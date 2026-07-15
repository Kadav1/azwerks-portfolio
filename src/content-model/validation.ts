import { contentError } from './error-codes.ts';
import { buildProjectBundle, sortProjectBundles } from './merge.ts';
import { validateRelationSet } from './relations.ts';
import { compareAscii } from './source.ts';
import type {
  NavigationItem,
  Project,
  ProjectBundle,
  ProjectData,
  ProjectRelation,
  SitePage,
  SourceEntry,
} from './types.ts';

export const validatePageNavigation = (
  pages: readonly SourceEntry<SitePage>[],
  navigation: readonly NavigationItem[],
): void => {
  const pageMap = new Map<string, SourceEntry<SitePage>>();
  for (const page of pages) {
    assertFilename(page);
    if (page.data.slug !== page.id) {
      contentError('CONTENT_FILENAME_MISMATCH', 'Page slug must match its filename.', page.id);
    }
    pageMap.set(page.id, page);
  }

  for (const item of navigation) {
    if (item.kind !== 'page') continue;
    const pageId = item.target.replace(/^\//, '').replace(/\/$/, '');
    const page = pageMap.get(pageId);
    if (!page) {
      contentError('CONTENT_NAVIGATION_INVALID', 'Page navigation target does not exist.', item.id);
    } else {
      if (item.visibility === 'public' && page.data.visibility !== 'public') {
        contentError('CONTENT_NAVIGATION_INVALID', 'Public navigation cannot expose a private page.', item.id);
      }
      if (page.data.navigation !== true) {
        contentError('CONTENT_NAVIGATION_INVALID', 'Navigation target has navigation disabled.', item.id);
      }
    }
  }
};

export const assertProductionHelperIsolation = (source: string): void => {
  if (/fixture(?:Projects|ProjectData|ProjectRelations|SitePages|Navigation|-contract)/i.test(source)) {
    contentError('CONTENT_FIXTURE_IMPORTED', 'Production helpers must not import or query fixture collections.');
  }
};

export interface ContentFoundationInput {
  projects: readonly SourceEntry<Project>[];
  companions: readonly SourceEntry<ProjectData>[];
  relations: readonly SourceEntry<ProjectRelation>[];
  fixture: boolean;
}

export interface ContentFoundationResult {
  projects: readonly SourceEntry<Project>[];
  companions: readonly SourceEntry<ProjectData>[];
  relations: readonly SourceEntry<ProjectRelation>[];
  bundles: readonly ProjectBundle[];
  publicationEligible: readonly ProjectBundle[];
}

const assertFilename = (entry: SourceEntry<unknown>): void => {
  const name = entry.filePath.replaceAll('\\', '/').split('/').at(-1)?.replace(/\.(?:md|json)$/, '');
  if (name !== entry.id) {
    contentError('CONTENT_FILENAME_MISMATCH', `Filename must match declared id "${entry.id}".`, entry.filePath);
  }
};

const assertCategoryContract = (project: SourceEntry<Project>, companion: SourceEntry<ProjectData>): void => {
  const data = companion.data;
  const inspectable = data.evidence.length > 0 || data.limitations.length > 0 || data.sourceAvailability !== 'not-applicable';

  if (['software', 'technical-system'].includes(project.data.category) && !inspectable) {
    contentError('CONTENT_CATEGORY_REQUIREMENT', 'Software and technical systems require evidence, limitation, or source state.', project.id);
  }
  if (project.data.category === 'visual-system' && data.evidence.length === 0 && data.limitations.length === 0) {
    contentError('CONTENT_CATEGORY_REQUIREMENT', 'Visual systems require evidence or an explicit incomplete-state limitation.', project.id);
  }
  if (project.data.category === 'art' && (data.artworkAvailability === 'not-applicable' || data.rightsStatus === 'unknown')) {
    contentError('CONTENT_CATEGORY_REQUIREMENT', 'Art requires explicit artwork availability and rights.', project.id);
  }
  if (project.data.category === 'limited-media' && data.evidence.length === 0 && data.limitations.length === 0) {
    contentError('CONTENT_CATEGORY_REQUIREMENT', 'Limited-media records require evidence or limitation.', project.id);
  }
};

export const validateContentFoundation = (input: ContentFoundationInput): ContentFoundationResult => {
  const projectMap = new Map<string, SourceEntry<Project>>();
  for (const project of input.projects) {
    assertFilename(project);
    if (projectMap.has(project.id)) contentError('CONTENT_SLUG_INVALID', `Duplicate project id "${project.id}".`, project.id);
    if (project.data.slug !== project.id) contentError('CONTENT_FILENAME_MISMATCH', 'Project slug must match its filename.', project.id);
    if (input.fixture && (!project.data.synthetic || project.data.visibility !== 'private' || project.data.noindex !== true)) {
      contentError('CONTENT_FIXTURE_PUBLIC', 'Fixture project violates fixture publication policy.', project.id);
    }
    projectMap.set(project.id, project);
  }

  const companionMap = new Map<string, SourceEntry<ProjectData>>();
  for (const companion of input.companions) {
    assertFilename(companion);
    const projectId = companion.data.project;
    if (!projectMap.has(projectId)) contentError('CONTENT_COMPANION_ORPHAN', 'Companion has no project.', companion.id);
    if (companionMap.has(projectId)) contentError('CONTENT_COMPANION_DUPLICATE', 'Project has more than one companion.', projectId);
    companionMap.set(projectId, companion);
  }

  for (const project of input.projects) {
    const companion = companionMap.get(project.id);
    if (!companion) {
      contentError('CONTENT_COMPANION_MISSING', 'Project companion is required.', project.id);
    } else {
      assertCategoryContract(project, companion);
    }
  }

  const relationData = input.relations.map(({ data }) => data);
  validateRelationSet(
    relationData,
    new Map([...projectMap].map(([id, project]) => [id, { visibility: project.data.visibility }])),
  );

  const bundles = sortProjectBundles(input.projects.map((project) =>
    buildProjectBundle(project, companionMap.get(project.id)!, relationData)));
  const publicationEligible = bundles.filter(({ publication }) => publication.eligible);
  if (input.fixture && publicationEligible.length > 0) {
    contentError('CONTENT_FIXTURE_PUBLIC', 'Fixture publication eligibility must remain zero.');
  }

  return {
    projects: [...input.projects].sort((left, right) => compareAscii(left.id, right.id)),
    companions: [...input.companions].sort((left, right) => compareAscii(left.id, right.id)),
    relations: [...input.relations].sort((left, right) => compareAscii(left.id, right.id)),
    bundles,
    publicationEligible,
  };
};
