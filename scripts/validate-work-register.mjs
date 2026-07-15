import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

import { repositoryRoot, walkFiles } from './token-utils.mjs';

const failures = [];
const fail = (code, message, path) => failures.push({ code, message, path });
const exists = async (path) => stat(join(repositoryRoot, path)).then(() => true, () => false);
const read = async (path) => readFile(join(repositoryRoot, path), 'utf8');

const requiredFiles = [
  'src/pages/work/index.astro',
  'src/components/work/WorkRegister.astro',
  'src/components/work/WorkRegisterHeader.astro',
  'src/components/work/WorkRegisterControls.astro',
  'src/components/work/WorkSearch.astro',
  'src/components/work/WorkFilterGroup.astro',
  'src/components/work/WorkSortControl.astro',
  'src/components/work/WorkRegisterSummary.astro',
  'src/components/work/WorkRegisterEmptyState.astro',
  'src/components/work/ProjectRegisterItem.astro',
  'src/components/work/ProjectPreview.astro',
  'src/lib/work-register/types.ts',
  'src/lib/work-register/view-model.ts',
  'src/lib/work-register/query-state.ts',
  'src/lib/work-register/filter.ts',
  'src/lib/work-register/sort.ts',
  'src/lib/work-register/url.ts',
  'src/lib/work-register/labels.ts',
  'src/lib/work-register/constants.ts',
  'src/scripts/work-register.ts',
  'src/styles/work-register.css',
];

for (const path of requiredFiles) {
  if (!(await exists(path))) fail('REGISTER_REQUIRED_FILE', 'Required Work Register file is missing.', path);
}

if (await exists('src/pages/work/index.astro')) {
  const source = await read('src/pages/work/index.astro');
  if (!source.includes("import GlobalShell from '../../layouts/GlobalShell.astro'")) {
    fail('REGISTER_LAYOUT', 'Work must use GlobalShell.', 'src/pages/work/index.astro');
  }
  if (!source.includes('getPublicProjectBundles')) {
    fail('REGISTER_PUBLIC_QUERY', 'Work must use the public production bundle query.', 'src/pages/work/index.astro');
  }
  if (!source.includes('createWorkRegisterRecords')) {
    fail('REGISTER_VIEW_MODEL', 'Work must derive the public register view model.', 'src/pages/work/index.astro');
  }
  if (!source.includes('workResultsId="work-results"') || !source.includes('noindex') || !source.includes('canonical="/work/"')) {
    fail('REGISTER_METADATA', 'Work must expose its result skip target and noindex policy.', 'src/pages/work/index.astro');
  }
  if (/foundation scaffold|arrives in the next focused phase/i.test(source)) {
    fail('REGISTER_SCAFFOLD_COPY', 'Foundation scaffold copy remains.', 'src/pages/work/index.astro');
  }
}

if (await exists('src/lib/work-register/view-model.ts')) {
  const source = await read('src/lib/work-register/view-model.ts');
  if (!/publication\.eligible\s*&&\s*!archiveState/.test(source)) {
    fail('REGISTER_ARCHIVE_BOUNDARY', 'View model must exclude archived records after publication eligibility.', 'src/lib/work-register/view-model.ts');
  }
  for (const field of ['sourceNote', 'rightsNote', 'redactionNote', 'relationCount']) {
    if (new RegExp(`\\b${field}\\b`).test(source)) {
      fail('REGISTER_PRIVATE_FIELD', `View model exposes prohibited field ${field}.`, 'src/lib/work-register/view-model.ts');
    }
  }
  if (!source.includes("from '../project-detail/routes.ts'") || !source.includes('getProjectDetailHref') || !source.includes('isProjectDetailRoutable')) {
    fail('REGISTER_DETAIL_ROUTE', 'Work Register must use the shared project-detail route helper.', 'src/lib/work-register/view-model.ts');
  }
}

const productionRoots = ['src/pages/work', 'src/components/work', 'src/lib/work-register', 'src/scripts/work-register.ts'];
const productionFiles = [];
for (const root of productionRoots) {
  const absolute = join(repositoryRoot, root);
  if (!(await exists(root))) continue;
  if (extname(root)) productionFiles.push(absolute);
  else productionFiles.push(...await walkFiles(absolute));
}

