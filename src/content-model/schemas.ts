import { z } from 'astro/zod';

import {
  EVIDENCE_TRUST_STATES,
  EVIDENCE_TYPES,
  LAYOUT_PROFILES,
  LIFECYCLES,
  LIMITATION_STATUSES,
  LINK_TYPES,
  MAINTENANCE_STATES,
  MEDIA_AVAILABILITIES,
  MEDIA_PURPOSES,
  MEDIA_TYPES,
  MOTION_PROFILES,
  NAVIGATION_KINDS,
  PROVENANCE_REVIEW_STATUSES,
  RELATION_DIRECTIONS,
  RELATION_TYPES,
  RELEASE_STATUSES,
  RIGHTS_STATES,
  SOURCE_AVAILABILITIES,
  THEME_PROFILES,
  VISIBILITIES,
} from './enums.ts';

const addIssue = (context: z.RefinementCtx, message: string, path: PropertyKey[] = []): void => {
  context.addIssue({ code: 'custom', message, path });
};

export const idSchema = z.string().trim().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Use lowercase ASCII kebab-case without duplicate, leading, or trailing hyphens.',
);

const textSchema = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

const stringListSchema = z.array(textSchema(1, 80)).max(24);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO calendar date.').refine(
  (value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  },
  'Use a valid ISO calendar date.',
);

const optionalProjectShape = {
  shortTitle: textSchema(2, 80).optional(),
  subtitle: textSchema(2, 160).optional(),
  year: z.number().int().min(1900).max(2200).optional(),
  startedAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
  releasedAt: isoDateSchema.optional(),
  scheduled: z.boolean().optional(),
  version: textSchema(1, 40).optional(),
  featured: z.boolean().optional(),
  experimental: z.boolean().optional(),
  tags: stringListSchema.optional(),
  capabilities: stringListSchema.optional(),
  roles: stringListSchema.optional(),
  tools: stringListSchema.optional(),
  platforms: stringListSchema.optional(),
  seoTitle: textSchema(2, 70).optional(),
  seoDescription: textSchema(24, 170).optional(),
  socialImage: textSchema(1, 160).optional(),
  noindex: z.boolean().optional(),
  medium: textSchema(2, 100).optional(),
  dimensions: textSchema(2, 100).optional(),
  period: textSchema(2, 80).optional(),
  archivedAt: isoDateSchema.optional(),
};

const commonProjectShape = {
  schemaVersion: z.literal('1.0'),
  slug: idSchema,
  title: textSchema(2, 120),
  summary: textSchema(24, 320),
  lifecycle: z.enum(LIFECYCLES),
  visibility: z.enum(VISIBILITIES),
  maintenance: z.enum(MAINTENANCE_STATES),
  synthetic: z.boolean(),
  ...optionalProjectShape,
};

const softwareProjectSchema = z.strictObject({
  ...commonProjectShape,
  category: z.literal('software'),
  capabilities: stringListSchema.min(1),
  platforms: stringListSchema.min(1),
});

const visualSystemProjectSchema = z.strictObject({
  ...commonProjectShape,
  category: z.literal('visual-system'),
  capabilities: stringListSchema.min(1),
});

const artProjectSchema = z.strictObject({
  ...commonProjectShape,
  category: z.literal('art'),
  medium: textSchema(2, 100),
}).refine((project) => project.year !== undefined || project.period !== undefined, {
  message: 'Art records require a known year or period.',
  path: ['year'],
});

const technicalSystemProjectSchema = z.strictObject({
  ...commonProjectShape,
  category: z.literal('technical-system'),
  platforms: stringListSchema.min(1),
});

const limitedMediaProjectSchema = z.strictObject({
  ...commonProjectShape,
  category: z.literal('limited-media'),
});

const baseProjectSchema = z.union([
  softwareProjectSchema,
  visualSystemProjectSchema,
  artProjectSchema,
  technicalSystemProjectSchema,
  limitedMediaProjectSchema,
]);

