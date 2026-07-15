import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSafeMarkdownBody,
  compareAscii,
  parseFlatFrontmatter,
} from '../../src/content-model/source.ts';

test('parses only flat scalar and string-array frontmatter', () => {
  const parsed = parseFlatFrontmatter(
    `---
schemaVersion: "1.0"
slug: quiet-machine
tags:
  - synthetic
  - fixture
synthetic: true
---
# Body`,
    'quiet-machine.md',
  );

  assert.deepEqual(parsed.data.tags, ['synthetic', 'fixture']);
  assert.equal(parsed.body, '# Body');
});

test('rejects nested frontmatter', () => {
  assert.throws(
    () => parseFlatFrontmatter('---\nseo:\n  title: Hidden\n---\nBody', 'bad.md'),
    { code: 'CONTENT_FRONTMATTER_NESTED' },
  );
});

test('rejects unsafe Markdown body constructs', () => {
  assert.throws(
    () => assertSafeMarkdownBody('<script>alert(1)</script>', 'bad.md'),
    { code: 'CONTENT_BODY_UNSAFE' },
  );
});

test('sorts IDs without locale dependence', () => {
  assert.deepEqual(
    ['zeta', 'alpha', 'beta'].sort(compareAscii),
    ['alpha', 'beta', 'zeta'],
  );
});
