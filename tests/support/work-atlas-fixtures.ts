import type { ProjectCategory, RelationType } from '../../src/content-model/enums.ts';
import type { AtlasRecord, AtlasRelation } from '../../src/lib/work-atlas/atlas-types.ts';
import { CATEGORY_LABELS, EVIDENCE_LABELS, MAINTENANCE_LABELS } from '../../src/lib/work-register/labels.ts';
import { normalizeSearchText } from '../../src/lib/work-register/query-state.ts';

const categories = ['software', 'visual-system', 'art', 'technical-system', 'limited-media'] as const;
const relationTypes = ['related', 'lineage', 'dependency', 'shared-method', 'family', 'supersedes', 'supports'] as const;
const maintenanceStates = ['active', 'maintenance', 'paused', 'dormant', 'retired', 'not-applicable'] as const;
const evidenceStates = ['verified', 'reviewed', 'unverified', 'unavailable', 'private', 'none'] as const;

export const createSyntheticAtlasRecords = (count: number): AtlasRecord[] =>
  Array.from({ length: count }, (_, index) => {
    const category: ProjectCategory = categories[index % categories.length]!;
    const serial = String(index + 1).padStart(3, '0');
    const maintenance = maintenanceStates[index % maintenanceStates.length]!;
    const evidenceState = evidenceStates[index % evidenceStates.length]!;
    const title = index % 17 === 0
      ? `Synthetic Atlas record ${serial} with an intentionally long title for resilient wrapping and text enlargement`
      : `Synthetic ${CATEGORY_LABELS[category]} Atlas record ${serial}`;
    const summary = index % 13 === 0
      ? 'An intentionally long isolated summary that exercises wrapping, inspector flow, filtering, and semantic indexing without entering the production publication boundary.'
      : `An isolated synthetic ${category} record for deterministic Atlas quality assurance.`;
    return {
      id: `synthetic-atlas-${serial}`,
      slug: `synthetic-atlas-${serial}`,
      href: `/work/synthetic-atlas-${serial}/`,
      title,
      shortTitle: index % 19 === 0 ? 'Duplicate short title' : `Atlas ${serial}`,
      summary,
      category,
      categoryLabel: CATEGORY_LABELS[category],
      world: category,
      maintenance,
      maintenanceLabel: MAINTENANCE_LABELS[maintenance],
      displayPeriod: `${2020 + (index % 6)}–${2021 + (index % 6)}`,
      evidenceState,
      evidenceLabel: EVIDENCE_LABELS[evidenceState],
      defaultIndex: index,
      searchText: normalizeSearchText(`${title} ${summary} ${category} system mapping accessible retrieval`),
    };
  });

export const createSyntheticAtlasRelations = (
  records: readonly AtlasRecord[],
  count = Math.min(Math.max(records.length - 1, 0), relationTypes.length),
): AtlasRelation[] => Array.from({ length: count }, (_, index) => {
  const type: RelationType = relationTypes[index % relationTypes.length]!;
  const source = records[index % records.length]!;
  const target = records[(index + 1) % records.length]!;
  return {
    id: `synthetic-relation-${String(index + 1).padStart(3, '0')}`,
    sourceId: source.id,
    targetId: target.id,
    type,
    label: type,
    directional: ['lineage', 'dependency', 'supersedes', 'supports'].includes(type),
    summary: `Synthetic ${type} relation for isolated Atlas quality assurance.`,
  };
});

export const ATLAS_FIXTURE_SIZES = [0, 1, 10, 50, 200] as const;
