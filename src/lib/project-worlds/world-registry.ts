import type { ProjectCategory } from '../../content-model/enums.ts';
import type { ProjectWorld, ProjectWorldDefinition } from './world-types.ts';

const defineWorld = (definition: ProjectWorldDefinition): ProjectWorldDefinition => Object.freeze({
  ...definition,
  sectionEmphasis: Object.freeze([...definition.sectionEmphasis]),
});

export const PROJECT_WORLD_REGISTRY: Readonly<Record<ProjectWorld, ProjectWorldDefinition>> = Object.freeze({
  software: defineWorld({
    id: 'software', label: 'Software', shellProfile: 'technical', worldProfile: 'software', layoutProfile: 'technical',
    themeProfile: 'system', motionProfile: 'none', leadStrategy: 'interface or type-led product stage',
    narrativeStrategy: 'purpose, workflow, capability, maintenance, and release',
    sectionEmphasis: ['lead', 'narrative', 'evidence', 'limitations', 'releases'], authoredMarkLevel: 0,
  }),
  'visual-system': defineWorld({
    id: 'visual-system', label: 'Visual system', shellProfile: 'standard', worldProfile: 'visual-system', layoutProfile: 'specimen-led',
    themeProfile: 'system', motionProfile: 'none', leadStrategy: 'selected explanatory specimen or type-led stage',
    narrativeStrategy: 'premise, rules, states, accessibility, and implementation',
    sectionEmphasis: ['lead', 'process', 'evidence', 'limitations', 'releases'], authoredMarkLevel: 0,
  }),
  art: defineWorld({
    id: 'art', label: 'Art', shellProfile: 'quiet', worldProfile: 'art', layoutProfile: 'media-led',
    themeProfile: 'neutral', motionProfile: 'none', leadStrategy: 'uncropped neutral artwork stage or dignified absence',
    narrativeStrategy: 'encounter, reflection, process, rights, and provenance',
    sectionEmphasis: ['lead', 'narrative', 'process', 'provenance'], authoredMarkLevel: 0,
  }),
  'technical-system': defineWorld({
    id: 'technical-system', label: 'Technical system', shellProfile: 'technical', worldProfile: 'technical-system', layoutProfile: 'technical',
    themeProfile: 'system', motionProfile: 'none', leadStrategy: 'architecture diagram or type-led system stage',
    narrativeStrategy: 'purpose, architecture, compatibility, implementation, and limits',
    sectionEmphasis: ['lead', 'narrative', 'evidence', 'limitations', 'releases'], authoredMarkLevel: 0,
  }),
  'limited-media': defineWorld({
    id: 'limited-media', label: 'Limited media', shellProfile: 'quiet', worldProfile: 'limited-media', layoutProfile: 'document-led',
    themeProfile: 'system', motionProfile: 'none', leadStrategy: 'document or type-led record without invented imagery',
    narrativeStrategy: 'summary, chronology, evidence, limitations, and provenance',
    sectionEmphasis: ['narrative', 'evidence', 'limitations', 'process', 'provenance'], authoredMarkLevel: 0,
  }),
});

export const getProjectWorldDefinition = (category: ProjectCategory): ProjectWorldDefinition => {
  const definition = (PROJECT_WORLD_REGISTRY as Partial<Record<string, ProjectWorldDefinition>>)[category];
  if (definition === undefined) throw new Error(`PROJECT_WORLD_CATEGORY_UNKNOWN ${String(category)}`);
  return definition;
};
