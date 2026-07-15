import { normalizeWorkRegisterState } from '../work-register/query-state.ts';
import type { WorkRegisterState } from '../work-register/types.ts';
import { serializeWorkRegisterState } from '../work-register/url.ts';
import { normalizeAtlasState } from './atlas-state.ts';
import type { AtlasState } from './atlas-types.ts';

export const serializeAtlasState = (input: AtlasState): string => {
  const state = normalizeAtlasState(input, input.focus ? [input.focus] : []);
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const value of state.category) params.append('category', value);
  for (const value of state.maintenance) params.append('maintenance', value);
  for (const value of state.evidence) params.append('evidence', value);
  for (const value of state.relation) params.append('relation', value);
  if (state.focus) params.set('focus', state.focus);
  return params.toString();
};

const withQuery = (path: string, query: string): string => `${path}${query ? `?${query}` : ''}`;

export const getRegisterHrefFromAtlas = (input: AtlasState): string => {
  const state = normalizeAtlasState(input, input.focus ? [input.focus] : []);
  const query = serializeWorkRegisterState({
    q: state.q,
    category: state.category,
    maintenance: state.maintenance,
    evidence: state.evidence,
    sort: 'curated',
  });
  return withQuery('/work/', query);
};

export const getAtlasHrefFromRegister = (input: WorkRegisterState): string => {
  const state = normalizeWorkRegisterState(input);
  const query = serializeAtlasState({
    q: state.q,
    category: state.category,
    maintenance: state.maintenance,
    evidence: state.evidence,
    relation: [],
    focus: '',
  });
  return withQuery('/work/atlas/', query);
};
