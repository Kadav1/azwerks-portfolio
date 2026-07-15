import { PROJECT_CATEGORIES } from '../../content-model/enums.ts';
import { CATEGORY_LABELS } from '../work-register/labels.ts';
import type { AtlasRegionDefinition } from './atlas-types.ts';

export const ATLAS_REGION_WIDTH = 600;
export const ATLAS_REGION_GAP = 40;
export const ATLAS_PLANE_PADDING = 40;

export const ATLAS_REGIONS: readonly AtlasRegionDefinition[] = Object.freeze(
  PROJECT_CATEGORIES.map((id, index) => Object.freeze({
    id,
    label: CATEGORY_LABELS[id],
    x: ATLAS_PLANE_PADDING + index * (ATLAS_REGION_WIDTH + ATLAS_REGION_GAP),
    y: ATLAS_PLANE_PADDING,
    width: ATLAS_REGION_WIDTH,
    rankMeaning: 'none' as const,
  })),
);
