import type {
  EvidenceTrust,
  LayoutProfile,
  MaintenanceState,
  MotionProfile,
  ProjectCategory,
  SourceAvailability,
  ThemeProfile,
} from '../../content-model/enums.ts';
import type { ShellProfile, WorldProfile } from '../shell/shell-types.ts';
import type { ProjectContextDestination } from './navigation.ts';

export interface ProjectDetailHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface ProjectDetailMedia {
  id: string;
  type: 'image' | 'svg' | 'video' | 'audio' | 'document' | 'diagram' | 'interface';
  source: string;
  purpose: 'informative' | 'decorative' | 'artwork' | 'interface' | 'diagram' | 'documentary';
  alt: string;
  caption?: string | undefined;
  credit?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  aspectRatio?: string | undefined;
  poster?: string | undefined;
  transcript?: string | undefined;
  description?: string | undefined;
}

export interface ProjectDetailEvidence {
  id: string;
  type: string;
  title: string;
  trust: EvidenceTrust;
  availability: SourceAvailability;
  summary?: string | undefined;
  claim?: string | undefined;
  method?: string | undefined;
  result?: string | undefined;
  limitations?: string | undefined;
  url?: string | undefined;
  version?: string | undefined;
  date?: string | undefined;
  artifact?: string | undefined;
  unit?: string | undefined;
}

export interface ProjectDetailProcessItem {
  id: string;
  title: string;
  summary: string;
  order: number;
  date?: string | undefined;
  decision?: string | undefined;
  result?: string | undefined;
  evidenceIds: readonly string[];
}

export interface ProjectDetailLimitation {
  id: string;
  summary: string;
  status: string;
  statusLabel: string;
  scope?: string | undefined;
  impact?: string | undefined;
  mitigation?: string | undefined;
  evidenceIds: readonly string[];
}

export interface ProjectDetailRelease {
  id: string;
  version: string;
  date: string;
  status: string;
  statusLabel: string;
  summary: string;
  url?: string | undefined;
  evidenceIds: readonly string[];
}

export interface ProjectDetailLink {
  id: string;
  type: string;
  label: string;
  typeLabel: string;
  url: string;
  external: boolean;
}

export interface ProjectDetailProvenance {
  owner: string;
  authorship: string;
  sourceAvailability: SourceAvailability;
  sourceAvailabilityLabel: string;
  rightsStatus: string;
  rightsStatusLabel: string;
  reviewStatus: string;
  reviewStatusLabel: string;
  reviewedAt?: string | undefined;
}

export interface ProjectDetailRelation {
  id: string;
  type: string;
  typeLabel: string;
  summary: string;
  direction: 'incoming' | 'outgoing' | 'undirected';
  directionLabel?: string | undefined;
  project: ProjectContextDestination;
}

export interface ProjectDetailViewModel {
  id: string;
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  subtitle?: string | undefined;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  category: ProjectCategory;
  categoryLabel: string;
  lifecycle: string;
  lifecycleLabel: string;
  maintenance: MaintenanceState;
  maintenanceLabel: string;
  displayPeriod?: string | undefined;
  version?: string | undefined;
  experimental: boolean;
  worldProfile: WorldProfile;
  shellProfile: ShellProfile;
  layoutProfile: LayoutProfile;
  themeProfile: ThemeProfile;
  motionProfile: MotionProfile;
  mediaState: 'available' | 'unavailable' | 'private' | 'not-applicable';
  leadMedia?: ProjectDetailMedia | undefined;
  allPublicMedia: readonly ProjectDetailMedia[];
  evidenceState: EvidenceTrust | 'none';
  evidenceStateLabel: string;
  publicEvidence: readonly ProjectDetailEvidence[];
  process: readonly ProjectDetailProcessItem[];
  limitations: readonly ProjectDetailLimitation[];
  releases: readonly ProjectDetailRelease[];
  publicLinks: readonly ProjectDetailLink[];
  provenance: ProjectDetailProvenance;
  relations: readonly ProjectDetailRelation[];
  tableOfContents: readonly ProjectDetailHeading[];
  position?: { current: number; total: number } | undefined;
  previousProject?: ProjectContextDestination | undefined;
  nextProject?: ProjectContextDestination | undefined;
  canonical: string;
  noindex: boolean;
}
