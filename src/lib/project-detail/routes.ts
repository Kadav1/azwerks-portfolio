import type { ProjectBundle } from '../../content-model/types.ts';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProjectDetailContractError extends Error {
  readonly code: 'PROJECT_DETAIL_BROKEN_HREF' | 'PROJECT_DETAIL_SLUG_DUPLICATE';

  constructor(code: ProjectDetailContractError['code'], message: string) {
    super(message);
    this.name = 'ProjectDetailContractError';
    this.code = code;
  }
}

export interface ProjectDetailRouteRecord {
  id: string;
  slug: string;
  href: string;
  title: string;
}

export const getProjectDetailHref = (slug: string): string => {
  if (!SLUG_PATTERN.test(slug)) {
    throw new ProjectDetailContractError(
      'PROJECT_DETAIL_BROKEN_HREF',
      `Project detail slugs must use lowercase ASCII kebab-case: ${slug || '(empty)'}`,
    );
  }
  return `/work/${slug}/`;
};

export const isProjectDetailRoutable = (bundle: ProjectBundle): boolean =>
  bundle.publication.eligible
  && !bundle.archiveState
  && bundle.project.data.synthetic === false
  && bundle.project.data.visibility === 'public'
  && bundle.project.data.lifecycle !== 'archived'
  && SLUG_PATTERN.test(bundle.project.data.slug);

export const getProjectDetailRouteRecords = (
  bundles: readonly ProjectBundle[],
): ProjectDetailRouteRecord[] => {
  const records: ProjectDetailRouteRecord[] = [];
  const slugs = new Map<string, string>();

  for (const bundle of bundles) {
    if (!isProjectDetailRoutable(bundle)) continue;
    const slug = bundle.project.data.slug;
    const previousId = slugs.get(slug);
    if (previousId !== undefined) {
      throw new ProjectDetailContractError(
        'PROJECT_DETAIL_SLUG_DUPLICATE',
        `Duplicate project detail slug "${slug}" from "${previousId}" and "${bundle.id}".`,
      );
    }
    slugs.set(slug, bundle.id);
    records.push(Object.freeze({
      id: bundle.id,
      slug,
      href: getProjectDetailHref(slug),
      title: bundle.project.data.title,
    }));
  }

  return records;
};
