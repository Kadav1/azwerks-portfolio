import type { ProjectData } from '../../content-model/types.ts';
import type { ProjectDetailEvidence } from './types.ts';

const PRIVATE_HOST = /^(?:localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i;
const safeUrl = (value?: string): string | undefined => {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !PRIVATE_HOST.test(url.hostname) ? value : undefined;
  } catch {
    return undefined;
  }
};

export const filterPublicEvidence = (
  evidence: readonly ProjectData['evidence'][number][],
): ProjectDetailEvidence[] => evidence.map((item) => Object.freeze({
  id: item.id,
  type: item.type,
  title: item.title,
  trust: item.trust,
  availability: item.availability,
  ...(item.summary === undefined ? {} : { summary: item.summary }),
  ...(item.claim === undefined ? {} : { claim: item.claim }),
  ...(item.method === undefined ? {} : { method: item.method }),
  ...(item.result === undefined ? {} : { result: item.result }),
  ...(item.limitations === undefined ? {} : { limitations: item.limitations }),
  ...(item.availability === 'public' && item.trust !== 'private' && safeUrl(item.url) ? { url: safeUrl(item.url) } : {}),
  ...(item.version === undefined ? {} : { version: item.version }),
  ...(item.date === undefined ? {} : { date: item.date }),
  ...(item.artifact === undefined ? {} : { artifact: item.artifact }),
  ...(item.unit === undefined ? {} : { unit: item.unit }),
}));
