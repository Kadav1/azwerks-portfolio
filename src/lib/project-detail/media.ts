import type { ProjectData } from '../../content-model/types.ts';
import type { ProjectDetailMedia } from './types.ts';

const PUBLISHABLE_RIGHTS = new Set(['owned', 'licensed', 'permission-granted', 'public-domain']);
const PRIVATE_HOST = /^(?:localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i;

const safeSource = (value: string): boolean => {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('..')) return true;
  if (/^[a-z0-9][a-z0-9/_-]*(?:\.[a-z0-9]+)?$/i.test(value) && !value.includes('..')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !PRIVATE_HOST.test(url.hostname);
  } catch {
    return false;
  }
};

const sanitizeMedia = (media: ProjectData['media'][number]): ProjectDetailMedia | undefined => {
  if (media.availability !== 'available' || !PUBLISHABLE_RIGHTS.has(media.rights) || !safeSource(media.source)) return undefined;
  if (media.purpose !== 'decorative' && !media.alt?.trim()) return undefined;
  if (['audio', 'video'].includes(media.type) && !media.transcript?.trim()) return undefined;
  return Object.freeze({
    id: media.id,
    type: media.type,
    source: media.source,
    purpose: media.purpose,
    alt: media.alt ?? '',
    ...(media.caption === undefined ? {} : { caption: media.caption }),
    ...(media.credit === undefined ? {} : { credit: media.credit }),
    ...(media.width === undefined ? {} : { width: media.width }),
    ...(media.height === undefined ? {} : { height: media.height }),
    ...(media.aspectRatio === undefined ? {} : { aspectRatio: media.aspectRatio }),
    ...(media.poster === undefined || !safeSource(media.poster) ? {} : { poster: media.poster }),
    ...(media.transcript === undefined ? {} : { transcript: media.transcript }),
    ...(media.description === undefined ? {} : { description: media.description }),
  });
};

export const filterPublicMedia = (media: readonly ProjectData['media'][number][]): ProjectDetailMedia[] =>
  media.map(sanitizeMedia).filter((item): item is ProjectDetailMedia => item !== undefined);

const priority = (media: ProjectDetailMedia): number => {
  if (media.purpose === 'artwork') return 0;
  if (media.type === 'interface' || media.purpose === 'interface') return 1;
  if (media.type === 'diagram' || media.purpose === 'diagram') return 2;
  if (['image', 'svg'].includes(media.type) && media.purpose !== 'decorative') return 3;
  if (media.purpose === 'documentary') return 4;
  if (media.purpose === 'decorative') return 5;
  return 6;
};

export const selectLeadMedia = (media: readonly ProjectData['media'][number][]): ProjectDetailMedia | undefined =>
  filterPublicMedia(media)
    .map((item, index) => ({ item, index }))
    .sort((left, right) => priority(left.item) - priority(right.item) || left.index - right.index)[0]?.item;
