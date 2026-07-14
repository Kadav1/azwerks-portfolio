import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const sourceDirectory = join(repositoryRoot, 'src/tokens/source');
export const generatedDirectory = join(repositoryRoot, 'src/tokens/generated');

export const sourceFileNames = [
  'primitives.json',
  'semantics.dark.json',
  'semantics.light.json',
  'typography.json',
  'spacing-layout.json',
  'shape-layer-motion.json',
  'marks-icons.json',
  'portfolio.aliases.json',
  'project-world.aliases.json',
];

export const knownDomains = new Set([
  'color',
  'typography',
  'spacing',
  'sizing',
  'radius',
  'border',
  'elevation',
  'z-index',
  'motion',
  'opacity',
  'breakpoints',
  'content-widths',
  'media-ratios',
  'focus',
  'interaction',
  'lifecycle-state',
  'trust',
  'authored-marks',
  'iconography',
  'atlas',
  'portfolio-shell',
  'project-worlds',
]);

export const layerRank = Object.freeze({
  primitive: 0,
  semantic: 1,
  portfolio: 2,
  world: 3,
});

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function tokenReferences(value) {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/\{(--azw-[a-z0-9-]+)\}/g)].map((match) => match[1]);
}

export function cssValue(value) {
  if (typeof value === 'number') return String(value);
  return value.replace(/\{(--azw-[a-z0-9-]+)\}/g, 'var($1)');
}

export async function loadTokenSources() {
  const documents = await Promise.all(
    sourceFileNames.map(async (fileName) => ({
      fileName,
      document: await readJson(join(sourceDirectory, fileName)),
    })),
  );

  const entries = [];
  for (const { fileName, document } of documents) {
    for (const group of document.groups) {
      for (const [name, token] of Object.entries(group.tokens)) {
        entries.push({
          ...token,
          name,
          fileName,
          layer: document.layer,
          mode: document.mode,
          group: group.name,
          domain: group.domain,
          evidence: group.evidence,
        });
      }
    }
  }
  return { documents, entries };
}

export function indexTokens(entries) {
  const index = new Map();
  for (const entry of entries) {
    const current = index.get(entry.name) ?? [];
    current.push(entry);
    index.set(entry.name, current);
  }
  return index;
}

export function tokenForMode(index, name, mode) {
  const candidates = index.get(name) ?? [];
  return (
    candidates.find((entry) => entry.mode === mode) ??
    candidates.find((entry) => entry.mode === undefined)
  );
}

export function resolveTokenValue(index, name, mode, stack = []) {
  if (stack.includes(name)) {
    throw new Error(`Circular token reference: ${[...stack, name].join(' -> ')}`);
  }
  const entry = tokenForMode(index, name, mode);
  if (!entry) throw new Error(`Missing ${mode} token: ${name}`);
  const refs = tokenReferences(entry.value);
  if (refs.length === 0) return entry.value;
  if (refs.length !== 1 || entry.value !== `{${refs[0]}}`) {
    throw new Error(`Color resolution only supports a single alias: ${name}`);
  }
  return resolveTokenValue(index, refs[0], mode, [...stack, name]);
}

export function countBy(entries, key) {
  const counts = {};
  for (const entry of entries) counts[entry[key]] = (counts[entry[key]] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

export async function walkFiles(directory, ignored = new Set()) {
  const files = [];
  for (const name of await readdir(directory)) {
    if (ignored.has(name)) continue;
    const path = join(directory, name);
    const details = await stat(path);
    if (details.isDirectory()) files.push(...(await walkFiles(path, ignored)));
    else files.push(path);
  }
  return files.sort();
}

export function displayPath(path) {
  return relative(repositoryRoot, path);
}

export function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function failIfErrors(errors, label) {
  if (errors.length === 0) return;
  for (const error of errors) console.error(`- ${error}`);
  throw new Error(`${label} failed with ${errors.length} error(s).`);
}
