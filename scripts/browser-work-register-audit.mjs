import { spawn, spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { repositoryRoot } from './token-utils.mjs';

const siteUrl = 'http://127.0.0.1:4322';
const debuggingPort = 9335;
const astroCli = join(repositoryRoot, 'node_modules/astro/bin/astro.mjs');
const harnessDirectory = join(repositoryRoot, 'src/pages/work-register-audit');
const harnessPath = join(harnessDirectory, '[size].astro');
const browserDataDirectory = await mkdtemp('/tmp/azwerks-register-browser-audit-');
const processes = [];
const results = [];
const metrics = {};

const build = () => {
  const result = spawnSync(process.execPath, [astroCli, 'build'], { cwd: repositoryRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Astro build exited ${result.status}.`);
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
  path,
  width = 1024,
  height = 900,
  javaScriptDisabled = false,
  forcedColors = false,
  reducedMotion = false,
  print = false,
  textScale = false,
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
    source: `window.__registerCls=0;try{new PerformanceObserver((list)=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput)window.__registerCls+=entry.value}}).observe({type:'layout-shift',buffered:true})}catch{}`,
  });
  if (textScale) {
    await session.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='200%'},{once:true})`,
    });
  }
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await session.send('Emulation.setEmulatedMedia', {
    media: print ? 'print' : 'screen',
    features: [
      { name: 'prefers-color-scheme', value: 'dark' },
      { name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' },
      { name: 'forced-colors', value: forcedColors ? 'active' : 'none' },
    ],
  });
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: true });
  const navigation = await session.send('Page.navigate', { url: `${siteUrl}${path}` });
  await session.once('Page.lifecycleEvent', ({ loaderId, name }) => loaderId === navigation.loaderId && name === 'load');
  if (javaScriptDisabled) await session.send('Emulation.setScriptExecutionDisabled', { value: false });
  await delay(80);
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
  const definitions = {
    Enter: { code: 'Enter', virtualKeyCode: 13, text: '\r' },
    ' ': { code: 'Space', virtualKeyCode: 32, text: ' ' },
  };
  const definition = definitions[key] ?? { code: key, virtualKeyCode: 0, text: '' };
  await session.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key,
    code: definition.code,
    windowsVirtualKeyCode: definition.virtualKeyCode,
    nativeVirtualKeyCode: definition.virtualKeyCode,
  });
  if (definition.text) {
    await session.send('Input.dispatchKeyEvent', {
      type: 'char',
      key,
      code: definition.code,
      text: definition.text,
      unmodifiedText: definition.text,
      windowsVirtualKeyCode: definition.virtualKeyCode,
      nativeVirtualKeyCode: definition.virtualKeyCode,
    });
  }
  await session.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: definition.code,
    windowsVirtualKeyCode: definition.virtualKeyCode,
    nativeVirtualKeyCode: definition.virtualKeyCode,
  });
  await delay(60);
};

const pressBrowserZoomIn = async (session) => {
  const event = {
    key: '+',
    code: 'Equal',
    modifiers: 2,
    windowsVirtualKeyCode: 187,
    nativeVirtualKeyCode: 187,
  };
  await session.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...event });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', ...event });
  await delay(120);
};

const auditAssets = async () => {
  const assetDirectory = join(repositoryRoot, 'dist/_astro');
  const files = await readdir(assetDirectory);
  let registerJavaScriptBytes = 0;
  let registerJavaScriptGzipBytes = 0;
  let registerCssBytes = 0;
  let registerCssGzipBytes = 0;
  for (const file of files) {
    const path = join(assetDirectory, file);
    const source = await readFile(path);
    const text = source.toString('utf8');
    if (file.endsWith('.js') && text.includes('registerInitialized')) {
      registerJavaScriptBytes += source.byteLength;
      registerJavaScriptGzipBytes += gzipSync(source).byteLength;
    }
    if (file.endsWith('.css') && text.includes('.work-register')) {
      registerCssBytes += source.byteLength;
      registerCssGzipBytes += gzipSync(source).byteLength;
    }
  }
  Object.assign(metrics, { registerJavaScriptBytes, registerJavaScriptGzipBytes, registerCssBytes, registerCssGzipBytes });
};

