import { RELATION_TYPES } from '../../content-model/enums.ts';
import {
  ATLAS_PLANE_PADDING,
  ATLAS_REGIONS,
  ATLAS_REGION_GAP,
} from './atlas-regions.ts';
import { ATLAS_RELATION_LANGUAGE } from './atlas-relations.ts';
import {
  ATLAS_NODE_HEIGHT,
  ATLAS_NODE_WIDTH,
  type AtlasLayout,
  type AtlasLayoutEdge,
  type AtlasLayoutNode,
  type AtlasRecord,
  type AtlasRelation,
} from './atlas-types.ts';

export const ATLAS_LAYOUT_ALGORITHM_VERSION = 'equal-regions-grid-1.0.0';

const REGION_HEADER_HEIGHT = 76;
const REGION_INSET = 36;
const NODE_COLUMN_GAP = 24;
const NODE_ROW_GAP = 24;
const REGION_MIN_HEIGHT = 252;
const REGION_COLUMNS = 2;
const DENSE_NODE_THRESHOLD = 50;
const DENSE_EDGE_THRESHOLD = 40;

const compareRecords = (left: AtlasRecord, right: AtlasRecord): number =>
  left.defaultIndex - right.defaultIndex
  || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);

const ensureUnique = (values: readonly { id: string }[], code: string): void => {
  const ids = new Set<string>();
  for (const { id } of values) {
    if (ids.has(id)) throw new Error(`${code} ${id}`);
    ids.add(id);
  }
};

interface Point { x: number; y: number }

const center = (node: AtlasLayoutNode): Point => ({
  x: node.x + ATLAS_NODE_WIDTH / 2,
  y: node.y + ATLAS_NODE_HEIGHT / 2,
});

const boundaryPoint = (from: Point, to: Point): Point => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return from;
  const horizontal = dx === 0 ? Number.POSITIVE_INFINITY : (ATLAS_NODE_WIDTH / 2) / Math.abs(dx);
  const vertical = dy === 0 ? Number.POSITIVE_INFINITY : (ATLAS_NODE_HEIGHT / 2) / Math.abs(dy);
  const scale = Math.min(horizontal, vertical);
  return { x: from.x + dx * scale, y: from.y + dy * scale };
};

const clean = (value: number): string => String(Number(value.toFixed(3)));

const edgePath = (
  relation: AtlasRelation,
  source: AtlasLayoutNode,
  target: AtlasLayoutNode,
): string => {
  const sourceCenter = center(source);
  const targetCenter = center(target);
  const start = boundaryPoint(sourceCenter, targetCenter);
  const end = boundaryPoint(targetCenter, sourceCenter);
  const typeOffset = (RELATION_TYPES.indexOf(relation.type) - 3) * 8;
  if (Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)) {
    const controlX = (start.x + end.x) / 2 + typeOffset;
    return `M ${clean(start.x)} ${clean(start.y)} C ${clean(controlX)} ${clean(start.y)} ${clean(controlX)} ${clean(end.y)} ${clean(end.x)} ${clean(end.y)}`;
  }
  const controlY = (start.y + end.y) / 2 + typeOffset;
  return `M ${clean(start.x)} ${clean(start.y)} C ${clean(start.x)} ${clean(controlY)} ${clean(end.x)} ${clean(controlY)} ${clean(end.x)} ${clean(end.y)}`;
};

export const createAtlasLayout = (
  records: readonly AtlasRecord[],
  relations: readonly AtlasRelation[],
): AtlasLayout => {
  ensureUnique(records, 'WORK_ATLAS_NODE_DUPLICATE');
  ensureUnique(relations, 'WORK_ATLAS_EDGE_DUPLICATE');

  const byRegion = new Map(ATLAS_REGIONS.map(({ id }) => [id, records.filter((record) => record.category === id).sort(compareRecords)]));
  const maximumRows = Math.max(1, ...[...byRegion.values()].map((items) => Math.ceil(items.length / REGION_COLUMNS)));
  const contentHeight = REGION_HEADER_HEIGHT
    + REGION_INSET
    + maximumRows * ATLAS_NODE_HEIGHT
    + Math.max(0, maximumRows - 1) * NODE_ROW_GAP
    + REGION_INSET;
  const regionHeight = Math.max(REGION_MIN_HEIGHT, contentHeight);
  const regions = ATLAS_REGIONS.map((region) => Object.freeze({ ...region, height: regionHeight }));
  const width = ATLAS_PLANE_PADDING * 2
    + ATLAS_REGIONS.reduce((total, region) => total + region.width, 0)
    + ATLAS_REGION_GAP * (ATLAS_REGIONS.length - 1);
  const height = regionHeight + ATLAS_PLANE_PADDING * 2;

  const nodes: AtlasLayoutNode[] = [];
  const occupied = new Set<string>();
  for (const region of regions) {
    const regionRecords = byRegion.get(region.id) ?? [];
    for (let recordIndex = 0; recordIndex < regionRecords.length; recordIndex += 1) {
      const record = regionRecords[recordIndex]!;
      let cell = recordIndex;
      let attempts = 0;
      while (occupied.has(`${region.id}:${cell}`) && attempts < regionRecords.length + 1) {
        cell += 1;
        attempts += 1;
      }
      if (occupied.has(`${region.id}:${cell}`)) throw new Error(`WORK_ATLAS_COLLISION_UNRESOLVED ${record.id}`);
      occupied.add(`${region.id}:${cell}`);
      const column = cell % REGION_COLUMNS;
      const row = Math.floor(cell / REGION_COLUMNS);
      nodes.push(Object.freeze({
        id: record.id,
        x: region.x + REGION_INSET + column * (ATLAS_NODE_WIDTH + NODE_COLUMN_GAP),
        y: region.y + REGION_HEADER_HEIGHT + REGION_INSET + row * (ATLAS_NODE_HEIGHT + NODE_ROW_GAP),
        regionId: region.id,
        order: record.defaultIndex,
      }));
    }
  }
  nodes.sort((left, right) => left.order - right.order || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges: AtlasLayoutEdge[] = relations
    .slice()
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    .map((relation) => {
      const source = nodeMap.get(relation.sourceId);
      const target = nodeMap.get(relation.targetId);
      if (source === undefined || target === undefined || source.id === target.id) {
        throw new Error(`WORK_ATLAS_RELATION_ENDPOINT ${relation.id}`);
      }
      const language = ATLAS_RELATION_LANGUAGE[relation.type];
      return Object.freeze({
        id: relation.id,
        sourceId: relation.sourceId,
        targetId: relation.targetId,
        type: relation.type,
        path: edgePath(relation, source, target),
        directional: language.directional,
      });
    });

  return Object.freeze({
    algorithmVersion: ATLAS_LAYOUT_ALGORITHM_VERSION,
    width,
    height,
    nodeWidth: ATLAS_NODE_WIDTH,
    nodeHeight: ATLAS_NODE_HEIGHT,
    regions: Object.freeze(regions),
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    edgePolicy: records.length >= DENSE_NODE_THRESHOLD || relations.length > DENSE_EDGE_THRESHOLD ? 'focused' : 'all',
  });
};
