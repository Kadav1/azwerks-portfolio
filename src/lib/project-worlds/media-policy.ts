import type { ProjectWorld } from './world-types.ts';

export interface ProjectWorldMediaPolicy {
  preserveRights: true;
  preserveAvailability: true;
  preserveAlternatives: true;
  crop: 'never';
  surround: 'world' | 'neutral-art' | 'document';
  prominence: 'wide' | 'specimen' | 'artwork' | 'architecture' | 'restrained';
}

const policies: Readonly<Record<ProjectWorld, ProjectWorldMediaPolicy>> = Object.freeze({
  software: Object.freeze({ preserveRights: true, preserveAvailability: true, preserveAlternatives: true, crop: 'never', surround: 'world', prominence: 'wide' }),
  'visual-system': Object.freeze({ preserveRights: true, preserveAvailability: true, preserveAlternatives: true, crop: 'never', surround: 'world', prominence: 'specimen' }),
  art: Object.freeze({ preserveRights: true, preserveAvailability: true, preserveAlternatives: true, crop: 'never', surround: 'neutral-art', prominence: 'artwork' }),
  'technical-system': Object.freeze({ preserveRights: true, preserveAvailability: true, preserveAlternatives: true, crop: 'never', surround: 'world', prominence: 'architecture' }),
  'limited-media': Object.freeze({ preserveRights: true, preserveAvailability: true, preserveAlternatives: true, crop: 'never', surround: 'document', prominence: 'restrained' }),
});

export const getProjectWorldMediaPolicy = (world: ProjectWorld): ProjectWorldMediaPolicy => policies[world];
