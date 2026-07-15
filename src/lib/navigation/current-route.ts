export type CurrentRouteState = 'page' | 'section' | null;

const routeBase = 'https://azwerks.invalid';
const sectionCurrentTargets = new Set(['/work/', '/archive/']);

export const normalizePathname = (input: string): string => {
  const value = input.trim() || '/';
  const pathname = value.startsWith('/')
    ? value.split(/[?#]/, 1)[0]
    : new URL(value, routeBase).pathname;
  const normalized = `/${pathname}`.replace(/\/{2,}/g, '/');
  return normalized === '/' ? '/' : `${normalized.replace(/\/$/, '')}/`;
};

export const getCurrentRouteState = (
  currentPath: string,
  target: string,
): CurrentRouteState => {
  const current = normalizePathname(currentPath);
  const destination = normalizePathname(target);
  if (current === destination) return 'page';
  if (sectionCurrentTargets.has(destination) && current.startsWith(destination)) return 'section';
  return null;
};
