import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('declares exactly five production and five fixture collections with local loaders', async () => {
  const source = await readFile(
    new URL('../../src/content.config.ts', import.meta.url),
    'utf8',
  );

  for (const name of [
    'projects',
    'projectData',
    'projectRelations',
    'sitePages',
    'navigation',
    'fixtureProjects',
    'fixtureProjectData',
    'fixtureProjectRelations',
    'fixtureSitePages',
    'fixtureNavigation',
  ]) {
    assert.match(source, new RegExp(`\\b${name}\\b`));
  }

  assert.doesNotMatch(source, /liveLoader|fetch\(|https?:\/\//);
  assert.match(source, /from ['"]astro\/loaders['"]/);
  assert.match(source, /from ['"]astro:content['"]/);
});
