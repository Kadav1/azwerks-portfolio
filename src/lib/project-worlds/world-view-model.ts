import type { ProjectDetailViewModel } from '../project-detail/types.ts';
import { getProjectWorldDefinition } from './world-registry.ts';
import { getProjectWorldSectionPolicy } from './world-section-policy.ts';
import type { ProjectWorldViewModel } from './world-types.ts';

export const createProjectWorldViewModel = (
  project: ProjectDetailViewModel,
  hasNarrative: boolean,
): ProjectWorldViewModel => {
  const definition = getProjectWorldDefinition(project.category);
  const hasLeadMedia = project.leadMedia !== undefined;
  const hasEvidence = project.publicEvidence.length > 0;
  const hasProcess = project.process.length > 0;
  const hasReleases = project.releases.length > 0;
  const hasLinks = project.publicLinks.length > 0;
  const hasRelations = project.relations.length > 0;
  return Object.freeze({
    world: definition.id,
    worldLabel: definition.label,
    shellProfile: definition.shellProfile,
    worldProfile: definition.worldProfile,
    layoutProfile: definition.layoutProfile,
    themeProfile: definition.themeProfile,
    motionProfile: definition.motionProfile,
    leadStrategy: definition.leadStrategy,
    narrativeStrategy: definition.narrativeStrategy,
    sectionPolicy: getProjectWorldSectionPolicy(definition.id),
    authoredMarkLevel: definition.authoredMarkLevel,
    hasLeadMedia,
    hasNarrative,
    hasEvidence,
    hasLimitations: project.limitations.length > 0,
    hasProcess,
    hasReleases,
    hasLinks,
    hasRelations,
    isSparse: !hasLeadMedia && !hasNarrative && !hasEvidence && !hasProcess && !hasReleases && !hasLinks && !hasRelations,
  });
};
