import type {
  EvidenceTrust,
  MaintenanceState,
  ProjectCategory,
} from '../../content-model/enums.ts';
import type { WorkRegisterSort } from './types.ts';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  software: 'Software',
  'visual-system': 'Visual system',
  art: 'Art',
  'technical-system': 'Technical system',
  'limited-media': 'Limited media',
};

export const MAINTENANCE_LABELS: Record<MaintenanceState, string> = {
  active: 'Active',
  maintenance: 'Maintained',
  paused: 'Paused',
  dormant: 'Dormant',
  retired: 'Retired',
  'not-applicable': 'Not applicable',
};

export const EVIDENCE_LABELS: Record<EvidenceTrust | 'none', string> = {
  verified: 'Verified evidence',
  reviewed: 'Reviewed evidence',
  unverified: 'Evidence available',
  unavailable: 'Evidence unavailable',
  private: 'Private evidence',
  none: 'Evidence unavailable',
};

export const SORT_LABELS: Record<WorkRegisterSort, string> = {
  curated: 'Curated',
  recent: 'Recent',
  title: 'Title',
};
