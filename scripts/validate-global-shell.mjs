import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

import { createNavigationModel, getNavigationRegion } from '../src/lib/navigation/navigation-model.ts';
import { repositoryRoot, walkFiles } from './token-utils.mjs';

const failures = [];
const fail = (code, message, path) => failures.push({ code, message, path });
const exists = async (path) => stat(join(repositoryRoot, path)).then(() => true, () => false);
const read = async (path) => readFile(join(repositoryRoot, path), 'utf8');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const requiredComponents = [
  'src/components/shell/GlobalHeader.astro',
  'src/components/shell/BrandIdentity.astro',
  'src/components/shell/PrimaryNavigation.astro',
  'src/components/shell/MobileNavigation.astro',
  'src/components/shell/ThemeControl.astro',
  'src/components/shell/SkipLinks.astro',
  'src/components/shell/GlobalFooter.astro',
  'src/components/shell/ShellStatus.astro',
  'src/components/navigation/NavigationLink.astro',
  'src/components/navigation/ExternalNavigationLink.astro',
  'src/layouts/GlobalShell.astro',
  'src/scripts/shell-navigation.ts',
  'src/styles/shell.css',
];

const routeContract = [
  ['src/pages/index.astro', 'home'],
  ['src/pages/work/index.astro', 'work'],
  ['src/pages/archive/index.astro', 'archive'],
  ['src/pages/about.astro', 'about'],
  ['src/pages/contact.astro', 'contact'],
  ['src/pages/accessibility.astro', 'accessibility'],
  ['src/pages/privacy.astro', 'privacy'],
  ['src/pages/colophon.astro', 'colophon'],
  ['src/pages/404.astro', 'not-found'],
];

for (const path of requiredComponents) {
  if (!(await exists(path))) fail('SHELL_REQUIRED_FILE', 'Required shell file is missing.', path);
}

const mainIds = new Set();
for (const [path, mainId] of routeContract) {
  if (!(await exists(path))) {
    fail('SHELL_ROUTE_MISSING', 'Required scaffold route is missing.', path);
    continue;
  }
  const source = await read(path);
  if (!/import GlobalShell from /.test(source) || !/<GlobalShell\b/.test(source)) {
    fail('SHELL_ROUTE_LAYOUT', 'Scaffold route must use GlobalShell.', path);
  }
  const headingSource = path === 'src/pages/work/index.astro' && await exists('src/components/work/WorkRegisterHeader.astro')
    ? `${source}\n${await read('src/components/work/WorkRegisterHeader.astro')}`
    : source;
  if ((headingSource.match(/<h1(?:\s|>)/g) ?? []).length !== 1) {
    fail('SHELL_ROUTE_H1', 'Scaffold route must contain exactly one H1.', path);
  }
  if (!/\bnoindex(?:=|\s|>)/.test(source)) {
    fail('SHELL_ROUTE_NOINDEX', 'Scaffold route must set noindex.', path);
  }
  const workRegisterRoute = path === 'src/pages/work/index.astro' && /import WorkRegister from /.test(source);
  if (!workRegisterRoute && !/foundation scaffold/i.test(source)) {
    fail('SHELL_ROUTE_DISCLOSURE', 'Scaffold route must identify itself as a foundation scaffold.', path);
  }
  const declaredMainId = source.match(/mainId=["']([^"']+)["']/)?.[1] ?? 'main-content';
  if (mainIds.has(declaredMainId)) fail('SHELL_MAIN_ID_DUPLICATE', `Main id "${declaredMainId}" is duplicated.`, path);
  mainIds.add(declaredMainId);
  if (path.includes('/work/') && !source.includes('workResultsId="work-results"')) {
    fail('SHELL_WORK_RESULTS_TARGET', 'Work scaffold must declare the future work-results skip target.', path);
  }
  if (declaredMainId !== mainId) {
    fail('SHELL_MAIN_ID', `Expected main id "${mainId}".`, path);
  }
}

try {
  const navigationSource = JSON.parse(await read('src/content/navigation.json'));
  const model = createNavigationModel(navigationSource);
  const primary = getNavigationRegion(model, 'primary');
  if (primary.map(({ id }) => id).join(',') !== 'work,archive,about,contact') {
    fail('SHELL_NAV_PRIMARY', 'Primary navigation must be Work, Archive, About, Contact in order.', 'src/content/navigation.json');
  }
  if (!primary.some(({ id, direct }) => id === 'work' && direct)) {
    fail('SHELL_NAV_WORK_DIRECT', 'Work must be a direct primary route.', 'src/content/navigation.json');
  }
} catch (error) {
  fail(error.code ?? 'SHELL_NAV_INVALID', error.message, 'src/content/navigation.json');
}

