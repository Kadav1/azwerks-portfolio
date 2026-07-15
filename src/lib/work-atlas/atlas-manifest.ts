import { createHash } from 'node:crypto';

import { PROJECT_CATEGORIES, RELATION_TYPES } from '../../content-model/enums.ts';
import { createAtlasLayout } from './atlas-layout.ts';
import { ATLAS_RELATION_LANGUAGE } from './atlas-relations.ts';
import type { AtlasViewModel } from './atlas-types.ts';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const createWorkAtlasManifest = (viewModel: AtlasViewModel) => {
  const layout = createAtlasLayout(viewModel.records, viewModel.relations);
  const categoryCounts = Object.fromEntries(PROJECT_CATEGORIES.map((category) => [
    category,
    viewModel.records.filter((record) => record.category === category).length,
  ]));
  const relationTypeCounts = Object.fromEntries(RELATION_TYPES.map((type) => [
    type,
    viewModel.relations.filter((relation) => relation.type === type).length,
  ]));
  const publicDataHash = sha256(JSON.stringify({ records: viewModel.records, relations: viewModel.relations }));
  const layoutPolicyHash = sha256(JSON.stringify({
    algorithmVersion: layout.algorithmVersion,
    plane: { width: layout.width, nodeWidth: layout.nodeWidth, nodeHeight: layout.nodeHeight },
    regions: layout.regions.map(({ id, x, width, rankMeaning }) => ({ id, x, width, rankMeaning })),
    relationLanguage: ATLAS_RELATION_LANGUAGE,
  }));
  const base = {
    schemaVersion: '1.0.0',
    publicNodeCount: viewModel.records.length,
    publicRelationCount: viewModel.relations.length,
    excludedByReason: { ...viewModel.excluded },
    categoryCounts,
    relationTypeCounts,
    plane: {
      width: layout.width,
      height: layout.height,
      nodeWidth: layout.nodeWidth,
      nodeHeight: layout.nodeHeight,
    },
    regions: layout.regions.map((region) => ({ ...region })),
    nodes: layout.nodes.map((node) => ({ ...node })),
    edges: layout.edges.map((edge) => ({ ...edge })),
    edgePolicy: layout.edgePolicy,
    layoutAlgorithmVersion: layout.algorithmVersion,
    layoutPolicyHash,
    publicDataHash,
  };
  return Object.freeze({
    ...base,
    generatedManifestHash: sha256(JSON.stringify(base)),
  });
};

export const serializeWorkAtlasManifest = (
  manifest: ReturnType<typeof createWorkAtlasManifest>,
): string => `${JSON.stringify(manifest, null, 2)}\n`;
