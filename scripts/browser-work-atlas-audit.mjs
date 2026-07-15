import { spawn, spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

import { repositoryRoot } from './token-utils.mjs';

const siteUrl = 'http://127.0.0.1:4325';
const debuggingPort = 9338;
const astroCli = join(repositoryRoot, 'node_modules/astro/bin/astro.mjs');
const harnessDirectory = join(repositoryRoot, 'src/pages/work-atlas-audit');
const harnessPath = join(harnessDirectory, '[size].astro');
const browserDataDirectory = await mkdtemp('/tmp/azwerks-work-atlas-browser-audit-');
const processes = [];
const results = [];
const metrics = { environment: { node: process.version, platform: process.platform, architecture: process.arch } };

const build = () => {
  const started = performance.now();
  const result = spawnSync(process.execPath, [astroCli, 'build'], { cwd: repositoryRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Astro build exited ${result.status}.`);
  return performance.now() - started;
};

const start = (command, args) => {
  const child = spawn(command, args, { cwd: repositoryRoot, stdio: 'ignore' });
  processes.push(child);
  return child;
};

const stopProcesses = async () => {
  for (const child of processes.splice(0).reverse()) {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(2000)]);
    }
  }
};

const waitFor = async (url, attempts = 160) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Startup polling intentionally tolerates transient connection errors.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

class CdpSession {
  #id = 0;
  #pending = new Map();
  #events = new Map();

  constructor(url) { this.socket = new WebSocket(url); }
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
  once(method, predicate = () => true) {
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
    const response = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    }
    return response.result.value;
  }
  close() { this.socket.close(); }
}

const openPage = async ({
  path,
  width = 1024,
  height = 900,
  javaScriptDisabled = false,
  forcedColors = false,
  reducedMotion = false,
  print = false,
  textScale = false,
  colorScheme = 'dark',
  themeAttribute,
  invalidStorage = false,
  storageThrows = false,
} = {}) => {
  const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  const target = await response.json();
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.open();
  await session.send('Page.enable');
  await session.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await session.send('Runtime.enable');
  await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__atlasCls=0;try{new PerformanceObserver((list)=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput)window.__atlasCls+=entry.value}}).observe({type:'layout-shift',buffered:true})}catch{}`,
  });
  if (invalidStorage) await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{localStorage.setItem('azwerks.portfolio.theme.v1','invalid-atlas-audit-value')}catch{}`,
  });
  if (storageThrows) await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}})`,
  });
  if (textScale) await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='200%'},{once:true})`,
  });
  await session.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  await session.send('Emulation.setEmulatedMedia', {
    media: print ? 'print' : 'screen',
    features: [
      { name: 'prefers-color-scheme', value: colorScheme },
      { name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' },
      { name: 'forced-colors', value: forcedColors ? 'active' : 'none' },
    ],
  });
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: true });
  const navigation = await session.send('Page.navigate', { url: `${siteUrl}${path}` });
  await session.once('Page.lifecycleEvent', ({ loaderId, name }) => loaderId === navigation.loaderId && name === 'load');
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: false });
  if (themeAttribute) await session.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(themeAttribute)}`);
  await delay(100);
  return { session, target };
};

const closePage = async ({ session, target }) => {
  session.close();
  await fetch(`http://127.0.0.1:${debuggingPort}/json/close/${target.id}`);
};

const record = (name, conditions, detail = '') => {
  const failures = Object.entries(conditions).filter(([, passed]) => !passed).map(([condition]) => condition);
  results.push({ name, failures, detail });
};

const pressKey = async (session, key) => {
  const keyCodes = { Enter: 13, ' ': 32, Escape: 27, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 };
  const code = key === ' ' ? 'Space' : key;
  const value = keyCodes[key] ?? 0;
  await session.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, windowsVirtualKeyCode: value, nativeVirtualKeyCode: value });
  if (key === ' ' || key === 'Enter') await session.send('Input.dispatchKeyEvent', { type: 'char', key, code, text: key === ' ' ? ' ' : '\r', unmodifiedText: key === ' ' ? ' ' : '\r', windowsVirtualKeyCode: value, nativeVirtualKeyCode: value });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: value, nativeVirtualKeyCode: value });
  await delay(60);
};

