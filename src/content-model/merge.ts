import { compareAscii } from './source.ts';
import {
  getIncomingRelations,
  getOutgoingRelations,
  getUndirectedNeighbors,
} from './relations.ts';
import { evaluatePublicationEligibility } from './publication.ts';
import type {
  Project,
  ProjectBundle,
  ProjectData,
  ProjectRelation,
  SourceEntry,
} from './types.ts';

const LIFECYCLE_RANK: Record<string, number> = {
  published: 6,
  approved: 5,
  reviewed: 4,
  candidate: 3,
  draft: 2,
  archived: 1,
};

const evidenceState = (companion: ProjectData): ProjectBundle['evidenceState'] => {
  if (companion.evidence.length === 0) return 'none';
  for (const state of ['verified', 'reviewed', 'unverified', 'private', 'unavailable'] as const) {
    if (companion.evidence.some(({ trust }) => trust === state)) return state;
  }
  return 'none';
};

const displayPeriod = (project: Project): string | undefined =>
  project.period ?? (project.year === undefined ? project.startedAt?.slice(0, 4) : String(project.year));

export const buildProjectBundle = (
  project: SourceEntry<Project>,
  companion: SourceEntry<ProjectData>,
  relations: readonly ProjectRelation[],
): ProjectBundle => {
  const incoming = getIncomingRelations(project.id, relations);
  const outgoing = getOutgoingRelations(project.id, relations);
  const undirected = getUndirectedNeighbors(project.id, relations);
  const relationCount = incoming.length + outgoing.length + undirected.length;
  const searchText = [
    project.data.title,
    project.data.shortTitle,
    project.data.summary,
    project.data.category,
    ...(project.data.tags ?? []),
    ...(project.data.capabilities ?? []),
    ...(project.data.platforms ?? []),
    ...(project.data.tools ?? []),
  ].filter(Boolean).join(' ').toLocaleLowerCase('en-US').replace(/\s+/g, ' ').trim();

  return {
    id: project.id,
    project,
    companion,
    incoming,
    outgoing,
    undirected,
    publication: evaluatePublicationEligibility({ project: project.data, companion: companion.data }),
    displayPeriod: displayPeriod(project.data),
    mediaState: companion.data.mediaAvailability,
    evidenceState: evidenceState(companion.data),
    relationCount,
    searchText,
    archiveState: project.data.lifecycle === 'archived',
    featured: project.data.featured === true,
  };
};

interface SortableBundle {
  id: string;
  featured?: boolean;
  project?: { data?: Partial<Project> };
}

const descendingText = (left?: string, right?: string): number => {
  if (left === right) return 0;
  if (left === undefined) return 1;
  if (right === undefined) return -1;
  return left > right ? -1 : 1;
};

export const sortProjectBundles = <T extends SortableBundle>(bundles: readonly T[]): T[] =>
  [...bundles].sort((left, right) => {
    const featured = Number(right.featured === true) - Number(left.featured === true);
    if (featured !== 0) return featured;

    const leftProject = left.project?.data ?? {};
    const rightProject = right.project?.data ?? {};
    const lifecycle = (LIFECYCLE_RANK[rightProject.lifecycle ?? ''] ?? 0) - (LIFECYCLE_RANK[leftProject.lifecycle ?? ''] ?? 0);
    if (lifecycle !== 0) return lifecycle;

    const date = descendingText(
      leftProject.releasedAt ?? leftProject.updatedAt ?? leftProject.startedAt ?? (leftProject.year === undefined ? undefined : String(leftProject.year)),
      rightProject.releasedAt ?? rightProject.updatedAt ?? rightProject.startedAt ?? (rightProject.year === undefined ? undefined : String(rightProject.year)),
    );
    if (date !== 0) return date;

    const title = compareAscii(leftProject.title ?? '', rightProject.title ?? '');
    return title !== 0 ? title : compareAscii(left.id, right.id);
  });

export const getProjectBundleFrom = (
  bundles: readonly ProjectBundle[],
  id: string,
): ProjectBundle | undefined => bundles.find((bundle) => bundle.id === id);

export const getProjectsByCategoryFrom = (
  bundles: readonly ProjectBundle[],
  category: Project['category'],
): ProjectBundle[] => sortProjectBundles(bundles.filter(({ project }) => project.data.category === category));

export const getProjectsByStatusFrom = (
  bundles: readonly ProjectBundle[],
  status: Project['lifecycle'],
): ProjectBundle[] => sortProjectBundles(bundles.filter(({ project }) => project.data.lifecycle === status));
