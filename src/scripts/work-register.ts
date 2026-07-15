import { DEFAULT_WORK_REGISTER_STATE } from '../lib/work-register/constants.ts';
import { filterWorkRegisterRecords } from '../lib/work-register/filter.ts';
import {
  parseWorkRegisterState,
  summarizeWorkRegisterState,
} from '../lib/work-register/query-state.ts';
import { sortWorkRegisterRecords } from '../lib/work-register/sort.ts';
import type { WorkRegisterRecord, WorkRegisterState } from '../lib/work-register/types.ts';
import { serializeWorkRegisterState } from '../lib/work-register/url.ts';

interface RegisterRow {
  element: HTMLElement;
  record: WorkRegisterRecord;
}

const roots = document.querySelectorAll<HTMLElement>('[data-register-root]');

for (const root of roots) {
  const initializationStarted = performance.now();
  if (root.dataset.registerInitialized === 'true') continue;
  root.dataset.registerInitialized = 'true';

  const controls = root.querySelector<HTMLFormElement>('[data-register-controls]');
  const list = root.querySelector<HTMLOListElement>('[data-register-list]');
  const count = root.querySelector<HTMLElement>('[data-register-count]');
  const constraints = root.querySelector<HTMLUListElement>('[data-register-constraints]');
  const announcer = root.querySelector<HTMLElement>('[data-register-announcer]');
  const summaryReset = root.querySelector<HTMLButtonElement>('[data-summary-reset]');
  const empty = root.querySelector<HTMLElement>('[data-empty-kind="filter-empty"]');
  const emptySummary = root.querySelector<HTMLElement>('[data-filter-empty-summary]');
  const emptyReset = root.querySelector<HTMLButtonElement>('[data-empty-reset]');
  const errorBlock = root.querySelector<HTMLElement>('[data-empty-kind="error-block"]');
  const resetButtons = [
    controls?.querySelector<HTMLButtonElement>('[data-register-reset]'),
    summaryReset,
    emptyReset,
  ].filter((button): button is HTMLButtonElement => button !== null && button !== undefined);

  if (!controls || !list || !count || !constraints || !announcer || !summaryReset || !empty || !emptySummary || !errorBlock) {
    delete root.dataset.registerInitialized;
    continue;
  }

  const rows: RegisterRow[] = [...list.querySelectorAll<HTMLElement>('[data-register-item]')].map((element) => ({
    element,
    record: {
      id: element.dataset.recordId ?? '',
      title: element.querySelector('h3')?.textContent?.trim() ?? '',
      shortTitle: element.querySelector('h3')?.textContent?.trim() ?? '',
      summary: '',
      category: element.dataset.category as WorkRegisterRecord['category'],
      categoryLabel: '',
      lifecycle: '',
      maintenance: element.dataset.maintenance as WorkRegisterRecord['maintenance'],
      maintenanceLabel: '',
      evidenceState: element.dataset.evidence as WorkRegisterRecord['evidenceState'],
      evidenceLabel: '',
      mediaState: 'not-applicable',
      featured: false,
      tags: [],
      capabilities: [],
      platforms: [],
      searchText: element.dataset.search ?? '',
      defaultIndex: Number(element.dataset.defaultIndex ?? 0),
      dateSortKey: element.dataset.dateSortKey ?? '',
      titleSortKey: element.dataset.titleSortKey ?? '',
    },
  }));

  const formState = (): WorkRegisterState => {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(controls).entries()) {
      if (typeof value === 'string') params.append(name, value);
    }
    return parseWorkRegisterState(params);
  };

  const syncControls = (state: WorkRegisterState): void => {
    const query = controls.elements.namedItem('q');
    const sort = controls.elements.namedItem('sort');
    if (query instanceof HTMLInputElement) query.value = state.q;
    if (sort instanceof HTMLSelectElement) sort.value = state.sort;
    for (const input of controls.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
      const values = state[input.name as 'category' | 'maintenance' | 'evidence'];
      input.checked = Array.isArray(values) && values.includes(input.value as never);
    }
  };

  const renderConstraints = (values: readonly string[]): void => {
    constraints.replaceChildren(...values.map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };

  const render = (state: WorkRegisterState, announce: boolean): void => {
    const records = rows.map(({ record }) => record);
    const visibleRecords = sortWorkRegisterRecords(filterWorkRegisterRecords(records, state), state.sort);
    const visibleIds = new Set(visibleRecords.map(({ id }) => id));
    const orderedRecords = [
      ...visibleRecords,
      ...sortWorkRegisterRecords(records.filter(({ id }) => !visibleIds.has(id)), state.sort),
    ];
    const rowById = new Map(rows.map((row) => [row.record.id, row]));
    for (const record of orderedRecords) {
      const row = rowById.get(record.id);
      if (!row) continue;
      row.element.hidden = !visibleIds.has(record.id);
      list.append(row.element);
    }

    const summary = summarizeWorkRegisterState(records.length, visibleRecords.length, state);
    count.textContent = summary.countText;
    renderConstraints(summary.constraints);
    summaryReset.hidden = !summary.constrained;
    empty.hidden = visibleRecords.length !== 0;
    emptySummary.textContent = summary.constraints.length === 0
      ? 'No public Work records match the current controls.'
      : `No records match. Active constraints: ${summary.constraints.join('; ')}.`;
    if (announce) {
      announcer.textContent = `${summary.countText}${summary.constraints.length > 0 ? ` ${summary.constraints.join('; ')}.` : ''}`;
    }
  };

  const stateUrl = (state: WorkRegisterState): string => {
    const query = serializeWorkRegisterState(state);
    return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  };

  const restoreFullList = (): void => {
    for (const { element } of [...rows].sort((left, right) => left.record.defaultIndex - right.record.defaultIndex)) {
      element.hidden = false;
      list.append(element);
    }
  };

  const failOpen = (): void => {
    restoreFullList();
    controls.hidden = true;
    root.dataset.registerEnhanced = 'false';
    root.dataset.registerFailed = 'true';
    empty.hidden = true;
    errorBlock.hidden = false;
    const summary = summarizeWorkRegisterState(rows.length, rows.length, DEFAULT_WORK_REGISTER_STATE);
    count.textContent = summary.countText;
    renderConstraints([]);
    summaryReset.hidden = true;
  };

  const transition = (state: WorkRegisterState, mode: 'push' | 'replace' | 'none', announce: boolean): void => {
    try {
      syncControls(state);
      render(state, announce);
      const url = stateUrl(state);
      if (mode === 'push') history.pushState(null, '', url);
      if (mode === 'replace') history.replaceState(null, '', url);
    } catch {
      failOpen();
    }
  };

  const onSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    transition(formState(), 'push', true);
  };
  const onReset = (): void => transition(DEFAULT_WORK_REGISTER_STATE, 'push', true);
  const onPopState = (): void => {
    const state = parseWorkRegisterState(window.location.search);
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    transition(state, stateUrl(state) === current ? 'none' : 'replace', true);
  };
  const onPageHide = (): void => {
    controls.removeEventListener('submit', onSubmit);
    for (const button of resetButtons) button.removeEventListener('click', onReset);
    window.removeEventListener('popstate', onPopState);
    window.removeEventListener('pagehide', onPageHide);
    delete root.dataset.registerInitialized;
  };

  controls.addEventListener('submit', onSubmit);
  for (const button of resetButtons) button.addEventListener('click', onReset);
  window.addEventListener('popstate', onPopState);
  window.addEventListener('pagehide', onPageHide);

  try {
    const initialState = parseWorkRegisterState(window.location.search);
    syncControls(initialState);
    render(initialState, false);
    controls.hidden = false;
    root.dataset.registerEnhanced = 'true';
    delete root.dataset.registerFailed;
    root.dataset.registerInitMs = (performance.now() - initializationStarted).toFixed(3);
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (stateUrl(initialState) !== current) history.replaceState(null, '', stateUrl(initialState));
  } catch {
    failOpen();
  }
}
