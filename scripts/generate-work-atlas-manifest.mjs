import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createWorkAtlasManifest, serializeWorkAtlasManifest } from '../src/lib/work-atlas/atlas-manifest.ts';
import { createAtlasViewModel } from '../src/lib/work-atlas/atlas-view-model.ts';
import { loadProductionProjectBundles } from './generate-project-detail-manifest.mjs';

export const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const outputPath = join(repositoryRoot, 'src/lib/work-atlas/generated/work-atlas-manifest.json');

export const buildWorkAtlasManifest = async () => {
  const bundles = await loadProductionProjectBundles();
  const viewModel = createAtlasViewModel(bundles);
  const manifest = createWorkAtlasManifest(viewModel);
  return { manifest, bytes: serializeWorkAtlasManifest(manifest) };
};

export const generateWorkAtlasManifest = async () => {
  const artifact = await buildWorkAtlasManifest();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, artifact.bytes);
  return artifact;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { manifest } = await generateWorkAtlasManifest();
  console.log(`Work Atlas manifest generated: ${manifest.publicNodeCount} nodes, ${manifest.publicRelationCount} relations; ${manifest.generatedManifestHash}.`);
}
