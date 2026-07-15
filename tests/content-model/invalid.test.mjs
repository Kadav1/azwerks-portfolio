import test from 'node:test';
import assert from 'node:assert/strict';

import { runInvalidFixtureCases } from '../../scripts/test-invalid-content-fixtures.mjs';

test('every invalid fixture fails with its expected stable code', async () => {
  const results = await runInvalidFixtureCases({ quiet: true });

  assert.ok(results.length >= 35);
  assert.ok(results.every((result) => result.actualCode === result.expectedCode));
});
