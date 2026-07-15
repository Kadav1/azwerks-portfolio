import {
  EVIDENCE_TRUST_STATES,
  MAINTENANCE_STATES,
  PROJECT_CATEGORIES,
} from '../../content-model/enums.ts';
import type { WorkRegisterState } from './types.ts';

export const MAX_QUERY_LENGTH = 120;
export const MAX_VISIBLE_CAPABILITIES = 4;
export const WORK_REGISTER_PARAMETERS = ['q', 'category', 'maintenance', 'evidence', 'sort'] as const;
export const WORK_REGISTER_CATEGORIES = PROJECT_CATEGORIES;
export const WORK_REGISTER_MAINTENANCE_STATES = MAINTENANCE_STATES;
export const WORK_REGISTER_EVIDENCE_STATES = ['none', ...EVIDENCE_TRUST_STATES] as const;

export const DEFAULT_WORK_REGISTER_STATE: WorkRegisterState = Object.freeze({
  q: '',
  category: Object.freeze([]),
  maintenance: Object.freeze([]),
  evidence: Object.freeze([]),
  sort: 'curated',
});
