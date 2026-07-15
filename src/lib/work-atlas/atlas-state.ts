import { RELATION_TYPES } from '../../content-model/enums.ts';
import { filterWorkRegisterRecords } from '../work-register/filter.ts';
import { normalizeWorkRegisterState } from '../work-register/query-state.ts';
import type { WorkRegisterState } from '../work-register/types.ts';
import type {
  AtlasFilteredData,
  AtlasRecord,
  AtlasRelation,
  AtlasState,
  PublicRelationType,
} from './atlas-types.ts';

export const DEFAULT_ATLAS_STATE: AtlasState = Object.freeze({
  q: '',
  category: Object.freeze([]),
  maintenance: Object.freeze([]),
  evidence: Object.freeze([]),
  relation: Object.freeze([]),
  focus: '',
});

const orderedValues = <T extends string>(values: readonly string[], allowed: readonly T[]): T[] =>
  allowed.filter((value) => values.includes(value));

export const normalizeAtlasState = (
  input: Partial<AtlasState>,
  allowedFocusSlugs: readonly string[] = [],
): AtlasState => {
  const compatible = normalizeWorkRegisterState({
    ...(input.q === undefined ? {} : { q: input.q }),
    ...(input.category === undefined ? {} : { category: input.category }),
    ...(input.maintenance === undefined ? {} : { maintenance: input.maintenance }),
    ...(input.evidence === undefined ? {} : { evidence: input.evidence }),
    sort: 'curated',
  });
  const focus = input.focus ?? '';
  return Object.freeze({
    q: compatible.q,
    category: Object.freeze([...compatible.category]),
    maintenance: Object.freeze([...compatible.maintenance]),
    evidence: Object.freeze([...compatible.evidence]),
    relation: Object.freeze(orderedValues(input.relation ?? [], RELATION_TYPES) as PublicRelationType[]),
    focus: allowedFocusSlugs.includes(focus) ? focus : '',
  });
};

export const parseAtlasState = (
  input: URLSearchParams | string,
  allowedFocusSlugs: readonly string[] = [],
): AtlasState => {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  return normalizeAtlasState({
    q: params.get('q') ?? '',
    category: params.getAll('category') as AtlasState['category'],
    maintenance: params.getAll('maintenance') as AtlasState['maintenance'],
    evidence: params.getAll('evidence') as AtlasState['evidence'],
    relation: params.getAll('relation') as AtlasState['relation'],
    focus: params.get('focus') ?? '',
  }, allowedFocusSlugs);
};

export const filterAtlasData = (
  records: readonly AtlasRecord[],
  relations: readonly AtlasRelation[],
  input: AtlasState,
): AtlasFilteredData => {
  const state = normalizeAtlasState(input, records.map(({ slug }) => slug));
  const compatibleState: WorkRegisterState = {
    q: state.q,
    category: state.category,
    maintenance: state.maintenance,
    evidence: state.evidence,
    sort: 'curated',
  };
  const visibleRecords = filterWorkRegisterRecords(records, compatibleState);
  const recordIds = new Set(visibleRecords.map(({ id }) => id));
  const visibleRelations = relations.filter((relation) =>
    recordIds.has(relation.sourceId)
      && recordIds.has(relation.targetId)
      && (state.relation.length === 0 || state.relation.includes(relation.type)),
  );
  const focusedRecord = visibleRecords.find(({ slug }) => slug === state.focus);
  return Object.freeze({
    records: Object.freeze(visibleRecords),
    relations: Object.freeze(visibleRelations),
    recordIds,
    ...(focusedRecord === undefined ? {} : { focusedId: focusedRecord.id }),
  });
};
