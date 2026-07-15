import { spawn, spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

import { repositoryRoot } from './token-utils.mjs';

const siteUrl = 'http://127.0.0.1:4324';
const debuggingPort = 9337;
const astroCli = join(repositoryRoot, 'node_modules/astro/bin/astro.mjs');
const harnessDirectory = join(repositoryRoot, 'src/pages/project-worlds-audit');
const harnessPath = join(harnessDirectory, '[slug].astro');
const narrativePath = join(harnessDirectory, '_AuditNarrative.astro');
const assetDirectory = join(repositoryRoot, 'public/project-worlds-audit');
const browserDataDirectory = await mkdtemp('/tmp/azwerks-project-worlds-browser-audit-');
const processes = [];
const results = [];
const detailBaseline10RouteMilliseconds = 2762.67;
const metrics = { buildMilliseconds: {}, detailBaseline10RouteMilliseconds };

const build = (count) => {
  const started = performance.now();
  const result = spawnSync(process.execPath, [astroCli, 'build'], {
    cwd: repositoryRoot,
    env: { ...process.env, ...(count === undefined ? {} : { PROJECT_WORLDS_AUDIT_COUNT: String(count) }) },
    stdio: 'inherit',
  });
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

const waitFor = async (url, attempts = 120) => {
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
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
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
} = {}) => {
  const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  const target = await response.json();
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.open();
  await session.send('Page.enable');
  await session.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await session.send('Runtime.enable');
  await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__worldCls=0;try{new PerformanceObserver((list)=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput)window.__worldCls+=entry.value}}).observe({type:'layout-shift',buffered:true})}catch{}`,
  });
  if (invalidStorage) await session.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{localStorage.setItem('azwerks.portfolio.theme.v1','invalid-world-audit-value')}catch{}`,
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

const pressTab = async (session) => {
  await session.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  await delay(40);
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
  let worldJavaScriptBytes = 0;
  for (const file of await readdir(directory)) {
    const source = await readFile(join(directory, file));
    const text = source.toString('utf8');
    if (file.endsWith('.css') && text.includes('.project-world')) {
      cssBytes += source.byteLength;
      cssGzipBytes += gzipSync(source).byteLength;
    }
    if (file.endsWith('.js') && text.includes('project-world')) worldJavaScriptBytes += source.byteLength;
  }
  Object.assign(metrics, { cssBytes, cssGzipBytes, worldJavaScriptBytes });
};

const harnessSource = `---
import ProjectDetail from '../../components/project/ProjectDetail.astro';
import ProjectDetailLayout from '../../layouts/ProjectDetailLayout.astro';
import { getProjectDetailRouteRecords } from '../../lib/project-detail/routes.ts';
import { createProjectDetailViewModel } from '../../lib/project-detail/view-model.ts';
import { createProjectDetailAuditBundles, createProjectDetailBundle } from '../../../tests/support/project-detail-fixtures.ts';
import AuditNarrative from './_AuditNarrative.astro';

export const getStaticPaths = () => {
  const requestedCount = Math.max(0, Math.min(10, Number(process.env.PROJECT_WORLDS_AUDIT_COUNT ?? '10')));
  const bundles = createProjectDetailAuditBundles(requestedCount, '/project-worlds-audit');
  if (requestedCount === 10) bundles[9] = createProjectDetailBundle('synthetic-detail-10', 'software');
  const routes = getProjectDetailRouteRecords(bundles);
  const auditHref = (slug) => \`/project-worlds-audit/\${slug}/\`;
  const remapDestination = (destination) => destination ? { ...destination, href: auditHref(routes.find(({ id }) => id === destination.id)?.slug ?? destination.id) } : undefined;
  const headings = [
    { depth: 2, slug: 'overview', text: 'Overview' },
    { depth: 3, slug: 'method', text: 'Method' },
    { depth: 2, slug: 'result', text: 'Result' },
    { depth: 2, slug: 'wide-material', text: 'Wide material' },
  ];
  return routes.map((route, index) => {
    const base = createProjectDetailViewModel(bundles[index], routes, index, headings);
    const href = auditHref(route.slug);
    const project = {
      ...base,
      href,
      canonical: href,
      noindex: true,
      previousProject: remapDestination(base.previousProject),
      nextProject: remapDestination(base.nextProject),
      relations: base.relations.map((relation) => ({ ...relation, project: remapDestination(relation.project) })),
    };
    return { params: { slug: route.slug }, props: { project } };
  });
};

const { project } = Astro.props;
---
<ProjectDetailLayout project={project}>
  <p data-synthetic-audit>Temporary isolated synthetic QA harness; not portfolio content.</p>
  <ProjectDetail project={project} Content={AuditNarrative} hasNarrative={project.slug !== 'synthetic-detail-10'} />
</ProjectDetailLayout>
`;

