import { navigationFileSchema } from '../../content-model/schemas.ts';
import type { NavigationItem } from '../../content-model/types.ts';

export type ShellNavigationErrorCode =
  | 'SHELL_NAV_SCHEMA'
  | 'SHELL_NAV_FIXTURE'
  | 'SHELL_NAV_PRIVATE'
  | 'SHELL_NAV_TARGET_DUPLICATE'
  | 'SHELL_NAV_WORK_REQUIRED';

export class ShellNavigationError extends Error {
  readonly code: ShellNavigationErrorCode;

  constructor(code: ShellNavigationErrorCode, message: string) {
    super(message);
    this.name = 'ShellNavigationError';
    this.code = code;
  }
}

export const validateShellNavigation = (input: unknown): readonly NavigationItem[] => {
  const parsed = navigationFileSchema.safeParse(input);
  if (!parsed.success) {
    throw new ShellNavigationError('SHELL_NAV_SCHEMA', parsed.error.issues[0]?.message ?? 'Navigation schema is invalid.');
  }

  const targets = new Set<string>();
  for (const item of parsed.data) {
    if (item.synthetic) {
      throw new ShellNavigationError('SHELL_NAV_FIXTURE', `Navigation item "${item.id}" is synthetic.`);
    }
    if (item.visibility !== 'public') {
      throw new ShellNavigationError('SHELL_NAV_PRIVATE', `Navigation item "${item.id}" is not public.`);
    }
    if (targets.has(item.target)) {
      throw new ShellNavigationError('SHELL_NAV_TARGET_DUPLICATE', `Navigation target "${item.target}" is duplicated.`);
    }
    targets.add(item.target);
  }

  const work = parsed.data.find(({ id }) => id === 'work');
  if (!work || work.kind !== 'route' || work.target !== '/work/') {
    throw new ShellNavigationError('SHELL_NAV_WORK_REQUIRED', 'A direct local Work route is required.');
  }

  return Object.freeze([...parsed.data].sort((left, right) => left.order - right.order));
};
