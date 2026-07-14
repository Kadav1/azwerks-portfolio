export const themeModes = ['system', 'dark', 'light'] as const;
export type ThemeMode = (typeof themeModes)[number];
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export const themeStorageKey = 'azwerks.portfolio.theme.v1';
export const themeChangeEvent = 'azwerks:theme-change';

interface StorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface ThemeChangeDetail {
  mode: ThemeMode;
  resolved: ResolvedTheme;
}

export function parseThemeMode(value: unknown): ThemeMode | null {
  return typeof value === 'string' && themeModes.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : null;
}

export function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  return mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;
}

export function readThemePreference(storage?: StorageLike): ThemeMode {
  if (!storage) return 'system';
  try {
    return parseThemeMode(storage.getItem(themeStorageKey)) ?? 'system';
  } catch {
    return 'system';
  }
}

export function writeThemePreference(mode: ThemeMode, storage?: StorageLike): boolean {
  if (!storage) return false;
  try {
    if (mode === 'system') storage.removeItem(themeStorageKey);
    else storage.setItem(themeStorageKey, mode);
    return true;
  } catch {
    return false;
  }
}

export function applyThemePreference(mode: ThemeMode): ResolvedTheme {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return resolveTheme(mode, false);
  }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = resolveTheme(mode, systemPrefersDark);
  if (mode === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  window.dispatchEvent(
    new CustomEvent<ThemeChangeDetail>(themeChangeEvent, {
      detail: { mode, resolved },
    }),
  );
  return resolved;
}

export function setThemePreference(mode: ThemeMode): ResolvedTheme {
  if (typeof window !== 'undefined') {
    try {
      writeThemePreference(mode, window.localStorage);
    } catch {
      // Access to the storage object itself may be blocked by the browser.
    }
  }
  return applyThemePreference(mode);
}
