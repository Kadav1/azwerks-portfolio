import type { ProjectBundle, ProjectRelation } from '../../src/content-model/types.ts';

const categoryRequirements = {
  software: { capabilities: ['Static inspection'], platforms: ['Web'] },
  'visual-system': { capabilities: ['Semantic tokens'] },
  art: { medium: 'Pigment on paper', year: 2025 },
  'technical-system': { platforms: ['Local'], version: '1.0.0' },
  'limited-media': {},
} as const;

export const createProjectDetailBundle = (
  id: string,
  category: keyof typeof categoryRequirements = 'software',
  overrides: Record<string, unknown> = {},
): ProjectBundle => {
  const projectOverrides = (overrides.project ?? {}) as Record<string, unknown>;
  const companionOverrides = (overrides.companion ?? {}) as Record<string, unknown>;
  const relationOverrides = (overrides.relations ?? {}) as {
    incoming?: ProjectRelation[];
    outgoing?: ProjectRelation[];
    undirected?: ProjectRelation[];
  };
  const project = {
    schemaVersion: '1.0',
    slug: id,
    title: `Synthetic ${category} ${id}`,
    shortTitle: `Synthetic ${id}`,
    subtitle: 'A private fixture adapted only inside isolated quality assurance.',
    summary: `A complete synthetic ${category} record used to test public-safe project detail projection without publication.`,
    category,
    lifecycle: 'approved',
    visibility: 'public',
    maintenance: category === 'art' ? 'not-applicable' : 'active',
    synthetic: false,
    startedAt: '2024-01-02',
    updatedAt: '2025-02-03',
    noindex: false,
    ...categoryRequirements[category],
    ...projectOverrides,
  } as ProjectBundle['project']['data'];
  const companion = {
    schemaVersion: '1.0',
    project: id,
    mediaAvailability: 'unavailable',
    sourceAvailability: 'private',
    rightsStatus: 'owned',
    artworkAvailability: 'not-applicable',
    layoutProfile: category === 'technical-system' ? 'technical' : category === 'art' ? 'media-led' : 'editorial',
    themeProfile: category === 'art' ? 'neutral' : 'system',
    motionProfile: 'none',
    links: [],
    media: [],
    evidence: [],
    process: [],
    limitations: [{ id: 'synthetic-limitation', summary: 'This fixture proves structure only and makes no claim about real work.', status: 'accepted' }],
    releases: [],
    provenance: {
      owner: 'Synthetic QA owner',
      authorship: 'Repository-authored synthetic fixture',
      sourceAvailability: 'private',
      rightsStatus: 'owned',
      reviewStatus: 'approved',
      reviewedAt: '2025-02-04',
      reviewedBy: 'Internal reviewer identity',
      sourceNote: 'Private source note',
      rightsNote: 'Private rights note',
      redactionNote: 'Private redaction note',
    },
    ...companionOverrides,
  } as ProjectBundle['companion']['data'];
  return {
    id,
    project: { id, data: project, body: '## Overview\n\nSynthetic narrative.', filePath: `/private/${id}.md` },
    companion: { id, data: companion, filePath: `/private/${id}.json` },
    incoming: relationOverrides.incoming ?? [],
    outgoing: relationOverrides.outgoing ?? [],
    undirected: relationOverrides.undirected ?? [],
    publication: (overrides.publication ?? { eligible: true, reasons: [] }) as ProjectBundle['publication'],
    displayPeriod: (overrides.displayPeriod ?? '2024–2025') as string,
    mediaState: companion.mediaAvailability,
    evidenceState: companion.evidence.length === 0 ? 'none' : 'reviewed',
    relationCount: (relationOverrides.incoming?.length ?? 0) + (relationOverrides.outgoing?.length ?? 0) + (relationOverrides.undirected?.length ?? 0),
    searchText: `${project.title} ${project.summary}`.toLowerCase(),
    archiveState: project.lifecycle === 'archived',
    featured: project.featured === true,
  };
};

export const createProjectDetailBundles = (count: number): ProjectBundle[] => {
  const categories = ['software', 'visual-system', 'art', 'technical-system', 'limited-media'] as const;
  return Array.from({ length: count }, (_, index) =>
    createProjectDetailBundle(`synthetic-detail-${String(index + 1).padStart(2, '0')}`, categories[index % categories.length]),
  );
};