const refineProjectDates = (
  project: z.infer<typeof baseProjectSchema>,
  context: z.RefinementCtx,
): void => {
  const compare = (left?: string, right?: string): boolean =>
    left === undefined || right === undefined || left <= right;

  if (!compare(project.startedAt, project.updatedAt)) {
    addIssue(context, 'startedAt must not follow updatedAt.', ['updatedAt']);
  }
  if (!compare(project.startedAt, project.releasedAt)) {
    addIssue(context, 'startedAt must not follow releasedAt.', ['releasedAt']);
  }
  if (project.lifecycle === 'published' && project.releasedAt === undefined) {
    addIssue(context, 'Published records require releasedAt.', ['releasedAt']);
  }
  if (project.releasedAt && project.releasedAt > '2026-07-14' && project.scheduled !== true) {
    addIssue(context, 'Future release dates require scheduled: true.', ['scheduled']);
  }
  if (project.year !== undefined) {
    const governingDate = project.startedAt ?? project.releasedAt;
    if (governingDate && Number(governingDate.slice(0, 4)) !== project.year) {
      addIssue(context, 'year must agree with the governing known date.', ['year']);
    }
  }
  if (project.category === 'technical-system' && project.version === undefined && project.maintenance === 'not-applicable') {
    addIssue(context, 'Technical systems require a version or maintainable state.', ['version']);
  }
};

export const projectSchema = baseProjectSchema.superRefine(refineProjectDates);

export const fixtureProjectSchema = projectSchema.superRefine((project, context) => {
  if (!project.synthetic || project.visibility !== 'private' || project.noindex !== true || project.featured === true) {
    addIssue(context, 'Fixtures must be synthetic, private, noindex, and not featured.');
  }
});

const safeUrlSchema = z.string().trim().max(500).superRefine((value, context) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    addIssue(context, 'Use an absolute safe URL.');
    return;
  }

  const privateHost = /^(?:localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i;
  if (!['https:', 'mailto:'].includes(url.protocol) || url.username || url.password || privateHost.test(url.hostname)) {
    addIssue(context, 'URL protocol, credentials, or host is unsafe.');
  }
});

const linkSchema = z.strictObject({
  id: idSchema,
  type: z.enum(LINK_TYPES),
  label: textSchema(3, 100),
  url: safeUrlSchema,
  public: z.boolean(),
}).superRefine((link, context) => {
  if (link.type !== 'contact' && !link.url.startsWith('https://')) {
    addIssue(context, 'Non-contact links require HTTPS.', ['url']);
  }
});

const mediaSchema = z.strictObject({
  id: idSchema,
  type: z.enum(MEDIA_TYPES),
  source: textSchema(1, 240),
  purpose: z.enum(MEDIA_PURPOSES),
  rights: z.enum(RIGHTS_STATES),
  availability: z.enum(MEDIA_AVAILABILITIES),
  alt: z.string().max(360).optional(),
  caption: textSchema(2, 500).optional(),
  credit: textSchema(2, 200).optional(),
  width: z.number().int().positive().max(16000).optional(),
  height: z.number().int().positive().max(16000).optional(),
  aspectRatio: z.string().regex(/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/).optional(),
  poster: textSchema(1, 240).optional(),
  transcript: textSchema(4, 500).optional(),
  description: textSchema(4, 1000).optional(),
}).superRefine((media, context) => {
  if (media.availability === 'available' && media.rights === 'unknown') {
    addIssue(context, 'Available media cannot use unknown rights.', ['rights']);
  }
  if (media.availability === 'available' && media.purpose !== 'decorative' && !media.alt?.trim()) {
    addIssue(context, 'Informative media requires alt text.', ['alt']);
  }
  if (media.purpose === 'decorative' && media.alt !== '') {
    addIssue(context, 'Decorative media requires an explicit empty alt.', ['alt']);
  }
  if (media.availability === 'available' && ['audio', 'video'].includes(media.type) && !media.transcript) {
    addIssue(context, 'Available audio and video require a transcript contract.', ['transcript']);
  }
  if (media.availability === 'available' && media.width === undefined && media.height === undefined && media.aspectRatio === undefined) {
    addIssue(context, 'Available media requires dimensions or aspect ratio.', ['width']);
  }
});

