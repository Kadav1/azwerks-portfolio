import type { ProjectBundle } from '../../content-model/types.ts';
import { CATEGORY_LABELS, EVIDENCE_LABELS, MAINTENANCE_LABELS } from './labels.ts';
import { normalizeSearchText } from './query-state.ts';
import type { WorkRegisterPreview, WorkRegisterRecord } from './types.ts';

const PUBLISHABLE_RIGHTS = new Set(['owned', 'licensed', 'permission-granted', 'public-domain']);

const createPreview = (bundle: ProjectBundle): WorkRegisterPreview | undefined => {
  const media = bundle.companion.data.media.find((candidate) =>
    candidate.availability === 'available'
      && PUBLISHABLE_RIGHTS.has(candidate.rights)
      && candidate.type === 'image'
      && typeof candidate.source === 'string'
      && typeof candidate.alt === 'string'
      && Number.isInteger(candidate.width)
      && Number.isInteger(candidate.height)
      && (candidate.width ?? 0) > 0
      && (candidate.height ?? 0) > 0,
  );
  if (!media || media.width === undefined || media.height === undefined || media.alt === undefined) return undefined;
  return {
    src: media.source,
    alt: media.alt,
    width: media.width,
    height: media.height,
    ...(media.caption === undefined ? {} : { caption: media.caption }),
    artwork: media.purpose === 'artwork' || bundle.project.data.category === 'art',
  };
};

const dateSortKey = (bundle: ProjectBundle): string => {
  const project = bundle.project.data;
  return project.releasedAt
    ?? project.updatedAt
    ?? project.startedAt
    ?? (project.year === undefined ? '' : `${String(project.year).padStart(4, '0')}-00-00`);
};

export const createWorkRegisterRecords = (
  bundles: readonly ProjectBundle[],
  detailRoutesAvailable = false,
): WorkRegisterRecord[] => bundles
  .filter(({ publication, archiveState }) => publication.eligible && !archiveState)
  .map((bundle, defaultIndex) => {
    const project = bundle.project.data;
    const preview = createPreview(bundle);
    const approvedSearchFields = [
      project.title,
      project.shortTitle,
      project.summary,
      project.category,
      ...(project.tags ?? []),
      ...(project.capabilities ?? []),
      ...(project.platforms ?? []),
      ...(project.tools ?? []),
    ].filter((value): value is string => typeof value === 'string');
    return {
      id: bundle.id,
      title: project.title,
      shortTitle: project.shortTitle ?? project.title,
      summary: project.summary,
      category: project.category,
      categoryLabel: CATEGORY_LABELS[project.category],
      lifecycle: project.lifecycle,
      maintenance: project.maintenance,
      maintenanceLabel: MAINTENANCE_LABELS[project.maintenance],
      ...(bundle.displayPeriod === undefined ? {} : { displayPeriod: bundle.displayPeriod }),
      evidenceState: bundle.evidenceState,
      evidenceLabel: EVIDENCE_LABELS[bundle.evidenceState],
      mediaState: bundle.mediaState,
      featured: bundle.featured,
      tags: [...(project.tags ?? [])],
      capabilities: [...(project.capabilities ?? [])],
      platforms: [...(project.platforms ?? [])],
      searchText: normalizeSearchText(approvedSearchFields.join(' ')),
      defaultIndex,
      dateSortKey: dateSortKey(bundle),
      titleSortKey: normalizeSearchText(project.title),
      ...(preview === undefined ? {} : { preview }),
      ...(detailRoutesAvailable ? { href: `/work/${bundle.id}/` } : {}),
    } satisfies WorkRegisterRecord;
  });
