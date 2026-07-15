import { createHash } from 'node:crypto';

import { PROJECT_CATEGORIES } from '../../content-model/enums.ts';
import { getAuthoredMarkPolicy } from './authored-mark-policy.ts';
import { getProjectWorldDefinition } from './world-registry.ts';
import { getProjectWorldSectionPolicy } from './world-section-policy.ts';

const hash = (value: unknown): string => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export const PROJECT_WORLD_FIXTURE_COVERAGE = Object.freeze([
  'rich-software', 'sparse-software', 'visual-system', 'art-with-image', 'art-without-image',
  'technical-system', 'limited-media', 'archived-exclusion', 'long-content', 'minimum-valid',
]);

export const createProjectWorldManifest = () => {
  const mappings = PROJECT_CATEGORIES.map((category) => {
    const definition = getProjectWorldDefinition(category);
    const policy = getProjectWorldSectionPolicy(category);
    return Object.freeze({
      category,
      world: definition.id,
      shellProfile: definition.shellProfile,
      worldProfile: definition.worldProfile,
      layoutProfile: definition.layoutProfile,
      themeProfile: definition.themeProfile,
      motionProfile: definition.motionProfile,
      authoredMarkLevel: getAuthoredMarkPolicy(category).level,
      sectionPolicyHash: hash(policy),
    });
  });
  const body = {
    modelVersion: '1.0.0',
    validatorVersion: '1.0.0',
    worldCount: mappings.length,
    mappings,
    tokenDependencies: Object.freeze([
      '--azw-world-canvas', '--azw-world-surface-emphasis', '--azw-world-media-surround',
      '--azw-world-density', '--azw-world-measure', '--azw-world-type-emphasis',
    ]),
    fixtureCoverage: PROJECT_WORLD_FIXTURE_COVERAGE,
  };
  return Object.freeze({ ...body, generatedHash: hash(body) });
};
