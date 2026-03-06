import {
  compileDiagram,
  compileFireAlarmDiagram,
  compileHvacDiagram,
  compileLightingControlDiagram,
  compileNetworkDiagram,
  parseDiagram,
  renderFireAlarmSvg,
  renderHvacSvg,
  renderLightingControlSvg,
  renderNetworkSvg,
  renderSvg,
} from './index';
import type { LaneDiagramLayout } from './lane-renderer';
import {
  electricalPrimaryFeeders,
  electricalShowcaseSource,
  fireAlarmShowcaseSource,
  fireAlarmSystems,
  hvacShowcaseSource,
  hvacSystems,
  lightingControlShowcaseSource,
  lightingControlSystems,
  networkShowcaseSource,
  networkSystems,
  type ShowcaseDetail,
} from './showcase-data';
import { siteVersion } from './version';

type ElectricalLayout = ReturnType<typeof compileDiagram>;
type DemoLayout = ElectricalLayout | LaneDiagramLayout;

interface ShowcaseMetric {
  label: string;
  note: string;
  value(layout: DemoLayout): number | string;
}

interface LandingMetric {
  label: string;
  note: string;
  value: number | string;
}

interface ShowcaseTagGroup {
  eyebrow: string;
  title: string;
  resolve(layout: DemoLayout): string[];
}

interface ShowcaseDefinition {
  id: string;
  tabLabel: string;
  sectionTitle: string;
  sourceTitle: string;
  source: string;
  downloadBase: string;
  detailsEyebrow: string;
  detailsTitle: string;
  details: ShowcaseDetail[];
  tagGroupA: ShowcaseTagGroup;
  tagGroupB: ShowcaseTagGroup;
  libraryEyebrow: string;
  libraryTitle: string;
  libraryTags: string[];
  proofEyebrow: string;
  proofTitle: string;
  proofPoints: string[];
  diagramTitle: string;
  diagramNote: string;
  metrics: ShowcaseMetric[];
  summary(layout: DemoLayout): string;
  render(source: string): { layout: DemoLayout; svg: string };
}

const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-demo-tab]'));
const activeSectionTitleEl = document.getElementById('activeSectionTitle');
const activeSummaryEl = document.getElementById('activeSummary');
const detailEyebrowEl = document.getElementById('detailEyebrow');
const detailTitleEl = document.getElementById('detailTitle');
const detailListEl = document.getElementById('detailList');
const tagGroupAEyebrowEl = document.getElementById('tagGroupAEyebrow');
const tagGroupATitleEl = document.getElementById('tagGroupATitle');
const tagGroupAListEl = document.getElementById('tagGroupAList');
const tagGroupBEyebrowEl = document.getElementById('tagGroupBEyebrow');
const tagGroupBTitleEl = document.getElementById('tagGroupBTitle');
const tagGroupBListEl = document.getElementById('tagGroupBList');
const libraryEyebrowEl = document.getElementById('libraryEyebrow');
const libraryTitleEl = document.getElementById('libraryTitle');
const libraryTagListEl = document.getElementById('libraryTagList');
const proofEyebrowEl = document.getElementById('proofEyebrow');
const proofTitleEl = document.getElementById('proofTitle');
const proofListEl = document.getElementById('proofList');
const diagramTitleEl = document.getElementById('diagramTitle');
const diagramNoteEl = document.getElementById('diagramNote');
const diagramEl = document.getElementById('activeDiagram');
const diagramViewportEl = document.getElementById('diagramViewport');
const sourceTitleEl = document.getElementById('sourceTitle');
const sourceCodeEl = document.querySelector('#sourceCode code');
const footerVersionEl = document.getElementById('footerVersion');
const saveSvgButton = document.getElementById('saveActiveSvg');
const savePngButton = document.getElementById('saveActivePng');
const zoomValueEl = document.getElementById('diagramZoomValue');
const zoomOutButton = document.getElementById('zoomOutDiagram');
const zoomInButton = document.getElementById('zoomInDiagram');
const zoomActualButton = document.getElementById('zoomActualDiagram');
const zoomFitButton = document.getElementById('zoomFitDiagram');

const metricElements = Array.from({ length: 4 }, (_, index) => ({
  label: document.querySelector<HTMLElement>(`[data-metric-label="${index}"]`),
  value: document.querySelector<HTMLElement>(`[data-metric-value="${index}"]`),
  note: document.querySelector<HTMLElement>(`[data-metric-note="${index}"]`),
}));

const TOOL_CONNECTION_STYLE_COUNT = 42;
const TOOL_LAYOUT_BAND_COUNT = 31;
const ZOOM_STEP = 1.2;
const MIN_ZOOM_MULTIPLIER = 0.1;
const MAX_ZOOM_MULTIPLIER = 16;

