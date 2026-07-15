import type {
  EvidenceTrust,
  MaintenanceState,
  ProjectCategory,
  RelationType,
} from '../../content-model/enums.ts';
import type { ProjectWorld } from '../project-worlds/world-types.ts';

export const ATLAS_NODE_WIDTH = 240;
export const ATLAS_NODE_HEIGHT = 88;

export type PublicRelationType = RelationType;

export interface AtlasRecord {
  id: string;
  slug: string;
  href: string;
  title: string;
  shortTitle?: string | undefined;
  summary: string;
  category: ProjectCategory;
  categoryLabel: string;
  world: ProjectWorld;
  maintenance?: MaintenanceState | undefined;
  maintenanceLabel?: string | undefined;
  displayPeriod?: string | undefined;
  evidenceState?: EvidenceTrust | 'none' | undefined;
  evidenceLabel?: string | undefined;
  defaultIndex: number;
  searchText: string;
}

export interface AtlasRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: PublicRelationType;
  label: string;
  directional: boolean;
  summary: string;
}

export interface AtlasRegionDefinition {
  id: ProjectCategory;
  label: string;
  x: number;
  y: number;
  width: number;
  rankMeaning: 'none';
}

export interface AtlasLayoutNode {
  id: string;
  x: number;
  y: number;
  regionId: ProjectCategory;
  order: number;
}

export interface AtlasLayoutEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: PublicRelationType;
  path: string;
  directional: boolean;
}

export interface AtlasLayoutRegion extends AtlasRegionDefinition {
  height: number;
}

export interface AtlasLayout {
  algorithmVersion: string;
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  regions: readonly AtlasLayoutRegion[];
  nodes: readonly AtlasLayoutNode[];
  edges: readonly AtlasLayoutEdge[];
  edgePolicy: 'all' | 'focused';
}

export interface AtlasExcludedCounts {
  archived: number;
  synthetic: number;
  private: number;
  unlisted: number;
  ineligible: number;
  unroutable: number;
  unsafeRelation: number;
}

export interface AtlasViewModel {
  records: readonly AtlasRecord[];
  relations: readonly AtlasRelation[];
  excluded: AtlasExcludedCounts;
}

export interface AtlasState {
  q: string;
  category: readonly ProjectCategory[];
  maintenance: readonly MaintenanceState[];
  evidence: readonly (EvidenceTrust | 'none')[];
  relation: readonly PublicRelationType[];
  focus: string;
}

export interface AtlasFilteredData {
  records: readonly AtlasRecord[];
  relations: readonly AtlasRelation[];
  recordIds: ReadonlySet<string>;
  focusedId?: string | undefined;
}
