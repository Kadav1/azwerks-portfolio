import {
  DEFAULT_WORK_REGISTER_STATE,
  MAX_QUERY_LENGTH,
  WORK_REGISTER_CATEGORIES,
  WORK_REGISTER_EVIDENCE_STATES,
  WORK_REGISTER_MAINTENANCE_STATES,
} from './constants.ts';
import {
  CATEGORY_LABELS,
  EVIDENCE_LABELS,
  MAINTENANCE_LABELS,
  SORT_LABELS,
} from './labels.ts';
import {
  WORK_REGISTER_SORTS,
  type WorkRegisterState,
  type WorkRegisterStateSummary,
} from './types.ts';

export const normalizeWhitespace = (value: string): string =>
  value.normalize('NFKC').replace(/\s+/gu, ' ').trim();

export const normalizeSearchText = (value: string): string =>
  normalizeWhitespace(value)
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLowerCase();

const boundedQuery = (value: string): string =>
  normalizeWhitespace(value).slice(0, MAX_QUERY_LENGTH).trim();

const orderedValues = <T extends string>(
  values: readonly string[],
  allowed: readonly T[],
): T[] => allowed.filter((value) => values.includes(value));

export const normalizeWorkRegisterState = (state: Partial<WorkRegisterState>): WorkRegisterState => ({
  q: boundedQuery(state.q ?? ''),
  category: orderedValues(state.category ?? [], WORK_REGISTER_CATEGORIES),
  maintenance: orderedValues(state.maintenance ?? [], WORK_REGISTER_MAINTENANCE_STATES),
  evidence: orderedValues(state.evidence ?? [], WORK_REGISTER_EVIDENCE_STATES),
  sort: WORK_REGISTER_SORTS.includes(state.sort ?? 'curated') ? state.sort ?? 'curated' : 'curated',
});

export const parseWorkRegisterState = (input: URLSearchParams | string): WorkRegisterState => {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const requestedSort = params.getAll('sort').find((value) => WORK_REGISTER_SORTS.includes(value as never));
  return normalizeWorkRegisterState({
    q: params.get('q') ?? '',
    category: params.getAll('category') as WorkRegisterState['category'],
    maintenance: params.getAll('maintenance') as WorkRegisterState['maintenance'],
    evidence: params.getAll('evidence') as WorkRegisterState['evidence'],
    sort: (requestedSort ?? DEFAULT_WORK_REGISTER_STATE.sort) as WorkRegisterState['sort'],
  });
};

const groupConstraint = (
  name: string,
  values: readonly string[],
  labels: Record<string, string>,
): string | undefined => values.length === 0
  ? undefined
  : `${name}: ${values.map((value) => labels[value] ?? value).join(' or ')}`;

export const summarizeWorkRegisterState = (
  total: number,
  visible: number,
  input: WorkRegisterState,
): WorkRegisterStateSummary => {
  const state = normalizeWorkRegisterState(input);
  const constraints = [
    state.q ? `Search: “${state.q}”` : undefined,
    groupConstraint('Category', state.category, CATEGORY_LABELS),
    groupConstraint('Maintenance', state.maintenance, MAINTENANCE_LABELS),
    groupConstraint('Evidence', state.evidence, EVIDENCE_LABELS),
    state.sort === 'curated' ? undefined : `Sort: ${SORT_LABELS[state.sort]}`,
  ].filter((value): value is string => value !== undefined);
  const noun = total === 1 ? 'record' : 'records';
  return {
    countText: visible === total
      ? `${total} public Work ${noun}.`
      : `Showing ${visible} of ${total} Work records.`,
    constraints,
    constrained: constraints.length > 0,
  };
};