export const createProjectDetailAuditBundles = (count = 10): ProjectBundle[] => {
  const bundles = createProjectDetailBundles(count);
  const mediaSource = '/project-detail-audit/synthetic-media.svg';
  const availableMedia = (items: ProjectBundle['companion']['data']['media']) => ({
    mediaAvailability: 'available' as const,
    media: items,
  });
  const auditBundles = bundles.map((bundle, index) => {
    const companion = structuredClone(bundle.companion.data);
    if (index === 0) Object.assign(companion, availableMedia([
      { id: 'interface', type: 'interface', source: mediaSource, purpose: 'interface', rights: 'owned', availability: 'available', alt: 'Synthetic interface regions for isolated quality assurance.', width: 1200, height: 800, caption: 'Synthetic interface fixture.' },
      { id: 'audio', type: 'audio', source: '/project-detail-audit/silence.wav', purpose: 'documentary', rights: 'owned', availability: 'available', alt: 'Synthetic silent audio fixture.', aspectRatio: '1:1', transcript: 'No speech. This silent fixture verifies the native audio and transcript contract.' },
    ]));
    if (index === 1) Object.assign(companion, availableMedia([
      { id: 'specimen', type: 'svg', source: mediaSource, purpose: 'informative', rights: 'owned', availability: 'available', alt: 'Synthetic visual-system specimen regions.', width: 1200, height: 800 },
    ]));
    if (index === 2) Object.assign(companion, {
      ...availableMedia([
        { id: 'portrait', type: 'image', source: mediaSource, purpose: 'artwork', rights: 'owned', availability: 'available', alt: 'Portrait synthetic artwork ratio.', width: 800, height: 1200 },
        { id: 'landscape', type: 'image', source: mediaSource, purpose: 'artwork', rights: 'owned', availability: 'available', alt: 'Landscape synthetic artwork ratio.', width: 1200, height: 800 },
        { id: 'square', type: 'image', source: mediaSource, purpose: 'artwork', rights: 'owned', availability: 'available', alt: 'Square synthetic artwork ratio.', width: 800, height: 800 },
      ]),
      artworkAvailability: 'available',
    });
    if (index === 3) Object.assign(companion, availableMedia([
      { id: 'diagram', type: 'diagram', source: mediaSource, purpose: 'diagram', rights: 'owned', availability: 'available', alt: 'Synthetic technical flow diagram.', width: 1200, height: 800, description: 'Input proceeds to inspection and then output.' },
      { id: 'video', type: 'video', source: '/project-detail-audit/silent-video.mp4', purpose: 'documentary', rights: 'owned', availability: 'available', alt: 'Synthetic silent video fixture.', width: 320, height: 180, poster: mediaSource, transcript: 'No speech. The static poster contains the complete synthetic state.' },
    ]));
    if (index === 4) {
      companion.mediaAvailability = 'not-applicable';
      companion.media = [];
    }
    if (index === 5) {
      companion.evidence = [
        { id: 'metric', type: 'metric', title: 'Synthetic timing', trust: 'verified', availability: 'public', method: 'Static fixture measurement', result: '12', unit: 'milliseconds', artifact: 'Synthetic timing report' },
        { id: 'private-proof', type: 'source', title: 'Private source inspection', trust: 'private', availability: 'private', summary: 'Private evidence exists without a public destination.' },
      ];
      companion.process = Array.from({ length: 8 }, (_, itemIndex) => ({ id: `process-${itemIndex + 1}`, title: `Synthetic decision ${itemIndex + 1}`, summary: 'An ordered synthetic decision used only for long-state quality assurance.', order: itemIndex + 1, evidenceIds: itemIndex === 0 ? ['metric', 'private-proof'] : [] }));
      companion.releases = Array.from({ length: 5 }, (_, itemIndex) => ({ id: `release-${itemIndex + 1}`, version: `0.${itemIndex + 1}.0`, date: `202${itemIndex}-01-01`, status: itemIndex === 4 ? 'released' : 'superseded', summary: 'A synthetic release used to verify deterministic newest-first rendering.', evidenceIds: itemIndex === 4 ? ['metric'] : [] }));
      companion.limitations = Array.from({ length: 5 }, (_, itemIndex) => ({ id: `limitation-${itemIndex + 1}`, summary: 'A visible synthetic limitation that qualifies only this private fixture.', status: itemIndex === 4 ? 'resolved' : 'accepted', evidenceIds: itemIndex === 0 ? ['metric', 'private-proof'] : [] }));
    }
    const projectData = {
      ...bundle.project.data,
      ...(index === 5 ? {
        title: 'Synthetic long-form project detail title that wraps without clipping across narrow screens and enlarged text',
        summary: 'A deliberately extended synthetic summary that exercises editorial measure, wrapping, semantic state, process, release, evidence, limitations, and navigation behavior without making any claim about real portfolio work.',
      } : {}),
    };
    return {
      ...bundle,
      project: { ...bundle.project, data: projectData },
      companion: { ...bundle.companion, data: companion },
      mediaState: companion.mediaAvailability,
      evidenceState: companion.evidence.some(({ trust }) => trust === 'verified') ? 'verified' : 'none',
    } as ProjectBundle;
  });
  const [first, second, third] = auditBundles;
  if (first && second && third) {
    const supports: ProjectRelation = { schemaVersion: '1.0', id: 'audit-supports', from: first.id, to: second.id, type: 'supports', direction: 'directed', summary: 'The first synthetic audit record supports the second.', visibility: 'public', synthetic: false };
    const shared: ProjectRelation = { schemaVersion: '1.0', id: 'audit-shared-method', from: first.id, to: third.id, type: 'shared-method', direction: 'undirected', summary: 'The synthetic audit records share an isolated validation method.', visibility: 'public', synthetic: false };
    auditBundles.splice(0, 3,
      { ...first, outgoing: [supports], undirected: [shared], relationCount: 2 },
      { ...second, incoming: [supports], relationCount: 1 },
      { ...third, undirected: [shared], relationCount: 1 },
    );
  }
  return auditBundles;
};
