import type { z } from 'astro/zod';

import type {
  navigationItemSchema,
  projectDataRawSchema,
  projectSchema,
  relationRawSchema,
  sitePageSchema,
} from './schemas.ts';

export type Project = z.infer<typeof projectSchema>;
export type ProjectData = z.infer<typeof projectDataRawSchema>;
export type ProjectRelation = z.infer<typeof relationRawSchema>;
export type SitePage = z.infer<typeof sitePageSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;

export interface SourceEntry<T> {
  id: string;
  data: T;
  body?: string | undefined;
  filePath: string;
}

export interface PublicationEvaluation {
  eligible: boolean;
  reasons: readonly string[];
}

export interface ProjectBundle {
  id: string;
  project: SourceEntry<Project>;
  companion: SourceEntry<ProjectData>;
  incoming: readonly ProjectRelation[];
  outgoing: readonly ProjectRelation[];
  undirected: readonly ProjectRelation[];
  publication: PublicationEvaluation;
  displayPeriod?: string | undefined;
  mediaState: 'available' | 'unavailable' | 'private' | 'not-applicable';
  evidenceState: 'none' | 'unverified' | 'reviewed' | 'verified' | 'unavailable' | 'private';
  relationCount: number;
  searchText: string;
  archiveState: boolean;
  featured: boolean;
}
