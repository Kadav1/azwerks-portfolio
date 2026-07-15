import type {
  LayoutProfile,
  MotionProfile,
  ProjectCategory,
  ThemeProfile,
} from '../../content-model/enums.ts';
import type { ProjectDetailViewModel } from '../project-detail/types.ts';
import type { ShellProfile, WorldProfile } from '../shell/shell-types.ts';

export type ProjectWorld = ProjectCategory;

export type ProjectWorldSection =
  | 'orientation'
  | 'header'
  | 'lead'
  | 'narrative'
  | 'evidence'
  | 'limitations'
  | 'process'
  | 'releases'
  | 'links'
  | 'provenance'
  | 'relations'
  | 'context-navigation';

export type NarrativeMeasure = 'reading' | 'editorial' | 'technical' | 'reflection';
export type MetadataDensity = 'quiet' | 'balanced' | 'compact';
export type EvidenceDensity = 'quiet' | 'balanced' | 'inspectable';
export type SectionTreatment = 'quiet' | 'standard' | 'emphasized';

export interface ProjectWorldSectionPolicy {
  order: readonly ProjectWorldSection[];
  required: readonly ProjectWorldSection[];
  narrativeMeasure: NarrativeMeasure;
  metadataDensity: MetadataDensity;
  evidenceDensity: EvidenceDensity;
  leadMediaPreference: string;
  processTreatment: SectionTreatment;
  releasesTreatment: SectionTreatment;
  limitationsTreatment: SectionTreatment;
  provenanceTreatment: SectionTreatment;
  relationTreatment: SectionTreatment;
}

export interface ProjectWorldDefinition {
  id: ProjectWorld;
  label: string;
  shellProfile: ShellProfile;
  worldProfile: WorldProfile;
  layoutProfile: LayoutProfile;
  themeProfile: ThemeProfile;
  motionProfile: MotionProfile;
  leadStrategy: string;
  narrativeStrategy: string;
  sectionEmphasis: readonly ProjectWorldSection[];
  authoredMarkLevel: 0 | 1;
}

export interface ProjectWorldViewModel {
  world: ProjectWorld;
  worldLabel: string;
  shellProfile: ShellProfile;
  worldProfile: WorldProfile;
  layoutProfile: LayoutProfile;
  themeProfile: ThemeProfile;
  motionProfile: MotionProfile;
  leadStrategy: string;
  narrativeStrategy: string;
  sectionPolicy: ProjectWorldSectionPolicy;
  authoredMarkLevel: 0 | 1;
  hasLeadMedia: boolean;
  hasNarrative: boolean;
  hasEvidence: boolean;
  hasLimitations: boolean;
  hasProcess: boolean;
  hasReleases: boolean;
  hasLinks: boolean;
  hasRelations: boolean;
  isSparse: boolean;
}

export type ProjectWorldProject = ProjectDetailViewModel;
