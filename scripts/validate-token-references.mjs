import {
  assert,
  failIfErrors,
  indexTokens,
  layerRank,
  loadTokenSources,
  tokenReferences,
} from './token-utils.mjs';

const errors = [];
const { entries } = await loadTokenSources();
const index = indexTokens(entries);

for (const [name, definitions] of index) {
  const scopes = definitions.map((entry) => entry.mode ?? 'shared');
  assert(new Set(scopes).size === scopes.length, `${name} is duplicated within the same scope.`, errors);
  assert(definitions.length <= 2, `${name} has more than dark/light definitions.`, errors);
  if (definitions.length === 2) {
    assert(scopes.includes('dark') && scopes.includes('light'), `${name} duplicates are not a dark/light pair.`, errors);
  }
}

for (const entry of entries) {
  for (const reference of tokenReferences(entry.value)) {
    const targets = index.get(reference) ?? [];
    assert(targets.length > 0, `${entry.name} references missing ${reference}.`, errors);
    for (const target of targets) {
      assert(layerRank[target.layer] <= layerRank[entry.layer], `${entry.name} references higher layer ${reference}.`, errors);
    }
  }
  if (entry.layer === 'world') {
    assert(!/(?:focus|action|state|trust|selection|warning|danger|success|target)/.test(entry.name), `${entry.name} attempts to override functional meaning.`, errors);
  }
}

function visit(name, stack = []) {
  if (stack.includes(name)) {
    errors.push(`Circular alias: ${[...stack, name].join(' -> ')}`);
    return;
  }
  for (const entry of index.get(name) ?? []) {
    for (const reference of tokenReferences(entry.value)) visit(reference, [...stack, name]);
  }
}
for (const name of index.keys()) visit(name);

const dark = new Set(entries.filter((entry) => entry.mode === 'dark').map((entry) => entry.name));
const light = new Set(entries.filter((entry) => entry.mode === 'light').map((entry) => entry.name));
for (const name of dark) assert(light.has(name), `${name} is missing from light mode.`, errors);
for (const name of light) assert(dark.has(name), `${name} is missing from dark mode.`, errors);

const requiredRoles = [
  '--azw-color-canvas', '--azw-color-surface-primary', '--azw-color-surface-alternate',
  '--azw-color-surface-raised', '--azw-color-surface-inset', '--azw-color-surface-code',
  '--azw-color-surface-art-neutral', '--azw-color-text-primary', '--azw-color-text-secondary',
  '--azw-color-text-muted', '--azw-color-text-faint', '--azw-color-text-inverse',
  '--azw-color-border-subtle', '--azw-color-border-default', '--azw-color-border-strong',
  '--azw-color-divider', '--azw-color-link-default', '--azw-color-link-hover',
  '--azw-color-link-active', '--azw-color-link-visited', '--azw-color-action-primary',
  '--azw-color-action-primary-hover', '--azw-color-action-primary-active',
  '--azw-color-action-secondary', '--azw-color-action-disabled', '--azw-focus-ring',
  '--azw-focus-ring-offset', '--azw-color-selection-background', '--azw-color-selection-text',
  '--azw-state-info', '--azw-state-success', '--azw-state-warning', '--azw-state-danger',
  '--azw-state-experimental', '--azw-state-archived', '--azw-trust-verified',
  '--azw-trust-reviewed', '--azw-trust-unverified', '--azw-trust-private',
  '--azw-trust-unavailable', '--azw-color-atlas-node', '--azw-color-atlas-node-active',
  '--azw-color-atlas-relation', '--azw-color-atlas-relation-muted',
];
for (const name of requiredRoles) {
  assert(dark.has(name) && light.has(name), `Required theme role ${name} lacks parity.`, errors);
}

const worlds = new Set(entries.filter((entry) => entry.layer === 'world').map((entry) => entry.group));
for (const world of ['world.software', 'world.visual-system', 'world.art', 'world.technical-system', 'world.limited-media']) {
  assert(worlds.has(world), `Missing ${world}.`, errors);
}

failIfErrors(errors, 'Token reference validation');
console.log(`Token reference validation passed: ${index.size} unique token names; dark/light parity ${dark.size}/${light.size}.`);
