import type { LayoutProfile, MotionProfile, ProjectCategory, ThemeProfile } from '../../content-model/enums.ts';
import type { ShellProfile, WorldProfile } from '../shell/shell-types.ts';

const DEFAULT_SHELL_PROFILES: Record<ProjectCategory, ShellProfile> = {
  software: 'technical',
  'visual-system': 'standard',
  art: 'quiet',
  'technical-system': 'technical',
  'limited-media': 'quiet',
};

export const mapProjectProfiles = (
  category: ProjectCategory,
  layoutProfile: LayoutProfile,
  themeProfile: ThemeProfile,
  motionProfile: MotionProfile,
): {
  worldProfile: WorldProfile;
  shellProfile: ShellProfile;
  layoutProfile: LayoutProfile;
  themeProfile: ThemeProfile;
  motionProfile: MotionProfile;
} => ({
  worldProfile: category,
  shellProfile: layoutProfile === 'technical'
    ? 'technical'
    : layoutProfile === 'media-led'
      ? 'immersive'
      : DEFAULT_SHELL_PROFILES[category],
  layoutProfile,
  themeProfile,
  motionProfile,
});
