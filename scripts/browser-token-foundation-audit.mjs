import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { repositoryRoot } from './token-utils.mjs';

const siteUrl = 'http://127.0.0.1:4321/';
const debuggingPort = 9333;
const browserDataDirectory = await mkdtemp(join(repositoryRoot, '.astro/token-browser-audit-'));
const processes = [];

function start(command, args, options = {}) {
  const child = spawn(command, args, { cwd: repositoryRoot, stdio: 'ignore', ...options });
  processes.push(child);
  return child;
}

async function waitFor(url, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Startup polling is intentionally quiet.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpSession {
  #id = 0;
  #pending = new Map();
  #events = new Map();

  constructor(url) {
    this.socket = new WebSocket(url);
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.#pending.get(message.id);
        if (!pending) return;
        this.#pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.#events.get(message.method) ?? []) listener(message.params);
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
  }

  once(method) {
    return new Promise((resolve) => {
      const listeners = this.#events.get(method) ?? [];
      const listener = (params) => {
        this.#events.set(method, listeners.filter((candidate) => candidate !== listener));
        resolve(params);
      };
      listeners.push(listener);
      this.#events.set(method, listeners);
    });
  }

  close() {
    this.socket.close();
  }
}

const scenarios = [
  { name: 'system-dark', width: 1024, scheme: 'dark', expectedTheme: null },
  { name: 'system-light', width: 1024, scheme: 'light', expectedTheme: null },
  { name: 'explicit-dark-over-light', width: 1024, scheme: 'light', storage: 'dark', expectedTheme: 'dark' },
  { name: 'explicit-light-over-dark', width: 1024, scheme: 'dark', storage: 'light', expectedTheme: 'light' },
  { name: 'invalid-storage', width: 1024, scheme: 'dark', storage: 'sepia', expectedTheme: null },
  { name: 'storage-unavailable', width: 1024, scheme: 'light', storageThrows: true, expectedTheme: null },
  { name: 'no-javascript', width: 1024, scheme: 'light', javaScriptDisabled: true, expectedTheme: null },
  { name: 'reduced-motion', width: 1024, scheme: 'dark', reducedMotion: true, expectedTheme: null },
  { name: 'forced-colors', width: 1024, scheme: 'dark', forcedColors: true, expectedTheme: null },
  { name: 'print', width: 1024, scheme: 'dark', print: true, expectedTheme: null },
  { name: 'text-200-percent', width: 375, scheme: 'dark', textScale: true, expectedTheme: null },
  ...[320, 375, 768, 1024, 1440].map((width) => ({ name: `viewport-${width}`, width, scheme: 'dark', expectedTheme: null })),
];

const results = [];

try {
  start(process.execPath, [join(repositoryRoot, 'node_modules/astro/bin/astro.mjs'), 'preview', '--host', '127.0.0.1']);
  await waitFor(siteUrl);

  start('/usr/bin/google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  for (const scenario of scenarios) {
    const targetResponse = await fetch(
      `http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent(siteUrl)}`,
      { method: 'PUT' },
    );
    const target = await targetResponse.json();
    const session = new CdpSession(target.webSocketDebuggerUrl);
    await session.open();
    await session.send('Page.enable');
    await session.send('Runtime.enable');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: scenario.width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: scenario.width < 768,
    });

    const media = scenario.print ? 'print' : 'screen';
    const features = [
      { name: 'prefers-color-scheme', value: scenario.scheme },
      { name: 'prefers-reduced-motion', value: scenario.reducedMotion ? 'reduce' : 'no-preference' },
      { name: 'forced-colors', value: scenario.forcedColors ? 'active' : 'none' },
    ];
    await session.send('Emulation.setEmulatedMedia', { media, features });

    if (scenario.storage) {
      await session.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `localStorage.setItem('azwerks.portfolio.theme.v1', ${JSON.stringify(scenario.storage)});`,
      });
    }
    if (scenario.storageThrows) {
      await session.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}});`,
      });
    }
    if (scenario.javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: true });

    const loaded = session.once('Page.loadEventFired');
    await session.send('Page.navigate', { url: siteUrl });
    await loaded;
    if (scenario.javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: false });

    const expression = `(() => {
      if (${Boolean(scenario.textScale)}) document.documentElement.style.fontSize = '200%';
      const link = document.querySelector('a');
      const scrollWidthBeforeFocus = document.documentElement.scrollWidth;
      link?.focus();
      const root = getComputedStyle(document.documentElement);
      const focus = link ? getComputedStyle(link) : null;
      const heading = document.querySelector('h1')?.getBoundingClientRect();
      const viewportWidth = Math.ceil(window.visualViewport?.width ?? window.innerWidth);
      const main = document.querySelector('main')?.getBoundingClientRect();
      const foundation = document.querySelector('.foundation')?.getBoundingClientRect();
      const pre = document.querySelector('pre');
      const preBounds = pre?.getBoundingClientRect();
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        canvas: root.getPropertyValue('--azw-color-canvas').trim(),
        text: root.getPropertyValue('--azw-color-text-primary').trim(),
        reducedDuration: root.getPropertyValue('--azw-motion-duration-micro').trim(),
        forcedColors: matchMedia('(forced-colors: active)').matches,
        print: matchMedia('print').matches,
        overflow: document.documentElement.scrollWidth > viewportWidth,
        headingClipped: heading ? heading.left < 0 || heading.right > viewportWidth : true,
        viewportWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportMetrics: {
          innerWidth: window.innerWidth,
          visualViewportWidth: window.visualViewport?.width ?? null,
          bodyClientWidth: document.body.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          bodyBounds: document.body.getBoundingClientRect().toJSON(),
          mainPaddingInline: getComputedStyle(document.querySelector('main')).paddingInline,
        },
        scrollWidthBeforeFocus,
        focusMetrics: focus ? { outlineWidth: focus.outlineWidth, outlineOffset: focus.outlineOffset, bounds: link.getBoundingClientRect().toJSON() } : null,
        headingBounds: heading ? { left: heading.left, right: heading.right, width: heading.width } : null,
        layoutBounds: {
          main: main ? { left: main.left, right: main.right, width: main.width } : null,
          foundation: foundation ? { left: foundation.left, right: foundation.right, width: foundation.width } : null,
          pre: preBounds ? { left: preBounds.left, right: preBounds.right, width: preBounds.width, scrollWidth: pre.scrollWidth, clientWidth: pre.clientWidth, overflowX: getComputedStyle(pre).overflowX } : null,
        },
        overflowElements: [...document.querySelectorAll('body *')]
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.left < 0 || bounds.right > viewportWidth;
          })
          .map((element) => ({
            element: element.tagName.toLowerCase(),
            className: element.className,
            bounds: element.getBoundingClientRect().toJSON(),
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          })),
        focusVisible: focus ? focus.outlineStyle !== 'none' && focus.outlineWidth !== '0px' : false,
        artSurface: getComputedStyle(document.querySelector('.foundation__art-sample')).backgroundColor,
        codeSurface: getComputedStyle(document.querySelector('pre')).backgroundColor,
        textReadable: getComputedStyle(document.body).color !== getComputedStyle(document.body).backgroundColor,
      };
    })()`;
    const evaluated = await session.send('Runtime.evaluate', { expression, returnByValue: true });
    const result = evaluated.result.value;
    const failures = [];
    if (result.theme !== scenario.expectedTheme) failures.push(`theme ${result.theme} != ${scenario.expectedTheme}`);
    if (result.overflow) failures.push('horizontal overflow');
    if (result.headingClipped) failures.push('clipped heading');
    if (!result.focusVisible) failures.push('focus not visible');
    if (!result.textReadable) failures.push('body text not readable');
    if (scenario.reducedMotion && !['0ms', '0s'].includes(result.reducedDuration)) failures.push(`reduced motion ${result.reducedDuration}`);
    if (scenario.forcedColors && !result.forcedColors) failures.push('forced colors not active');
    if (scenario.print && !result.print) failures.push('print media not active');
    results.push({ scenario: scenario.name, ...result, failures });
    session.close();
    await fetch(`http://127.0.0.1:${debuggingPort}/json/close/${target.id}`);
  }

  const darkCanvas = results.find((result) => result.scenario === 'system-dark')?.canvas;
  const lightCanvas = results.find((result) => result.scenario === 'system-light')?.canvas;
  if (darkCanvas === lightCanvas) results[0].failures.push('system dark/light canvas did not change');

  for (const result of results) {
    console.log(`${result.failures.length === 0 ? 'PASS' : 'FAIL'} ${result.scenario}: theme=${result.theme ?? 'system'} canvas=${result.canvas}`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
    if (result.failures.length > 0 && result.overflowElements.length > 0) {
      console.error(`  - overflow evidence: ${JSON.stringify({ viewportWidth: result.viewportWidth, scrollWidth: result.scrollWidth, scrollWidthBeforeFocus: result.scrollWidthBeforeFocus, viewportMetrics: result.viewportMetrics, focusMetrics: result.focusMetrics, headingBounds: result.headingBounds, layoutBounds: result.layoutBounds, elements: result.overflowElements })}`);
    }
  }
  if (results.some((result) => result.failures.length > 0)) process.exitCode = 1;
  else console.log(`Browser token audit passed: ${results.length} scenarios.`);
} finally {
  for (const child of processes.reverse()) {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => child.once('exit', resolve)),
        delay(2000),
      ]);
    }
  }
  await rm(browserDataDirectory, { recursive: true, force: true });
}
