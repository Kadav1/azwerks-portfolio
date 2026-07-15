import {
  shellProfiles,
  worldProfiles,
  type ShellContext,
  type ShellProfile,
  type WorldProfile,
} from './shell-types.ts';

export { shellProfiles };

class ShellContextError extends Error {
  readonly code: 'SHELL_PROFILE_INVALID' | 'SHELL_WORLD_PROFILE_INVALID';

  constructor(code: 'SHELL_PROFILE_INVALID' | 'SHELL_WORLD_PROFILE_INVALID', message: string) {
    super(message);
    this.name = 'ShellContextError';
    this.code = code;
  }
}

export const createShellContext = (
  profile: ShellProfile,
  world?: WorldProfile,
): ShellContext => {
  if (!shellProfiles.includes(profile)) {
    throw new ShellContextError('SHELL_PROFILE_INVALID', `Unsupported shell profile: ${profile}`);
  }
  if (world !== undefined && !worldProfiles.includes(world)) {
    throw new ShellContextError('SHELL_WORLD_PROFILE_INVALID', `Unsupported world profile: ${world}`);
  }
  return Object.freeze({
    profile,
    world,
    navigationSemantics: 'stable',
    focusSemantics: 'stable',
    themeSemantics: 'stable',
    targetSemantics: 'stable',
  });
};
