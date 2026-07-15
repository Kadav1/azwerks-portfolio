import { normalizeSearchText, normalizeWorkRegisterState } from './query-state.ts';
import type { WorkRegisterRecord, WorkRegisterState } from './types.ts';

export interface WorkRegisterFilterRecord {
  searchText: string;
  category: WorkRegisterRecord['category'];
  maintenance?: WorkRegisterRecord['maintenance'] | undefined;
  evidenceState?: WorkRegisterRecord['evidenceState'] | undefined;
}

export const filterWorkRegisterRecords = <T extends WorkRegisterFilterRecord>(
  records: readonly T[],
  input: WorkRegisterState,
): T[] => {
  const state = normalizeWorkRegisterState(input);
  const terms = normalizeSearchText(state.q).split(' ').filter(Boolean);
  return records.filter((record) => {
    const searchText = normalizeSearchText(record.searchText);
    return terms.every((term) => searchText.includes(term))
      && (state.category.length === 0 || state.category.includes(record.category))
      && (state.maintenance.length === 0 || (record.maintenance !== undefined && state.maintenance.includes(record.maintenance)))
      && (state.evidence.length === 0 || (record.evidenceState !== undefined && state.evidence.includes(record.evidenceState)));
  });
};
