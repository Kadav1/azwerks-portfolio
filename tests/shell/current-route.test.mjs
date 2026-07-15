import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCurrentRouteState,
  normalizePathname,
} from '../../src/lib/navigation/current-route.ts';

test('normalizes root, trailing slash, query, hash, and absolute URLs', () => {
  assert.equal(normalizePathname('/'), '/');
  assert.equal(normalizePathname('/work'), '/work/');
  assert.equal(normalizePathname('/work/?view=atlas#results'), '/work/');
  assert.equal(normalizePathname('https://azwerks.example/archive?page=2'), '/archive/');
});

test('marks exact destinations as current pages', () => {
  assert.equal(getCurrentRouteState('/work/', '/work/'), 'page');
  assert.equal(getCurrentRouteState('/about?ref=nav', '/about/'), 'page');
});

test('marks nested destinations as sections without misusing page current state', () => {
  assert.equal(getCurrentRouteState('/work/example-project/', '/work/'), 'section');
  assert.equal(getCurrentRouteState('/archive/page/2/', '/archive/'), 'section');
  assert.equal(getCurrentRouteState('/contact/thanks/', '/contact/'), null);
  assert.equal(getCurrentRouteState('/privacy/notice/', '/privacy/'), null);
  assert.equal(getCurrentRouteState('/workshop/', '/work/'), null);
  assert.equal(getCurrentRouteState('/aboutness/', '/about/'), null);
});

test('never treats root as current for every route', () => {
  assert.equal(getCurrentRouteState('/', '/'), 'page');
  assert.equal(getCurrentRouteState('/work/', '/'), null);
});
