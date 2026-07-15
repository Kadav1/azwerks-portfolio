import type { ProjectDetailHeading } from './types.ts';

export class ProjectDetailHeadingError extends Error {
  readonly code = 'PROJECT_DETAIL_HEADING_INVALID' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ProjectDetailHeadingError';
  }
}

export const validateProjectDetailHeadings = (
  headings: readonly ProjectDetailHeading[],
): ProjectDetailHeading[] => {
  const slugs = new Set<string>();
  let previousDepth = 1;
  return headings.map((heading, index) => {
    const text = heading.text.trim();
    const slug = heading.slug.trim();
    if (heading.depth < 2 || heading.depth > 6 || (index === 0 && heading.depth !== 2)) {
      throw new ProjectDetailHeadingError('Project narrative headings must begin at H2 and remain below the page H1.');
    }
    if (!text || !slug || heading.depth > previousDepth + 1) {
      throw new ProjectDetailHeadingError('Project narrative headings must be meaningful and cannot skip levels.');
    }
    if (slugs.has(slug)) {
      throw new ProjectDetailHeadingError(`Duplicate project narrative heading slug: ${slug}`);
    }
    slugs.add(slug);
    previousDepth = heading.depth;
    return Object.freeze({ depth: heading.depth, slug, text });
  });
};

export const getProjectDetailTableOfContents = (
  headings: readonly ProjectDetailHeading[],
): ProjectDetailHeading[] => {
  const validated = validateProjectDetailHeadings(headings);
  const contents = validated.filter(({ depth }) => depth === 2 || depth === 3);
  return contents.length >= 3 ? contents : [];
};
