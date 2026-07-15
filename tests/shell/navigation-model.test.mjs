import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createNavigationModel,
  getNavigationRegion,
} from '../../src/lib/navigation/navigation-model.ts';

const validItems = [
  { id: 'work', label: 'Work', kind: 'route', target: '/work/', order: 10, visibility: 'public', synthetic: false },
  { id: 'archive', label: 'Archive', kind: 'route', target: '/archive/', order: 20, visibility: 'public', synthetic: false },
  { id: 'about', label: 'About', kind: 'route', target: '/about/', order: 30, visibility: 'public', synthetic: false },
  { id: 'contact', label: 'Contact', kind: 'route', target: '/contact/', order: 40, visibility: 'public', synthetic: false },
  { id: 'accessibility', label: 'Accessibility', kind: 'route', target: '/accessibility/', order: 50, visibility: 'public', synthetic: false },
  { id: 'privacy', label: 'Privacy', kind: 'route', target: '/privacy/', order: 60, visibility: 'public', synthetic: false },
  { id: 'colophon', label: 'Colophon', kind: 'route', target: '/colophon/', order: 70, visibility: 'public', synthetic: false },
];

test('creates one ordered model for desktop, mobile, footer, and route tests', () => {
  const model = createNavigationModel(validItems);
  assert.deepEqual(getNavigationRegion(model, 'primary').map(({ id }) => id), [
    'work', 'archive', 'about', 'contact',
  ]);
  assert.deepEqual(getNavigationRegion(model, 'footer').map(({ id }) => id), [
    'contact', 'accessibility', 'privacy', 'colophon',
  ]);
  assert.equal(model.find(({ id }) => id === 'work')?.direct, true);
});

test('rejects duplicate targets and orders with stable shell codes', () => {
  assert.throws(
    () => createNavigationModel([
      ...validItems,
      { id: 'duplicate', label: 'Duplicate', kind: 'route', target: '/work/', order: 80, visibility: 'public', synthetic: false },
    ]),
    { code: 'SHELL_NAV_TARGET_DUPLICATE' },
  );
  assert.throws(
    () => createNavigationModel(validItems.map((item) => item.id === 'archive' ? { ...item, order: 10 } : item)),
    { code: 'SHELL_NAV_SCHEMA' },
  );
});

test('rejects fixture, private, unsafe, missing Work, and external primary items', () => {
  assert.throws(
    () => createNavigationModel(validItems.map((item) => item.id === 'work' ? { ...item, synthetic: true } : item)),
    { code: 'SHELL_NAV_FIXTURE' },
  );
  assert.throws(
    () => createNavigationModel(validItems.map((item) => item.id === 'work' ? { ...item, visibility: 'private' } : item)),
    { code: 'SHELL_NAV_PRIVATE' },
  );
  assert.throws(
    () => createNavigationModel(validItems.map((item) => item.id === 'work' ? { ...item, target: 'javascript:alert(1)' } : item)),
    { code: 'SHELL_NAV_SCHEMA' },
  );
  assert.throws(
    () => createNavigationModel(validItems.filter(({ id }) => id !== 'work')),
    { code: 'SHELL_NAV_WORK_REQUIRED' },
  );
  assert.throws(
    () => createNavigationModel(validItems.map((item) => item.id === 'work' ? { ...item, kind: 'external', target: 'https://example.com/work' } : item)),
    { code: 'SHELL_NAV_WORK_REQUIRED' },
  );
});
