import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import {
  fixtureNavigationFileSchema,
  fixtureProjectSchema,
  fixtureSitePageSchema,
  projectDataRawSchema,
  relationRawSchema,
} from './schemas.ts';
import { assertSafeString, compareAscii, readMarkdownEntry } from './source.ts';
import { validateContentFoundation, validatePageNavigation } from './validation.ts';
import type {
  NavigationItem,
  Project,
  ProjectData,
  ProjectRelation,
  SitePage,
  SourceEntry,
} from './types.ts';

const FIXTURE_ROOT = fileURLToPath(new URL('../content/fixtures/', import.meta.url));

const entryFiles = async (directory: string, extension: '.md' | '.json'): Promise<string[]> =>
  (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map(({ name }) => join(directory, name))
    .sort(compareAscii);

const idFromPath = (filePath: string): string =>
  filePath.replaceAll('\\', '/').split('/').at(-1)!.replace(/\.(?:md|json)$/, '');

const scanJsonStrings = (value: unknown, context: string): void => {
  if (typeof value === 'string') {
    assertSafeString(value, context);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => scanJsonStrings(item, `${context}[${index}]`));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => scanJsonStrings(item, `${context}.${key}`));
  }
};

const loadMarkdownEntries = async <T>(
  directory: string,
  schema: { parse(value: unknown): T },
): Promise<SourceEntry<T>[]> => Promise.all(
  (await entryFiles(directory, '.md')).map(async (filePath) => {
    const parsed = await readMarkdownEntry(filePath);
    return {
      id: idFromPath(filePath),
      data: schema.parse(parsed.data),
      body: parsed.body,
      filePath,
    };
  }),
);

const loadJsonEntries = async <T>(
  directory: string,
  schema: { parse(value: unknown): T },
): Promise<SourceEntry<T>[]> => Promise.all(
  (await entryFiles(directory, '.json')).map(async (filePath) => {
    const value: unknown = JSON.parse(await readFile(filePath, 'utf8'));
    scanJsonStrings(value, filePath);
    return {
      id: idFromPath(filePath),
      data: schema.parse(value),
      filePath,
    };
  }),
);

export interface FixtureFoundation {
  projects: readonly SourceEntry<Project>[];
  companions: readonly SourceEntry<ProjectData>[];
  relations: readonly SourceEntry<ProjectRelation>[];
  bundles: ReturnType<typeof validateContentFoundation>['bundles'];
  publicationEligible: ReturnType<typeof validateContentFoundation>['publicationEligible'];
  pages: readonly SourceEntry<SitePage>[];
  navigation: readonly NavigationItem[];
}

export const loadFixtureFoundation = async (): Promise<FixtureFoundation> => {
  const [projects, companions, relations, pages, navigationValue] = await Promise.all([
    loadMarkdownEntries<Project>(join(FIXTURE_ROOT, 'projects'), fixtureProjectSchema),
    loadJsonEntries<ProjectData>(join(FIXTURE_ROOT, 'project-data'), projectDataRawSchema),
    loadJsonEntries<ProjectRelation>(join(FIXTURE_ROOT, 'project-relations'), relationRawSchema),
    loadMarkdownEntries<SitePage>(join(FIXTURE_ROOT, 'pages'), fixtureSitePageSchema),
    readFile(join(FIXTURE_ROOT, 'navigation.json'), 'utf8').then((source) => {
      const value: unknown = JSON.parse(source);
      scanJsonStrings(value, 'fixture navigation');
      return fixtureNavigationFileSchema.parse(value);
    }),
  ]);

  const result = validateContentFoundation({
    projects,
    companions,
    relations,
    fixture: true,
  });
  validatePageNavigation(pages, navigationValue);

  return {
    ...result,
    pages: [...pages].sort((left, right) => compareAscii(left.id, right.id)),
    navigation: [...navigationValue].sort((left, right) => left.order - right.order || compareAscii(left.id, right.id)),
  };
};

export const getFixtureProjectBundles = async () =>
  (await loadFixtureFoundation()).bundles;