const productionFiles = (await walkFiles(join(repositoryRoot, 'src')))
  .filter((path) => ['.astro', '.css', '.ts', '.js', '.mjs'].includes(extname(path)))
  .filter((path) => /src\/(?:components|layouts|pages|styles|scripts|lib\/(?:navigation|shell))\//.test(relative(repositoryRoot, path)));
for (const absolutePath of productionFiles) {
  const source = await readFile(absolutePath, 'utf8');
  const path = relative(repositoryRoot, absolutePath);
  if (/content\/fixtures|fixture(?:Projects|Navigation|ProjectData|ProjectRelations|SitePages)/i.test(source)) {
    fail('SHELL_FIXTURE_IMPORT', 'Production shell source imports fixture content.', path);
  }
  const hasInlineEventAttribute = extname(absolutePath) === '.astro' && /\son[a-z]+\s*=/i.test(source);
  if (/javascript\s*:/i.test(source) || hasInlineEventAttribute) {
    fail('SHELL_UNSAFE_INTERACTION', 'Unsafe URL or inline event attribute found.', path);
  }
}

if (await exists('src/styles/shell.css')) {
  const source = (await read('src/styles/shell.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const rawChecks = [
    ['SHELL_RAW_COLOR', /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|lab|lch)a?\(/i],
    ['SHELL_PRIMITIVE_TOKEN', /var\(--azw-p-/],
    ['SHELL_RAW_MOTION', /(?:animation|transition)(?:-[a-z-]+)?\s*:[^;]*(?:\d+m?s|cubic-bezier\()/i],
    ['SHELL_RAW_Z_INDEX', /z-index\s*:\s*-?\d+\s*;/i],
  ];
  for (const [code, pattern] of rawChecks) {
    if (pattern.test(source)) fail(code, 'Shell CSS contains an ungoverned value.', 'src/styles/shell.css');
  }
  const governedDeclarations = [
    ['SHELL_RAW_SHADOW', 'box-shadow', /^(?:var\(|none\b)/i],
    ['SHELL_RAW_RADIUS', 'border-radius', /^(?:var\(|0\b)/i],
    ['SHELL_RAW_TYPE_SIZE', 'font-size', /^(?:var\(|inherit\b|100%\b)/i],
  ];
  for (const [code, property, allowed] of governedDeclarations) {
    for (const match of source.matchAll(new RegExp(`${property}\\s*:\\s*([^;]+)`, 'gi'))) {
      if (!allowed.test(match[1].trim())) {
        fail(code, `Shell CSS contains an ungoverned ${property} value.`, 'src/styles/shell.css');
      }
    }
  }
  for (const match of source.matchAll(/@media\s*\(min-width:\s*([^\)]+)\)/g)) {
    if (match[1].trim() !== '64rem') {
      fail('SHELL_BREAKPOINT_UNGOVERNED', `Media breakpoint "${match[1].trim()}" is not the governed workspace breakpoint.`, 'src/styles/shell.css');
    }
  }
}

if (await exists('src/components/shell/PrimaryNavigation.astro') && await exists('src/components/shell/MobileNavigation.astro')) {
  const desktop = await read('src/components/shell/PrimaryNavigation.astro');
  const mobile = await read('src/components/shell/MobileNavigation.astro');
  if (!desktop.includes('items') || !mobile.includes('items')) {
    fail('SHELL_NAV_NOT_SHARED', 'Desktop and mobile navigation must consume shared item props.', 'src/components/shell');
  }
  if (/['"]\/(?:work|archive|about|contact)\//.test(`${desktop}\n${mobile}`)) {
    fail('SHELL_NAV_HARDCODED', 'Desktop or mobile navigation hardcodes primary targets.', 'src/components/shell');
  }
}

const identityAssets = [
  ['src/assets/brand/az-wordmark.svg', 'a9190943c1aafca4c183da694e3edbaeba2243ee13ef150049b5ce3133df4027'],
  ['src/assets/brand/wordmark-dark.png', 'dd842140f95da2b0a4d373e265d7141f7801c7dcee0d9a0cd32e56c2454cc3c5'],
];
for (const [path, expectedHash] of identityAssets) {
  if (!(await exists(path))) {
    fail('SHELL_WORDMARK_ASSET_MISSING', 'Verified identity asset is missing.', path);
    continue;
  }
  const asset = await readFile(join(repositoryRoot, path));
  if (sha256(asset) !== expectedHash) fail('SHELL_WORDMARK_HASH', 'Identity asset hash differs from the verified source.', path);
}

const prohibitedRoutes = ['src/pages/work/[slug].astro', 'src/pages/search.astro'];
for (const path of prohibitedRoutes) {
  if (await exists(path)) fail('SHELL_SCOPE_ROUTE', 'Deferred route was implemented during the shell phase.', path);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.code} ${failure.path}: ${failure.message}`);
  console.error(`Global shell validation failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Global shell validation passed: ${requiredComponents.length} shell files and ${routeContract.length} scaffold routes.`);
}
