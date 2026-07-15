import { normalizeSearchText, normalizeWorkRegisterState } from './query-state.ts';
import type { WorkRegisterRecord, WorkRegisterState } from './types.ts';

export const filterWorkRegisterRecords = (
  records: readonly WorkRegisterRecord[],
  input: WorkRegisterState,
): WorkRegisterRecord[] => {
  const state = normalizeWorkRegisterState(input);
  const terms = normalizeSearchText(state.q).split(' ').filter(Boolean);
  return records.filter((record) => {
    const searchText = normalizeSearchText(record.searchText);
    return terms.every((term) => searchText.includes(term))
      && (state.category.length === 0 || state.category.includes(record.category))
      && (state.maintenance.length === 0 || state.maintenance.includes(record.maintenance))
      && (state.evidence.length === 0 || state.evidence.includes(record.evidenceState));
  });
};
