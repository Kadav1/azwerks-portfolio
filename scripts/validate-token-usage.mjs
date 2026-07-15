import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  assert,
  displayPath,
  failIfErrors,
  repositoryRoot,
  walkFiles,
} from './token-utils.mjs';

const errors = [];
const srcRoot = join(repositoryRoot, 'src');
const files = await walkFiles(srcRoot, new Set(['generated', 'source', 'schema']));
const productionFiles = files.filter((path) => ['.css', '.astro', '.ts', '.tsx', '.js', '.mjs'].includes(extname(path)));

function declarations(content, propertyPattern) {
  return [...content.matchAll(new RegExp(`(?<![\\w-])(?:${propertyPattern})\\s*:\\s*([^;}{]+)`, 'gi'))]
    .map((match) => match[1].trim());
}

for (const path of productionFiles) {
  const content = await readFile(path, 'utf8');
  const name = displayPath(path);
  if (name !== 'src/tokens/index.ts') {
    assert(!/var\(--azw-p-/.test(content), `${name} consumes a primitive token directly.`, errors);
  }
  assert(!/@azwerks\/radium/.test(content), `${name} references the excluded package.`, errors);
  assert(!/(?:\/home\/|\/media\/|\/mnt\/)/.test(content), `${name} exposes a private absolute path.`, errors);

  if (extname(path) === '.css' || extname(path) === '.astro') {
    const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
    assert(!/#[0-9a-f]{3,8}\b/i.test(withoutComments), `${name} contains a raw hex color.`, errors);
    assert(!/\b(?:rgb|hsl|oklch|lab|lch)a?\(/i.test(withoutComments), `${name} contains a raw color function.`, errors);
    const motionValues = declarations(withoutComments, '(?:animation|transition)(?:-[a-z-]+)?');
    assert(!motionValues.some((value) => /(?:\d+m?s|cubic-bezier\()/i.test(value) && !value.startsWith('var(')), `${name} contains raw motion values.`, errors);
    assert(!declarations(withoutComments, 'z-index').some((value) => /^-?\d+$/.test(value)), `${name} contains a raw z-index.`, errors);
    assert(!declarations(withoutComments, 'box-shadow').some((value) => !/^(?:var\(|none\b)/.test(value)), `${name} contains a raw box shadow.`, errors);
    assert(!declarations(withoutComments, 'border-radius').some((value) => !/^(?:var\(|0\b|inherit\b|initial\b|unset\b)/.test(value)), `${name} contains a raw radius.`, errors);
    assert(!declarations(withoutComments, 'font-size').some((value) => !/^(?:var\(|inherit\b|100%$)/.test(value)), `${name} contains a raw font size.`, errors);
    assert(!declarations(withoutComments, 'gap|padding|padding-block|padding-inline|margin-block|margin-inline').some((value) => !/^(?:var\(|0\b|auto\b)/.test(value)), `${name} contains raw spacing.`, errors);
    assert(!declarations(withoutComments, 'max-width|inline-size|max-inline-size').some((value) => !/^(?:var\(|100%$|none\b|auto\b)/.test(value)), `${name} contains a raw content width.`, errors);
  }
}

const packageJson = JSON.parse(await readFile(join(repositoryRoot, 'package.json'), 'utf8'));
for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
  assert(!Object.prototype.hasOwnProperty.call(packageJson[section] ?? {}, '@azwerks/radium'), `package.json declares the excluded package in ${section}.`, errors);
}
assert(!(await walkFiles(srcRoot)).some((path) => displayPath(path).includes('vendor/radium')), 'A Radium package is vendored under src.', errors);

failIfErrors(errors, 'Token usage validation');
console.log(`Token usage validation passed: ${productionFiles.length} authored production files; package absence confirmed.`);