const evidenceSchema = z.strictObject({
  id: idSchema,
  type: z.enum(EVIDENCE_TYPES),
  title: textSchema(3, 140),
  trust: z.enum(EVIDENCE_TRUST_STATES),
  availability: z.enum(SOURCE_AVAILABILITIES),
  summary: textSchema(4, 500).optional(),
  claim: textSchema(4, 500).optional(),
  method: textSchema(3, 500).optional(),
  result: textSchema(2, 500).optional(),
  limitations: textSchema(3, 500).optional(),
  url: safeUrlSchema.optional(),
  version: textSchema(1, 80).optional(),
  date: isoDateSchema.optional(),
  artifact: textSchema(2, 240).optional(),
  unit: textSchema(1, 80).optional(),
}).superRefine((evidence, context) => {
  if (evidence.trust === 'verified' && !evidence.artifact) {
    addIssue(context, 'Verified evidence requires a named artifact.', ['artifact']);
  }
  if (evidence.type === 'metric' && (!evidence.method || !evidence.unit || !evidence.artifact)) {
    addIssue(context, 'Metrics require method, unit, and provenance artifact.', ['method']);
  }
  if ((evidence.availability === 'private' || evidence.trust === 'private') && evidence.url) {
    addIssue(context, 'Private evidence cannot expose a URL.', ['url']);
  }
});

const processSchema = z.strictObject({
  id: idSchema,
  title: textSchema(2, 140),
  summary: textSchema(8, 500),
  order: z.number().int().positive(),
  date: isoDateSchema.optional(),
  decision: textSchema(4, 500).optional(),
  result: textSchema(4, 500).optional(),
  evidenceIds: z.array(idSchema).max(24).optional(),
});

const limitationSchema = z.strictObject({
  id: idSchema,
  summary: textSchema(8, 500),
  status: z.enum(LIMITATION_STATUSES),
  scope: textSchema(2, 160).optional(),
  impact: textSchema(4, 500).optional(),
  mitigation: textSchema(4, 500).optional(),
  evidenceIds: z.array(idSchema).max(24).optional(),
});

const releaseSchema = z.strictObject({
  id: idSchema,
  version: textSchema(1, 80),
  date: isoDateSchema,
  status: z.enum(RELEASE_STATUSES),
  summary: textSchema(8, 500),
  url: safeUrlSchema.optional(),
  evidenceIds: z.array(idSchema).max(24).optional(),
});

const provenanceSchema = z.strictObject({
  owner: textSchema(3, 160),
  authorship: textSchema(3, 160),
  sourceAvailability: z.enum(SOURCE_AVAILABILITIES),
  rightsStatus: z.enum(RIGHTS_STATES),
  reviewStatus: z.enum(PROVENANCE_REVIEW_STATUSES),
  reviewedAt: isoDateSchema.optional(),
  reviewedBy: textSchema(3, 160).optional(),
  sourceNote: textSchema(4, 500).optional(),
  rightsNote: textSchema(4, 500).optional(),
  redactionNote: textSchema(4, 500).optional(),
});

const uniqueBy = (
  values: ReadonlyArray<{ id: string }>,
  context: z.RefinementCtx,
  path: string,
): void => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) addIssue(context, `Duplicate ${path} id "${value.id}".`, [path]);
    seen.add(value.id);
  }
};

const createProjectDataBaseSchema = <TProjectReference extends z.ZodType>(projectReference: TProjectReference) => z.strictObject({
  schemaVersion: z.literal('1.0'),
  project: projectReference,
  mediaAvailability: z.enum(MEDIA_AVAILABILITIES),
  sourceAvailability: z.enum(SOURCE_AVAILABILITIES),
  rightsStatus: z.enum(RIGHTS_STATES),
  artworkAvailability: z.enum(MEDIA_AVAILABILITIES),
  layoutProfile: z.enum(LAYOUT_PROFILES),
  themeProfile: z.enum(THEME_PROFILES),
  motionProfile: z.enum(MOTION_PROFILES),
  links: z.array(linkSchema).max(24),
  media: z.array(mediaSchema).max(40),
  evidence: z.array(evidenceSchema).max(40),
  process: z.array(processSchema).max(30),
  limitations: z.array(limitationSchema).max(30),
  releases: z.array(releaseSchema).max(30),
  provenance: provenanceSchema,
}).superRefine((data, context) => {
  uniqueBy(data.links, context, 'links');
  uniqueBy(data.media, context, 'media');
  uniqueBy(data.evidence, context, 'evidence');
  uniqueBy(data.process, context, 'process');
  uniqueBy(data.limitations, context, 'limitations');
  uniqueBy(data.releases, context, 'releases');

  const orders = new Set<number>();
  for (const item of data.process) {
    if (orders.has(item.order)) addIssue(context, `Duplicate process order ${item.order}.`, ['process']);
    orders.add(item.order);
  }

  const evidenceIds = new Set(data.evidence.map(({ id }) => id));
  for (const item of [...data.process, ...data.limitations, ...data.releases]) {
    for (const id of item.evidenceIds ?? []) {
      if (!evidenceIds.has(id)) addIssue(context, `Unknown evidence reference "${id}".`, ['evidence']);
    }
  }

  if (data.mediaAvailability === 'available' && data.media.length === 0) {
    addIssue(context, 'Available media state requires at least one media item.', ['media']);
  }
  if (data.mediaAvailability !== 'available' && data.media.some(({ availability }) => availability === 'available')) {
    addIssue(context, 'Media availability conflicts with an available item.', ['mediaAvailability']);
  }
});

