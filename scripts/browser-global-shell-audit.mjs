import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { repositoryRoot } from './token-utils.mjs';

const siteUrl = 'http://127.0.0.1:4321';
const debuggingPort = 9334;
const browserDataDirectory = await mkdtemp('/tmp/azwerks-shell-browser-audit-');
const processes = [];
const results = [];

const start = (command, args) => {
  const child = spawn(command, args, { cwd: repositoryRoot, stdio: 'ignore' });
  processes.push(child);
  return child;
};

const waitFor = async (url, attempts = 120) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Startup polling intentionally ignores transient connection errors.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

class CdpSession {
  #id = 0;
  #pending = new Map();
  #events = new Map();
  #eventHistory = new Map();

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
      const history = this.#eventHistory.get(message.method) ?? [];
      history.push(message.params);
      this.#eventHistory.set(message.method, history.slice(-20));
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

  waitFor(method, predicate) {
    const previous = (this.#eventHistory.get(method) ?? []).find(predicate);
    if (previous) return Promise.resolve(previous);
    return new Promise((resolve) => {
      const listeners = this.#events.get(method) ?? [];
      const listener = (params) => {
        if (!predicate(params)) return;
        this.#events.set(method, listeners.filter((candidate) => candidate !== listener));
        resolve(params);
      };
      listeners.push(listener);
      this.#events.set(method, listeners);
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.exceptionDetails) {
      const description = response.exceptionDetails.exception?.description
        ?? response.exceptionDetails.exception?.value
        ?? response.exceptionDetails.text;
      throw new Error(String(description));
    }
    return response.result.value;
  }

  close() {
    this.socket.close();
  }
}

const openPage = async ({
  path = '/',
  width = 1024,
  height = 900,
  scheme = 'dark',
  reducedMotion = false,
  forcedColors = false,
  print = false,
  javaScriptDisabled = false,
  storage,
  storageThrows = false,
} = {}) => {
  const response = await fetch(
    `http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  );
  const target = await response.json();
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.open();
  await session.send('Page.enable');
  await session.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await session.send('Runtime.enable');
  await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__azwerksShellCls=0;window.__azwerksShellShiftSources=[];try{new PerformanceObserver((list)=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput){window.__azwerksShellCls+=entry.value;window.__azwerksShellShiftSources.push({value:entry.value,sources:entry.sources?.map(({node})=>node?.tagName+('.'+node?.className))??[]})}}}).observe({type:'layout-shift',buffered:true})}catch{}`,
  });
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await session.send('Emulation.setEmulatedMedia', {
    media: print ? 'print' : 'screen',
    features: [
      { name: 'prefers-color-scheme', value: scheme },
      { name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' },
      { name: 'forced-colors', value: forcedColors ? 'active' : 'none' },
    ],
  });
  if (storage !== undefined) {
    await session.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `localStorage.setItem('azwerks.portfolio.theme.v1', ${JSON.stringify(storage)});`,
    });
  }
  if (storageThrows) {
    await session.send('Page.addScriptToEvaluateOnNewDocument', {
      source: "Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}});",
    });
  }
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: true });
  const navigation = await session.send('Page.navigate', { url: `${siteUrl}${path}` });
  await session.waitFor('Page.lifecycleEvent', ({ loaderId, name }) => loaderId === navigation.loaderId && name === 'load');
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: false });
  await delay(50);
  return { session, target };
};

const closePage = async ({ session, target }) => {
  session.close();
  await fetch(`http://127.0.0.1:${debuggingPort}/json/close/${target.id}`);
};

const record = (name, conditions, detail = '') => {
  const failures = Object.entries(conditions)
    .filter(([, passed]) => !passed)
    .map(([condition]) => condition);
  results.push({ name, failures, detail });
};

const pressKey = async (session, key, modifiers = 0) => {
  await session.send('Input.dispatchKeyEvent', { type: 'keyDown', key, modifiers });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers });
  await delay(50);
};

const routes = [
  ['/', null],
  ['/work/', 'Work'],
  ['/archive/', 'Archive'],
  ['/about/', 'About'],
  ['/contact/', 'Contact'],
  ['/accessibility/', null],
  ['/privacy/', null],
  ['/colophon/', null],
  ['/404.html', null],
];

