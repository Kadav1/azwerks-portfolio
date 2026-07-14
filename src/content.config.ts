import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';

import {
  createProjectDataSchema,
  createRelationSchema,
  fixtureNavigationFileSchema,
  fixtureProjectSchema,
  fixtureSitePageSchema,
  navigationFileSchema,
  projectSchema,
  sitePageSchema,
} from './content-model/schemas.ts';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

const projectData = defineCollection({
  loader: glob({ base: './src/content/project-data', pattern: '**/*.json' }),
  schema: createProjectDataSchema(reference('projects')),
});

const projectRelations = defineCollection({
  loader: glob({ base: './src/content/project-relations', pattern: '**/*.json' }),
  schema: createRelationSchema(reference('projects')),
});

const sitePages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: sitePageSchema,
});

const navigation = defineCollection({
  loader: file('./src/content/navigation.json'),
  schema: navigationFileSchema.element,
});

const fixtureProjects = defineCollection({
  loader: glob({ base: './src/content/fixtures/projects', pattern: '**/*.md' }),
  schema: fixtureProjectSchema,
});

const fixtureProjectData = defineCollection({
  loader: glob({ base: './src/content/fixtures/project-data', pattern: '**/*.json' }),
  schema: createProjectDataSchema(reference('fixtureProjects')),
});

const fixtureProjectRelations = defineCollection({
  loader: glob({ base: './src/content/fixtures/project-relations', pattern: '**/*.json' }),
  schema: createRelationSchema(reference('fixtureProjects')),
});

const fixtureSitePages = defineCollection({
  loader: glob({ base: './src/content/fixtures/pages', pattern: '**/*.md' }),
  schema: fixtureSitePageSchema,
});

const fixtureNavigation = defineCollection({
  loader: file('./src/content/fixtures/navigation.json'),
  schema: fixtureNavigationFileSchema.element,
});

export const collections = {
  projects,
  projectData,
  projectRelations,
  sitePages,
  navigation,
  fixtureProjects,
  fixtureProjectData,
  fixtureProjectRelations,
  fixtureSitePages,
  fixtureNavigation,
};
