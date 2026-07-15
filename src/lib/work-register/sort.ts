import { normalizeWorkRegisterState } from './query-state.ts';
import type { WorkRegisterRecord, WorkRegisterSort } from './types.ts';

const compareAscii = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0;

export const sortWorkRegisterRecords = (
  records: readonly WorkRegisterRecord[],
  sort: WorkRegisterSort,
): WorkRegisterRecord[] => {
  const normalizedSort = normalizeWorkRegisterState({ sort }).sort;
  return [...records].sort((left, right) => {
    if (normalizedSort === 'curated') return left.defaultIndex - right.defaultIndex;
    if (normalizedSort === 'recent') {
      const date = compareAscii(right.dateSortKey, left.dateSortKey);
      if (date !== 0) return date;
      const stable = left.defaultIndex - right.defaultIndex;
      return stable !== 0 ? stable : compareAscii(left.id, right.id);
    }
    const title = compareAscii(left.titleSortKey, right.titleSortKey);
    return title !== 0 ? title : compareAscii(left.id, right.id);
  });
};
