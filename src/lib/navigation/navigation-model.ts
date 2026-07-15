import type { NavigationItem } from '../../content-model/types.ts';
import { validateShellNavigation } from './navigation-validation.ts';

export type NavigationRegion = 'primary' | 'footer';

export interface NormalizedNavigationItem extends NavigationItem {
  direct: boolean;
  external: boolean;
  regions: readonly NavigationRegion[];
}

export type NavigationModel = readonly NormalizedNavigationItem[];

const primaryIds = new Set(['work', 'archive', 'about', 'contact']);
const footerIds = new Set(['contact', 'accessibility', 'privacy', 'colophon']);

export const createNavigationModel = (input: unknown): NavigationModel =>
  Object.freeze(validateShellNavigation(input).map((item) => {
    const regions: NavigationRegion[] = [];
    if (primaryIds.has(item.id)) regions.push('primary');
    if (footerIds.has(item.id)) regions.push('footer');
    return Object.freeze({
      ...item,
      direct: item.id === 'work' && item.kind === 'route' && item.target === '/work/',
      external: item.kind === 'external',
      regions: Object.freeze(regions),
    });
  }));

export const getNavigationRegion = (
  model: NavigationModel,
  region: NavigationRegion,
): readonly NormalizedNavigationItem[] => model.filter((item) => item.regions.includes(region));