const harnessSource = `---
import GlobalShell from '../../layouts/GlobalShell.astro';
import WorkRegister from '../../components/work/WorkRegister.astro';
import WorkRegisterHeader from '../../components/work/WorkRegisterHeader.astro';
import { createSyntheticWorkRegisterRecords } from '../../../tests/support/work-register-fixtures.ts';
import '../../styles/work-register.css';

export const getStaticPaths = () => [0, 1, 10, 50, 200].map((size) => ({ params: { size: String(size) }, props: { size } }));
const { size } = Astro.props;
const records = createSyntheticWorkRegisterRecords(size);
---
<GlobalShell title={\`Synthetic Work Register QA \${size} — azwerks\`} description="Temporary isolated synthetic Work Register quality assurance." mainId="work-audit" workResultsId="work-results" noindex>
  <p data-synthetic-audit>Temporary synthetic QA harness; not portfolio content.</p>
  <WorkRegisterHeader count={records.length} />
  <WorkRegister records={records} />
</GlobalShell>
`;

try {
  await rm(harnessDirectory, { recursive: true, force: true });
  build();
  const productionHtml = await readFile(join(repositoryRoot, 'dist/work/index.html'));
  metrics.productionEmptyHtmlBytes = productionHtml.byteLength;

  start(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4322']);
  await waitFor(`${siteUrl}/work/`);
  start('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  const production = await openPage({ path: '/work/' });
  const productionData = await production.session.evaluate(`(() => ({
    h1: document.querySelectorAll('h1').length,
    noindex: document.querySelector('meta[name="robots"]')?.content === 'noindex, nofollow',
    corpusEmpty: Boolean(document.querySelector('[data-empty-kind="corpus-empty"]')),
    controls: document.querySelector('[data-register-controls]'),
    fixtureText: document.body.textContent.includes('Synthetic Work Register QA'),
    current: document.querySelector('nav[aria-label="Primary"] [aria-current="page"]')?.textContent.trim(),
    runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType}) => ['fetch','xmlhttprequest'].includes(initiatorType)).length,
  }))()`);
  record('production empty route', {
    'one H1': productionData.h1 === 1,
    noindex: productionData.noindex,
    'truthful corpus empty': productionData.corpusEmpty,
    'controls omitted': productionData.controls === null,
    'no synthetic fixture copy': !productionData.fixtureText,
    'Work current': productionData.current === 'Work',
    'zero runtime content requests': productionData.runtimeRequests === 0,
  });
  await closePage(production);
  await stopProcesses();

  await mkdir(harnessDirectory, { recursive: true });
  await writeFile(harnessPath, harnessSource, 'utf8');
  build();
  metrics.populated200HtmlBytes = (await stat(join(repositoryRoot, 'dist/work-register-audit/200/index.html'))).size;
  await auditAssets();

  start(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4322']);
  await waitFor(`${siteUrl}/work-register-audit/10/`);
  start('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  for (const size of [0, 1, 10, 50, 200]) {
    const page = await openPage({ path: `/work-register-audit/${size}/` });
    const data = await page.session.evaluate(`(() => ({
      items: document.querySelectorAll('[data-register-item]').length,
      enhanced: document.querySelector('[data-register-root]')?.dataset.registerEnhanced,
      controlsVisible: Boolean(document.querySelector('[data-register-controls]:not([hidden])')),
      corpusEmpty: Boolean(document.querySelector('[data-empty-kind="corpus-empty"]')),
      nodeCount: document.querySelectorAll('*').length,
      initMs: Number(document.querySelector('[data-register-root]')?.dataset.registerInitMs ?? 0),
      runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType}) => ['fetch','xmlhttprequest'].includes(initiatorType)).length,
      animations: document.getAnimations().length,
      cls: window.__registerCls ?? null,
    }))()`);
    metrics[`domNodes${size}`] = data.nodeCount;
    if (size === 200) metrics.initializationMilliseconds200 = data.initMs;
    record(`dataset ${size}`, {
      'exact item count': data.items === size,
      'appropriate empty state': size === 0 ? data.corpusEmpty && !data.controlsVisible : data.enhanced === 'true' && data.controlsVisible,
      'zero runtime requests': data.runtimeRequests === 0,
      'zero continuous animation': data.animations === 0,
      'zero register CLS': data.cls === 0,
    }, `nodes=${data.nodeCount} init=${data.initMs}ms cls=${data.cls}`);
    await closePage(page);
  }

  const noScript = await openPage({ path: '/work-register-audit/10/', width: 320, javaScriptDisabled: true });
  const noScriptData = await noScript.session.evaluate(`(() => ({
    items: document.querySelectorAll('[data-register-item]').length,
    hiddenItems: document.querySelectorAll('[data-register-item][hidden]').length,
    controlsHidden: document.querySelector('[data-register-controls]').hidden,
    enhanced: document.querySelector('[data-register-root]').dataset.registerEnhanced,
    categoryLinks: document.querySelectorAll('.work-register__category-nav a').length,
    noscript: document.body.textContent.includes('complete public register is visible'),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }))()`);
  record('no-JavaScript baseline', {
    'complete list visible': noScriptData.items === 10 && noScriptData.hiddenItems === 0,
    'controls enhancement gated': noScriptData.controlsHidden && noScriptData.enhanced === 'false',
    'category browsing': noScriptData.categoryLinks === 5,
    'truthful noscript note': noScriptData.noscript,
    'no horizontal overflow': !noScriptData.overflow,
  });
  await closePage(noScript);

  const interaction = await openPage({ path: '/work-register-audit/10/?category=bad&sort=random' });
  const hydrated = await interaction.session.evaluate(`(() => ({
    url: location.search,
    semanticList: document.querySelector('[data-register-list]')?.tagName,
    fieldsets: document.querySelectorAll('[data-register-controls] fieldset').length,
    live: document.querySelector('[data-register-announcer]')?.getAttribute('aria-live'),
    links: document.querySelectorAll('[data-register-item] h3 a').length,
    media: document.querySelectorAll('.project-preview img[width][height]').length,
    noMedia: [...document.querySelectorAll('[data-register-item]')].some((item) => !item.querySelector('img')),
  }))()`);
  record('hydration and semantics', {
    'invalid URL normalized': hydrated.url === '',
    'semantic ordered list': hydrated.semanticList === 'OL',
    'filter fieldsets': hydrated.fieldsets === 3,
    'polite live region': hydrated.live === 'polite',
    'project links deferred': hydrated.links === 0,
    'valid intrinsic preview': hydrated.media > 0,
    'missing preview has no placeholder': hydrated.noMedia,
  });

  const keyboard = await openPage({ path: '/work-register-audit/10/', width: 375 });
  await keyboard.session.evaluate(`(() => {
    const input = document.querySelector('[name="q"]');
    input.value = 'record 004';
    input.focus();
  })()`);
  await pressKey(keyboard.session, 'Enter');
  const enterData = await keyboard.session.evaluate(`(() => ({
    visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
    focus: document.activeElement?.getAttribute('name'),
  }))()`);
  await keyboard.session.evaluate(`document.querySelector('input[name="category"][value="software"]').focus()`);
  await pressKey(keyboard.session, ' ');
  const spaceChecked = await keyboard.session.evaluate(`document.querySelector('input[name="category"][value="software"]').checked`);
  await keyboard.session.evaluate(`document.querySelector('.work-controls__filters summary').focus()`);
  await pressKey(keyboard.session, 'Enter');
  const disclosureClosed = await keyboard.session.evaluate(`!document.querySelector('.work-controls__filters').open`);
  await pressKey(keyboard.session, 'Enter');
  const disclosureOpened = await keyboard.session.evaluate(`document.querySelector('.work-controls__filters').open`);
  await keyboard.session.evaluate(`document.querySelector('[data-register-reset]').focus()`);
  await pressKey(keyboard.session, 'Enter');
  const keyboardReset = await keyboard.session.evaluate(`(() => ({
    visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
    focused: document.activeElement?.matches('[data-register-reset]'),
    skipTarget: document.querySelector('.skip-links a[href="#work-results"]')?.getAttribute('href'),
  }))()`);
  record('physical keyboard operations', {
    'Enter submits search': enterData.visible === 1 && enterData.focus === 'q',
    'Space toggles checkbox': spaceChecked,
    'disclosure toggles with Enter': disclosureClosed && disclosureOpened,
    'Reset activates with Enter': keyboardReset.visible === 10 && keyboardReset.focused,
    'Work-results skip target': keyboardReset.skipTarget === '#work-results',
  }, `enter=${JSON.stringify(enterData)} space=${spaceChecked} disclosure=${disclosureClosed}/${disclosureOpened} reset=${JSON.stringify(keyboardReset)}`);
  await closePage(keyboard);

  const applied = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    const query = form.elements.q;
    const submit = form.querySelector('[type="submit"]');
    query.value = 'record 003';
    submit.focus();
    form.requestSubmit(submit);
    return {
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      url: location.search,
      focus: document.activeElement === submit,
      count: document.querySelector('[data-register-count]').textContent,
      announced: document.querySelector('[data-register-announcer]').textContent,
    };
  })()`);
  record('search Apply', {
    'one result': applied.visible === 1,
    'stable URL': applied.url === '?q=record+003',
    'focus stable': applied.focus,
    'count accurate': applied.count.includes('Showing 1 of 10'),
    'settled announcement': applied.announced.includes('Showing 1 of 10'),
  });

  const multiFilter = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    form.elements.q.value = '';
    for (const box of form.querySelectorAll('input[type="checkbox"]')) box.checked = false;
    form.querySelector('input[name="category"][value="software"]').checked = true;
    form.querySelector('input[name="category"][value="art"]').checked = true;
    form.querySelector('input[name="maintenance"][value="active"]').checked = true;
    form.querySelector('input[name="evidence"][value="verified"]').checked = true;
    form.requestSubmit(form.querySelector('[type="submit"]'));
    return { url: location.search, visible: document.querySelectorAll('[data-register-item]:not([hidden])').length };
  })()`);
  record('combined filters', {
    'repeated category URL': multiFilter.url.includes('category=software&category=art'),
    'AND groups applied': multiFilter.visible === 1,
  });

  const sorted = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    form.reset();
    form.elements.sort.value = 'title';
    form.requestSubmit(form.querySelector('[type="submit"]'));
    const keys = [...document.querySelectorAll('[data-register-item]:not([hidden])')].map((node) => node.dataset.titleSortKey);
    return { keys, url: location.search };
  })()`);
  record('title sort', {
    'sort serialized': sorted.url === '?sort=title',
    'deterministic title order': sorted.keys.join('|') === [...sorted.keys].sort().join('|'),
  });

  const reset = await interaction.session.evaluate(`(() => {
    const button = document.querySelector('[data-register-reset]');
    button.focus();
    button.click();
    return {
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      url: location.search,
      focus: document.activeElement === button,
      sort: document.querySelector('[name="sort"]').value,
    };
  })()`);
  record('Reset', {
    'all records restored': reset.visible === 10,
    'canonical URL': reset.url === '',
    'focus stable': reset.focus,
    'curated restored': reset.sort === 'curated',
  });

  const historyData = await interaction.session.evaluate(`(async () => {
    const form = document.querySelector('[data-register-controls]');
    form.elements.q.value = 'record 001'; form.requestSubmit(form.querySelector('[type="submit"]'));
    form.elements.q.value = 'record 002'; form.requestSubmit(form.querySelector('[type="submit"]'));
    history.back();
    await new Promise((resolve) => setTimeout(resolve, 120));
    return {
      q: form.elements.q.value,
      url: location.search,
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      announced: document.querySelector('[data-register-announcer]').textContent,
    };
  })()`);
  record('history restoration', {
    'query restored': historyData.q === 'record 001' && historyData.url === '?q=record+001',
    'visibility restored': historyData.visible === 1,
    'history announced': historyData.announced.includes('Showing 1 of 10'),
  });
  const forwardData = await interaction.session.evaluate(`(async () => {
    history.forward();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const form = document.querySelector('[data-register-controls]');
    return {
      q: form.elements.q.value,
      url: location.search,
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
    };
  })()`);
  record('forward history restoration', {
    'query restored': forwardData.q === 'record 002' && forwardData.url === '?q=record+002',
    'visibility restored': forwardData.visible === 1,
  });

  const filterEmpty = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    form.elements.q.value = 'no possible synthetic match';
    form.requestSubmit(form.querySelector('[type="submit"]'));
    const state = {
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      empty: !document.querySelector('[data-empty-kind="filter-empty"]').hidden,
      hiddenFocusable: [...document.querySelectorAll('[data-register-item][hidden] a, [data-register-item][hidden] button')].length,
    };
    document.querySelector('[data-empty-reset]').click();
    return { ...state, resetVisible: document.querySelectorAll('[data-register-item]:not([hidden])').length };
  })()`);
  record('filter-empty recovery', {
    'no results': filterEmpty.visible === 0,
    'distinct filter empty': filterEmpty.empty,
    'no hidden focusables': filterEmpty.hiddenFocusable === 0,
    'Reset recovers': filterEmpty.resetVisible === 10,
  });

  const failure = await interaction.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    history.pushState = () => { throw new Error('synthetic history failure') };
    form.elements.q.value = 'record 001';
    form.requestSubmit(form.querySelector('[type="submit"]'));
    return {
      enhanced: document.querySelector('[data-register-root]').dataset.registerEnhanced,
      controlsHidden: form.hidden,
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      error: !document.querySelector('[data-empty-kind="error-block"]').hidden,
    };
  })()`);
  record('enhancement failure', {
    'enhancement removed': failure.enhanced === 'false',
    'controls hidden': failure.controlsHidden,
    'full list restored': failure.visible === 10,
    'recoverable explanation': failure.error,
  });
  await closePage(interaction);

  for (const scenario of [
    { name: '320px', width: 320, height: 700 },
    { name: '375px', width: 375, height: 720 },
    { name: '768px landscape', width: 768, height: 420 },
    { name: '1024px', width: 1024, height: 800 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '200% text', width: 320, height: 900, textScale: true },
    { name: 'forced colors', width: 375, height: 720, forcedColors: true },
    { name: 'reduced motion', width: 375, height: 720, reducedMotion: true },
    { name: 'print', width: 1024, height: 900, print: true },
  ]) {
    const page = await openPage({ path: '/work-register-audit/10/', ...scenario });
    const data = await page.session.evaluate(`(() => {
      const viewport = Math.ceil(window.visualViewport?.width ?? innerWidth);
      const targets = [...document.querySelectorAll('[data-register-controls] button, [data-register-controls] input[type="search"], [data-register-controls] select, [data-register-controls] summary')]
        .filter((node) => node.getClientRects().length > 0)
        .map((node) => node.getBoundingClientRect().height);
      return {
        overflow: document.documentElement.scrollWidth > viewport,
        targets: targets.every((height) => height >= 44),
        h1Visible: document.querySelector('h1').getBoundingClientRect().width <= viewport,
        mode: ${scenario.forcedColors ? "matchMedia('(forced-colors: active)').matches" : scenario.reducedMotion ? "matchMedia('(prefers-reduced-motion: reduce)').matches" : scenario.print ? "matchMedia('print').matches" : 'true'},
        printControls: ${scenario.print ? "getComputedStyle(document.querySelector('[data-register-controls]')).display === 'none'" : 'true'},
      };
    })()`);
    record(scenario.name, {
      'no horizontal overflow': !data.overflow,
      '44px primary controls': data.targets,
      'heading visible': data.h1Visible,
      'mode active': data.mode,
      'print controls omitted': data.printControls,
    });
    await closePage(page);
  }

  const zoom = await openPage({ path: '/work-register-audit/10/', width: 1024, height: 900 });
  const beforeZoom = await zoom.session.evaluate(`({ width: innerWidth, ratio: devicePixelRatio })`);
  await pressBrowserZoomIn(zoom.session);
  await pressBrowserZoomIn(zoom.session);
  const afterZoom = await zoom.session.evaluate(`(() => ({
    width: innerWidth,
    ratio: devicePixelRatio,
    overflow: document.documentElement.scrollWidth > Math.ceil(window.visualViewport?.width ?? innerWidth),
    h1Visible: document.querySelector('h1').getBoundingClientRect().right <= Math.ceil(window.visualViewport?.width ?? innerWidth),
  }))()`);
  record('native browser zoom', {
    'browser zoom changed layout scale': afterZoom.width < beforeZoom.width || afterZoom.ratio > beforeZoom.ratio,
    'no horizontal overflow': !afterZoom.overflow,
    'heading visible': afterZoom.h1Visible,
  }, `before=${JSON.stringify(beforeZoom)} after=${JSON.stringify(afterZoom)}`);
  await closePage(zoom);

  const scale = await openPage({ path: '/work-register-audit/200/' });
  const scaleData = await scale.session.evaluate(`(() => {
    const form = document.querySelector('[data-register-controls]');
    form.elements.q.value = 'system';
    form.querySelector('input[name="category"][value="software"]').checked = true;
    const started = performance.now();
    form.requestSubmit(form.querySelector('[type="submit"]'));
    return {
      duration: performance.now() - started,
      visible: document.querySelectorAll('[data-register-item]:not([hidden])').length,
      count: document.querySelector('[data-register-count]').textContent,
    };
  })()`);
  metrics.applyToRenderMilliseconds200 = scaleData.duration;
  record('200-record Apply benchmark', {
    'results updated': scaleData.visible > 0 && scaleData.count.includes('of 200'),
    'within 100ms test-machine target': scaleData.duration <= 100,
  }, `${scaleData.duration.toFixed(3)}ms`);
  await closePage(scale);

  record('register asset budgets', {
    'JavaScript found': metrics.registerJavaScriptBytes > 0,
    'JavaScript <=10KB minified': metrics.registerJavaScriptBytes <= 10 * 1024,
    'CSS found': metrics.registerCssBytes > 0,
    'CSS <=14KB compressed': metrics.registerCssGzipBytes <= 14 * 1024,
  }, `js=${metrics.registerJavaScriptBytes}B gzip=${metrics.registerJavaScriptGzipBytes}B css=${metrics.registerCssBytes}B gzip=${metrics.registerCssGzipBytes}B`);

  for (const result of results) {
    console.log(`${result.failures.length === 0 ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
  }
  console.log(`METRICS ${JSON.stringify(metrics)}`);
  const failureCount = results.reduce((total, result) => total + result.failures.length, 0);
  if (failureCount > 0) throw new Error(`Work Register browser audit failed: ${failureCount} assertion(s) across ${results.length} scenarios.`);
  console.log(`Work Register browser audit passed: ${results.length} deterministic scenarios.`);
} finally {
  await stopProcesses();
  await rm(browserDataDirectory, { recursive: true, force: true });
  await rm(harnessDirectory, { recursive: true, force: true });
  build();
  const leakedHarness = await stat(join(repositoryRoot, 'dist/work-register-audit')).then(() => true, () => false);
  if (leakedHarness) throw new Error('Temporary Work Register harness remains in production output.');
}
