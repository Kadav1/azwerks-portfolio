import type { Project, ProjectData, ProjectRelation, PublicationEvaluation } from './types.ts';

interface PublicationInput {
  project: Partial<Project>;
  companion?: Partial<ProjectData>;
  relations?: readonly ProjectRelation[];
  relationSafe?: boolean;
  validationBlocks?: readonly string[];
}

const PUBLISHABLE_RIGHTS = new Set(['owned', 'licensed', 'permission-granted', 'public-domain']);

export const evaluatePublicationEligibility = ({
  project,
  companion,
  relationSafe = true,
  validationBlocks = [],
}: PublicationInput): PublicationEvaluation => {
  const reasons: string[] = [];

  if (project.synthetic !== false) reasons.push('synthetic');
  if (project.visibility !== 'public') reasons.push('visibility');
  if (!['approved', 'published'].includes(project.lifecycle ?? '')) reasons.push('lifecycle');
  if (!companion) reasons.push('companion');

  if (companion) {
    if (!companion.provenance || !['reviewed', 'approved'].includes(companion.provenance.reviewStatus ?? '')) {
      reasons.push('provenance');
    }
    if (!PUBLISHABLE_RIGHTS.has(companion.rightsStatus ?? '')) reasons.push('rights');
    if ((companion.limitations?.length ?? 0) === 0) reasons.push('limitations');
    if (companion.media?.some((media) =>
      media.availability === 'available' &&
      (!PUBLISHABLE_RIGHTS.has(media.rights) || (media.purpose !== 'decorative' && !media.alt)))) {
      reasons.push('media');
    }
    if (companion.links?.some((link) => !link.public)) reasons.push('links');
  }

  if (!relationSafe) reasons.push('relations');
  reasons.push(...validationBlocks);

  return Object.freeze({
    eligible: reasons.length === 0,
    reasons: Object.freeze([...new Set(reasons)].sort()),
  });
};
