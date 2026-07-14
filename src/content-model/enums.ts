export const PROJECT_CATEGORIES = [
  'software',
  'visual-system',
  'art',
  'technical-system',
  'limited-media',
] as const;

export const LIFECYCLES = [
  'draft',
  'candidate',
  'reviewed',
  'approved',
  'published',
  'archived',
] as const;

export const VISIBILITIES = ['private', 'unlisted', 'public'] as const;
export const MAINTENANCE_STATES = ['active', 'maintenance', 'paused', 'dormant', 'retired', 'not-applicable'] as const;
export const EVIDENCE_TRUST_STATES = ['unverified', 'reviewed', 'verified', 'unavailable', 'private'] as const;
export const RIGHTS_STATES = ['owned', 'licensed', 'permission-granted', 'public-domain', 'synthetic', 'private', 'unavailable', 'unknown'] as const;
export const SOURCE_AVAILABILITIES = ['public', 'private', 'unavailable', 'not-applicable'] as const;
export const RELATION_TYPES = ['related', 'lineage', 'dependency', 'shared-method', 'family', 'supersedes', 'supports'] as const;
export const RELATION_DIRECTIONS = ['directed', 'undirected'] as const;
export const LINK_TYPES = ['repository', 'demo', 'documentation', 'release', 'publication', 'external', 'contact'] as const;
export const MEDIA_TYPES = ['image', 'svg', 'video', 'audio', 'document', 'diagram', 'interface'] as const;
export const MEDIA_AVAILABILITIES = ['available', 'unavailable', 'private', 'not-applicable'] as const;
export const MEDIA_PURPOSES = ['informative', 'decorative', 'artwork', 'interface', 'diagram', 'documentary'] as const;
export const LAYOUT_PROFILES = ['editorial', 'technical', 'media-led', 'specimen-led', 'document-led'] as const;
export const THEME_PROFILES = ['system', 'dark', 'light', 'neutral'] as const;
export const MOTION_PROFILES = ['none', 'reduced', 'system'] as const;
export const EVIDENCE_TYPES = ['repository', 'release', 'test', 'documentation', 'artifact', 'metric', 'publication', 'source', 'inspection'] as const;
export const LIMITATION_STATUSES = ['known', 'accepted', 'mitigated', 'resolved'] as const;
export const RELEASE_STATUSES = ['planned', 'candidate', 'released', 'superseded', 'withdrawn'] as const;
export const PROVENANCE_REVIEW_STATUSES = ['unreviewed', 'reviewed', 'approved'] as const;
export const NAVIGATION_KINDS = ['page', 'route', 'external'] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type Lifecycle = (typeof LIFECYCLES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type MaintenanceState = (typeof MAINTENANCE_STATES)[number];
export type EvidenceTrust = (typeof EVIDENCE_TRUST_STATES)[number];
export type RightsState = (typeof RIGHTS_STATES)[number];
export type SourceAvailability = (typeof SOURCE_AVAILABILITIES)[number];
export type RelationType = (typeof RELATION_TYPES)[number];
export type RelationDirection = (typeof RELATION_DIRECTIONS)[number];
export type LinkType = (typeof LINK_TYPES)[number];
export type MediaType = (typeof MEDIA_TYPES)[number];
export type MediaAvailability = (typeof MEDIA_AVAILABILITIES)[number];
export type LayoutProfile = (typeof LAYOUT_PROFILES)[number];
export type ThemeProfile = (typeof THEME_PROFILES)[number];
export type MotionProfile = (typeof MOTION_PROFILES)[number];

export const CONTENT_ENUMS = Object.freeze({
  projectCategories: PROJECT_CATEGORIES,
  lifecycles: LIFECYCLES,
  visibilities: VISIBILITIES,
  maintenanceStates: MAINTENANCE_STATES,
  evidenceTrustStates: EVIDENCE_TRUST_STATES,
  rightsStates: RIGHTS_STATES,
  sourceAvailabilities: SOURCE_AVAILABILITIES,
  relationTypes: RELATION_TYPES,
  relationDirections: RELATION_DIRECTIONS,
  linkTypes: LINK_TYPES,
  mediaTypes: MEDIA_TYPES,
  mediaAvailabilities: MEDIA_AVAILABILITIES,
  mediaPurposes: MEDIA_PURPOSES,
  layoutProfiles: LAYOUT_PROFILES,
  themeProfiles: THEME_PROFILES,
  motionProfiles: MOTION_PROFILES,
  evidenceTypes: EVIDENCE_TYPES,
  limitationStatuses: LIMITATION_STATUSES,
  releaseStatuses: RELEASE_STATUSES,
  provenanceReviewStatuses: PROVENANCE_REVIEW_STATUSES,
  navigationKinds: NAVIGATION_KINDS,
});