const narrativeSource = `---
---
<h2 id="overview">Overview</h2>
<p>This synthetic narrative verifies the shared project-detail reading contract without representing real portfolio work.</p>
<h3 id="method">Method</h3>
<p>The method uses static semantic HTML, governed tokens, and no client content request.</p>
<h2 id="result">Result</h2>
<blockquote>The fixture proves structure only; it makes no production claim.</blockquote>
<h2 id="wide-material">Wide material</h2>
<pre tabindex="0"><code>synthetic-command --with-an-intentionally-long-value=abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789</code></pre>
<table><caption>Synthetic wide table</caption><thead><tr><th scope="col">Field</th><th scope="col">Long value</th></tr></thead><tbody><tr><th scope="row">Boundary</th><td>abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789</td></tr></tbody></table>
`;

const svgSource = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#202826"/><path d="M120 650 430 160l220 360 170-250 260 380" fill="none" stroke="#d7f500" stroke-width="32"/></svg>`;

try {
  await rm(harnessDirectory, { recursive: true, force: true });
  await rm(assetDirectory, { recursive: true, force: true });
  metrics.buildMilliseconds.productionZero = build();
  const productionWorkEntries = await readdir(join(repositoryRoot, 'dist/work'));
  record('production zero-route build', {
    'only Work index generated': productionWorkEntries.length === 1 && productionWorkEntries[0] === 'index.html',
  });

  await mkdir(harnessDirectory, { recursive: true });
  await mkdir(assetDirectory, { recursive: true });
  await writeFile(harnessPath, harnessSource, 'utf8');
  await writeFile(narrativePath, narrativeSource, 'utf8');
  await writeFile(join(assetDirectory, 'synthetic-media.svg'), svgSource, 'utf8');

  const media = spawnSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=8000:cl=mono', '-t', '0.2', '-y', join(assetDirectory, 'silence.wav')]);
  if (media.error || media.status !== 0) throw media.error ?? new Error('ffmpeg could not create the temporary audio fixture.');
  const video = spawnSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=320x180:r=1', '-t', '1', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', join(assetDirectory, 'silent-video.mp4')]);
  if (video.error || video.status !== 0) throw video.error ?? new Error('ffmpeg could not create the temporary video fixture.');

  for (const count of [0, 5, 10]) metrics.buildMilliseconds[count] = build(count);
  await auditAssets();
  metrics.sparseHtmlBytes = (await stat(join(repositoryRoot, 'dist/project-worlds-audit/synthetic-detail-05/index.html'))).size;
  metrics.normalHtmlBytes = (await stat(join(repositoryRoot, 'dist/project-worlds-audit/synthetic-detail-01/index.html'))).size;
  metrics.longHtmlBytes = (await stat(join(repositoryRoot, 'dist/project-worlds-audit/synthetic-detail-06/index.html'))).size;

  start(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4324']);
  await waitFor(`${siteUrl}/project-worlds-audit/synthetic-detail-01/`);
  start('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${browserDataDirectory}`,
    'about:blank',
  ]);
  await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);

  const categories = ['software', 'visual-system', 'art', 'technical-system', 'limited-media'];
  const expectedOrders = {
    software: ['orientation','header','lead','narrative','evidence','limitations','process','releases','links','provenance','relations','context-navigation'],
    'visual-system': ['orientation','header','lead','narrative','process','evidence','limitations','releases','links','provenance','relations','context-navigation'],
    art: ['orientation','header','lead','narrative','process','limitations','provenance','evidence','relations','links','releases','context-navigation'],
    'technical-system': ['orientation','header','lead','narrative','limitations','evidence','process','releases','provenance','links','relations','context-navigation'],
    'limited-media': ['orientation','header','lead','narrative','evidence','limitations','process','provenance','releases','links','relations','context-navigation'],
  };
  for (let index = 0; index < categories.length; index += 1) {
    const serial = String(index + 1).padStart(2, '0');
    const page = await openPage({ path: `/project-worlds-audit/synthetic-detail-${serial}/` });
    const data = await page.session.evaluate(`(() => ({
      category: document.querySelector('[data-project-category]')?.dataset.projectCategory,
      world: document.querySelector('[data-project-world]')?.dataset.projectWorld,
      markLevel: document.querySelector('[data-world-authored-mark-level]')?.dataset.worldAuthoredMarkLevel,
      order: [...document.querySelectorAll('[data-world-section]')].map(({dataset})=>dataset.worldSection),
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      article: document.querySelectorAll('article.project-detail').length,
      back: document.querySelector('.project-orientation a')?.getAttribute('href'),
      noindex: document.querySelector('meta[name="robots"]')?.content,
      sections: [...document.querySelectorAll('.project-detail h2')].map(({textContent})=>textContent.trim()),
      runtimeRequests: performance.getEntriesByType('resource').filter(({initiatorType})=>['fetch','xmlhttprequest'].includes(initiatorType)).length,
      mediaRequests: performance.getEntriesByType('resource').filter(({initiatorType})=>['img','video','audio'].includes(initiatorType)).length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      cls: window.__worldCls,
      animations: document.getAnimations().filter(({playState})=>playState==='running').length,
    }))()`);
    record(`category ${categories[index]}`, {
      'correct category attribute': data.category === categories[index],
      'category resolves to world': data.world === categories[index],
      'authored marks remain Level 0': data.markLevel === '0',
      'rendered order follows typed policy': data.order.every((section, position, rendered) => position === 0 || expectedOrders[categories[index]].indexOf(rendered[position - 1]) < expectedOrders[categories[index]].indexOf(section)),
      'orientation and header lead': data.order[0] === 'orientation' && data.order[1] === 'header',
      'context navigation closes': data.order.at(-1) === 'context-navigation',
      'one H1': data.h1 === 1,
      'one main': data.main === 1,
      'one project article': data.article === 1,
      'Back to Work is native': data.back === '/work/',
      noindex: data.noindex === 'noindex, nofollow',
      'visible limitations': data.sections.includes('Limitations'),
      'zero runtime content requests': data.runtimeRequests === 0,
      'no page overflow': !data.overflow,
      'zero CLS': data.cls === 0,
      'zero continuous animation': data.animations === 0,
    }, `mediaRequests=${data.mediaRequests}`);
    await closePage(page);
  }

  const rich = await openPage({ path: '/project-worlds-audit/synthetic-detail-01/' });
  const richData = await rich.session.evaluate(`(() => ({
    toc: [...document.querySelectorAll('.project-contents a')].map((link)=>link.getAttribute('href')),
    lead: document.querySelector('[data-media-type="interface"] img[width][height]') !== null,
    audio: document.querySelector('audio[controls]') !== null,
    transcript: document.body.textContent.includes('Transcript:'),
    relations: document.querySelectorAll('.project-relations a').length,
    previous: document.body.textContent.includes('Previous project:'),
    next: document.body.textContent.includes('Next project:'),
    privacy: ['Private source note','Private rights note','Private redaction note','Internal reviewer identity','fixtureProjects','/private/'].some((value)=>document.documentElement.innerHTML.includes(value)),
    focusables: document.querySelectorAll('a[href],button,input,select,textarea,audio[controls],video[controls],[tabindex="0"]').length,
    nodes: document.querySelectorAll('*').length,
  }))()`);
  record('rich semantics and privacy', {
    'semantic contents links': richData.toc.join(',') === '#overview,#method,#result,#wide-material',
    'intrinsic lead media': richData.lead,
    'native audio': richData.audio,
    'visible transcript contract': richData.transcript,
    'routable relations': richData.relations === 2,
    'first boundary omits previous': !richData.previous && richData.next,
    'no private fields': !richData.privacy,
    'focusable content': richData.focusables > 5,
  }, `nodes=${richData.nodes}`);
  metrics.normalDomNodes = richData.nodes;
  await pressTab(rich.session);
  const firstFocus = await rich.session.evaluate(`document.activeElement?.textContent?.trim()`);
  record('physical keyboard entry', { 'skip link receives first Tab': firstFocus === 'Skip to main content' });
  await closePage(rich);

  const long = await openPage({ path: '/project-worlds-audit/synthetic-detail-06/', width: 320, textScale: true });
  const longData = await long.session.evaluate(`(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    codeLocal: document.querySelector('pre').scrollWidth >= document.querySelector('pre').clientWidth,
    tableLocal: document.querySelector('table').scrollWidth >= document.querySelector('table').clientWidth,
    metric: document.body.textContent.includes('Static fixture measurement') && document.body.textContent.includes('12 milliseconds') && document.body.textContent.includes('Synthetic timing report'),
    privateLink: [...document.links].some(({href})=>href.includes('private.example')),
    process: document.querySelectorAll('.project-process li').length,
    releases: document.querySelectorAll('.project-releases li').length,
    limitations: document.querySelectorAll('.project-limitations li').length,
  }))()`);
  record('long content at 320px and 200% text', {
    'no page overflow': !longData.overflow,
    'code locally contained': longData.codeLocal,
    'table locally contained': longData.tableLocal,
    'metric context adjacent': longData.metric,
    'private evidence has no link': !longData.privateLink,
    'long process rendered': longData.process === 8,
    'deterministic releases rendered': longData.releases === 5,
    'many limitations visible': longData.limitations === 5,
  });
  await closePage(long);

  const mediaPage = await openPage({ path: '/project-worlds-audit/synthetic-detail-04/' });
  const mediaData = await mediaPage.session.evaluate(`(() => ({video:document.querySelector('video[controls]')!==null,poster:document.querySelector('video')?.getAttribute('poster'),transcript:document.body.textContent.includes('static poster contains the complete synthetic state')}))()`);
  record('video transcript contract', { 'native video controls': mediaData.video, 'public poster': mediaData.poster === '/project-worlds-audit/synthetic-media.svg', 'visible transcript': mediaData.transcript });
  await closePage(mediaPage);

  const artPage = await openPage({ path: '/project-worlds-audit/synthetic-detail-03/' });
  const artData = await artPage.session.evaluate(`(() => ({artwork:document.querySelectorAll('.project-media--artwork img').length,contains:[...document.querySelectorAll('.project-media--artwork img')].every((img)=>getComputedStyle(img).objectFit==='contain')}))()`);
  record('art ratio fidelity', { 'portrait landscape square rendered': artData.artwork === 3, 'art uses contain': artData.contains });
  await closePage(artPage);

  const artWithoutMedia = await openPage({ path: '/project-worlds-audit/synthetic-detail-08/' });
  const artWithoutMediaData = await artWithoutMedia.session.evaluate(`(() => ({world:document.querySelector('[data-project-world]')?.dataset.projectWorld,noMedia:document.querySelector('.project-no-media')!==null,images:document.querySelectorAll('.project-media img').length,provenance:document.querySelector('.project-provenance')!==null}))()`);
  record('art without media', { 'art world retained': artWithoutMediaData.world === 'art', 'dignified no-media state': artWithoutMediaData.noMedia, 'no invented image': artWithoutMediaData.images === 0, 'provenance retained': artWithoutMediaData.provenance });
  await closePage(artWithoutMedia);

  const sparseSoftware = await openPage({ path: '/project-worlds-audit/synthetic-detail-10/', width: 320 });
  const sparseSoftwareData = await sparseSoftware.session.evaluate(`(() => ({world:document.querySelector('[data-project-world]')?.dataset.projectWorld,sparse:document.querySelector('.project-world--sparse')!==null,noMedia:document.querySelector('.project-no-media')!==null,narrative:document.querySelector('.project-narrative')!==null,overflow:document.documentElement.scrollWidth>innerWidth}))()`);
  record('sparse software', { 'software world retained': sparseSoftwareData.world === 'software', 'sparse state identified': sparseSoftwareData.sparse, 'no-media state retained': sparseSoftwareData.noMedia, 'empty narrative omitted': !sparseSoftwareData.narrative, 'no overflow': !sparseSoftwareData.overflow });
  await closePage(sparseSoftware);

  const sparse = await openPage({ path: '/project-worlds-audit/synthetic-detail-05/', javaScriptDisabled: true, width: 375 });
  const sparseData = await sparse.session.evaluate(`(() => ({noMedia:document.querySelector('.project-no-media')!==null,content:document.querySelector('.project-prose')!==null,links:document.querySelectorAll('a[href]').length,overflow:document.documentElement.scrollWidth>innerWidth}))()`);
  record('no-JavaScript limited-media state', { 'intentional no-media state': sparseData.noMedia, 'narrative present': sparseData.content, 'native links present': sparseData.links > 2, 'no overflow': !sparseData.overflow });
  await closePage(sparse);

  for (const [name, options] of [
    ['forced colors', { forcedColors: true }],
    ['reduced motion', { reducedMotion: true }],
    ['print', { print: true }],
    ['explicit light', { themeAttribute: 'light' }],
    ['explicit dark', { themeAttribute: 'dark' }],
    ['system light', { colorScheme: 'light' }],
    ['system dark', { colorScheme: 'dark' }],
    ['invalid storage fallback', { invalidStorage: true }],
  ]) {
    const page = await openPage({ path: '/project-worlds-audit/synthetic-detail-02/', ...options });
    const data = await page.session.evaluate(`(() => ({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,animations:document.getAnimations().filter(({playState})=>playState==='running').length,printTitle:getComputedStyle(document.querySelector('h1')).display!=='none'}))()`);
    record(name, { 'title retained': data.h1 === 1 && data.printTitle, 'no overflow': !data.overflow, 'no continuous animation': data.animations === 0 });
    await closePage(page);
  }

  for (const width of [320, 375, 768, 1024, 1440, 1600]) {
    const page = await openPage({ path: '/project-worlds-audit/synthetic-detail-06/', width, height: width === 768 ? 420 : 900 });
    const data = await page.session.evaluate(`(() => {const caption=document.querySelector('figcaption');return {overflow:document.documentElement.scrollWidth>innerWidth,title:document.querySelector('h1').getBoundingClientRect().right<=innerWidth,caption:!caption||caption.getBoundingClientRect().right<=innerWidth}})()`);
    record(`responsive ${width}`, { 'no page overflow': !data.overflow, 'title fits': data.title, 'caption fits': data.caption });
    await closePage(page);
  }


  const zoomed = await openPage({ path: '/project-worlds-audit/synthetic-detail-06/', width: 375 });
  const beforeZoom = await zoomed.session.evaluate(`({width:innerWidth,ratio:devicePixelRatio})`);
  await zoomed.session.send('Emulation.setDeviceMetricsOverride', {
    width: 188,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await delay(120);
  const zoomData = await zoomed.session.evaluate(`(() => ({width:innerWidth,ratio:devicePixelRatio,overflow:document.documentElement.scrollWidth>Math.ceil(window.visualViewport?.width??innerWidth),title:document.querySelector('h1').getBoundingClientRect().right<=Math.ceil(window.visualViewport?.width??innerWidth)}))()`);
  record('emulated 200% browser zoom', { 'zoomed layout viewport applied': zoomData.width < beforeZoom.width && zoomData.ratio > beforeZoom.ratio, 'no page overflow': !zoomData.overflow, 'title remains visible': zoomData.title }, `before=${JSON.stringify(beforeZoom)} after=${JSON.stringify(zoomData)}`);
  await closePage(zoomed);

  const missing = await fetch(`${siteUrl}/project-worlds-audit/unknown-slug/`);
  record('unknown slug', { 'missing route is 404': missing.status === 404 });

  record('performance budgets', {
    'world CSS at most 24KB gzip': metrics.cssGzipBytes <= 24 * 1024,
    'world-specific JavaScript is zero': metrics.worldJavaScriptBytes === 0,
    '10-route build regression at most 20 percent': metrics.buildMilliseconds[10] <= detailBaseline10RouteMilliseconds * 1.2,
    '10-route build deterministic output exists': metrics.longHtmlBytes > metrics.sparseHtmlBytes,
  }, JSON.stringify(metrics));
} finally {
  await stopProcesses();
  await rm(harnessDirectory, { recursive: true, force: true });
  await rm(assetDirectory, { recursive: true, force: true });
  await rm(browserDataDirectory, { recursive: true, force: true });
  build();
}

const failed = results.filter(({ failures }) => failures.length > 0);
for (const result of results) {
  console.log(`${result.failures.length === 0 ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
  for (const failure of result.failures) console.error(`  ${failure}`);
}
console.log(`Project world browser audit: ${results.length - failed.length}/${results.length} scenarios passed.`);
console.log(`Project world metrics: ${JSON.stringify(metrics)}`);
if (failed.length > 0) process.exitCode = 1;