const diagramZoomState = {
  naturalWidth: 0,
  naturalHeight: 0,
  fitScale: 1,
  zoomMultiplier: 1,
};

const showcases: ShowcaseDefinition[] = [
  {
    id: 'electrical',
    tabLabel: 'Electrical',
    sectionTitle: 'Electrical power modeled as maintainable source',
    sourceTitle: 'Electrical source model behind this view',
    source: electricalShowcaseSource,
    downloadBase: 'diagjs-electrical',
    detailsEyebrow: 'Use Case',
    detailsTitle: 'Distribution groups carried in this model',
    details: electricalPrimaryFeeders,
    tagGroupA: {
      eyebrow: 'Key Semantics',
      title: 'Electrical levels surfaced directly from source',
      resolve(layout) {
        return collectParamValues(layout.nodes, ['voltage', 'secondary', 'system']);
      },
    },
    tagGroupB: {
      eyebrow: 'Layout Rules',
      title: 'Renderer behaviors applied to the one-line',
      resolve() {
        return ['Source-only terminals', 'Assembly buses', 'Feeder buckets', 'Voltage strata', 'Wire legend', 'Detailed glyphs'];
      },
    },
    libraryEyebrow: 'Shipped Coverage',
    libraryTitle: 'Representative electrical and connected equipment',
    libraryTags: [
      'Utility',
      'Transformer',
      'Switchboard',
      'Panel',
      'MCC',
      'Generator',
      'Breaker',
      'Disconnect',
      'Fuse',
      'ATS',
      'UPS',
      'Battery',
      'PV',
      'Inverter',
      'Meter',
      'Capacitor',
      'Relay',
      'Ground',
      'Busway',
      'Chiller',
      'Pump',
      'Fan',
      'HVAC',
      'RTU',
      'Boiler',
      'Elevator',
    ],
    proofEyebrow: 'Why It Matters',
    proofTitle: 'What this renderer contributes to the platform',
    proofPoints: [
      'A compact DSL can describe utility service, transformation, distribution, and downstream loads without dropping into manual SVG editing.',
      'Assemblies render as structured equipment groups, which makes the output closer to engineering deliverables and leaves room for richer internal detail as the library expands.',
      'Voltage and system metadata stay attached to the equipment that owns them, supporting review today and stronger validation rules later.',
      'The example already mixes electrical distribution with connected building loads, which is the direction the platform needs for broader coordination workflows.',
    ],
    diagramTitle: 'Electrical one-line generated from source',
    diagramNote: 'Study the source on the left, inspect the rendered one-line on the right, and use zoom or export controls while reviewing.',
    metrics: [
      { label: 'Nodes', note: 'distribution devices and end loads in the single-line demo', value: (layout) => layout.nodes.length },
      { label: 'Runs', note: 'hierarchy-routed feeder runs through the electrical example', value: (layout) => layout.edges.length },
      { label: 'Voltages', note: 'distinct service and utilization levels surfaced from params', value: (layout) => collectParamValues(layout.nodes, ['voltage', 'secondary', 'system']).length },
      { label: 'Assemblies', note: 'major distribution groupings highlighted in the sidebar', value: () => electricalPrimaryFeeders.length },
    ],
    summary(layout) {
      return `${layout.nodes.length} devices and ${layout.edges.length} feeder relationships show how Diag.JS turns a terse power model into a readable one-line that is structured for reuse, review, and future validation.`;
    },
    render(source) {
      const layout = compileDiagram(parseDiagram(source));
      return { layout, svg: renderSvg(layout) };
    },
  },
  {
    id: 'hvac',
    tabLabel: 'HVAC',
    sectionTitle: 'Mechanical systems modeled as coordinated schematic source',
    sourceTitle: 'HVAC source model behind this view',
    source: hvacShowcaseSource,
    downloadBase: 'diagjs-hvac',
    detailsEyebrow: 'Use Case',
    detailsTitle: 'Airside, hydronic, and controls groups in this model',
    details: hvacSystems,
    tagGroupA: {
      eyebrow: 'Key Semantics',
      title: 'Air and water services differentiated by the renderer',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Layout Rules',
      title: 'Bands used to keep the schematic legible',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Shipped Coverage',
    libraryTitle: 'Representative mechanical components',
    libraryTags: [
      'Louver',
      'ERV',
      'Mixing Box',
      'Filter',
      'Cooling Coil',
      'Heating Coil',
      'Humidifier',
      'Supply Fan',
      'VAV',
      'FCU',
      'Diffuser',
      'Return Grille',
      'Chiller',
      'Cooling Tower',
      'Boiler',
      'Pump',
      'Strainer',
      'Control Valve',
      'Separator',
      'Expansion Tank',
      'BMS',
    ],
    proofEyebrow: 'Why It Matters',
    proofTitle: 'What this renderer contributes to the platform',
    proofPoints: [
      'One source model can carry plant equipment, airside equipment, hydronic loops, terminal devices, and controls on the same sheet.',
      'Return paths and looped services are preserved as schematic routes instead of forcing the model into a feeder-only tree.',
      'Lane, column, and slot controls give authors predictable placement now and provide a stable contract for richer layout tooling later.',
      'Mechanical-specific symbols keep the output readable for designers while the underlying language stays consistent with the rest of the platform.',
    ],
    diagramTitle: 'HVAC schematic generated from source',
    diagramNote: 'The renderer separates plant, airside, return, terminal, and controls content so larger mechanical diagrams stay readable as the library grows.',
    metrics: [
      { label: 'Components', note: 'mechanical devices rendered on dedicated schematic bands', value: (layout) => layout.nodes.length },
      { label: 'Media', note: 'distinct duct and piping services styled independently', value: (layout) => getLaneMediaCount(layout) },
      { label: 'Bands', note: 'discipline lanes visible on the drawing', value: (layout) => getLaneCount(layout) },
      { label: 'Returns', note: 'reverse-routed return and loop connections retained in the example', value: (layout) => countReversedEdges(layout) },
    ],
    summary(layout) {
      return `${layout.nodes.length} HVAC components are arranged across ${getLaneCount(layout)} bands, showing how the shared DSL can support coordinated mechanical schematics without giving up discipline-specific notation.`;
    },
    render(source) {
      const layout = compileHvacDiagram(source);
      return { layout, svg: renderHvacSvg(layout) };
    },
  },
  {
    id: 'network',
    tabLabel: 'Network',
    sectionTitle: 'Network infrastructure modeled as diagram code',
    sourceTitle: 'Network source model behind this view',
    source: networkShowcaseSource,
    downloadBase: 'diagjs-network',
    detailsEyebrow: 'Use Case',
    detailsTitle: 'Backbone, service, compute, storage, and edge groups',
    details: networkSystems,
    tagGroupA: {
      eyebrow: 'Key Semantics',
      title: 'Link classes surfaced by the renderer',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Layout Rules',
      title: 'Bands used to separate infrastructure roles',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Shipped Coverage',
    libraryTitle: 'Representative network equipment',
    libraryTags: [
      'Carrier Cloud',
      'WAN Router',
      'Core Switch',
      'Spine Switch',
      'Leaf Switch',
      'Firewall',
      'Load Balancer',
      'Service Cluster',
      'Virtualization Cluster',
      'GPU Cluster',
      'SAN Switch',
      'Storage Array',
      'Backup Appliance',
      'Management Switch',
      'Building Gateway',
      'IDF Switch',
      'Access Stack',
      'Wireless Controller',
      'Security Stack',
    ],
    proofEyebrow: 'Why It Matters',
    proofTitle: 'What this renderer contributes to the platform',
    proofPoints: [
      'The same text-first workflow can describe carrier ingress, campus backbone, security, shared services, compute fabric, storage, and building edge.',
      'Connection media remain explicit, which makes backbone, fabric, management, wireless, and security links reviewable instead of implied.',
      'Recognizable device glyphs make the output useful for infrastructure planning now while leaving room for deeper topology rules later.',
      'The example shows how Diag.JS can evolve beyond building services into broader infrastructure diagramming without inventing a new authoring model.',
    ],
    diagramTitle: 'Network architecture generated from source',
    diagramNote: 'This example keeps backbone, services, compute, storage, and edge layers separate so a large network can still be reviewed as one coordinated diagram.',
    metrics: [
      { label: 'Nodes', note: 'network devices and infrastructure groups on the schematic', value: (layout) => layout.nodes.length },
      { label: 'Links', note: 'transport links across the routed architecture', value: (layout) => layout.edges.length },
      { label: 'Media', note: 'distinct link classes carried in the legend', value: (layout) => getLaneMediaCount(layout) },
      { label: 'Edge Sites', note: 'building and user-edge nodes attached to the campus fabric', value: (layout) => countNodesByLane(layout, ['building', 'edge']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} infrastructure nodes and ${layout.edges.length} routed links show how the platform can scale from building edge networks to data-centre and campus architecture within the same authoring model.`;
    },
    render(source) {
      const layout = compileNetworkDiagram(source);
      return { layout, svg: renderNetworkSvg(layout) };
    },
  },
  {
    id: 'fire-alarm',
    tabLabel: 'Fire Alarm',
    sectionTitle: 'Fire alarm architecture modeled from command to field',
    sourceTitle: 'Fire alarm source model behind this view',
    source: fireAlarmShowcaseSource,
    downloadBase: 'diagjs-fire-alarm',
    detailsEyebrow: 'Use Case',
    detailsTitle: 'Command, network, panel, and field groups in this model',
    details: fireAlarmSystems,
    tagGroupA: {
      eyebrow: 'Key Semantics',
      title: 'Circuit classes surfaced by the renderer',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Layout Rules',
      title: 'Bands used to separate fire alarm roles',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Shipped Coverage',
    libraryTitle: 'Representative head-end, panel, and field devices',
    libraryTags: [
      'Command Center',
      'Distributed Node',
      'FACP',
      'Power Supply',
      'Annunciator',
      'Repeater',
      'Telephone Master',
      'Duct Detector',
      'Monitor Module',
      'Control Module',
      'NAC Extender',
      'Horn / Strobe',
      'Speaker / Strobe',
      'Smoke Detector',
      'Heat Detector',
      'Pull Station',
      'Flow Switch',
      'Tamper Switch',
      'Beam Detector',
      'Aspirating Detector',
      'Releasing Panel',
      'Smoke Control',
      'Elevator Recall',
    ],
    proofEyebrow: 'Why It Matters',
    proofTitle: 'What this renderer contributes to the platform',
    proofPoints: [
      'A single model can span command head-end, peer nodes, FACPs, annunciation, loops, notification, and specialty interfaces.',
      'Notification, SLC, supervisory, releasing, and network paths stay distinct, which is essential for clear review and future rule enforcement.',
      'Dedicated symbols keep panels, interfaces, and field devices readable without flattening the system into generic boxes.',
      'The layered layout shows how Diag.JS can grow toward more rigorous life-safety documentation while still using the shared core language.',
    ],
    diagramTitle: 'Fire alarm system generated from source',
    diagramNote: 'The renderer separates command, network, panel, annunciation, notification, specialty, and field layers so large systems remain legible.',
    metrics: [
      { label: 'Nodes', note: 'head-end, nodes, panels, interfaces, and devices in the example', value: (layout) => layout.nodes.length },
      { label: 'Circuits', note: 'network, loop, notification, and specialty paths shown', value: (layout) => layout.edges.length },
      { label: 'Panels', note: 'distributed panel and power-supply devices in the drawing', value: (layout) => countNodesByLane(layout, ['panels']) },
      { label: 'Field Devices', note: 'field and notification endpoints driven from the system', value: (layout) => countNodesByLane(layout, ['field', 'notification']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} devices and interfaces show how the shared DSL can represent campus-scale fire alarm architecture from head-end command through panels and field appliances.`;
    },
    render(source) {
      const layout = compileFireAlarmDiagram(source);
      return { layout, svg: renderFireAlarmSvg(layout) };
    },
  },
  {
    id: 'lighting-control',
    tabLabel: 'Lighting Control',
    sectionTitle: 'Lighting control modeled across enterprise, room, and field layers',
    sourceTitle: 'Lighting control source model behind this view',
    source: lightingControlShowcaseSource,
    downloadBase: 'diagjs-lighting-control',
    detailsEyebrow: 'Use Case',
    detailsTitle: 'Head-end, panel, room, and fixture groups in this model',
    details: lightingControlSystems,
    tagGroupA: {
      eyebrow: 'Key Semantics',
      title: 'Control media surfaced by the renderer',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Layout Rules',
      title: 'Bands used to organize the control stack',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Shipped Coverage',
    libraryTitle: 'Representative control, sensing, and load devices',
    libraryTags: [
      'Head-End Server',
      'Gateway',
      'Backbone Switch',
      'Relay Panel',
      'Dimming Panel',
      'Area Controller',
      'Room Controller',
      'Shade Controller',
      'Wallstation',
      'Scene Station',
      'Occupancy Sensor',
      'Daylight Sensor',
      'Photocell',
      'Fixture Group',
      'Emergency Interface',
    ],
    proofEyebrow: 'Why It Matters',
    proofTitle: 'What this renderer contributes to the platform',
    proofPoints: [
      'The source model can cover enterprise head-end, gateways, panels, room controls, sensors, fixtures, exterior lighting, and emergency interfaces together.',
      'Ethernet, DALI, 0-10V, relay, sensor, exterior, and emergency links each remain visible as first-class control media.',
      'The output reads like lighting control documentation rather than a generic network graph, which makes the diagrams usable now.',
      'This renderer demonstrates how future systems can layer protocol semantics and device-specific symbols onto the shared platform without forking the DSL.',
    ],
    diagramTitle: 'Lighting control architecture generated from source',
    diagramNote: 'The example keeps enterprise, panel, room, sensor, fixture, exterior, and emergency layers readable while using the same core authoring model.',
    metrics: [
      { label: 'Nodes', note: 'controllers, cabinets, sensors, and loads on the sheet', value: (layout) => layout.nodes.length },
      { label: 'Control Paths', note: 'backbone, room-control, and fixture-control links', value: (layout) => layout.edges.length },
      { label: 'Panels', note: 'relay and dimming cabinets represented in the example', value: (layout) => countNodesByLane(layout, ['panel']) },
      { label: 'Lighting Loads', note: 'fixture and exterior load groups coordinated by the system', value: (layout) => countNodesByLane(layout, ['fixture', 'exterior']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} devices coordinate head-end software, panels, room controls, sensors, fixtures, exterior lighting, and emergency interfaces, illustrating how the platform can grow into richer controls documentation.`;
    },
    render(source) {
      const layout = compileLightingControlDiagram(source);
      return { layout, svg: renderLightingControlSvg(layout) };
    },
  },
];

const showcaseById = new Map(showcases.map((showcase) => [showcase.id, showcase]));
const renderCache = new Map<string, { layout: DemoLayout; svg: string }>();
const landingMetrics = createLandingMetrics(showcases);
let activeShowcaseId = showcases[0]?.id ?? 'electrical';

wireTabs();
wireDownloadButtons();
wireZoomButtons();
observeDiagramViewport();
renderLandingMetrics();
renderFooterVersion();
activateShowcase(resolveInitialShowcaseId(), false);
window.addEventListener('hashchange', () => {
  activateShowcase(resolveInitialShowcaseId(), false);
});

function wireTabs(): void {
  for (const button of tabButtons) {
    button.addEventListener('click', () => {
      const showcaseId = button.dataset.demoTab;
      if (showcaseId) {
        activateShowcase(showcaseId, true);
      }
    });
  }
}

function activateShowcase(showcaseId: string, syncHash: boolean): void {
  const showcase = showcaseById.get(showcaseId) ?? showcases[0];
  if (!showcase) {
    return;
  }

  activeShowcaseId = showcase.id;
  updateTabState(showcase.id);
  if (syncHash) {
    syncLocationHash(showcase.id);
  }

  if (!activeSectionTitleEl || !activeSummaryEl || !detailEyebrowEl || !detailTitleEl || !detailListEl || !tagGroupAEyebrowEl || !tagGroupATitleEl || !tagGroupAListEl || !tagGroupBEyebrowEl || !tagGroupBTitleEl || !tagGroupBListEl || !libraryEyebrowEl || !libraryTitleEl || !libraryTagListEl || !proofEyebrowEl || !proofTitleEl || !proofListEl || !diagramTitleEl || !diagramNoteEl || !diagramEl || !sourceTitleEl || !sourceCodeEl) {
    return;
  }

  activeSectionTitleEl.textContent = showcase.sectionTitle;
  detailEyebrowEl.textContent = showcase.detailsEyebrow;
  detailTitleEl.textContent = showcase.detailsTitle;
  tagGroupAEyebrowEl.textContent = showcase.tagGroupA.eyebrow;
  tagGroupATitleEl.textContent = showcase.tagGroupA.title;
  tagGroupBEyebrowEl.textContent = showcase.tagGroupB.eyebrow;
  tagGroupBTitleEl.textContent = showcase.tagGroupB.title;
  libraryEyebrowEl.textContent = showcase.libraryEyebrow;
  libraryTitleEl.textContent = showcase.libraryTitle;
  proofEyebrowEl.textContent = showcase.proofEyebrow;
  proofTitleEl.textContent = showcase.proofTitle;
  diagramTitleEl.textContent = showcase.diagramTitle;
  diagramNoteEl.textContent = showcase.diagramNote;
  sourceTitleEl.textContent = showcase.sourceTitle;
  sourceCodeEl.textContent = showcase.source;

  try {
    const rendered = getRenderedShowcase(showcase);
    const labelMap = new Map<string, string>(rendered.layout.nodes.map((node): [string, string] => [node.id, node.label]));

    activeSummaryEl.textContent = showcase.summary(rendered.layout);
    diagramEl.innerHTML = rendered.svg;
    resetDiagramZoom();
    detailListEl.replaceChildren(...showcase.details.map((detail) => createDetailItem(labelMap.get(detail.id) ?? detail.id, detail.detail)));
    tagGroupAListEl.replaceChildren(...showcase.tagGroupA.resolve(rendered.layout).map(createTag));
    tagGroupBListEl.replaceChildren(...showcase.tagGroupB.resolve(rendered.layout).map(createTag));
    libraryTagListEl.replaceChildren(...showcase.libraryTags.map(createTag));
    proofListEl.replaceChildren(...showcase.proofPoints.map(createBulletItem));
  } catch (error) {
    activeSummaryEl.textContent = error instanceof Error ? error.message : String(error);
    detailListEl.replaceChildren();
    tagGroupAListEl.replaceChildren();
    tagGroupBListEl.replaceChildren();
    libraryTagListEl.replaceChildren(...showcase.libraryTags.map(createTag));
    proofListEl.replaceChildren(...showcase.proofPoints.map(createBulletItem));
    renderError(diagramEl, error);
    clearDiagramZoom();
  }
}

function updateTabState(activeId: string): void {
  for (const button of tabButtons) {
    const isActive = button.dataset.demoTab === activeId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  }
}

function getRenderedShowcase(showcase: ShowcaseDefinition): { layout: DemoLayout; svg: string } {
  const cached = renderCache.get(showcase.id);
  if (cached) {
    return cached;
  }

  const rendered = showcase.render(showcase.source);
  renderCache.set(showcase.id, rendered);
  return rendered;
}

function renderLandingMetrics(): void {
  landingMetrics.forEach((metric, index) => {
    const target = metricElements[index];
    if (!target) {
      return;
    }
    if (target.label) target.label.textContent = metric.label;
    if (target.value) target.value.textContent = String(metric.value);
    if (target.note) target.note.textContent = metric.note;
  });
}

function createLandingMetrics(definitions: ShowcaseDefinition[]): LandingMetric[] {
  return [
    {
      label: 'Supported Systems',
      value: definitions.length,
      note: 'renderer families currently shipped across the platform',
    },
    {
      label: 'Device Families',
      value: countUniqueText(definitions.flatMap((definition) => definition.libraryTags)),
      note: 'named equipment and device families available in the shipped libraries',
    },
    {
      label: 'Connection Semantics',
      value: TOOL_CONNECTION_STYLE_COUNT,
      note: 'visual and logical connection treatments encoded by the renderers',
    },
    {
      label: 'Layout Bands',
      value: TOOL_LAYOUT_BAND_COUNT,
      note: 'reusable lane definitions used by the band-aware systems',
    },
  ];
}

function resolveInitialShowcaseId(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return showcaseById.has(hash) ? hash : activeShowcaseId;
}

function syncLocationHash(showcaseId: string): void {
  const url = `${window.location.pathname}${window.location.search}#${showcaseId}`;
  window.history.replaceState(null, '', url);
}

function renderFooterVersion(): void {
  if (footerVersionEl) {
    footerVersionEl.textContent = siteVersion;
  }
}

function wireDownloadButtons(): void {
  saveSvgButton?.addEventListener('click', () => {
    const showcase = showcaseById.get(activeShowcaseId);
    if (showcase) {
      void saveDiagramSvg('activeDiagram', `${showcase.downloadBase}.svg`);
    }
  });

  savePngButton?.addEventListener('click', () => {
    const showcase = showcaseById.get(activeShowcaseId);
    if (showcase) {
      void saveDiagramPng('activeDiagram', `${showcase.downloadBase}.png`);
    }
  });
}

function wireZoomButtons(): void {
  zoomOutButton?.addEventListener('click', () => {
    adjustDiagramZoom(1 / ZOOM_STEP);
  });

  zoomInButton?.addEventListener('click', () => {
    adjustDiagramZoom(ZOOM_STEP);
  });

  zoomActualButton?.addEventListener('click', () => {
    if (diagramZoomState.fitScale > 0) {
      setDiagramZoomMultiplier(1 / diagramZoomState.fitScale, { recenter: true });
    }
  });

  zoomFitButton?.addEventListener('click', () => {
    resetDiagramZoom();
  });

  diagramViewportEl?.addEventListener(
    'wheel',
    (event) => {
      if (!(event.ctrlKey || event.metaKey) || !diagramEl?.querySelector('svg')) {
        return;
      }

      event.preventDefault();
      const rect = diagramViewportEl.getBoundingClientRect();
      adjustDiagramZoom(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, {
        anchorX: diagramViewportEl.scrollLeft + event.clientX - rect.left,
        anchorY: diagramViewportEl.scrollTop + event.clientY - rect.top,
      });
    },
    { passive: false },
  );
}

function observeDiagramViewport(): void {
  if (!diagramViewportEl) {
    return;
  }

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(() => {
      if (diagramEl?.querySelector('svg')) {
        refreshDiagramZoom(false);
      }
    });
    observer.observe(diagramViewportEl);
    return;
  }

  window.addEventListener('resize', () => {
    if (diagramEl?.querySelector('svg')) {
      refreshDiagramZoom(false);
    }
  });
}

async function saveDiagramSvg(containerId: string, fileName: string): Promise<void> {
  const markup = getSerializedSvg(containerId);
  if (!markup) {
    return;
  }

  const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), fileName);
}

async function saveDiagramPng(containerId: string, fileName: string): Promise<void> {
  const markup = getSerializedSvg(containerId);
  if (!markup) {
    return;
  }

  const image = new Image();
  const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    image.src = objectUrl;
    await image.decode();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  triggerDownload(canvas.toDataURL('image/png'), fileName);
}

function getSerializedSvg(containerId: string): string | null {
  const container = document.getElementById(containerId);
  const svg = container?.querySelector('svg');
  if (!svg) {
    return null;
  }

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.style.removeProperty('width');
  clone.style.removeProperty('height');
  return new XMLSerializer().serializeToString(clone);
}

function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  if (url.startsWith('blob:')) {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function createDetailItem(nameText: string, detailText: string): HTMLLIElement {
  const item = document.createElement('li');
  const name = document.createElement('span');
  const detail = document.createElement('span');
  name.className = 'branch-name';
  name.textContent = nameText;
  detail.className = 'branch-detail';
  detail.textContent = detailText;
  item.append(name, detail);
  return item;
}

function createBulletItem(text: string): HTMLLIElement {
  const item = document.createElement('li');
  item.textContent = text;
  return item;
}

function createTag(text: string): HTMLSpanElement {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = text;
  return tag;
}

function renderError(target: HTMLElement, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  target.innerHTML = `<p style="color:#b91c1c; padding:1rem;">Render error: ${message}</p>`;
}

function resetDiagramZoom(): void {
  diagramZoomState.zoomMultiplier = 1;
  refreshDiagramZoom(true);
}

function refreshDiagramZoom(recenter: boolean): void {
  const svg = diagramEl?.querySelector<SVGSVGElement>('svg');
  if (!svg || !diagramViewportEl || !diagramEl) {
    clearDiagramZoom();
    return;
  }

  const naturalWidth = getSvgLength(svg, 'width') ?? svg.viewBox.baseVal.width;
  const naturalHeight = getSvgLength(svg, 'height') ?? svg.viewBox.baseVal.height;
  if (!naturalWidth || !naturalHeight) {
    clearDiagramZoom();
    return;
  }

  const previousScale = getDiagramScale();
  const { width: viewportWidth, height: viewportHeight } = getDiagramViewportSize();
  const fitScale = Math.min(viewportWidth / naturalWidth, viewportHeight / naturalHeight);

  diagramZoomState.naturalWidth = naturalWidth;
  diagramZoomState.naturalHeight = naturalHeight;
  diagramZoomState.fitScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;

  if (recenter) {
    diagramZoomState.zoomMultiplier = 1;
  } else {
    diagramZoomState.zoomMultiplier = clamp(diagramZoomState.zoomMultiplier, MIN_ZOOM_MULTIPLIER, MAX_ZOOM_MULTIPLIER);
  }

  applyDiagramZoom(previousScale, { recenter });
}

function adjustDiagramZoom(factor: number, anchor?: { anchorX: number; anchorY: number }): void {
  setDiagramZoomMultiplier(diagramZoomState.zoomMultiplier * factor, anchor);
}

function setDiagramZoomMultiplier(nextMultiplier: number, options: { anchorX?: number; anchorY?: number; recenter?: boolean } = {}): void {
  if (!diagramEl?.querySelector('svg')) {
    return;
  }

  const previousScale = getDiagramScale();
  diagramZoomState.zoomMultiplier = clamp(nextMultiplier, MIN_ZOOM_MULTIPLIER, MAX_ZOOM_MULTIPLIER);
  applyDiagramZoom(previousScale, options);
}

function applyDiagramZoom(previousScale: number, options: { anchorX?: number; anchorY?: number; recenter?: boolean } = {}): void {
  const svg = diagramEl?.querySelector<SVGSVGElement>('svg');
  if (!svg || !diagramViewportEl || !diagramEl || !diagramZoomState.naturalWidth || !diagramZoomState.naturalHeight) {
    clearDiagramZoom();
    return;
  }

  const scale = getDiagramScale();
  const scaledWidth = diagramZoomState.naturalWidth * scale;
  const scaledHeight = diagramZoomState.naturalHeight * scale;

  diagramEl.style.width = `${scaledWidth}px`;
  diagramEl.style.height = `${scaledHeight}px`;
  svg.style.width = `${scaledWidth}px`;
  svg.style.height = `${scaledHeight}px`;
  updateZoomReadout(scale);
  setZoomControlsEnabled(true);

  window.requestAnimationFrame(() => {
    if (!diagramViewportEl) {
      return;
    }

    if (options.recenter) {
      diagramViewportEl.scrollLeft = 0;
      diagramViewportEl.scrollTop = 0;
      return;
    }

    const anchorX = options.anchorX ?? diagramViewportEl.scrollLeft + diagramViewportEl.clientWidth / 2;
    const anchorY = options.anchorY ?? diagramViewportEl.scrollTop + diagramViewportEl.clientHeight / 2;
    const previousWidth = diagramZoomState.naturalWidth * previousScale;
    const previousHeight = diagramZoomState.naturalHeight * previousScale;
    const relativeX = previousWidth > 0 ? anchorX / previousWidth : 0.5;
    const relativeY = previousHeight > 0 ? anchorY / previousHeight : 0.5;

    diagramViewportEl.scrollLeft = Math.max(0, scaledWidth * relativeX - diagramViewportEl.clientWidth / 2);
    diagramViewportEl.scrollTop = Math.max(0, scaledHeight * relativeY - diagramViewportEl.clientHeight / 2);
  });
}

function clearDiagramZoom(): void {
  diagramZoomState.naturalWidth = 0;
  diagramZoomState.naturalHeight = 0;
  diagramZoomState.fitScale = 1;
  diagramZoomState.zoomMultiplier = 1;

  if (diagramEl) {
    diagramEl.style.width = '';
    diagramEl.style.height = '';
  }

  const svg = diagramEl?.querySelector<SVGSVGElement>('svg');
  if (svg) {
    svg.style.width = '';
    svg.style.height = '';
  }

  updateZoomReadout(0);
  setZoomControlsEnabled(false);
}

function getDiagramScale(): number {
  return diagramZoomState.fitScale * diagramZoomState.zoomMultiplier;
}

function getDiagramViewportSize(): { width: number; height: number } {
  if (!diagramViewportEl) {
    return { width: 1, height: 1 };
  }

  const styles = window.getComputedStyle(diagramViewportEl);
  const width = diagramViewportEl.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const height = diagramViewportEl.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function getSvgLength(svg: SVGSVGElement, attribute: 'width' | 'height'): number | null {
  const value = Number.parseFloat(svg.getAttribute(attribute) ?? '');
  return Number.isFinite(value) ? value : null;
}

function updateZoomReadout(scale: number): void {
  if (zoomValueEl) {
    zoomValueEl.textContent = scale > 0 ? `${Math.round(scale * 100)}%` : 'No SVG';
  }
}

function setZoomControlsEnabled(enabled: boolean): void {
  [zoomOutButton, zoomInButton, zoomActualButton, zoomFitButton].forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = !enabled;
    }
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isLaneLayout(layout: DemoLayout): layout is LaneDiagramLayout {
  return 'lanes' in layout && 'media' in layout;
}

function getLaneLabels(layout: DemoLayout): string[] {
  return isLaneLayout(layout) ? layout.lanes.map((lane) => lane.label) : [];
}

function getLaneCount(layout: DemoLayout): number {
  return isLaneLayout(layout) ? layout.lanes.length : 0;
}

function getLaneMediaLabels(layout: DemoLayout): string[] {
  return isLaneLayout(layout) ? layout.media.map((medium) => medium.label) : [];
}

function getLaneMediaCount(layout: DemoLayout): number {
  return isLaneLayout(layout) ? layout.media.length : 0;
}

function countReversedEdges(layout: DemoLayout): number {
  return isLaneLayout(layout) ? layout.edges.filter((edge) => edge.reversed).length : 0;
}

function countNodesByLane(layout: DemoLayout, laneIds: string[]): number {
  return isLaneLayout(layout) ? layout.nodes.filter((node) => laneIds.includes(node.lane)).length : 0;
}

function collectParamValues(nodes: Array<{ params?: Record<string, string> }>, keys: string[]): string[] {
  const keySet = new Set(keys);
  const seen = new Set<string>();
  const values: string[] = [];

  for (const node of nodes) {
    for (const [key, value] of Object.entries(node.params ?? {})) {
      if (!keySet.has(key) || seen.has(String(value))) {
        continue;
      }
      seen.add(String(value));
      values.push(String(value));
    }
  }

  return values;
}

function countUniqueText(values: string[]): number {
  return new Set(values.map((value) => value.toLowerCase())).size;
}
