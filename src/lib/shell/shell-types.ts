export const shellProfiles = ['standard', 'quiet', 'immersive', 'technical'] as const;
export type ShellProfile = (typeof shellProfiles)[number];

export const worldProfiles = [
  'software',
  'visual-system',
  'art',
  'technical-system',
  'limited-media',
] as const;
export type WorldProfile = (typeof worldProfiles)[number];

export interface ShellContext {
  profile: ShellProfile;
  world?: WorldProfile | undefined;
  navigationSemantics: 'stable';
  focusSemantics: 'stable';
  themeSemantics: 'stable';
  targetSemantics: 'stable';
}
