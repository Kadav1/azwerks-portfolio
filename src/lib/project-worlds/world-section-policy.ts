import type { ProjectWorld, ProjectWorldSection, ProjectWorldSectionPolicy } from './world-types.ts';

export const REQUIRED_INVARIANT_SECTIONS = Object.freeze([
  'orientation',
  'header',
  'limitations',
  'provenance',
  'context-navigation',
] satisfies ProjectWorldSection[]);

const freezePolicy = (policy: ProjectWorldSectionPolicy): ProjectWorldSectionPolicy => Object.freeze({
  ...policy,
  order: Object.freeze([...policy.order]),
  required: REQUIRED_INVARIANT_SECTIONS,
});

export const PROJECT_WORLD_SECTION_POLICIES: Readonly<Record<ProjectWorld, ProjectWorldSectionPolicy>> = Object.freeze({
  software: freezePolicy({
    order: ['orientation', 'header', 'lead', 'narrative', 'evidence', 'limitations', 'process', 'releases', 'links', 'provenance', 'relations', 'context-navigation'],
    required: REQUIRED_INVARIANT_SECTIONS,
    narrativeMeasure: 'technical', metadataDensity: 'compact', evidenceDensity: 'inspectable',
    leadMediaPreference: 'interface-first', processTreatment: 'standard', releasesTreatment: 'emphasized',
    limitationsTreatment: 'emphasized', provenanceTreatment: 'standard', relationTreatment: 'standard',
  }),
  'visual-system': freezePolicy({
    order: ['orientation', 'header', 'lead', 'narrative', 'process', 'evidence', 'limitations', 'releases', 'links', 'provenance', 'relations', 'context-navigation'],
    required: REQUIRED_INVARIANT_SECTIONS,
    narrativeMeasure: 'editorial', metadataDensity: 'balanced', evidenceDensity: 'inspectable',
    leadMediaPreference: 'specimen-first', processTreatment: 'emphasized', releasesTreatment: 'standard',
    limitationsTreatment: 'emphasized', provenanceTreatment: 'standard', relationTreatment: 'standard',
  }),
  art: freezePolicy({
    order: ['orientation', 'header', 'lead', 'narrative', 'process', 'limitations', 'provenance', 'evidence', 'relations', 'links', 'releases', 'context-navigation'],
    required: REQUIRED_INVARIANT_SECTIONS,
    narrativeMeasure: 'reflection', metadataDensity: 'quiet', evidenceDensity: 'quiet',
    leadMediaPreference: 'artwork-fidelity', processTreatment: 'standard', releasesTreatment: 'quiet',
    limitationsTreatment: 'standard', provenanceTreatment: 'emphasized', relationTreatment: 'quiet',
  }),
  'technical-system': freezePolicy({
    order: ['orientation', 'header', 'lead', 'narrative', 'limitations', 'evidence', 'process', 'releases', 'provenance', 'links', 'relations', 'context-navigation'],
    required: REQUIRED_INVARIANT_SECTIONS,
    narrativeMeasure: 'technical', metadataDensity: 'compact', evidenceDensity: 'inspectable',
    leadMediaPreference: 'architecture-first', processTreatment: 'standard', releasesTreatment: 'emphasized',
    limitationsTreatment: 'emphasized', provenanceTreatment: 'standard', relationTreatment: 'standard',
  }),
  'limited-media': freezePolicy({
    order: ['orientation', 'header', 'lead', 'narrative', 'evidence', 'limitations', 'process', 'provenance', 'releases', 'links', 'relations', 'context-navigation'],
    required: REQUIRED_INVARIANT_SECTIONS,
    narrativeMeasure: 'reading', metadataDensity: 'balanced', evidenceDensity: 'balanced',
    leadMediaPreference: 'document-or-type-led', processTreatment: 'emphasized', releasesTreatment: 'quiet',
    limitationsTreatment: 'emphasized', provenanceTreatment: 'emphasized', relationTreatment: 'quiet',
  }),
});

export const getProjectWorldSectionPolicy = (world: ProjectWorld): ProjectWorldSectionPolicy =>
  PROJECT_WORLD_SECTION_POLICIES[world];
