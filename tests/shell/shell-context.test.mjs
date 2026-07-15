import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createShellContext,
  shellProfiles,
} from '../../src/lib/shell/shell-context.ts';

test('exposes exactly the controlled stable shell profiles', () => {
  assert.deepEqual(shellProfiles, ['standard', 'quiet', 'immersive', 'technical']);
});

test('profiles alter presentation context without altering functional semantics', () => {
  for (const profile of shellProfiles) {
    const context = createShellContext(profile);
    assert.equal(context.profile, profile);
    assert.equal(context.navigationSemantics, 'stable');
    assert.equal(context.focusSemantics, 'stable');
    assert.equal(context.themeSemantics, 'stable');
    assert.equal(context.targetSemantics, 'stable');
  }
});

test('accepts only controlled future project-world profiles', () => {
  assert.equal(createShellContext('quiet', 'art').world, 'art');
  assert.throws(() => createShellContext('standard', 'marketing'), {
    code: 'SHELL_WORLD_PROFILE_INVALID',
  });
});
