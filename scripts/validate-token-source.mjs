import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  assert,
  failIfErrors,
  knownDomains,
  loadTokenSources,
  readJson,
  repositoryRoot,
  sha256,
  sourceDirectory,
} from './token-utils.mjs';

const errors = [];
const manifest = await readJson(join(sourceDirectory, 'source-manifest.json'));
const { documents, entries } = await loadTokenSources();
const accepted = new Map(manifest.acceptedDocuments.map((document) => [document.id, document]));
let localEvidenceVerified = 0;
let localEvidenceUnavailable = 0;

assert(manifest.schemaVersion === '1.0.0', 'Unexpected source manifest schema.', errors);
assert(manifest.authorityModel === 'current canonical local azwerks documents only', 'Authority model is not document-only.', errors);
assert(manifest.removedPackage?.authority === false, 'Historical package is not explicitly excluded from authority.', errors);
assert(manifest.removedPackage?.usedForValues === false, 'Historical package is not explicitly excluded from values.', errors);
assert(manifest.removedPackage?.usedForImplementation === false, 'Historical package is not explicitly excluded from implementation.', errors);

for (const acceptedDocument of manifest.acceptedDocuments) {
  assert(acceptedDocument.status === 'canonical', `${acceptedDocument.id} is not canonical.`, errors);
  assert(/^[a-f0-9]{64}$/.test(acceptedDocument.sha256), `${acceptedDocument.id} lacks a valid SHA-256.`, errors);
  assert(!acceptedDocument.reference.startsWith('/'), `${acceptedDocument.id} exposes an absolute path.`, errors);
  if (acceptedDocument.localEvidence) {
    try {
      const bytes = await readFile(join(repositoryRoot, acceptedDocument.localEvidence));
      assert(sha256(bytes) === acceptedDocument.sha256, `${acceptedDocument.id} local evidence hash changed.`, errors);
      localEvidenceVerified += 1;
    } catch (error) {
      if (error?.code === 'ENOENT') localEvidenceUnavailable += 1;
      else throw error;
    }
  }
}

const historicalBlock = await readFile(
  join(repositoryRoot, 'docs/portfolio/architecture/token-source-resolution-block-v0.1.md'),
  'utf8',
);
assert(
  historicalBlock.includes(manifest.documentHashes['universal-theme-v1.2']),
  'Universal-theme hash is not preserved in the historical evidence report.',
  errors,
);

for (const { fileName, document } of documents) {
  assert(document.schemaVersion === '1.0.0', `${fileName} has an invalid schemaVersion.`, errors);
  assert(['primitive', 'semantic', 'portfolio', 'world'].includes(document.layer), `${fileName} has an unknown layer.`, errors);
  if (document.mode) assert(['dark', 'light'].includes(document.mode), `${fileName} has an invalid mode.`, errors);
  assert(Array.isArray(document.groups) && document.groups.length > 0, `${fileName} has no groups.`, errors);
  for (const group of document.groups) {
    assert(knownDomains.has(group.domain), `${fileName}:${group.name} has unknown domain ${group.domain}.`, errors);
    assert(accepted.has(group.evidence?.documentId), `${fileName}:${group.name} cites an unaccepted document.`, errors);
    assert(Boolean(group.evidence?.heading), `${fileName}:${group.name} lacks a source heading.`, errors);
    assert(['direct', 'mapped', 'derived', 'portfolio-alias'].includes(group.evidence?.normalization), `${fileName}:${group.name} has invalid normalization.`, errors);
    assert(Object.keys(group.tokens ?? {}).length > 0, `${fileName}:${group.name} is empty.`, errors);
  }
}

for (const entry of entries) {
  assert(/^--azw-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name), `${entry.name} has an invalid token name.`, errors);
  assert(['string', 'number'].includes(typeof entry.value), `${entry.name} has an invalid value type.`, errors);
  if (typeof entry.value === 'string') {
    assert(entry.value.trim().length > 0, `${entry.name} has an empty value.`, errors);
    assert(!/(?:TODO|TBD|UNRESOLVED)/i.test(entry.value), `${entry.name} has an unresolved value.`, errors);
  }
  assert(Boolean(entry.description), `${entry.name} lacks a description.`, errors);
  assert(['direct', 'mapped', 'derived', 'portfolio-alias'].includes(entry.classification), `${entry.name} has invalid classification.`, errors);
}

const publicInputs = [
  JSON.stringify(manifest),
  ...documents.map(({ document }) => JSON.stringify(document)),
].join('\n');
assert(!/(?:\/home\/|\/media\/|\/mnt\/)/.test(publicInputs), 'A private absolute path appears in token sources.', errors);
assert(!/@azwerks\/radium/.test(publicInputs), 'The excluded package name appears in token sources.', errors);

failIfErrors(errors, 'Token source validation');
console.log(`Token source validation passed: ${entries.length} scoped token declarations across ${documents.length} source files; local evidence ${localEvidenceVerified} verified, ${localEvidenceUnavailable} unavailable.`);
