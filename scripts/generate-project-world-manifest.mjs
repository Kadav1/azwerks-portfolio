import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createProjectWorldManifest } from '../src/lib/project-worlds/manifest.ts';

export const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const outputPath = join(repositoryRoot, 'src/lib/project-worlds/generated/project-world-manifest.json');
export const serializeProjectWorldManifest = (manifest) => `${JSON.stringify(manifest, null, 2)}\n`;

export const buildProjectWorldManifest = () => {
  const manifest = createProjectWorldManifest();
  return { manifest, bytes: serializeProjectWorldManifest(manifest) };
};

export const generateProjectWorldManifest = async () => {
  const artifact = buildProjectWorldManifest();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, artifact.bytes);
  return artifact;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { manifest } = await generateProjectWorldManifest();
  console.log(`Project world manifest generated: ${manifest.worldCount} worlds; ${manifest.generatedHash}.`);
}
