import type { ProjectBundle, ProjectRelation } from '../../content-model/types.ts';
import { createPublicProjectRelations } from '../project-detail/relations.ts';
import { getProjectDetailRouteRecords, isProjectDetailRoutable } from '../project-detail/routes.ts';
import { getProjectWorldDefinition } from '../project-worlds/world-registry.ts';
import { createWorkRegisterRecords } from '../work-register/view-model.ts';
import { ATLAS_RELATION_LANGUAGE } from './atlas-relations.ts';
import type {
  AtlasExcludedCounts,
  AtlasRecord,
  AtlasRelation,
  AtlasViewModel,
} from './atlas-types.ts';

const emptyExcluded = (): AtlasExcludedCounts => ({
  archived: 0,
  synthetic: 0,
  private: 0,
  unlisted: 0,
  ineligible: 0,
  unroutable: 0,
  unsafeRelation: 0,
});

const classifyExcluded = (
  bundle: ProjectBundle,
  includedIds: ReadonlySet<string>,
  excluded: AtlasExcludedCounts,
): void => {
  if (includedIds.has(bundle.id)) return;
  const project = bundle.project.data;
  if (bundle.archiveState || project.lifecycle === 'archived') excluded.archived += 1;
  else if (project.synthetic) excluded.synthetic += 1;
  else if (project.visibility === 'private') excluded.private += 1;
  else if (project.visibility === 'unlisted') excluded.unlisted += 1;
  else if (!bundle.publication.eligible) excluded.ineligible += 1;
  else excluded.unroutable += 1;
};

const allBundleRelations = (bundle: ProjectBundle): readonly ProjectRelation[] => [
  ...bundle.incoming,
  ...bundle.outgoing,
  ...bundle.undirected,
];

export const createAtlasViewModel = (bundles: readonly ProjectBundle[]): AtlasViewModel => {
  const routes = getProjectDetailRouteRecords(bundles);
  const routeMap = new Map(routes.map((route) => [route.id, route]));
  const registerRecords = createWorkRegisterRecords(bundles);
  const routableRegisterRecords = registerRecords.filter((record) => record.href !== undefined);
  const registerIds = routableRegisterRecords.map(({ id }) => id);
  const routeIds = routes.map(({ id }) => id);
  if (registerIds.length !== routeIds.length || registerIds.some((id, index) => id !== routeIds[index])) {
    throw new Error('WORK_ATLAS_REGISTER_PARITY');
  }

  const bundleMap = new Map(bundles.map((bundle) => [bundle.id, bundle]));
  const records: AtlasRecord[] = routableRegisterRecords.map((record) => {
    const route = routeMap.get(record.id);
    const bundle = bundleMap.get(record.id);
    if (route === undefined || bundle === undefined || !isProjectDetailRoutable(bundle)) {
      throw new Error(`WORK_ATLAS_ROUTE_SOURCE_INVALID ${record.id}`);
    }
    const world = getProjectWorldDefinition(record.category);
    return Object.freeze({
      id: record.id,
      slug: route.slug,
      href: route.href,
      title: record.title,
      shortTitle: record.shortTitle,
      summary: record.summary,
      category: record.category,
      categoryLabel: record.categoryLabel,
      world: world.id,
      maintenance: record.maintenance,
      maintenanceLabel: record.maintenanceLabel,
      ...(record.displayPeriod === undefined ? {} : { displayPeriod: record.displayPeriod }),
      evidenceState: record.evidenceState,
      evidenceLabel: record.evidenceLabel,
      defaultIndex: record.defaultIndex,
      searchText: record.searchText,
    });
  });

  const includedIds = new Set(records.map(({ id }) => id));
  const excluded = emptyExcluded();
  for (const bundle of bundles) classifyExcluded(bundle, includedIds, excluded);

  const rawRelations = new Map<string, ProjectRelation>();
  for (const bundle of bundles) {
    for (const relation of allBundleRelations(bundle)) rawRelations.set(relation.id, relation);
  }

  const safeIds = new Set<string>();
  const relations: AtlasRelation[] = [];
  for (const record of records) {
    const bundle = bundleMap.get(record.id);
    if (bundle === undefined) continue;
    for (const safeRelation of createPublicProjectRelations(bundle, routes)) {
      if (safeIds.has(safeRelation.id)) continue;
      const raw = rawRelations.get(safeRelation.id);
      if (raw === undefined || !includedIds.has(raw.from) || !includedIds.has(raw.to)) continue;
      safeIds.add(raw.id);
      relations.push(Object.freeze({
        id: raw.id,
        sourceId: raw.from,
        targetId: raw.to,
        type: raw.type,
        label: ATLAS_RELATION_LANGUAGE[raw.type].label,
        directional: raw.direction === 'directed',
        summary: safeRelation.summary,
      }));
    }
  }
  relations.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);

  for (const relation of rawRelations.values()) {
    if (
      relation.visibility === 'public'
      && !relation.synthetic
      && (includedIds.has(relation.from) || includedIds.has(relation.to))
      && !safeIds.has(relation.id)
    ) excluded.unsafeRelation += 1;
  }

  return Object.freeze({
    records: Object.freeze(records),
    relations: Object.freeze(relations),
    excluded: Object.freeze(excluded),
  });
};
