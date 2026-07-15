import {
  LIMITATION_STATUSES,
  PROVENANCE_REVIEW_STATUSES,
  RELEASE_STATUSES,
  type EvidenceTrust,
  type Lifecycle,
  type LinkType,
  type MaintenanceState,
  type ProjectCategory,
  type RightsState,
  type SourceAvailability,
} from '../../content-model/enums.ts';

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  software: 'Software',
  'visual-system': 'Visual system',
  art: 'Art',
  'technical-system': 'Technical system',
  'limited-media': 'Limited media',
};

export const PROJECT_LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  draft: 'Draft', candidate: 'Candidate', reviewed: 'Reviewed', approved: 'Approved', published: 'Published', archived: 'Archived',
};

export const PROJECT_MAINTENANCE_LABELS: Record<MaintenanceState, string> = {
  active: 'Active', maintenance: 'Maintained', paused: 'Paused', dormant: 'Dormant', retired: 'Retired', 'not-applicable': 'Not applicable',
};

export const PROJECT_EVIDENCE_LABELS: Record<EvidenceTrust | 'none', string> = {
  verified: 'Verified evidence', reviewed: 'Reviewed evidence', unverified: 'Unverified evidence', unavailable: 'Evidence unavailable', private: 'Private evidence', none: 'No evidence published',
};

export const PROJECT_LINK_LABELS: Record<LinkType, string> = {
  repository: 'Repository', demo: 'Demo', documentation: 'Documentation', release: 'Release', publication: 'Publication', external: 'External resource', contact: 'Contact',
};

export const PROJECT_LIMITATION_LABELS: Record<(typeof LIMITATION_STATUSES)[number], string> = {
  known: 'Known', accepted: 'Accepted', mitigated: 'Mitigated', resolved: 'Resolved',
};

export const PROJECT_RELEASE_LABELS: Record<(typeof RELEASE_STATUSES)[number], string> = {
  planned: 'Planned', candidate: 'Candidate', released: 'Released', superseded: 'Superseded', withdrawn: 'Withdrawn',
};

export const SOURCE_AVAILABILITY_LABELS: Record<SourceAvailability, string> = {
  public: 'Public source', private: 'Private source', unavailable: 'Source unavailable', 'not-applicable': 'Source not applicable',
};

export const RIGHTS_STATUS_LABELS: Record<RightsState, string> = {
  owned: 'Owned', licensed: 'Licensed', 'permission-granted': 'Permission granted', 'public-domain': 'Public domain', synthetic: 'Synthetic', private: 'Private', unavailable: 'Unavailable', unknown: 'Unknown',
};

export const REVIEW_STATUS_LABELS: Record<(typeof PROVENANCE_REVIEW_STATUSES)[number], string> = {
  unreviewed: 'Unreviewed', reviewed: 'Reviewed', approved: 'Approved',
};
