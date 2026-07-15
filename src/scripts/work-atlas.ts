import { DEFAULT_ATLAS_STATE, filterAtlasData, normalizeAtlasState, parseAtlasState } from '../lib/work-atlas/atlas-state.ts';
import type { AtlasRecord, AtlasRelation, AtlasState } from '../lib/work-atlas/atlas-types.ts';
import { getRegisterHrefFromAtlas, serializeAtlasState } from '../lib/work-atlas/atlas-url.ts';

interface AtlasDomRecord extends AtlasRecord {
  element: HTMLButtonElement;
}

interface AtlasDomRelation extends AtlasRelation {
  element: SVGPathElement;
}

const roots = document.querySelectorAll<HTMLElement>('[data-atlas-root]');

for (const root of roots) {
  if (root.dataset.atlasInitialized === 'true') continue;
  root.dataset.atlasInitialized = 'true';
  const initializationStarted = performance.now();

  const controls = root.querySelector<HTMLFormElement>('[data-atlas-controls]');
  const spatial = root.querySelector<HTMLElement>('[data-atlas-spatial]');
  const viewport = root.querySelector<HTMLElement>('[data-atlas-viewport]');
  const plane = root.querySelector<HTMLElement>('[data-atlas-plane]');
  const summary = root.querySelector<HTMLElement>('[data-atlas-summary]');
  const error = root.querySelector<HTMLElement>('[data-atlas-error]');
  const indexes = root.querySelector<HTMLDetailsElement>('[data-atlas-indexes]');
  const inspector = root.querySelector<HTMLElement>('[data-atlas-inspector]');
  const inspectorInstruction = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-instruction]');
  const inspectorContent = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-content]');
  const inspectorTitle = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-title]');
  const inspectorSummary = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-summary]');
  const inspectorCategory = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-category]');
  const inspectorPeriod = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-period]');
  const inspectorMaintenance = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-maintenance]');
  const inspectorEvidence = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-evidence]');
  const inspectorRelations = inspector?.querySelector<HTMLUListElement>('[data-atlas-inspector-relations]');
  const inspectorNoRelations = inspector?.querySelector<HTMLElement>('[data-atlas-inspector-no-relations]');
  const inspectorProject = inspector?.querySelector<HTMLAnchorElement>('[data-atlas-inspector-project]');
  const inspectorRegister = inspector?.querySelector<HTMLAnchorElement>('[data-atlas-inspector-register]');
  const centerButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-center-selected]');
  const enterMapButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-enter-map]');
  const showAllRelations = controls?.querySelector<HTMLInputElement>('[data-atlas-show-all-relations]');
  const resetButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-reset]');
  const resetViewButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-reset-view]');
  const zoomInButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-zoom-in]');
  const zoomOutButton = controls?.querySelector<HTMLButtonElement>('[data-atlas-zoom-out]');

  const required = [
    controls, spatial, viewport, plane, summary, error, indexes, inspector, inspectorInstruction,
    inspectorContent, inspectorTitle, inspectorSummary, inspectorCategory, inspectorPeriod,
    inspectorMaintenance, inspectorEvidence, inspectorRelations, inspectorNoRelations,
    inspectorProject, inspectorRegister, centerButton, enterMapButton, showAllRelations,
    resetButton, resetViewButton, zoomInButton, zoomOutButton,
  ];

  const nodes: AtlasDomRecord[] = [...root.querySelectorAll<HTMLButtonElement>('[data-atlas-node]')].map((element) => ({
    element,
    id: element.dataset.recordId ?? '',
    slug: element.dataset.slug ?? '',
    href: element.dataset.href ?? '',
    title: element.dataset.title ?? '',
    shortTitle: element.textContent?.trim() ?? '',
    summary: element.dataset.summary ?? '',
    category: element.dataset.category as AtlasRecord['category'],
    categoryLabel: element.dataset.categoryLabel ?? '',
    world: element.dataset.category as AtlasRecord['world'],
    maintenance: element.dataset.maintenance as AtlasRecord['maintenance'],
    maintenanceLabel: element.dataset.maintenanceLabel ?? '',
    displayPeriod: element.dataset.displayPeriod || undefined,
    evidenceState: element.dataset.evidence as AtlasRecord['evidenceState'],
    evidenceLabel: element.dataset.evidenceLabel ?? '',
    defaultIndex: Number(element.dataset.defaultIndex ?? 0),
    searchText: element.dataset.search ?? '',
  }));
  const relations: AtlasDomRelation[] = [...root.querySelectorAll<SVGPathElement>('[data-atlas-relation]')].map((element) => ({
    element,
    id: element.dataset.relationId ?? '',
    sourceId: element.dataset.sourceId ?? '',
    targetId: element.dataset.targetId ?? '',
    type: element.dataset.relationType as AtlasRelation['type'],
    label: element.dataset.relationLabel ?? '',
    directional: element.hasAttribute('marker-end'),
    summary: element.dataset.relationSummary ?? '',
  }));

  let currentState: AtlasState = DEFAULT_ATLAS_STATE;
  let selectedId = '';
  const zoomSteps = [0.8, 1, 1.2, 1.4] as const;
  let zoomIndex = 1;
  const listeners: Array<() => void> = [];

  const setHidden = (element: Element, hidden: boolean): void => {
    element.toggleAttribute('hidden', hidden);
  };

  const restoreInspector = (): void => {
    selectedId = '';
    inspectorInstruction!.hidden = false;
    inspectorContent!.hidden = true;
    centerButton!.disabled = true;
    for (const node of nodes) node.element.setAttribute('aria-pressed', 'false');
  };

  const updateInspector = (record: AtlasDomRecord): void => {
    selectedId = record.id;
    inspectorInstruction!.hidden = true;
    inspectorContent!.hidden = false;
    inspectorTitle!.textContent = record.title;
    inspectorSummary!.textContent = record.summary;
    inspectorCategory!.textContent = record.categoryLabel;
    inspectorPeriod!.textContent = record.displayPeriod ?? '';
    inspectorPeriod!.closest('div')!.hidden = record.displayPeriod === undefined;
    inspectorMaintenance!.textContent = record.maintenanceLabel ?? '';
    inspectorMaintenance!.closest('div')!.hidden = !record.maintenanceLabel;
    inspectorEvidence!.textContent = record.evidenceLabel ?? '';
    inspectorEvidence!.closest('div')!.hidden = !record.evidenceLabel;
    inspectorProject!.href = record.href;
    inspectorProject!.textContent = `Open ${record.title}`;
    inspectorRegister!.href = `${getRegisterHrefFromAtlas(currentState)}#work-results`;
    inspectorRelations!.replaceChildren();
    const titleMap = new Map(nodes.map((node) => [node.id, node.title]));
    const connected = relations.filter(({ sourceId, targetId }) => sourceId === record.id || targetId === record.id);
    for (const relation of connected.slice(0, 8)) {
      const item = document.createElement('li');
      const sourceTitle = titleMap.get(relation.sourceId) ?? relation.sourceId;
      const targetTitle = titleMap.get(relation.targetId) ?? relation.targetId;
      item.textContent = `${relation.label}: ${sourceTitle} ${relation.directional ? '→' : '—'} ${targetTitle}. ${relation.summary}`;
      inspectorRelations!.append(item);
    }
    if (connected.length > 8) {
      const item = document.createElement('li');
      item.textContent = `${connected.length - 8} additional documented relations remain in the complete relation index.`;
      inspectorRelations!.append(item);
    }
    inspectorNoRelations!.hidden = connected.length !== 0;
    centerButton!.disabled = false;
    for (const node of nodes) node.element.setAttribute('aria-pressed', String(node.id === record.id));
  };

  const stateUrl = (state: AtlasState): string => {
    const query = serializeAtlasState(state);
    return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  };

  const updateViewLinks = (state: AtlasState): void => {
    const registerLink = root.querySelector<HTMLAnchorElement>('[data-register-view-link]');
    const atlasLink = root.querySelector<HTMLAnchorElement>('[data-atlas-view-link]');
    if (registerLink) registerLink.href = getRegisterHrefFromAtlas(state);
    if (atlasLink) atlasLink.href = stateUrl(state);
    if (inspectorRegister && selectedId) inspectorRegister.href = `${getRegisterHrefFromAtlas(state)}#work-results`;
  };

  const syncControls = (state: AtlasState): void => {
    const query = controls!.elements.namedItem('q');
    if (query instanceof HTMLInputElement) query.value = state.q;
    for (const input of controls!.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]')) {
      const values = state[input.name as 'category' | 'maintenance' | 'evidence' | 'relation'];
      input.checked = Array.isArray(values) && values.includes(input.value as never);
    }
  };

  const renderRelations = (visibleIds: ReadonlySet<string>, visibleRelationIds: ReadonlySet<string>): void => {
    const dense = root.dataset.edgePolicy === 'focused';
    const showAll = showAllRelations!.checked || !dense;
    for (const relation of relations) {
      const connectedToSelection = selectedId !== '' && (relation.sourceId === selectedId || relation.targetId === selectedId);
      const visible = visibleRelationIds.has(relation.id)
        && visibleIds.has(relation.sourceId)
        && visibleIds.has(relation.targetId)
        && (showAll || connectedToSelection);
      setHidden(relation.element, !visible);
      relation.element.toggleAttribute('data-selected-relation', connectedToSelection && visible);
    }
  };

  const render = (state: AtlasState, announce: boolean): void => {
    const filtered = filterAtlasData(nodes, relations, state);
    for (const node of nodes) node.element.hidden = !filtered.recordIds.has(node.id);
    if (selectedId && !filtered.recordIds.has(selectedId)) restoreInspector();
    const focusedRecord = nodes.find(({ id }) => id === filtered.focusedId);
    if (focusedRecord) updateInspector(focusedRecord);
    const visibleRelationIds = new Set(filtered.relations.map(({ id }) => id));
    renderRelations(filtered.recordIds, visibleRelationIds);
    const text = `Showing ${filtered.records.length} of ${nodes.length} public Work ${nodes.length === 1 ? 'record' : 'records'}.`;
    if (!announce || summary!.textContent !== text) summary!.textContent = text;
    updateViewLinks(state);
  };

  const formState = (): AtlasState => {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(controls!).entries()) {
      if (typeof value === 'string') params.append(name, value);
    }
    if (currentState.focus) params.set('focus', currentState.focus);
    return parseAtlasState(params, nodes.map(({ slug }) => slug));
  };

  const transition = (state: AtlasState, mode: 'push' | 'replace' | 'none', announce: boolean): void => {
    currentState = normalizeAtlasState(state, nodes.map(({ slug }) => slug));
    syncControls(currentState);
    render(currentState, announce);
    const url = stateUrl(currentState);
    if (mode === 'push') history.pushState(null, '', url);
    if (mode === 'replace') history.replaceState(null, '', url);
  };

  const selectRecord = (record: AtlasDomRecord, mode: 'replace' | 'none' = 'replace'): void => {
    updateInspector(record);
    currentState = normalizeAtlasState({ ...currentState, focus: record.slug }, nodes.map(({ slug }) => slug));
    render(currentState, false);
    if (mode === 'replace') history.replaceState(null, '', stateUrl(currentState));
  };

  const applyZoom = (): void => {
    const zoom = zoomSteps[zoomIndex]!;
    plane!.style.setProperty('--_atlas-zoom', String(zoom));
    root.dataset.atlasZoom = String(zoom);
    zoomOutButton!.disabled = zoomIndex === 0;
    zoomInButton!.disabled = zoomIndex === zoomSteps.length - 1;
  };

  const centerSelected = (): void => {
    const node = nodes.find(({ id }) => id === selectedId);
    if (!node || node.element.hidden) return;
    const zoom = zoomSteps[zoomIndex]!;
    const x = Number(node.element.dataset.x ?? 0) * zoom;
    const y = Number(node.element.dataset.y ?? 0) * zoom;
    const nodeWidth = node.element.offsetWidth * zoom;
    const nodeHeight = node.element.offsetHeight * zoom;
    viewport!.scrollTo({
      left: Math.max(0, x + nodeWidth / 2 - viewport!.clientWidth / 2),
      top: Math.max(0, y + nodeHeight / 2 - viewport!.clientHeight / 2),
      behavior: 'auto',
    });
  };

  const visibleNodes = (): AtlasDomRecord[] => nodes.filter(({ element }) => !element.hidden);

  const enterMap = (): void => {
    const target = nodes.find(({ id, element }) => id === selectedId && !element.hidden) ?? visibleNodes()[0];
    if (!target) return;
    for (const node of nodes) node.element.tabIndex = node.id === target.id ? 0 : -1;
    target.element.focus();
  };

  const moveMapFocus = (current: AtlasDomRecord, key: string): void => {
    const currentX = Number(current.element.dataset.x ?? 0);
    const currentY = Number(current.element.dataset.y ?? 0);
    const candidates = visibleNodes().filter(({ id }) => id !== current.id).flatMap((candidate) => {
      const dx = Number(candidate.element.dataset.x ?? 0) - currentX;
      const dy = Number(candidate.element.dataset.y ?? 0) - currentY;
      const permitted = key === 'ArrowLeft' ? dx < 0
        : key === 'ArrowRight' ? dx > 0
          : key === 'ArrowUp' ? dy < 0
            : dy > 0;
      if (!permitted) return [];
      const primary = key === 'ArrowLeft' || key === 'ArrowRight' ? Math.abs(dx) : Math.abs(dy);
      const secondary = key === 'ArrowLeft' || key === 'ArrowRight' ? Math.abs(dy) : Math.abs(dx);
      return [{ candidate, score: primary + secondary / 4 }];
    }).sort((left, right) => left.score - right.score || left.candidate.defaultIndex - right.candidate.defaultIndex);
    const target = candidates[0]?.candidate;
    if (!target) return;
    current.element.tabIndex = -1;
    target.element.tabIndex = 0;
    target.element.focus();
  };

  const failOpen = (): void => {
    for (const node of nodes) {
      node.element.hidden = false;
      node.element.tabIndex = -1;
      node.element.setAttribute('aria-pressed', 'false');
    }
    for (const relation of relations) setHidden(relation.element, false);
    controls!.hidden = true;
    spatial!.hidden = true;
    indexes!.open = true;
    error!.hidden = false;
    plane!.style.setProperty('--_atlas-zoom', '1');
    summary!.textContent = `${nodes.length} public Work ${nodes.length === 1 ? 'record' : 'records'}.`;
    root.dataset.atlasEnhanced = 'false';
    root.dataset.atlasFailed = 'true';
    restoreInspector();
  };

  if (required.some((value) => value === null || value === undefined) || nodes.length === 0) {
    delete root.dataset.atlasInitialized;
    continue;
  }

  const onSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    try { transition(formState(), 'push', true); } catch { failOpen(); }
  };
  const onReset = (): void => {
    restoreInspector();
    transition(DEFAULT_ATLAS_STATE, 'push', true);
  };
  const onPopState = (): void => {
    try {
      const state = parseAtlasState(window.location.search, nodes.map(({ slug }) => slug));
      transition(state, stateUrl(state) === `${window.location.pathname}${window.location.search}${window.location.hash}` ? 'none' : 'replace', true);
    } catch { failOpen(); }
  };
  const onResetView = (): void => {
    zoomIndex = 1;
    applyZoom();
    viewport!.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  };
  const onZoomIn = (): void => { zoomIndex = Math.min(zoomSteps.length - 1, zoomIndex + 1); applyZoom(); };
  const onZoomOut = (): void => { zoomIndex = Math.max(0, zoomIndex - 1); applyZoom(); };
  const onShowAll = (): void => render(currentState, false);
  const onPageHide = (): void => {
    for (const remove of listeners.splice(0)) remove();
    delete root.dataset.atlasInitialized;
  };

  const listen = <K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: (event: HTMLElementEventMap[K]) => void): void => {
    element.addEventListener(type, listener as EventListener);
    listeners.push(() => element.removeEventListener(type, listener as EventListener));
  };

  listen(controls!, 'submit', onSubmit as (event: Event) => void);
  listen(resetButton!, 'click', onReset);
  listen(resetViewButton!, 'click', onResetView);
  listen(zoomInButton!, 'click', onZoomIn);
  listen(zoomOutButton!, 'click', onZoomOut);
  listen(centerButton!, 'click', centerSelected);
  listen(enterMapButton!, 'click', enterMap);
  listen(showAllRelations!, 'change', onShowAll);
  for (const record of nodes) {
    listen(record.element, 'click', () => selectRecord(record));
    listen(record.element, 'keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault();
          moveMapFocus(record, event.key);
          break;
        case 'Escape':
          event.preventDefault();
          for (const node of nodes) node.element.tabIndex = -1;
          enterMapButton!.focus();
          break;
      }
    });
  }
  window.addEventListener('popstate', onPopState);
  listeners.push(() => window.removeEventListener('popstate', onPopState));
  window.addEventListener('pagehide', onPageHide, { once: true });

  try {
    const initial = parseAtlasState(window.location.search, nodes.map(({ slug }) => slug));
    syncControls(initial);
    currentState = initial;
    render(initial, false);
    applyZoom();
    controls!.hidden = false;
    spatial!.hidden = false;
    error!.hidden = true;
    root.dataset.atlasEnhanced = 'true';
    delete root.dataset.atlasFailed;
    root.dataset.atlasInitMs = (performance.now() - initializationStarted).toFixed(3);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (stateUrl(initial) !== currentUrl) history.replaceState(null, '', stateUrl(initial));
  } catch {
    failOpen();
  }
}