try {
  start(process.execPath, [join(repositoryRoot, 'node_modules/astro/bin/astro.mjs'), 'preview', '--host', '127.0.0.1']);
  await waitFor(`${siteUrl}/`);
  start('/usr/bin/google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  for (const [path, expectedCurrent] of routes) {
    const page = await openPage({ path });
    const data = await page.session.evaluate(`(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      noindex: document.querySelector('meta[name="robots"]')?.content === 'noindex, nofollow',
      primaryLabels: [...document.querySelectorAll('nav[aria-label="Primary"] a')].map(({textContent}) => textContent.trim()).join(','),
      current: document.querySelector('nav[aria-label="Primary"] [aria-current="page"]')?.textContent.trim() ?? null,
      identityNames: [...document.querySelectorAll('.brand-identity')].map((node) => node.getAttribute('aria-label')).filter(Boolean),
      footer: Boolean(document.querySelector('footer')),
      cls: window.__azwerksShellCls ?? null,
      shiftSources: window.__azwerksShellShiftSources ?? [],
      runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType}) => ['fetch','xmlhttprequest'].includes(initiatorType)).length,
      scriptCount: document.scripts.length,
    }))()`);
    record(`route ${path}`, {
      'document title': data.title.length > 0,
      'one H1': data.h1Count === 1,
      'one main': data.mainCount === 1,
      noindex: data.noindex,
      'shared primary order': data.primaryLabels === 'Work,Archive,About,Contact',
      'current route': data.current === expectedCurrent,
      'single identity name': data.identityNames.length === 1 && data.identityNames[0] === 'azwerks, home',
      footer: data.footer,
      'zero shell CLS': data.cls === 0,
      'zero runtime data requests': data.runtimeRequests === 0,
      'two client scripts': data.scriptCount === 2,
    }, `cls=${data.cls} sources=${JSON.stringify(data.shiftSources)}`);
    await closePage(page);
  }

  for (const width of [320, 375, 768, 1024, 1440]) {
    const page = await openPage({ path: '/work/', width, height: width === 768 ? 520 : 900 });
    await pressKey(page.session, 'Tab');
    const data = await page.session.evaluate(`(() => {
      const viewport = Math.ceil(window.visualViewport?.width ?? innerWidth);
      const h1 = document.querySelector('h1').getBoundingClientRect();
      const workContainer = document.querySelector('.global-header__direct-work');
      const work = workContainer?.querySelector('a')?.getBoundingClientRect();
      const menu = document.querySelector('.mobile-navigation__trigger')?.getBoundingClientRect();
      const focusTarget = document.activeElement;
      const focus = getComputedStyle(focusTarget);
      return {
        overflow: document.documentElement.scrollWidth > viewport,
        h1Clipped: h1.left < 0 || h1.right > viewport,
        workTarget: work && workContainer.getClientRects().length > 0 ? work.width >= 44 && work.height >= 44 : true,
        menuTarget: menu && document.querySelector('.mobile-navigation').getClientRects().length > 0 ? menu.width >= 44 && menu.height >= 44 : true,
        focusVisible: focus.outlineStyle !== 'none' && focus.outlineWidth !== '0px',
      };
    })()`);
    record(`viewport ${width}`, {
      'no horizontal overflow': !data.overflow,
      'heading not clipped': !data.h1Clipped,
      'direct Work 44px': data.workTarget,
      'Menu 44px': data.menuTarget,
      'focus visible': data.focusVisible,
    });
    await closePage(page);
  }

  const noScript = await openPage({ path: '/work/', width: 320, javaScriptDisabled: true });
  const noScriptData = await noScript.session.evaluate(`(() => {
    const details = document.querySelector('[data-mobile-navigation]');
    const trigger = details.querySelector('summary');
    trigger.click();
    return {
      enhanced: document.documentElement.dataset.shellEnhanced === 'true',
      open: details.open,
      links: [...details.querySelectorAll('nav a')].map(({textContent}) => textContent.trim()).join(','),
      visible: getComputedStyle(details.querySelector('[data-mobile-navigation-panel]')).display !== 'none',
      themeDisabled: details.querySelector('[data-theme-select]').disabled,
      themeStatus: details.querySelector('[data-theme-status]').hidden === false,
      directWork: getComputedStyle(document.querySelector('.global-header__direct-work')).display !== 'none',
      role: details.querySelector('[data-mobile-navigation-panel]').getAttribute('role'),
      modal: details.querySelector('[data-mobile-navigation-panel]').getAttribute('aria-modal'),
    };
  })()`);
  record('mobile no-JavaScript fallback', {
    'not falsely enhanced': !noScriptData.enhanced,
    'native disclosure opens': noScriptData.open,
    'same route order': noScriptData.links === 'Work,Archive,About,Contact',
    'links visible': noScriptData.visible,
    'theme truthfully disabled': noScriptData.themeDisabled && noScriptData.themeStatus,
    'direct Work visible': noScriptData.directWork,
    'no false modal semantics': noScriptData.role === null && noScriptData.modal === null,
  });
  await closePage(noScript);

  const mobile = await openPage({ path: '/archive/', width: 375 });
  await mobile.session.evaluate(`document.querySelector('[data-mobile-navigation] summary').click()`);
  await delay(100);
  const opened = await mobile.session.evaluate(`(() => {
    const details = document.querySelector('[data-mobile-navigation]');
    return {
      open: details.open,
      expanded: details.querySelector('summary').getAttribute('aria-expanded'),
      focused: document.activeElement?.textContent.trim(),
      inert: document.querySelector('main').inert,
      locked: getComputedStyle(document.body).overflow,
      current: details.querySelector('[aria-current="page"]')?.textContent.trim(),
      role: details.querySelector('[data-mobile-navigation-panel]').getAttribute('role'),
      modal: details.querySelector('[data-mobile-navigation-panel]').getAttribute('aria-modal'),
    };
  })()`);
  record('mobile enhanced open', {
    open: opened.open,
    expanded: opened.expanded === 'true',
    'initial focus on Close': opened.focused === 'Close',
    'background inert': opened.inert,
    'scroll locked': opened.locked === 'hidden',
    'current route': opened.current === 'Archive',
    'dialog semantics': opened.role === 'dialog' && opened.modal === 'true',
  });

  await mobile.session.evaluate(`(() => {
    const panel = document.querySelector('[data-mobile-navigation-panel]');
    const focusable = [...panel.querySelectorAll('a[href],button:not([disabled]),select:not([disabled])')]
      .filter((node) => node.getClientRects().length > 0);
    focusable.at(-1).focus();
  })()`);
  await pressKey(mobile.session, 'Tab');
  const contained = await mobile.session.evaluate(`document.activeElement?.textContent.trim()`);
  record('mobile focus containment', { 'focus wraps to Close': contained === 'Close' });

  await pressKey(mobile.session, 'Escape');
  const escaped = await mobile.session.evaluate(`(() => ({
    open: document.querySelector('[data-mobile-navigation]').open,
    expanded: document.querySelector('[data-mobile-navigation] summary').getAttribute('aria-expanded'),
    focused: document.activeElement?.textContent.trim(),
    inert: document.querySelector('main').inert,
    locked: getComputedStyle(document.body).overflow,
  }))()`);
  record('mobile Escape and restoration', {
    closed: !escaped.open,
    collapsed: escaped.expanded === 'false',
    'focus restored to Menu': escaped.focused === 'Menu',
    'background restored': !escaped.inert,
    'scroll restored': escaped.locked !== 'hidden',
  });

  await mobile.session.evaluate(`document.querySelector('[data-mobile-navigation] summary').click()`);
  await delay(50);
  await mobile.session.send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 900, deviceScaleFactor: 1, mobile: false });
  await delay(100);
  const viewportClosed = await mobile.session.evaluate(`!document.querySelector('[data-mobile-navigation]').open`);
  record('mobile viewport change', { 'menu closes at workspace width': viewportClosed });
  await closePage(mobile);

  const theme = await openPage({ width: 1024, scheme: 'light' });
  const themeStates = await theme.session.evaluate(`(async () => {
    const select = document.querySelector('#theme-desktop');
    const states = [];
    for (const mode of ['dark','light','system']) {
      select.value = mode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      states.push({ mode, theme: document.documentElement.dataset.theme ?? null, stored: localStorage.getItem('azwerks.portfolio.theme.v1'), value: select.value });
    }
    return states;
  })()`);
  const systemLightCanvas = await theme.session.evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--azw-color-canvas').trim()`);
  await theme.session.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [
      { name: 'prefers-color-scheme', value: 'dark' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
      { name: 'forced-colors', value: 'none' },
    ],
  });
  await delay(100);
  const systemDark = await theme.session.evaluate(`(() => ({
    canvas: getComputedStyle(document.documentElement).getPropertyValue('--azw-color-canvas').trim(),
    theme: document.documentElement.dataset.theme ?? null,
    value: document.querySelector('#theme-desktop').value,
  }))()`);
  record('theme system dark light', {
    dark: themeStates[0].theme === 'dark' && themeStates[0].stored === 'dark',
    light: themeStates[1].theme === 'light' && themeStates[1].stored === 'light',
    system: themeStates[2].theme === null && themeStates[2].stored === null,
    'value exposed': themeStates.every(({ mode, value }) => mode === value),
    'system follows media changes': systemDark.theme === null && systemDark.value === 'system' && systemDark.canvas !== systemLightCanvas,
  });
  await closePage(theme);

  for (const scenario of [
    { name: 'invalid storage', storage: 'sepia' },
    { name: 'failed storage', storageThrows: true },
  ]) {
    const page = await openPage({ width: 1024, ...scenario });
    const data = await page.session.evaluate(`(() => ({
      theme: document.documentElement.dataset.theme ?? null,
      value: document.querySelector('#theme-desktop').value,
      enabled: !document.querySelector('#theme-desktop').disabled,
    }))()`);
    record(`theme ${scenario.name}`, {
      'falls back to system': data.theme === null && data.value === 'system',
      'control remains enabled': data.enabled,
    });
    await closePage(page);
  }

  for (const scenario of [
    { name: 'reduced motion', reducedMotion: true },
    { name: 'forced colors', forcedColors: true },
    { name: 'print', print: true },
    { name: '200% text', path: '/work/', width: 320, textScale: true },
    { name: '200% desktop text', path: '/work/', width: 1024, textScale: true, desktopTextScale: true },
  ]) {
    const page = await openPage(scenario);
    const data = await page.session.evaluate(`(() => {
      ${scenario.textScale ? "document.documentElement.style.fontSize = '200%';" : ''}
      const viewport = Math.ceil(window.visualViewport?.width ?? innerWidth);
      const identityText = document.querySelector('.brand-identity__forced-colors');
      const identity = document.querySelector('.brand-identity').getBoundingClientRect();
      const skip = document.querySelector('.skip-links a');
      const header = document.querySelector('.global-header').getBoundingClientRect();
      const headerPosition = getComputedStyle(document.querySelector('.global-header')).position;
      const mainScrollMargin = Number.parseFloat(getComputedStyle(document.querySelector('main')).scrollMarginBlockStart);
      skip.focus();
      return {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        reducedDuration: getComputedStyle(document.documentElement).getPropertyValue('--azw-motion-duration-micro').trim(),
        forced: matchMedia('(forced-colors: active)').matches,
        print: matchMedia('print').matches,
        overflow: document.documentElement.scrollWidth > viewport,
        identityTextVisible: getComputedStyle(identityText).display !== 'none',
        identityWidth: identity.width,
        footerVisible: getComputedStyle(document.querySelector('footer')).display !== 'none',
        skipVisible: skip.getBoundingClientRect().top >= 0,
        headerHeight: header.height,
        headerPosition,
        mainScrollMargin,
        viewportHeight: innerHeight,
      };
    })()`);
    record(scenario.name, {
      'mode active': scenario.reducedMotion ? data.reduced : scenario.forcedColors ? data.forced : scenario.print ? data.print : true,
      'reduced duration is zero': scenario.reducedMotion ? ['0ms', '0s'].includes(data.reducedDuration) : true,
      'no horizontal overflow': !data.overflow,
      'identity remains readable': scenario.textScale ? data.identityWidth >= 90 : true,
      'header remains compact': scenario.desktopTextScale ? data.headerHeight <= data.viewportHeight * 0.25 : true,
      'header cannot obscure anchors': scenario.desktopTextScale ? data.headerPosition !== 'sticky' || data.mainScrollMargin + 2 >= data.headerHeight : true,
      'forced identity fallback': scenario.forcedColors ? data.identityTextVisible : true,
      'print footer hidden': scenario.print ? !data.footerVisible : true,
      'skip link visible on focus': scenario.print ? true : data.skipVisible,
    }, scenario.desktopTextScale ? `header=${data.headerHeight} scrollMargin=${data.mainScrollMargin}` : '');
    await closePage(page);
  }

  for (const result of results) {
    console.log(`${result.failures.length === 0 ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
  }
  const failureCount = results.reduce((count, result) => count + result.failures.length, 0);
  if (failureCount > 0) {
    throw new Error(`Global shell browser audit failed: ${failureCount} assertion(s) across ${results.length} scenarios.`);
  } else {
    console.log(`Global shell browser audit passed: ${results.length} deterministic scenarios.`);
  }
} finally {
  for (const child of processes.reverse()) {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(2000)]);
    }
  }
  await rm(browserDataDirectory, { recursive: true, force: true });
}
