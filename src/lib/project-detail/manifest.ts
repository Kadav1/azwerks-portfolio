import { createHash } from 'node:crypto';

import type { ProjectBundle } from '../../content-model/types.ts';
import { getProjectDetailRouteRecords } from './routes.ts';

export const PROJECT_DETAIL_ROUTE_HELPER_VERSION = '1.0.0';
export const PROJECT_DETAIL_MODEL_VERSION = '1.0.0';

export interface ProjectDetailManifest {
  modelVersion: string;
  routeHelperVersion: string;
  routeCount: number;
  sourceBundleCount: number;
  publicRoutes: readonly { id: string; slug: string; href: string }[];
  excludedByReason: Readonly<Record<'archived' | 'synthetic' | 'private' | 'unlisted' | 'ineligible', number>>;
  generatedHash: string;
}

const exclusionReason = (
  bundle: ProjectBundle,
): keyof ProjectDetailManifest['excludedByReason'] => {
  if (bundle.archiveState || bundle.project.data.lifecycle === 'archived') return 'archived';
  if (bundle.project.data.synthetic) return 'synthetic';
  if (bundle.project.data.visibility === 'private') return 'private';
  if (bundle.project.data.visibility === 'unlisted') return 'unlisted';
  return 'ineligible';
};

const stableJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const createProjectDetailManifest = (
  bundles: readonly ProjectBundle[],
): ProjectDetailManifest => {
  const records = getProjectDetailRouteRecords(bundles);
  const routeIds = new Set(records.map(({ id }) => id));
  const excludedByReason = {
    archived: 0,
    synthetic: 0,
    private: 0,
    unlisted: 0,
    ineligible: 0,
  };
  for (const bundle of bundles) {
    if (!routeIds.has(bundle.id)) excludedByReason[exclusionReason(bundle)] += 1;
  }
  const payload = {
    modelVersion: PROJECT_DETAIL_MODEL_VERSION,
    routeHelperVersion: PROJECT_DETAIL_ROUTE_HELPER_VERSION,
    routeCount: records.length,
    sourceBundleCount: bundles.length,
    publicRoutes: records
      .map(({ id, slug, href }) => ({ id, slug, href }))
      .sort((left, right) => left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
    excludedByReason,
  };
  return Object.freeze({
    ...payload,
    generatedHash: createHash('sha256').update(stableJson(payload)).digest('hex'),
  });
};

export const serializeProjectDetailManifest = (manifest: ProjectDetailManifest): string =>
  stableJson(manifest);
