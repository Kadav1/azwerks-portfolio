import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateContentManifest } from '../../scripts/generate-content-manifest.mjs';

test('generates byte-identical manifests', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'azw-content-manifest-'));

  try {
    const first = join(directory, 'first.json');
    const second = join(directory, 'second.json');
    await generateContentManifest({ outputPath: first });
    await generateContentManifest({ outputPath: second });
    assert.deepEqual(await readFile(first), await readFile(second));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
