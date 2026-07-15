import type { ProjectDetailRouteRecord } from './routes.ts';

export interface ProjectContextDestination {
  id: string;
  title: string;
  href: string;
}

export interface ProjectContextNavigation {
  position?: { current: number; total: number } | undefined;
  previousProject?: ProjectContextDestination | undefined;
  nextProject?: ProjectContextDestination | undefined;
}

const destination = (record?: ProjectDetailRouteRecord): ProjectContextDestination | undefined =>
  record === undefined
    ? undefined
    : Object.freeze({ id: record.id, title: record.title, href: record.href });

export const getProjectContextNavigation = (
  records: readonly ProjectDetailRouteRecord[],
  index: number,
): ProjectContextNavigation => {
  if (!Number.isInteger(index) || index < 0 || index >= records.length) {
    throw new RangeError(`Project navigation index ${index} is outside the route set.`);
  }
  return Object.freeze({
    position: records.length > 1 ? Object.freeze({ current: index + 1, total: records.length }) : undefined,
    previousProject: destination(records[index - 1]),
    nextProject: destination(records[index + 1]),
  });
};
