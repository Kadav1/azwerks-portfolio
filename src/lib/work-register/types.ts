import type {
  EvidenceTrust,
  MaintenanceState,
  ProjectCategory,
} from '../../content-model/enums.ts';

export const WORK_REGISTER_SORTS = ['curated', 'recent', 'title'] as const;
export type WorkRegisterSort = (typeof WORK_REGISTER_SORTS)[number];

export interface WorkRegisterPreview {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string | undefined;
  artwork: boolean;
}

export interface WorkRegisterRecord {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  category: ProjectCategory;
  categoryLabel: string;
  lifecycle: string;
  maintenance: MaintenanceState;
  maintenanceLabel: string;
  displayPeriod?: string | undefined;
  evidenceState: EvidenceTrust | 'none';
  evidenceLabel: string;
  mediaState: 'available' | 'unavailable' | 'private' | 'not-applicable';
  featured: boolean;
  tags: readonly string[];
  capabilities: readonly string[];
  platforms: readonly string[];
  searchText: string;
  defaultIndex: number;
  dateSortKey: string;
  titleSortKey: string;
  preview?: WorkRegisterPreview | undefined;
  href?: string | undefined;
}

export interface WorkRegisterState {
  q: string;
  category: readonly ProjectCategory[];
  maintenance: readonly MaintenanceState[];
  evidence: readonly (EvidenceTrust | 'none')[];
  sort: WorkRegisterSort;
}

export interface WorkRegisterStateSummary {
  countText: string;
  constraints: readonly string[];
  constrained: boolean;
}