export const projectDataRawSchema = createProjectDataBaseSchema(idSchema);

export const createProjectDataSchema = <TProjectReference extends z.ZodType>(projectReference: TProjectReference) =>
  createProjectDataBaseSchema(projectReference);

const pageBaseSchema = z.strictObject({
  schemaVersion: z.literal('1.0'),
  slug: idSchema,
  title: textSchema(2, 120),
  summary: textSchema(24, 320),
  visibility: z.enum(VISIBILITIES),
  navigation: z.boolean(),
  order: z.number().int().min(0).max(1000),
  noindex: z.boolean(),
  synthetic: z.boolean(),
});

export const sitePageSchema = pageBaseSchema;
export const fixtureSitePageSchema = pageBaseSchema.superRefine((page, context) => {
  if (!page.synthetic || page.visibility !== 'private' || page.noindex !== true) {
    addIssue(context, 'Fixture pages must be synthetic, private, and noindex.');
  }
});

export const navigationItemSchema = z.strictObject({
  id: idSchema,
  label: textSchema(2, 80),
  kind: z.enum(NAVIGATION_KINDS),
  target: textSchema(1, 500),
  order: z.number().int().min(0).max(1000),
  visibility: z.enum(VISIBILITIES),
  synthetic: z.boolean(),
}).superRefine((item, context) => {
  if (item.kind === 'external') {
    if (!item.target.startsWith('https://')) addIssue(context, 'External navigation targets require HTTPS.', ['target']);
  } else if (!/^\/[a-z0-9/-]*$/.test(item.target) || item.target.includes('..')) {
    addIssue(context, 'Local navigation targets must be root-relative safe paths.', ['target']);
  }
});

export const navigationFileSchema = z.array(navigationItemSchema).superRefine((items, context) => {
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const item of items) {
    if (ids.has(item.id)) addIssue(context, `Duplicate navigation id "${item.id}".`, ['id']);
    if (orders.has(item.order)) addIssue(context, `Duplicate navigation order ${item.order}.`, ['order']);
    ids.add(item.id);
    orders.add(item.order);
  }
});

export const fixtureNavigationFileSchema = navigationFileSchema.superRefine((items, context) => {
  for (const [index, item] of items.entries()) {
    if (!item.synthetic || item.visibility !== 'private') {
      addIssue(context, 'Fixture navigation items must be synthetic and private.', [index]);
    }
  }
});

export const relationRawSchema = z.strictObject({
  schemaVersion: z.literal('1.0'),
  id: idSchema,
  from: idSchema,
  to: idSchema,
  type: z.enum(RELATION_TYPES),
  direction: z.enum(RELATION_DIRECTIONS),
  summary: textSchema(12, 320),
  visibility: z.enum(VISIBILITIES),
  synthetic: z.boolean(),
});

export const createRelationSchema = <TProjectReference extends z.ZodType>(projectReference: TProjectReference) => z.strictObject({
  schemaVersion: z.literal('1.0'),
  id: idSchema,
  from: projectReference,
  to: projectReference,
  type: z.enum(RELATION_TYPES),
  direction: z.enum(RELATION_DIRECTIONS),
  summary: textSchema(12, 320),
  visibility: z.enum(VISIBILITIES),
  synthetic: z.boolean(),
});
