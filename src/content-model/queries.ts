import { getCollection } from 'astro:content';

import {
  buildProjectBundle,
  getProjectBundleFrom,
  getProjectsByCategoryFrom,
  getProjectsByStatusFrom,
  sortProjectBundles,
} from './merge.ts';
import { getRelationsForProject as getRelationsFrom } from './relations.ts';
import type {
  Project,
  ProjectBundle,
  ProjectData,
  ProjectRelation,
  SourceEntry,
} from './types.ts';

const referenceId = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id;
  throw new TypeError('Content reference does not contain a stable id.');
};

const sourcePath = (entry: { id: string }): string => `content:${entry.id}`;

export const getAllProjectBundles = async (): Promise<ProjectBundle[]> => {
  const [projectEntries, companionEntries, relationEntries] = await Promise.all([
    getCollection('projects'),
    getCollection('projectData'),
    getCollection('projectRelations'),
  ]);

  const projects: SourceEntry<Project>[] = projectEntries.map((entry) => ({
    id: entry.id,
    data: entry.data as Project,
    body: entry.body,
    filePath: sourcePath(entry),
  }));
  const companions: SourceEntry<ProjectData>[] = companionEntries.map((entry) => ({
    id: entry.id,
    data: { ...entry.data, project: referenceId(entry.data.project) } as ProjectData,
    filePath: sourcePath(entry),
  }));
  const relations: ProjectRelation[] = relationEntries.map((entry) => ({
    ...entry.data,
    from: referenceId(entry.data.from),
    to: referenceId(entry.data.to),
  }) as ProjectRelation);
  const companionMap = new Map(companions.map((entry) => [entry.data.project, entry]));

  return sortProjectBundles(projects.map((project) => {
    const companion = companionMap.get(project.id);
    if (!companion) throw new Error(`Missing project companion for ${project.id}.`);
    return buildProjectBundle(project, companion, relations);
  }));
};

export const getPublicProjectBundles = async (): Promise<ProjectBundle[]> =>
  (await getAllProjectBundles()).filter(({ publication }) => publication.eligible);

export const getUnlistedProjectBundles = async (): Promise<ProjectBundle[]> =>
  (await getAllProjectBundles()).filter(({ project }) => project.data.visibility === 'unlisted');

export const getArchivedProjectBundles = async (): Promise<ProjectBundle[]> =>
  (await getAllProjectBundles()).filter(({ archiveState }) => archiveState);

export const getProjectBundle = async (id: string): Promise<ProjectBundle | undefined> =>
  getProjectBundleFrom(await getAllProjectBundles(), id);

export const getRelationsForProject = async (id: string): Promise<readonly ProjectRelation[]> => {
  const entries = await getCollection('projectRelations');
  const relations = entries.map((entry) => ({
    ...entry.data,
    from: referenceId(entry.data.from),
    to: referenceId(entry.data.to),
  }) as ProjectRelation);
  return getRelationsFrom(id, relations);
};

export const getProjectsByCategory = async (
  category: Project['category'],
): Promise<ProjectBundle[]> => getProjectsByCategoryFrom(await getAllProjectBundles(), category);

export const getProjectsByStatus = async (
  status: Project['lifecycle'],
): Promise<ProjectBundle[]> => getProjectsByStatusFrom(await getAllProjectBundles(), status);

export { sortProjectBundles };
