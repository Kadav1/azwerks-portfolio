import type { ProjectBundle } from '../../content-model/types.ts';
import { filterPublicEvidence } from './evidence.ts';
import { getProjectDetailTableOfContents } from './headings.ts';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_EVIDENCE_LABELS,
  PROJECT_LIFECYCLE_LABELS,
  PROJECT_LIMITATION_LABELS,
  PROJECT_LINK_LABELS,
  PROJECT_MAINTENANCE_LABELS,
  PROJECT_RELEASE_LABELS,
  REVIEW_STATUS_LABELS,
  RIGHTS_STATUS_LABELS,
  SOURCE_AVAILABILITY_LABELS,
} from './labels.ts';
import { filterPublicMedia, selectLeadMedia } from './media.ts';
import { getProjectContextNavigation } from './navigation.ts';
import { mapProjectProfiles } from './profiles.ts';
import { createPublicProjectRelations } from './relations.ts';
import type { ProjectDetailRouteRecord } from './routes.ts';
import { isProjectDetailRoutable } from './routes.ts';
import type { ProjectDetailHeading, ProjectDetailViewModel } from './types.ts';

const safeExternalUrl = (value?: string): string | undefined => {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    const privateHost = /^(?:localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i;
    return ['https:', 'mailto:'].includes(url.protocol) && !url.username && !url.password && !privateHost.test(url.hostname) ? value : undefined;
  } catch {
    return undefined;
  }
};

const publicEvidenceState = (evidence: ReturnType<typeof filterPublicEvidence>): ProjectDetailViewModel['evidenceState'] => {
  if (evidence.length === 0) return 'none';
  for (const state of ['verified', 'reviewed', 'unverified', 'private', 'unavailable'] as const) {
    if (evidence.some(({ trust }) => trust === state)) return state;
  }
  return 'none';
};

export const createProjectDetailViewModel = (
  bundle: ProjectBundle,
  routes: readonly ProjectDetailRouteRecord[],
  index: number,
  headings: readonly ProjectDetailHeading[] = [],
): ProjectDetailViewModel => {
  if (!isProjectDetailRoutable(bundle) || routes[index]?.id !== bundle.id) {
    throw new Error(`PROJECT_DETAIL_ROUTE_SOURCE_INVALID ${bundle.id}`);
  }
  const project = bundle.project.data;
  const companion = bundle.companion.data;
  const route = routes[index];
  const profiles = mapProjectProfiles(project.category, companion.layoutProfile, companion.themeProfile, companion.motionProfile);
  const media = filterPublicMedia(companion.media);
  const evidence = filterPublicEvidence(companion.evidence);
  const evidenceState = publicEvidenceState(evidence);
  const publicEvidenceIds = new Set(evidence.filter(({ availability }) => availability === 'public').map(({ id }) => id));
  const filterEvidenceIds = (ids?: readonly string[]): string[] => (ids ?? []).filter((id) => publicEvidenceIds.has(id));
  const navigation = getProjectContextNavigation(routes, index);

  return Object.freeze({
    id: bundle.id,
    slug: route.slug,
    href: route.href,
    title: project.title,
    shortTitle: project.shortTitle ?? project.title,
    ...(project.subtitle === undefined ? {} : { subtitle: project.subtitle }),
    summary: project.summary,
    seoTitle: project.seoTitle ?? `${project.title} — azwerks`,
    seoDescription: project.seoDescription ?? project.summary,
    category: project.category,
    categoryLabel: PROJECT_CATEGORY_LABELS[project.category],
    lifecycle: project.lifecycle,
    lifecycleLabel: PROJECT_LIFECYCLE_LABELS[project.lifecycle],
    maintenance: project.maintenance,
    maintenanceLabel: PROJECT_MAINTENANCE_LABELS[project.maintenance],
    ...(bundle.displayPeriod === undefined ? {} : { displayPeriod: bundle.displayPeriod }),
    ...(project.version === undefined ? {} : { version: project.version }),
    experimental: project.experimental === true,
    ...profiles,
    mediaState: bundle.mediaState,
    leadMedia: selectLeadMedia(companion.media),
    allPublicMedia: media,
    evidenceState,
    evidenceStateLabel: PROJECT_EVIDENCE_LABELS[evidenceState],
    publicEvidence: evidence,
    process: companion.process
      .map((item) => Object.freeze({ ...item, evidenceIds: filterEvidenceIds(item.evidenceIds) }))
      .sort((left, right) => left.order - right.order),
    limitations: companion.limitations.map((item) => Object.freeze({
      ...item,
      statusLabel: PROJECT_LIMITATION_LABELS[item.status],
      evidenceIds: filterEvidenceIds(item.evidenceIds),
    })),
    releases: companion.releases
      .map((item) => {
        const url = safeExternalUrl(item.url);
        return Object.freeze({
          ...item,
          statusLabel: PROJECT_RELEASE_LABELS[item.status],
          ...(url === undefined ? { url: undefined } : { url }),
          evidenceIds: filterEvidenceIds(item.evidenceIds),
        });
      })
      .sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id)),
    publicLinks: companion.links.flatMap((item) => {
      const url = item.public ? safeExternalUrl(item.url) : undefined;
      return url === undefined ? [] : [Object.freeze({
        id: item.id,
        type: item.type,
        label: item.label,
        typeLabel: PROJECT_LINK_LABELS[item.type],
        url,
        external: url.startsWith('https://'),
      })];
    }),
    provenance: Object.freeze({
      owner: companion.provenance.owner,
      authorship: companion.provenance.authorship,
      sourceAvailability: companion.provenance.sourceAvailability,
      sourceAvailabilityLabel: SOURCE_AVAILABILITY_LABELS[companion.provenance.sourceAvailability],
      rightsStatus: companion.provenance.rightsStatus,
      rightsStatusLabel: RIGHTS_STATUS_LABELS[companion.provenance.rightsStatus],
      reviewStatus: companion.provenance.reviewStatus,
      reviewStatusLabel: REVIEW_STATUS_LABELS[companion.provenance.reviewStatus],
      ...(companion.provenance.reviewedAt === undefined ? {} : { reviewedAt: companion.provenance.reviewedAt }),
    }),
    relations: createPublicProjectRelations(bundle, routes),
    tableOfContents: headings.length === 0 ? [] : getProjectDetailTableOfContents(headings),
    ...navigation,
    canonical: route.href,
    noindex: false,
  });
};
