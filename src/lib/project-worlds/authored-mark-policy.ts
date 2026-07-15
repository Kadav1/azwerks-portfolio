import type { ProjectWorld } from './world-types.ts';

export interface AuthoredMarkPolicy {
  level: 0 | 1;
  approvedSurface?: string | undefined;
  removable: true;
  forcedColors: 'remove';
  reducedExpression: 'remove';
  print: 'remove-unless-documentary';
  carriesMeaning: false;
}

const LEVEL_ZERO = Object.freeze<AuthoredMarkPolicy>({
  level: 0,
  removable: true,
  forcedColors: 'remove',
  reducedExpression: 'remove',
  print: 'remove-unless-documentary',
  carriesMeaning: false,
});

export const getAuthoredMarkPolicy = (_world: ProjectWorld): AuthoredMarkPolicy => LEVEL_ZERO;
