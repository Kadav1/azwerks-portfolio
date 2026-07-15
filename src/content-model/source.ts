import { readFile } from 'node:fs/promises';

import { contentError } from './error-codes.ts';

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  body: string;
}

const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;
const PRIVATE_PATH_PATTERN = /(?:file:\/\/|(?:^|[\s("'])\/(?:home|media|mnt|Users|private|var\/folders)\/|[A-Za-z]:\\)/i;
const PRIVATE_HOST_PATTERN = /(?:localhost|127\.0\.0\.1|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?=[:/\s]|$)/i;
const CREDENTIAL_URL_PATTERN = /https?:\/\/[^\s/@:]+:[^\s/@]+@/i;

export const compareAscii = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const parseScalar = (raw: string, context: string): unknown => {
  const value = raw.trim();

  if (value === '') {
    return undefined;
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') {
    return contentError('CONTENT_FRONTMATTER_INVALID', 'Null frontmatter values must be omitted.', context);
  }

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return contentError('CONTENT_FRONTMATTER_INVALID', 'Frontmatter numbers must be finite.', context);
    }
    return number;
  }

  if (value.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
        return contentError('CONTENT_FRONTMATTER_NESTED', 'Frontmatter arrays may contain strings only.', context);
      }
      return parsed;
    } catch {
      return contentError('CONTENT_FRONTMATTER_INVALID', 'Inline arrays must use JSON string syntax.', context);
    }
  }

  if (value.startsWith('{') || value.startsWith('&') || value.startsWith('*') || value.startsWith('!')) {
    return contentError('CONTENT_FRONTMATTER_NESTED', 'Nested, aliased, and tagged YAML values are prohibited.', context);
  }

  if (value.startsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed !== 'string') throw new Error('not a string');
      return parsed;
    } catch {
      return contentError('CONTENT_FRONTMATTER_INVALID', 'Double-quoted values must be valid JSON strings.', context);
    }
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'");
  }

  if (/[:#]\s/.test(value)) {
    return contentError('CONTENT_FRONTMATTER_INVALID', 'Ambiguous plain scalars must be quoted.', context);
  }

  return value;
};

export const assertSafeString = (value: string, context: string): void => {
  if (PRIVATE_PATH_PATTERN.test(value) || /(?:^|\/)\.\.(?:\/|$)/.test(value)) {
    contentError('CONTENT_PRIVATE_PATH', 'Local and traversal paths are prohibited.', context);
  }

  if (/javascript\s*:/i.test(value) || PRIVATE_HOST_PATTERN.test(value) || CREDENTIAL_URL_PATTERN.test(value)) {
    contentError('CONTENT_UNSAFE_URL', 'Unsafe or private URLs are prohibited.', context);
  }
};

export const assertSafeMarkdownBody = (body: string, context: string): void => {
  assertSafeString(body, context);

  if (
    /<\s*(?:script|iframe|object|embed|form|style)\b/i.test(body) ||
    /\son[a-z]+\s*=/i.test(body) ||
    /!?\[\[[\s\S]*?\]\]/.test(body) ||
    /<\/?[A-Za-z][^>]*>/.test(body)
  ) {
    contentError('CONTENT_BODY_UNSAFE', 'Raw HTML, scripts, handlers, iframes, and Obsidian constructs are prohibited.', context);
  }
};

export const parseFlatFrontmatter = (source: string, filePath: string): ParsedFrontmatter => {
  const normalized = source.replaceAll('\r\n', '\n');
  if (!normalized.startsWith('---\n')) {
    return contentError('CONTENT_FRONTMATTER_INVALID', 'Markdown entries must begin with frontmatter.', filePath);
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    return contentError('CONTENT_FRONTMATTER_INVALID', 'Frontmatter closing delimiter is missing.', filePath);
  }

  const frontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5).replace(/^\n/, '').replace(/\n$/, '');
  const data: Record<string, unknown> = {};
  const lines = frontmatter.split('\n');
  let pendingArrayKey: string | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const lineContext = `${filePath}:${index + 2}`;

    if (line.includes('\t')) {
      return contentError('CONTENT_FRONTMATTER_INVALID', 'Tabs are prohibited in frontmatter.', lineContext);
    }

    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;

    if (/^\s/.test(line)) {
      const listMatch = line.match(/^  -\s+(.+)$/);
      if (!listMatch || !pendingArrayKey) {
        return contentError('CONTENT_FRONTMATTER_NESTED', 'Only two-space string-array items may be indented.', lineContext);
      }
      const parsed = parseScalar(listMatch[1] ?? '', lineContext);
      if (typeof parsed !== 'string') {
        return contentError('CONTENT_FRONTMATTER_NESTED', 'Frontmatter arrays may contain strings only.', lineContext);
      }
      (data[pendingArrayKey] as string[]).push(parsed);
      continue;
    }

    pendingArrayKey = undefined;
    const match = line.match(/^([^:]+):(.*)$/);
    if (!match) {
      return contentError('CONTENT_FRONTMATTER_INVALID', 'Frontmatter lines must be key-value pairs.', lineContext);
    }

    const key = (match[1] ?? '').trim();
    if (!KEY_PATTERN.test(key)) {
      return contentError('CONTENT_FRONTMATTER_INVALID', `Invalid frontmatter key "${key}".`, lineContext);
    }
    if (Object.hasOwn(data, key)) {
      return contentError('CONTENT_FRONTMATTER_DUPLICATE', `Duplicate frontmatter key "${key}".`, lineContext);
    }

    const parsed = parseScalar(match[2] ?? '', lineContext);
    if (parsed === undefined) {
      data[key] = [];
      pendingArrayKey = key;
    } else {
      data[key] = parsed;
      if (typeof parsed === 'string') assertSafeString(parsed, lineContext);
      if (Array.isArray(parsed)) parsed.forEach((item) => assertSafeString(item, lineContext));
    }
  }

  assertSafeMarkdownBody(body, filePath);
  return { body, data };
};

export const readMarkdownEntry = async (filePath: string): Promise<ParsedFrontmatter> =>
  parseFlatFrontmatter(await readFile(filePath, 'utf8'), filePath);
