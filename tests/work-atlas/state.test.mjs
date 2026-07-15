import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_ATLAS_STATE,
  filterAtlasData,
  normalizeAtlasState,
  parseAtlasState,
} from '../../src/lib/work-atlas/atlas-state.ts';
import {
  getAtlasHrefFromRegister,
  getRegisterHrefFromAtlas,
  serializeAtlasState,
} from '../../src/lib/work-atlas/atlas-url.ts';
import { parseWorkRegisterState } from '../../src/lib/work-register/query-state.ts';
import { createSyntheticAtlasRecords, createSyntheticAtlasRelations } from '../support/work-atlas-fixtures.ts';

test('normalizes known state with bounded query, canonical value order, and public focus', () => {
  const slugs = ['synthetic-atlas-001', 'synthetic-atlas-002'];
  const state = normalizeAtlasState({
    q: '  Atlas\t record  ',
    category: ['art', 'invalid', 'software', 'art'],
    maintenance: ['retired', 'active', 'active'],
    evidence: ['none', 'verified', 'invalid'],
    relation: ['supports', 'related', 'supports', 'invalid'],
    focus: 'synthetic-atlas-002',
  }, slugs);
  assert.deepEqual(state, {
    q: 'Atlas record',
    category: ['software', 'art'],
    maintenance: ['active', 'retired'],
    evidence: ['none', 'verified'],
    relation: ['related', 'supports'],
    focus: 'synthetic-atlas-002',
  });
  assert.equal(normalizeAtlasState({ focus: 'private-or-missing' }, slugs).focus, '');
});

test('parses duplicate and invalid URL values into one deterministic state', () => {
  const state = parseAtlasState('?relation=supports&category=art&relation=supports&relation=nope&q=%20map%20&focus=synthetic-atlas-001', ['synthetic-atlas-001']);
  assert.deepEqual(state, {
    ...DEFAULT_ATLAS_STATE,
    q: 'map',
    category: ['art'],
    relation: ['supports'],
    focus: 'synthetic-atlas-001',
  });
  assert.equal(
    serializeAtlasState(state),
    'q=map&category=art&relation=supports&focus=synthetic-atlas-001',
  );
});

test('filters with AND between groups and OR within groups without fabricating relations', () => {
  const records = createSyntheticAtlasRecords(10);
  const relations = createSyntheticAtlasRelations(records, 7);
  const state = normalizeAtlasState({
    q: 'synthetic',
    category: ['software', 'art'],
    maintenance: ['active', 'paused'],
    evidence: [],
    relation: ['related', 'lineage'],
    focus: records[0].slug,
  }, records.map(({ slug }) => slug));
  const filtered = filterAtlasData(records, relations, state);
  assert.deepEqual(filtered.records.map(({ id }) => id), ['synthetic-atlas-001', 'synthetic-atlas-003']);
  assert.ok(filtered.relations.every(({ type }) => ['related', 'lineage'].includes(type)));
  assert.ok(filtered.relations.every(({ sourceId, targetId }) => filtered.recordIds.has(sourceId) && filtered.recordIds.has(targetId)));
  assert.equal(filtered.focusedId, 'synthetic-atlas-001');
  assert.equal(relations.length, 7);
});

test('drops filtered focus and preserves no relation when no explicit edge exists', () => {
  const records = createSyntheticAtlasRecords(3);
  const relations = createSyntheticAtlasRelations(records, 1);
  const state = normalizeAtlasState({ category: ['art'], focus: records[0].slug }, records.map(({ slug }) => slug));
  const filtered = filterAtlasData(records, relations, state);
  assert.deepEqual(filtered.records.map(({ category }) => category), ['art']);
  assert.deepEqual(filtered.relations, []);
  assert.equal(filtered.focusedId, undefined);
});

test('hands compatible constraints between Register and Atlas without leaking local state', () => {
  const atlasState = normalizeAtlasState({
    q: 'proof', category: ['software'], maintenance: ['active'], evidence: ['verified'], relation: ['supports'], focus: 'project-one',
  }, ['project-one']);
  assert.equal(getRegisterHrefFromAtlas(atlasState), '/work/?q=proof&category=software&maintenance=active&evidence=verified');
  const registerState = parseWorkRegisterState('?q=proof&category=software&maintenance=active&evidence=verified&sort=title');
  assert.equal(getAtlasHrefFromRegister(registerState), '/work/atlas/?q=proof&category=software&maintenance=active&evidence=verified');
});