for (const absolutePath of productionFiles) {
  const source = await readFile(absolutePath, 'utf8');
  const path = relative(repositoryRoot, absolutePath);
  if (/content\/fixtures|fixture(?:Projects|ProjectData|ProjectRelations|SitePages|Navigation)/i.test(source)) {
    fail('REGISTER_FIXTURE_IMPORT', 'Production register source imports fixture content.', path);
  }
  if (/\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket/.test(source)) {
    fail('REGISTER_RUNTIME_REQUEST', 'Register source performs a runtime request.', path);
  }
  if (/innerHTML|outerHTML|insertAdjacentHTML|\beval\s*\(|new Function/.test(source)) {
    fail('REGISTER_UNSAFE_DOM', 'Register source uses an unsafe DOM API.', path);
  }
  if (/infinite[- ]scroll|IntersectionObserver|virtuali[sz]/i.test(source)) {
    fail('REGISTER_DEFERRED_PATTERN', 'Register source contains deferred loading or virtualization.', path);
  }
}

if (await exists('src/components/work/WorkRegisterControls.astro')) {
  const source = [
    await read('src/components/work/WorkRegisterControls.astro'),
    await read('src/components/work/WorkFilterGroup.astro'),
  ].join('\n');
  for (const marker of ['<form', '<fieldset', '<legend', 'type="submit"', 'data-register-controls']) {
    if (!source.includes(marker)) fail('REGISTER_CONTROL_SEMANTICS', `Controls are missing ${marker}.`, 'src/components/work/WorkRegisterControls.astro');
  }
}

if (await exists('src/components/work/WorkRegister.astro')) {
  const source = [
    await read('src/components/work/WorkRegister.astro'),
    await read('src/components/work/WorkRegisterSummary.astro'),
  ].join('\n');
  for (const marker of ['id="work-results"', 'role="region"', '<ol', 'aria-live="polite"', '<noscript>', 'data-register-root']) {
    if (!source.includes(marker)) fail('REGISTER_RESULT_SEMANTICS', `Register is missing ${marker}.`, 'src/components/work/WorkRegister.astro');
  }
}

if (await exists('src/lib/work-register/constants.ts')) {
  const source = await read('src/lib/work-register/constants.ts');
  for (const parameter of ['q', 'category', 'maintenance', 'evidence', 'sort']) {
    if (!source.includes(`'${parameter}'`)) fail('REGISTER_QUERY_PARAMETER', `Known parameter ${parameter} is not declared.`, 'src/lib/work-register/constants.ts');
  }
}

if (await exists('src/styles/work-register.css')) {
  const source = (await read('src/styles/work-register.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const checks = [
    ['REGISTER_RAW_COLOR', /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|lab|lch)a?\(/i],
    ['REGISTER_PRIMITIVE_TOKEN', /var\(--azw-p-/],
    ['REGISTER_RAW_MOTION', /(?:animation|transition)(?:-[a-z-]+)?\s*:[^;]*(?:\d+m?s|cubic-bezier\()/i],
    ['REGISTER_RAW_Z_INDEX', /z-index\s*:\s*-?\d+\s*;/i],
  ];
  for (const [code, pattern] of checks) {
    if (pattern.test(source)) fail(code, 'Register CSS contains an ungoverned value.', 'src/styles/work-register.css');
  }
  const governedDeclarations = [
    ['REGISTER_RAW_RADIUS', 'border-radius', /^(?:var\(|0\b)/i],
    ['REGISTER_RAW_TYPE_SIZE', 'font-size', /^(?:var\(|inherit\b|100%\b)/i],
  ];
  for (const [code, property, allowed] of governedDeclarations) {
    for (const match of source.matchAll(new RegExp(`${property}\\s*:\\s*([^;]+)`, 'gi'))) {
      if (!allowed.test(match[1].trim())) fail(code, `Register CSS contains an ungoverned ${property} value.`, 'src/styles/work-register.css');
    }
  }
}

for (const path of [
  'src/pages/__work-register-audit.astro',
  'src/pages/work-register-audit.astro',
  'src/pages/work-register-audit',
  'public/work-register-audit',
  'dist/work-register-audit',
]) {
  if (await exists(path)) fail('REGISTER_TEMPORARY_HARNESS', 'Temporary browser harness remains.', path);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.code} ${failure.path}: ${failure.message}`);
  console.error(`Work Register validation failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Work Register validation passed: ${requiredFiles.length} required files and production boundaries verified.`);
}
