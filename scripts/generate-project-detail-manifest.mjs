import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createProjectDetailManifest, serializeProjectDetailManifest } from '../src/lib/project-detail/manifest.ts';
import { projectDataRawSchema, projectSchema, relationRawSchema } from '../src/content-model/schemas.ts';
import { assertSafeString, compareAscii, readMarkdownEntry } from '../src/content-model/source.ts';
import { validateContentFoundation } from '../src/content-model/validation.ts';

export const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(repositoryRoot, 'src/lib/project-detail/generated/project-detail-route-manifest.json');
const contentRoot = join(repositoryRoot, 'src/content');

const files = async (directory, extension) => (await readdir(directory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && extname(entry.name) === extension)
  .map((entry) => join(directory, entry.name))
  .sort(compareAscii);

const idFromPath = (path) => path.replaceAll('\\', '/').split('/').at(-1).replace(/\.(?:md|json)$/, '');

const scanStrings = (value, context) => {
  if (typeof value === 'string') assertSafeString(value, context);
  else if (Array.isArray(value)) value.forEach((item, index) => scanStrings(item, `${context}[${index}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => scanStrings(item, `${context}.${key}`));
};

const loadMarkdownProjects = async () => Promise.all((await files(join(contentRoot, 'projects'), '.md')).map(async (filePath) => {
  const parsed = await readMarkdownEntry(filePath);
  return { id: idFromPath(filePath), data: projectSchema.parse(parsed.data), body: parsed.body, filePath };
}));

const loadJsonEntries = async (directory, schema) => Promise.all((await files(join(contentRoot, directory), '.json')).map(async (filePath) => {
  const value = JSON.parse(await readFile(filePath, 'utf8'));
  scanStrings(value, filePath);
  return { id: idFromPath(filePath), data: schema.parse(value), filePath };
}));

export const loadProductionProjectBundles = async () => {
  const [projects, companions, relations] = await Promise.all([
    loadMarkdownProjects(),
    loadJsonEntries('project-data', projectDataRawSchema),
    loadJsonEntries('project-relations', relationRawSchema),
  ]);
  return validateContentFoundation({ projects, companions, relations, fixture: false }).bundles;
};

export const buildProjectDetailManifest = async () => {
  const bundles = await loadProductionProjectBundles();
  const manifest = createProjectDetailManifest(bundles);
  return { manifest, bytes: serializeProjectDetailManifest(manifest) };
};

export const generateProjectDetailManifest = async () => {
  const artifact = await buildProjectDetailManifest();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, artifact.bytes);
  return artifact;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { manifest } = await generateProjectDetailManifest();
  console.log(`Project detail manifest generated: ${manifest.routeCount} routes from ${manifest.sourceBundleCount} production bundles; ${manifest.generatedHash}.`);
}
