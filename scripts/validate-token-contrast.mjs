import { join } from 'node:path';
import {
  failIfErrors,
  indexTokens,
  loadTokenSources,
  readJson,
  resolveTokenValue,
  sourceDirectory,
} from './token-utils.mjs';

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  if (!/^#[a-f0-9]{6}$/i.test(hex)) throw new Error(`Contrast value is not opaque six-digit hex: ${hex}`);
  const values = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return 0.2126 * channel(values[0]) + 0.7152 * channel(values[1]) + 0.0722 * channel(values[2]);
}

function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const { entries } = await loadTokenSources();
const index = indexTokens(entries);
const contract = await readJson(join(sourceDirectory, 'contrast-pairs.json'));
const errors = [];
const results = [];

for (const pair of contract.pairs) {
  const foreground = resolveTokenValue(index, pair.foreground, pair.mode);
  const background = resolveTokenValue(index, pair.background, pair.mode);
  const ratio = contrast(foreground, background);
  results.push({ ...pair, foregroundValue: foreground, backgroundValue: background, ratio: Number(ratio.toFixed(2)) });
  if (ratio + Number.EPSILON < pair.minimum) {
    errors.push(`${pair.mode} ${pair.name}: ${ratio.toFixed(2)}:1 < ${pair.minimum}:1 (${foreground} on ${background}).`);
  }
}

failIfErrors(errors, 'Token contrast validation');
for (const result of results) {
  console.log(`${result.mode.padEnd(5)} ${result.name.padEnd(28)} ${result.ratio.toFixed(2)}:1`);
}
console.log(`Token contrast validation passed: ${results.length} required pairs.`);