const pressBrowserZoomIn = async (session) => {
  const event = { key: '+', code: 'Equal', modifiers: 2, windowsVirtualKeyCode: 187, nativeVirtualKeyCode: 187 };
  await session.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...event });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', ...event });
  await delay(120);
};

const auditAssets = async () => {
  const directory = join(repositoryRoot, 'dist/_astro');
  let cssBytes = 0;
  let cssGzipBytes = 0;
  let javascriptBytes = 0;
  let javascriptGzipBytes = 0;
  for (const file of await readdir(directory)) {
    const source = await readFile(join(directory, file));
    const text = source.toString('utf8');
    if (file.endsWith('.css') && text.includes('.work-atlas')) {
      cssBytes += source.byteLength;
      cssGzipBytes += gzipSync(source).byteLength;
    }
    if (file.endsWith('.js') && text.includes('atlasInitialized')) {
      javascriptBytes += source.byteLength;
      javascriptGzipBytes += gzipSync(source).byteLength;
    }
  }
  Object.assign(metrics, { cssBytes, cssGzipBytes, javascriptBytes, javascriptGzipBytes });
};

const harnessSource = `---
import GlobalShell from '../../layouts/GlobalShell.astro';
import WorkAtlas from '../../components/work-atlas/WorkAtlas.astro';
import { createAtlasLayout } from '../../lib/work-atlas/atlas-layout.ts';
import { createSyntheticAtlasRecords, createSyntheticAtlasRelations } from '../../../tests/support/work-atlas-fixtures.ts';
import '../../styles/work-atlas.css';

export const getStaticPaths = () => [0, 1, 10, 50, 200].map((size) => ({ params: { size: String(size) }, props: { size } }));
const { size } = Astro.props;
const records = createSyntheticAtlasRecords(size);
const relationCount = size <= 1 ? 0 : size === 10 ? 7 : size === 50 ? 49 : 140;
const relations = createSyntheticAtlasRelations(records, relationCount);
const layout = createAtlasLayout(records, relations);
---
<GlobalShell title={\`Synthetic Work Atlas QA \${size} — azwerks\`} description="Temporary isolated synthetic Work Atlas quality assurance." mainId="atlas-audit" workResultsId="atlas-project-index" noindex>
  <p data-synthetic-audit>Temporary synthetic QA harness; not portfolio content.</p>
  <WorkAtlas records={records} relations={relations} layout={layout} />
</GlobalShell>
`;

