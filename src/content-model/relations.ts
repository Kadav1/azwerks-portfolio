import { contentError } from './error-codes.ts';
import { compareAscii } from './source.ts';
import type { ProjectRelation } from './types.ts';

const DIRECTED_TYPES = new Set(['lineage', 'dependency', 'supersedes', 'supports']);
const UNDIRECTED_TYPES = new Set(['related', 'shared-method', 'family']);

const edgeKey = (relation: ProjectRelation): string => {
  if (relation.direction === 'undirected') {
    const endpoints = [relation.from, relation.to].sort(compareAscii);
    return `${relation.type}:undirected:${endpoints[0]}:${endpoints[1]}`;
  }
  return `${relation.type}:directed:${relation.from}:${relation.to}`;
};

export const validateRelationSet = (
  relations: readonly ProjectRelation[],
  projects: ReadonlyMap<string, { visibility: string }>,
): readonly ProjectRelation[] => {
  const ids = new Set<string>();
  const edges = new Set<string>();

  for (const relation of relations) {
    if (ids.has(relation.id)) {
      contentError('CONTENT_RELATION_DUPLICATE', `Duplicate relation id "${relation.id}".`, relation.id);
    }
    ids.add(relation.id);

    if (relation.from === relation.to) {
      contentError('CONTENT_RELATION_SELF', 'Project relations cannot point to the same project.', relation.id);
    }
    if (!projects.has(relation.from) || !projects.has(relation.to)) {
      contentError('CONTENT_RELATION_ORPHAN', 'Project relation target does not exist.', relation.id);
    }
    if (DIRECTED_TYPES.has(relation.type) && relation.direction !== 'directed') {
      contentError('CONTENT_RELATION_DIRECTION', `Relation type "${relation.type}" must be directed.`, relation.id);
    }
    if (UNDIRECTED_TYPES.has(relation.type) && relation.direction !== 'undirected') {
      contentError('CONTENT_RELATION_DIRECTION', `Relation type "${relation.type}" must be undirected.`, relation.id);
    }

    const key = edgeKey(relation);
    if (edges.has(key)) {
      contentError('CONTENT_RELATION_DUPLICATE', 'Duplicate project relation edge.', relation.id);
    }
    edges.add(key);

    if (relation.visibility === 'public') {
      if (projects.get(relation.from)?.visibility !== 'public' || projects.get(relation.to)?.visibility !== 'public') {
        contentError('CONTENT_RELATION_ORPHAN', 'Public relations may reference public projects only.', relation.id);
      }
    }
  }

  return [...relations].sort((left, right) => compareAscii(left.id, right.id));
};

export const getRelationsForProject = (
  projectId: string,
  relations: readonly ProjectRelation[],
): readonly ProjectRelation[] => relations
  .filter(({ from, to }) => from === projectId || to === projectId)
  .sort((left, right) => compareAscii(left.id, right.id));

export const getOutgoingRelations = (
  projectId: string,
  relations: readonly ProjectRelation[],
): readonly ProjectRelation[] => relations
  .filter(({ direction, from }) => direction === 'directed' && from === projectId)
  .sort((left, right) => compareAscii(left.id, right.id));

export const getIncomingRelations = (
  projectId: string,
  relations: readonly ProjectRelation[],
): readonly ProjectRelation[] => relations
  .filter(({ direction, to }) => direction === 'directed' && to === projectId)
  .sort((left, right) => compareAscii(left.id, right.id));

export const getUndirectedNeighbors = (
  projectId: string,
  relations: readonly ProjectRelation[],
): readonly ProjectRelation[] => relations
  .filter(({ direction, from, to }) => direction === 'undirected' && (from === projectId || to === projectId))
  .sort((left, right) => compareAscii(left.id, right.id));

export const RELATION_LABELS = Object.freeze({
  related: 'Related',
  lineage: 'Lineage',
  dependency: 'Depends on',
  'shared-method': 'Shared method',
  family: 'Family',
  supersedes: 'Supersedes',
  supports: 'Supports',
});

export const getRelationLabel = (relation: ProjectRelation): string =>
  RELATION_LABELS[relation.type];

export const filterPublicRelations = (
  relations: readonly ProjectRelation[],
): readonly ProjectRelation[] => relations.filter(({ visibility }) => visibility === 'public');
