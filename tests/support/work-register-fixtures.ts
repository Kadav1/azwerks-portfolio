import {
  CATEGORY_LABELS,
  EVIDENCE_LABELS,
  MAINTENANCE_LABELS,
} from '../../src/lib/work-register/labels.ts';
import { normalizeSearchText } from '../../src/lib/work-register/query-state.ts';
import type { WorkRegisterRecord } from '../../src/lib/work-register/types.ts';

const categories = ['software', 'visual-system', 'art', 'technical-system', 'limited-media'] as const;
const maintenanceStates = ['active', 'maintenance', 'paused', 'dormant', 'retired', 'not-applicable'] as const;
const evidenceStates = ['verified', 'reviewed', 'unverified', 'unavailable', 'private', 'none'] as const;
const previewSource = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22800%22 viewBox=%220 0 1200 800%22%3E%3Crect width=%221200%22 height=%22800%22 fill=%22%23232a28%22/%3E%3Cpath d=%22M120 620L420 180l210 330 160-230 290 340%22 fill=%22none%22 stroke=%22%23d7f500%22 stroke-width=%2232%22/%3E%3C/svg%3E';

export const createSyntheticWorkRegisterRecords = (count: number): WorkRegisterRecord[] =>
  Array.from({ length: count }, (_, index) => {
    const category = categories[index % categories.length]!;
    const maintenance = maintenanceStates[index % maintenanceStates.length]!;
    const evidenceState = evidenceStates[index % evidenceStates.length]!;
    const serial = String(index + 1).padStart(3, '0');
    const title = index % 17 === 0
      ? `Synthetic boundary record ${serial} with an intentionally long title that verifies resilient wrapping without truncation`
      : `Synthetic ${CATEGORY_LABELS[category]} record ${serial}`;
    const summary = index % 13 === 0
      ? 'An intentionally long synthetic summary for isolated Work Register quality assurance. It exercises wrapping, text enlargement, bounded content measure, filter updates, and stable rendering without presenting itself as real portfolio work or entering the production content boundary.'
      : `An isolated synthetic ${category} summary for deterministic register behavior and scale testing.`;
    const capabilities = [`Capability ${index % 7}`, 'System mapping', 'Accessible retrieval', 'Static generation', 'Long-term maintenance'];
    return {
      id: `synthetic-record-${serial}`,
      title,
      shortTitle: `Synthetic ${serial}`,
      summary,
      category,
      categoryLabel: CATEGORY_LABELS[category],
      lifecycle: index % 2 === 0 ? 'approved' : 'published',
      maintenance,
      maintenanceLabel: MAINTENANCE_LABELS[maintenance],
      displayPeriod: `${2020 + (index % 6)}–${2021 + (index % 6)}`,
      evidenceState,
      evidenceLabel: EVIDENCE_LABELS[evidenceState],
      mediaState: category === 'art' && index % 2 === 0 ? 'available' : 'unavailable',
      featured: index < 3,
      tags: [`tag-${index % 9}`, 'synthetic-qa'],
      capabilities,
      platforms: index % 2 === 0 ? ['Web', 'Local'] : ['Document'],
      searchText: normalizeSearchText(`${title} ${summary} ${category} ${capabilities.join(' ')} Web Local TypeScript system`),
      defaultIndex: index,
      dateSortKey: `${2020 + (index % 6)}-${String((index % 12) + 1).padStart(2, '0')}-01`,
      titleSortKey: normalizeSearchText(title),
      ...(category === 'art' && index % 2 === 0 ? {
        preview: {
          src: previewSource,
          alt: `Synthetic geometric preview for QA record ${serial}`,
          width: 1200,
          height: 800,
          caption: 'Synthetic QA media; never published as portfolio content.',
          artwork: true,
        },
      } : {}),
    };
  });
