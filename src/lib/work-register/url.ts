import { normalizeWorkRegisterState } from './query-state.ts';
import type { WorkRegisterState } from './types.ts';

export const serializeWorkRegisterState = (input: WorkRegisterState): string => {
  const state = normalizeWorkRegisterState(input);
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const value of state.category) params.append('category', value);
  for (const value of state.maintenance) params.append('maintenance', value);
  for (const value of state.evidence) params.append('evidence', value);
  if (state.sort !== 'curated') params.set('sort', state.sort);
  return params.toString();
};
