import {
  applyThemePreference,
  parseThemeMode,
  readThemePreference,
  resolveTheme,
  setThemePreference,
  themeStorageKey,
  writeThemePreference,
} from '../src/tokens/runtime/theme.ts';

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(parseThemeMode('system') === 'system', 'system mode did not parse');
expect(parseThemeMode('dark') === 'dark', 'dark mode did not parse');
expect(parseThemeMode('light') === 'light', 'light mode did not parse');
expect(parseThemeMode('sepia') === null, 'invalid mode was not rejected');
expect(resolveTheme('system', true) === 'dark', 'system dark did not resolve');
expect(resolveTheme('system', false) === 'light', 'system light did not resolve');
expect(applyThemePreference('system') === 'light', 'SSR-safe fallback did not resolve');

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  removeItem: (key) => values.delete(key),
  setItem: (key, value) => values.set(key, value),
};
expect(writeThemePreference('dark', storage), 'valid preference did not write');
expect(values.get(themeStorageKey) === 'dark', 'storage key or value is incorrect');
expect(readThemePreference(storage) === 'dark', 'stored preference did not read');
expect(writeThemePreference('system', storage), 'system preference did not clear');
expect(!values.has(themeStorageKey), 'system preference remained in storage');

const throwingStorage = {
  getItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
};
expect(readThemePreference(throwingStorage) === 'system', 'throwing storage read was not safe');
expect(writeThemePreference('light', throwingStorage) === false, 'throwing storage write was not safe');

globalThis.window = {
  get localStorage() { throw new Error('blocked getter'); },
  matchMedia: () => ({ matches: false }),
  dispatchEvent: () => true,
};
globalThis.document = { documentElement: { dataset: {} } };
globalThis.CustomEvent = class {
  constructor(type, init) {
    this.type = type;
    this.detail = init.detail;
  }
};
expect(setThemePreference('dark') === 'dark', 'storage-getter failure blocked theme application');
expect(document.documentElement.dataset.theme === 'dark', 'explicit theme was not applied after storage failure');

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Theme runtime validation passed: parsing, resolution, SSR, storage, and storage-getter failure.');
}
