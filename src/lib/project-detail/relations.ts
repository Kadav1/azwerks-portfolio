import type { ProjectBundle, ProjectRelation } from '../../content-model/types.ts';
import { RELATION_LABELS } from '../../content-model/relations.ts';
import type { ProjectDetailRouteRecord } from './routes.ts';
import type { ProjectDetailRelation } from './types.ts';

const incomingLabels: Record<string, string> = {
  lineage: 'Lineage from', dependency: 'Dependency of', supersedes: 'Superseded by', supports: 'Supported by',
};
const outgoingLabels: Record<string, string> = {
  lineage: 'Lineage to', dependency: 'Depends on', supersedes: 'Supersedes', supports: 'Supports',
};

export const createPublicProjectRelations = (
  bundle: ProjectBundle,
  routes: readonly ProjectDetailRouteRecord[],
): ProjectDetailRelation[] => {
  const routeMap = new Map(routes.map((route) => [route.id, route]));
  const seen = new Set<string>();
  const relations: Array<{ relation: ProjectRelation; direction: ProjectDetailRelation['direction'] }> = [
    ...bundle.incoming.map((relation) => ({ relation, direction: 'incoming' as const })),
    ...bundle.outgoing.map((relation) => ({ relation, direction: 'outgoing' as const })),
    ...bundle.undirected.map((relation) => ({ relation, direction: 'undirected' as const })),
  ];
  const result: ProjectDetailRelation[] = [];
  for (const { relation, direction } of relations) {
    if (relation.visibility !== 'public' || relation.synthetic || seen.has(relation.id)) continue;
    seen.add(relation.id);
    const targetId = direction === 'incoming' ? relation.from : relation.to === bundle.id ? relation.from : relation.to;
    const route = routeMap.get(targetId);
    if (route === undefined || targetId === bundle.id) continue;
    result.push(Object.freeze({
      id: relation.id,
      type: relation.type,
      typeLabel: RELATION_LABELS[relation.type],
      summary: relation.summary,
      direction,
      ...(direction === 'undirected' ? {} : { directionLabel: direction === 'incoming' ? incomingLabels[relation.type] : outgoingLabels[relation.type] }),
      project: Object.freeze({ id: route.id, title: route.title, href: route.href }),
    }));
  }
  return result.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
};