try {
  await rm(harnessDirectory, { recursive: true, force: true });
  metrics.productionBuildMilliseconds = build();
  metrics.productionHtmlBytes = (await stat(join(repositoryRoot, 'dist/work/atlas/index.html'))).size;

  start(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4325']);
  await waitFor(`${siteUrl}/work/atlas/`);
  start('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  const production = await openPage({ path: '/work/atlas/' });
  const productionData = await production.session.evaluate(`(() => ({
    h1: document.querySelectorAll('h1').length,
    noindex: document.querySelector('meta[name="robots"]')?.content === 'noindex, nofollow',
    empty: Boolean(document.querySelector('.atlas-empty-state')),
    controls: document.querySelector('[data-atlas-controls]'),
    spatial: document.querySelector('[data-atlas-spatial]'),
    registerHref: document.querySelector('[data-register-view-link]')?.getAttribute('href'),
    current: document.querySelector('nav[aria-label="Primary"] [data-current]')?.textContent.trim(),
    runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType}) => ['fetch','xmlhttprequest'].includes(initiatorType)).length,
    synthetic: document.body.textContent.includes('Synthetic Work Atlas QA'),
  }))()`);
  record('production zero-project route', {
    'one H1': productionData.h1 === 1,
    noindex: productionData.noindex,
    'truthful empty state': productionData.empty,
    'controls omitted': productionData.controls === null,
    'empty plane omitted': productionData.spatial === null,
    'Register one link away': productionData.registerHref === '/work/',
    'Work current globally': productionData.current?.startsWith('Work'),
    'zero runtime content requests': productionData.runtimeRequests === 0,
    'no fixture publication': !productionData.synthetic,
  });
  await closePage(production);
  await stopProcesses();

  await mkdir(harnessDirectory, { recursive: true });
  await writeFile(harnessPath, harnessSource, 'utf8');
  metrics.fixtureBuildMilliseconds = build();
  metrics.htmlBytes200 = (await stat(join(repositoryRoot, 'dist/work-atlas-audit/200/index.html'))).size;
  await auditAssets();

  start(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4325']);
  await waitFor(`${siteUrl}/work-atlas-audit/10/`);
  start('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  for (const size of [0, 1, 10, 50, 200]) {
    const page = await openPage({ path: `/work-atlas-audit/${size}/` });
    const data = await page.session.evaluate(`(() => ({
      nodes: document.querySelectorAll('[data-atlas-node]').length,
      projectLinks: document.querySelectorAll('[data-atlas-project-index] a').length,
      relations: document.querySelectorAll('[data-atlas-relation]').length,
      relationItems: document.querySelectorAll('[data-atlas-index-relation]').length,
      controlsVisible: Boolean(document.querySelector('[data-atlas-controls]:not([hidden])')),
      spatialVisible: Boolean(document.querySelector('[data-atlas-spatial]:not([hidden])')),
      empty: Boolean(document.querySelector('.atlas-empty-state')),
      enhanced: document.querySelector('[data-atlas-root]')?.dataset.atlasEnhanced,
      initMs: Number(document.querySelector('[data-atlas-root]')?.dataset.atlasInitMs ?? 0),
      domNodes: document.querySelectorAll('*').length,
      runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType}) => ['fetch','xmlhttprequest'].includes(initiatorType)).length,
      animations: document.getAnimations().length,
      cls: window.__atlasCls ?? null,
      edgePolicy: document.querySelector('[data-atlas-root]')?.dataset.edgePolicy,
      visibleEdges: document.querySelectorAll('[data-atlas-relation]:not([hidden])').length,
    }))()`);
    metrics[`domNodes${size}`] = data.domNodes;
    metrics[`initializationMilliseconds${size}`] = data.initMs;
    const expectedRelations = size <= 1 ? 0 : size === 10 ? 7 : size === 50 ? 49 : 140;
    record(`fixture dataset ${size}`, {
      'exact node count': data.nodes === size,
      'exact semantic link count': data.projectLinks === size,
      'exact relation geometry count': data.relations === expectedRelations,
      'exact semantic relation count': data.relationItems === expectedRelations,
      'truthful zero/enhanced state': size === 0 ? data.empty && !data.controlsVisible && !data.spatialVisible : data.enhanced === 'true' && data.controlsVisible && data.spatialVisible,
      'one-project has no relation geometry': size !== 1 || data.relations === 0,
      'dense edge reduction': size < 50 ? data.edgePolicy === 'all' : data.edgePolicy === 'focused' && data.visibleEdges === 0,
      'zero runtime requests': data.runtimeRequests === 0,
      'zero continuous animation': data.animations === 0,
      'zero Atlas CLS': data.cls === 0,
    }, `dom=${data.domNodes} init=${data.initMs}ms cls=${data.cls}`);
    await closePage(page);
  }

  const noScript = await openPage({ path: '/work-atlas-audit/10/', width: 320, javaScriptDisabled: true });
  const noScriptData = await noScript.session.evaluate(`(() => ({
    links: document.querySelectorAll('[data-atlas-project-index] a').length,
    relations: document.querySelectorAll('[data-atlas-index-relation]').length,
    controlsHidden: document.querySelector('[data-atlas-controls]').hidden,
    spatialHidden: document.querySelector('[data-atlas-spatial]').hidden,
    enhanced: document.querySelector('[data-atlas-root]').dataset.atlasEnhanced,
    categories: document.querySelectorAll('[data-atlas-project-index] > section').length,
    relationLabels: document.querySelectorAll('[data-atlas-index-relation] strong').length,
    noScriptCopy: document.body.textContent.includes('Spatial controls require JavaScript'),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }))()`);
  record('semantic no-JavaScript baseline', {
    'complete project index': noScriptData.links === 10,
    'complete relation index': noScriptData.relations === 7 && noScriptData.relationLabels === 7,
    'controls gated': noScriptData.controlsHidden,
    'spatial view gated': noScriptData.spatialHidden,
    'enhancement absent': noScriptData.enhanced === 'false',
    'five category groups': noScriptData.categories === 5,
    'truthful no-script copy': noScriptData.noScriptCopy,
    'no page horizontal overflow': !noScriptData.overflow,
  });
  await closePage(noScript);

  const interaction = await openPage({ path: '/work-atlas-audit/10/?category=bad&relation=nope&focus=private' });
  const normalized = await interaction.session.evaluate(`(() => ({
    search: location.search,
    fieldsets: document.querySelectorAll('[data-atlas-controls] fieldset').length,
    viewportRole: document.querySelector('[data-atlas-viewport]')?.getAttribute('role'),
    applicationRole: Boolean(document.querySelector('[role="application"]')),
    directLinks: document.querySelectorAll('[data-atlas-project-index] a').length,
    registerHref: document.querySelector('[data-register-view-link]')?.getAttribute('href'),
  }))()`);
  record('enhancement semantics and URL normalization', {
    'invalid URL normalized': normalized.search === '',
    'native filter groups': normalized.fieldsets === 5,
    'labeled region viewport': normalized.viewportRole === 'region',
    'no application role': !normalized.applicationRole,
    'native project links retained': normalized.directLinks === 10,
    'Register handoff present': normalized.registerHref === '/work/',
  });

  const applied = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-atlas-controls]');
    form.elements.q.value = 'record 003';
    form.requestSubmit(form.querySelector('[type="submit"]'));
    return {
      visible: document.querySelectorAll('[data-atlas-node]:not([hidden])').length,
      search: location.search,
      summary: document.querySelector('[data-atlas-summary]').textContent,
      registerHref: document.querySelector('[data-register-view-link]').getAttribute('href'),
    };
  })()`);
  record('search Apply and handoff', {
    'one visible node': applied.visible === 1,
    'query serialized': applied.search === '?q=record+003',
    'summary accurate': applied.summary.includes('Showing 1 of 10'),
    'Register preserves query': applied.registerHref === '/work/?q=record+003',
  });

  const reset = await interaction.session.evaluate(`(() => {
    document.querySelector('[data-atlas-reset]').click();
    return { visible: document.querySelectorAll('[data-atlas-node]:not([hidden])').length, search: location.search };
  })()`);
  record('Reset', { 'all nodes restored': reset.visible === 10, 'canonical query': reset.search === '' });

  const selected = await interaction.session.evaluate(`(() => {
    const node = document.querySelector('[data-atlas-node]');
    node.focus();
    node.click();
    return {
      pressed: node.getAttribute('aria-pressed'),
      focusStable: document.activeElement === node,
      inspector: document.querySelector('[data-atlas-inspector-title]').textContent,
      projectHref: document.querySelector('[data-atlas-inspector-project]').getAttribute('href'),
      centerEnabled: !document.querySelector('[data-atlas-center-selected]').disabled,
      search: location.search,
    };
  })()`);
  record('selection and inspector', {
    'selected state exposed': selected.pressed === 'true',
    'selection does not steal focus': selected.focusStable,
    'inspector updated': selected.inspector.includes('Synthetic'),
    'native project href': selected.projectHref === '/work/synthetic-atlas-001/',
    'center enabled': selected.centerEnabled,
    'focus slug serialized': selected.search === '?focus=synthetic-atlas-001',
  });

  const zoom = await interaction.session.evaluate(`(() => {
    const root = document.querySelector('[data-atlas-root]');
    document.querySelector('[data-atlas-zoom-in]').click();
    const zoomed = root.dataset.atlasZoom;
    document.querySelector('[data-atlas-center-selected]').click();
    const centered = { left: document.querySelector('[data-atlas-viewport]').scrollLeft, top: document.querySelector('[data-atlas-viewport]').scrollTop };
    document.querySelector('[data-atlas-reset-view]').click();
    return { zoomed, reset: root.dataset.atlasZoom, left: document.querySelector('[data-atlas-viewport]').scrollLeft, top: document.querySelector('[data-atlas-viewport]').scrollTop, centered };
  })()`);
  record('zoom, center, and reset', {
    'bounded zoom step': zoom.zoomed === '1.2',
    'reset zoom': zoom.reset === '1',
    'reset origin': zoom.left === 0 && zoom.top === 0,
    'center used native scroll': zoom.centered.left >= 0 && zoom.centered.top >= 0,
  });

  await interaction.session.evaluate(`document.querySelector('[data-atlas-enter-map]').focus()`);
  await pressKey(interaction.session, 'Enter');
  const entered = await interaction.session.evaluate(`document.activeElement?.matches('[data-atlas-node]')`);
  const beforeArrow = await interaction.session.evaluate(`document.activeElement?.dataset.recordId`);
  await pressKey(interaction.session, 'ArrowRight');
  const afterArrow = await interaction.session.evaluate(`document.activeElement?.dataset.recordId`);
  await pressKey(interaction.session, 'Escape');
  const escaped = await interaction.session.evaluate(`document.activeElement?.matches('[data-atlas-enter-map]')`);
  record('CDP keyboard map entry, movement, and exit', {
    'Enter moves into map': entered,
    'arrow moves to a different node': beforeArrow !== afterArrow,
    'Escape returns to entry': escaped,
  }, `${beforeArrow} -> ${afterArrow}`);

  const historyData = await interaction.session.evaluate(`(async () => {
    const form = document.querySelector('[data-atlas-controls]');
    form.elements.q.value = 'record 001'; form.requestSubmit(form.querySelector('[type="submit"]'));
    form.elements.q.value = 'record 002'; form.requestSubmit(form.querySelector('[type="submit"]'));
    history.back();
    await new Promise((resolve) => setTimeout(resolve, 120));
    return {
      q: form.elements.q.value,
      queryParameter: new URLSearchParams(location.search).get('q'),
      focusParameter: new URLSearchParams(location.search).get('focus'),
      visible: document.querySelectorAll('[data-atlas-node]:not([hidden])').length,
    };
  })()`);
  record('popstate restoration', {
    'query restored': historyData.q === 'record 001' && historyData.queryParameter === 'record 001',
    'focus state retained': historyData.focusParameter === 'synthetic-atlas-001',
    'visibility restored': historyData.visible === 1,
  });

  const failure = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-atlas-controls]');
    history.pushState = () => { throw new Error('isolated history failure') };
    form.elements.q.value = 'record 004';
    form.requestSubmit(form.querySelector('[type="submit"]'));
    return {
      enhanced: document.querySelector('[data-atlas-root]').dataset.atlasEnhanced,
      controlsHidden: form.hidden,
      spatialHidden: document.querySelector('[data-atlas-spatial]').hidden,
      indexesOpen: document.querySelector('[data-atlas-indexes]').open,
      nodesVisible: document.querySelectorAll('[data-atlas-node]:not([hidden])').length,
      errorVisible: !document.querySelector('[data-atlas-error]').hidden,
    };
  })()`);
  record('enhancement failure recovery', {
    'enhancement removed': failure.enhanced === 'false',
    'controls hidden': failure.controlsHidden,
    'spatial view removed': failure.spatialHidden,
    'complete indexes opened': failure.indexesOpen,
    'all nodes restored before spatial removal': failure.nodesVisible === 10,
    'failure explained': failure.errorVisible,
  });
  await closePage(interaction);

  for (const scenario of [
    { name: '320px', width: 320, height: 700 },
    { name: '375px', width: 375, height: 720 },
    { name: '768px landscape', width: 768, height: 420 },
    { name: '1024px', width: 1024, height: 800 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '1600px', width: 1600, height: 900 },
    { name: '200% text', width: 320, height: 900, textScale: true },
    { name: 'forced colors', width: 375, height: 720, forcedColors: true },
    { name: 'reduced motion', width: 375, height: 720, reducedMotion: true },
    { name: 'print', width: 1024, height: 900, print: true },
    { name: 'system light', width: 1024, height: 800, colorScheme: 'light' },
    { name: 'explicit dark', width: 1024, height: 800, themeAttribute: 'dark' },
    { name: 'explicit light', width: 1024, height: 800, themeAttribute: 'light' },
    { name: 'invalid stored mode', width: 1024, height: 800, invalidStorage: true },
    { name: 'failed storage', width: 1024, height: 800, storageThrows: true },
  ]) {
    const page = await openPage({ path: '/work-atlas-audit/10/', ...scenario });
    const data = await page.session.evaluate(`(() => {
      const viewportWidth = Math.ceil(window.visualViewport?.width ?? innerWidth);
      const targets = [...document.querySelectorAll('[data-atlas-controls] button, [data-atlas-controls] input[type="search"], [data-atlas-controls] summary')]
        .filter((node) => node.getClientRects().length > 0)
        .map((node) => node.getBoundingClientRect().height);
      const workspace = document.querySelector('.atlas-workspace');
      const indexes = document.querySelector('[data-atlas-indexes]');
      return {
        overflow: document.documentElement.scrollWidth > viewportWidth,
        targets: targets.every((height) => height >= 44),
        h1Visible: document.querySelector('h1').getBoundingClientRect().right <= viewportWidth,
        internalScroll: document.querySelector('[data-atlas-viewport]').scrollWidth > document.querySelector('[data-atlas-viewport]').clientWidth,
        indexFirst: innerWidth >= 768 || indexes.getBoundingClientRect().top < workspace.getBoundingClientRect().top,
        mode: ${scenario.forcedColors ? "matchMedia('(forced-colors: active)').matches" : scenario.reducedMotion ? "matchMedia('(prefers-reduced-motion: reduce)').matches" : scenario.print ? "matchMedia('print').matches" : 'true'},
        printPlaneHidden: ${scenario.print ? "getComputedStyle(workspace).display === 'none'" : 'true'},
        indexesVisible: indexes.getClientRects().length > 0,
      };
    })()`);
    record(scenario.name, {
      'no page horizontal overflow': !data.overflow,
      '44px primary controls': data.targets,
      'heading visible': data.h1Visible,
      'map scrolls internally': scenario.print || data.internalScroll,
      'mobile index first': data.indexFirst,
      'mode active': data.mode,
      'print omits plane': data.printPlaneHidden,
      'semantic indexes visible': data.indexesVisible,
    });
    await closePage(page);
  }

  const browserZoom = await openPage({ path: '/work-atlas-audit/10/', width: 1024, height: 900 });
  const beforeZoom = await browserZoom.session.evaluate(`({ width: innerWidth, ratio: devicePixelRatio })`);
  await pressBrowserZoomIn(browserZoom.session);
  await pressBrowserZoomIn(browserZoom.session);
  const afterZoom = await browserZoom.session.evaluate(`(() => ({
    width: innerWidth,
    ratio: devicePixelRatio,
    overflow: document.documentElement.scrollWidth > Math.ceil(window.visualViewport?.width ?? innerWidth),
    h1Visible: document.querySelector('h1').getBoundingClientRect().right <= Math.ceil(window.visualViewport?.width ?? innerWidth),
  }))()`);
  record('native browser zoom', {
    'browser zoom changed layout scale': afterZoom.width < beforeZoom.width || afterZoom.ratio > beforeZoom.ratio,
    'no page horizontal overflow': !afterZoom.overflow,
    'heading visible': afterZoom.h1Visible,
  }, `before=${JSON.stringify(beforeZoom)} after=${JSON.stringify(afterZoom)}`);
  await closePage(browserZoom);

  const dense = await openPage({ path: '/work-atlas-audit/200/' });
  const denseData = await dense.session.evaluate(`(() => {
    const form = document.querySelector('[data-atlas-controls]');
    const firstVisible = document.querySelector('[data-atlas-node]:not([hidden])');
    firstVisible.click();
    const focusedEdges = document.querySelectorAll('[data-atlas-relation]:not([hidden])').length;
    document.querySelector('[data-atlas-show-all-relations]').click();
    const allEdges = document.querySelectorAll('[data-atlas-relation]:not([hidden])').length;
    form.elements.q.value = 'system';
    form.querySelector('input[name="category"][value="software"]').checked = true;
    const started = performance.now();
    form.requestSubmit(form.querySelector('[type="submit"]'));
    const duration = performance.now() - started;
    return { duration, visible: document.querySelectorAll('[data-atlas-node]:not([hidden])').length, focusedEdges, allEdges };
  })()`);
  metrics.filterUpdateMilliseconds200 = denseData.duration;
  record('200-record filter and relation density', {
    'records filtered without omission': denseData.visible > 0,
    'within 100ms test-machine target': denseData.duration <= 100,
    'focused edges bounded': denseData.focusedEdges <= 8,
    'show-all reveals more existing edges': denseData.allEdges > denseData.focusedEdges,
  }, `${denseData.duration.toFixed(3)}ms focused=${denseData.focusedEdges} all=${denseData.allEdges}`);
  await closePage(dense);

  record('Atlas asset and timing budgets', {
    'Atlas JavaScript found': metrics.javascriptBytes > 0,
    'Atlas JavaScript <=16KB minified': metrics.javascriptBytes <= 16 * 1024,
    'Atlas CSS found': metrics.cssBytes > 0,
    'Atlas CSS <=18KB compressed': metrics.cssGzipBytes <= 18 * 1024,
    '10-record initialization <=50ms': metrics.initializationMilliseconds10 <= 50,
    '50-record initialization <=100ms': metrics.initializationMilliseconds50 <= 100,
    '200-record initialization <=250ms': metrics.initializationMilliseconds200 <= 250,
  }, `js=${metrics.javascriptBytes}B gzip=${metrics.javascriptGzipBytes}B css=${metrics.cssBytes}B gzip=${metrics.cssGzipBytes}B`);

  for (const result of results) {
    console.log(`${result.failures.length === 0 ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
  }
  console.log(`METRICS ${JSON.stringify(metrics)}`);
  const failureCount = results.reduce((total, result) => total + result.failures.length, 0);
  if (failureCount > 0) throw new Error(`Work Atlas browser audit failed: ${failureCount} assertion(s) across ${results.length} scenarios.`);
  console.log(`Work Atlas browser audit passed: ${results.length} deterministic scenarios.`);
} finally {
  await stopProcesses();
  await rm(browserDataDirectory, { recursive: true, force: true });
  await rm(harnessDirectory, { recursive: true, force: true });
  build();
  const leakedHarness = await stat(join(repositoryRoot, 'dist/work-atlas-audit')).then(() => true, () => false);
  if (leakedHarness) throw new Error('Temporary Work Atlas harness remains in production output.');
}
