import {
  applyThemePreference,
  parseThemeMode,
  readThemePreference,
  setThemePreference,
  themeChangeEvent,
  type ThemeChangeDetail,
  type ThemeMode,
} from '../tokens/runtime/theme.ts';

type Cleanup = () => void;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'select:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const bindMobileNavigation = (details: HTMLDetailsElement): Cleanup => {
  const trigger = details.querySelector<HTMLElement>('summary');
  const panel = details.querySelector<HTMLElement>('[data-mobile-navigation-panel]');
  const closeButton = details.querySelector<HTMLButtonElement>('[data-mobile-navigation-close]');
  if (!trigger || !panel || !closeButton) return () => undefined;

  const inertTargets = [...document.querySelectorAll<HTMLElement>('[data-shell-background]')];
  const initialInert = new Map(inertTargets.map((target) => [target, target.inert]));
  const body = document.body;
  const previousBodyOverflow = body.style.overflow;
  const previousBodyPadding = body.style.paddingInlineEnd;
  let modalActive = false;

  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  const setExpanded = (expanded: boolean) => trigger.setAttribute('aria-expanded', String(expanded));

  const enableModal = (): void => {
    if (modalActive) return;
    modalActive = true;
    for (const target of inertTargets) target.inert = true;
    const scrollbarOffset = window.innerWidth - document.documentElement.clientWidth;
    body.style.setProperty('--_shell-scrollbar-offset', `${scrollbarOffset}px`);
    body.style.paddingInlineEnd = 'var(--_shell-scrollbar-offset)';
    body.style.overflow = 'hidden';
    setExpanded(true);
    queueMicrotask(() => closeButton.focus());
  };

  const disableModal = (restoreFocus: boolean): void => {
    if (!modalActive) return;
    modalActive = false;
    for (const target of inertTargets) target.inert = initialInert.get(target) ?? false;
    body.style.overflow = previousBodyOverflow;
    body.style.paddingInlineEnd = previousBodyPadding;
    body.style.removeProperty('--_shell-scrollbar-offset');
    setExpanded(false);
    if (restoreFocus && trigger.isConnected) trigger.focus();
  };

  const close = (restoreFocus = true): void => {
    details.open = false;
    disableModal(restoreFocus);
  };

  const onToggle = (): void => {
    if (details.open) enableModal();
    else disableModal(false);
  };

  const onCloseClick = (): void => close(true);

  const onKeydown = (event: KeyboardEvent): void => {
    if (!details.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll<HTMLElement>(focusableSelector)]
      .filter((element) => !element.hidden && element.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const onPanelClick = (event: MouseEvent): void => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (link && new URL(link.href, window.location.href).origin === window.location.origin) close(false);
  };

  const workspace = getComputedStyle(document.documentElement)
    .getPropertyValue('--azw-breakpoint-workspace')
    .trim();
  const workspaceQuery = window.matchMedia(`(min-width: ${workspace})`);
  const onViewportChange = (event: MediaQueryListEvent): void => {
    if (event.matches && details.open) close(false);
  };

  setExpanded(details.open);
  details.addEventListener('toggle', onToggle);
  closeButton.addEventListener('click', onCloseClick);
  panel.addEventListener('click', onPanelClick);
  document.addEventListener('keydown', onKeydown);
  workspaceQuery.addEventListener('change', onViewportChange);

  return () => {
    details.removeEventListener('toggle', onToggle);
    closeButton.removeEventListener('click', onCloseClick);
    panel.removeEventListener('click', onPanelClick);
    document.removeEventListener('keydown', onKeydown);
    workspaceQuery.removeEventListener('change', onViewportChange);
    close(false);
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
  };
};

const bindThemeControls = (): Cleanup => {
  const selects = [...document.querySelectorAll<HTMLSelectElement>('[data-theme-select]')];
  const statusLabels = [...document.querySelectorAll<HTMLElement>('[data-theme-status]')];
  if (selects.length === 0) return () => undefined;

  let storage: Storage | undefined;
  try {
    storage = window.localStorage;
  } catch {
    storage = undefined;
  }
  let mode: ThemeMode = readThemePreference(storage);

  const sync = (nextMode: ThemeMode): void => {
    mode = nextMode;
    for (const select of selects) {
      select.value = nextMode;
      select.disabled = false;
      select.removeAttribute('aria-describedby');
    }
    for (const status of statusLabels) {
      status.hidden = false;
      status.setAttribute('aria-hidden', 'true');
      status.closest<HTMLElement>('[data-theme-control]')?.setAttribute('data-theme-ready', 'true');
    }
  };

  const onChange = (event: Event): void => {
    const select = event.currentTarget as HTMLSelectElement;
    const nextMode = parseThemeMode(select.value) ?? 'system';
    setThemePreference(nextMode);
    sync(nextMode);
  };

  const onThemeChange = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeChangeDetail>).detail;
    if (detail) sync(detail.mode);
  };

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemThemeChange = (): void => {
    if (mode === 'system') applyThemePreference('system');
  };

  sync(mode);
  for (const select of selects) select.addEventListener('change', onChange);
  window.addEventListener(themeChangeEvent, onThemeChange);
  systemTheme.addEventListener('change', onSystemThemeChange);

  return () => {
    for (const select of selects) select.removeEventListener('change', onChange);
    window.removeEventListener(themeChangeEvent, onThemeChange);
    systemTheme.removeEventListener('change', onSystemThemeChange);
    for (const select of selects) {
      select.disabled = true;
      select.setAttribute('aria-describedby', `${select.id}-status`);
    }
    for (const status of statusLabels) {
      status.removeAttribute('aria-hidden');
      status.closest<HTMLElement>('[data-theme-control]')?.removeAttribute('data-theme-ready');
    }
  };
};

export const initShellNavigation = (): Cleanup => {
  const root = document.querySelector<HTMLElement>('[data-shell-root]');
  if (!root || root.dataset.shellInitialized === 'true') return () => undefined;
  root.dataset.shellInitialized = 'true';
  document.documentElement.dataset.shellEnhanced = 'true';

  const cleanups = [
    ...[...document.querySelectorAll<HTMLDetailsElement>('[data-mobile-navigation]')]
      .map(bindMobileNavigation),
    bindThemeControls(),
  ];

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
    delete root.dataset.shellInitialized;
    delete document.documentElement.dataset.shellEnhanced;
  };
};

const cleanup = initShellNavigation();
window.addEventListener('pagehide', cleanup, { once: true });
