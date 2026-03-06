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
const sourceTitleEl = document.getElementById('sourceTitle');
const sourceCodeEl = document.querySelector('#sourceCode code');
const footerVersionEl = document.getElementById('footerVersion');
const saveSvgButton = document.getElementById('saveActiveSvg');
const savePngButton = document.getElementById('saveActivePng');

const metricElements = Array.from({ length: 4 }, (_, index) => ({
  label: document.querySelector<HTMLElement>(`[data-metric-label="${index}"]`),
  value: document.querySelector<HTMLElement>(`[data-metric-value="${index}"]`),
  note: document.querySelector<HTMLElement>(`[data-metric-note="${index}"]`),
}));

const showcases: ShowcaseDefinition[] = [
  {
    id: 'electrical',
    tabLabel: 'Electrical',
    sectionTitle: 'Building electrical distribution single-line diagram',
    sourceTitle: 'DSL used for the electrical showcase',
    source: electricalShowcaseSource,
    downloadBase: 'diagjs-electrical',
    detailsEyebrow: 'Major Branches',
    detailsTitle: 'Main downstream equipment',
    details: electricalPrimaryFeeders,
    tagGroupA: {
      eyebrow: 'Voltage Stack',
      title: 'Levels carried in the model',
      resolve(layout) {
        return collectParamValues(layout.nodes, ['voltage', 'secondary', 'system']);
      },
    },
    tagGroupB: {
      eyebrow: 'Presentation Model',
      title: 'How the single-line behaves',
      resolve() {
        return ['Source-only terminals', 'Assembly buses', 'Feeder buckets', 'Voltage strata', 'Wire legend', 'Detailed glyphs'];
      },
    },
    libraryEyebrow: 'Symbol Library',
    libraryTitle: 'Expanded device set',
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
    proofEyebrow: 'Why this example',
    proofTitle: 'What the electrical module proves',
    proofPoints: [
      'Assemblies such as switchboards, panels, and MCCs render as structured input-main-bus-output elevations instead of generic boxes.',
      'Source, assembly, and load roles control which terminal sides appear on the SVG so feeders land on physically valid faces.',
      'Voltage parameters surface directly beside the equipment that owns them, which keeps the one-line readable without a separate schedule.',
      'Mechanical and service-end devices render with dedicated glyphs so downstream loads do not collapse into placeholder symbols.',
    ],
    diagramTitle: 'Extensive building distribution model',
    diagramNote: 'Source and SVG update together from the same inline DSL example.',
    metrics: [
      { label: 'Nodes', note: 'distribution devices and end loads in the single-line demo', value: (layout) => layout.nodes.length },
      { label: 'Runs', note: 'hierarchy-routed feeder runs through the electrical example', value: (layout) => layout.edges.length },
      { label: 'Voltages', note: 'distinct service and utilization levels surfaced from params', value: (layout) => collectParamValues(layout.nodes, ['voltage', 'secondary', 'system']).length },
      { label: 'Assemblies', note: 'major distribution groupings highlighted in the sidebar', value: () => electricalPrimaryFeeders.length },
    ],
    summary(layout) {
      return `${layout.nodes.length} nodes and ${layout.edges.length} feeder runs are arranged as a utility-to-load single-line, with assemblies rendered as breaker-main-bus-output elevations rather than generic graph nodes.`;
    },
    render(source) {
      const layout = compileDiagram(parseDiagram(source));
      return { layout, svg: renderSvg(layout) };
    },
  },
  {
    id: 'hvac',
    tabLabel: 'HVAC',
    sectionTitle: 'Mechanical HVAC schematic with airside and hydronic systems',
    sourceTitle: 'DSL used for the HVAC showcase',
    source: hvacShowcaseSource,
    downloadBase: 'diagjs-hvac',
    detailsEyebrow: 'Major Systems',
    detailsTitle: 'Mechanical stacks carried on the sheet',
    details: hvacSystems,
    tagGroupA: {
      eyebrow: 'Media Legend',
      title: 'Duct and piping services in play',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Lane Bands',
      title: 'Disciplined placement model',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'HVAC Library',
    libraryTitle: 'Mechanical component coverage',
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
    proofEyebrow: 'Why this example',
    proofTitle: 'What the HVAC module proves',
    proofPoints: [
      'Airside, condenser, chilled-water, heating-water, terminal, exhaust, and controls content can live on one coordinated mechanical sheet.',
      'Return paths and hydronic loops are handled as routed schematic connections instead of forcing the model into a feeder-only tree.',
      'Discipline-specific symbols replace electrical placeholders, so coils, towers, pumps, valves, sensors, and VAVs read like mechanical drawings.',
      '`lane`, `column`, and `slot` parameters provide stable author control when a schematic needs deliverable-style arrangement rather than auto-graph chaos.',
    ],
    diagramTitle: 'Office tower HVAC plant and airside model',
    diagramNote: 'The renderer pins equipment to mechanical bands so plant, airside, return, and controls remain legible as the sheet grows.',
    metrics: [
      { label: 'Components', note: 'mechanical devices rendered on dedicated schematic bands', value: (layout) => layout.nodes.length },
      { label: 'Media', note: 'distinct duct and piping services styled independently', value: (layout) => getLaneMediaCount(layout) },
      { label: 'Bands', note: 'discipline lanes visible on the drawing', value: (layout) => getLaneCount(layout) },
      { label: 'Returns', note: 'reverse-routed return and loop connections retained in the example', value: (layout) => countReversedEdges(layout) },
    ],
    summary(layout) {
      return `${layout.nodes.length} HVAC components are placed on ${getLaneCount(layout)} mechanical bands so supply air, return air, condenser water, chilled water, heating water, and controls read like a coordinated schematic instead of a generic graph.`;
    },
    render(source) {
      const layout = compileHvacDiagram(source);
      return { layout, svg: renderHvacSvg(layout) };
    },
  },
  {
    id: 'network',
    tabLabel: 'Network',
    sectionTitle: 'Data centre and campus network infrastructure schematic',
    sourceTitle: 'DSL used for the data centre network showcase',
    source: networkShowcaseSource,
    downloadBase: 'diagjs-network',
    detailsEyebrow: 'Major Systems',
    detailsTitle: 'Backbone, fabric, storage, and edge stacks',
    details: networkSystems,
    tagGroupA: {
      eyebrow: 'Link Services',
      title: 'Transport classes represented on the sheet',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Infrastructure Bands',
      title: 'How the network is segmented',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Network Library',
    libraryTitle: 'Infrastructure coverage',
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
    proofEyebrow: 'Why this example',
    proofTitle: 'What the network module proves',
    proofPoints: [
      'A realistic data centre architecture can be carried as a lane-based infrastructure drawing instead of collapsing core, services, fabric, storage, and edge into one flat tier.',
      'Campus, building, and OT edge segments can sit beside the data centre fabric on the same sheet without losing readability.',
      'Link media such as WAN, 400G backbone, 100G fabric, Fibre Channel, management, Wi-Fi, and security overlays are visually differentiated from each other.',
      'Racks, switching, security, storage, and gateway devices render as recognizable hardware elevations rather than generic rounded boxes.',
    ],
    diagramTitle: 'Resilient data centre and campus network',
    diagramNote: 'The example mixes carrier, campus, core, shared services, compute fabric, storage, and mixed-use building edge on one coordinated sheet.',
    metrics: [
      { label: 'Nodes', note: 'network devices and infrastructure groups on the schematic', value: (layout) => layout.nodes.length },
      { label: 'Links', note: 'transport links across the routed architecture', value: (layout) => layout.edges.length },
      { label: 'Media', note: 'distinct link classes carried in the legend', value: (layout) => getLaneMediaCount(layout) },
      { label: 'Edge Sites', note: 'building and user-edge nodes attached to the campus fabric', value: (layout) => countNodesByLane(layout, ['building', 'edge']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} infrastructure nodes and ${layout.edges.length} routed links cover carrier ingress, campus backbone, border security, shared services, leaf-spine compute fabric, storage, and mixed-use building edge in one data centre network schematic.`;
    },
    render(source) {
      const layout = compileNetworkDiagram(source);
      return { layout, svg: renderNetworkSvg(layout) };
    },
  },
  {
    id: 'fire-alarm',
    tabLabel: 'Fire Alarm',
    sectionTitle: 'Campus fire alarm and emergency voice architecture',
    sourceTitle: 'DSL used for the fire alarm showcase',
    source: fireAlarmShowcaseSource,
    downloadBase: 'diagjs-fire-alarm',
    detailsEyebrow: 'Major Systems',
    detailsTitle: 'Command, network, panel, and field layers',
    details: fireAlarmSystems,
    tagGroupA: {
      eyebrow: 'Circuit Types',
      title: 'Network, loop, and notification classes',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Functional Bands',
      title: 'How the campus system is organized',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Fire Alarm Library',
    libraryTitle: 'Head-end to device coverage',
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
    proofEyebrow: 'Why this example',
    proofTitle: 'What the fire alarm module proves',
    proofPoints: [
      'The renderer can represent a real campus fire alarm topology from the command head-end through peer nodes, FACPs, annunciation, addressable loops, notification circuits, and specialty interfaces.',
      'Notification, SLC, supervisory, and releasing paths are separate media classes instead of one undifferentiated connection style.',
      'Panels, annunciators, repeaters, boosters, and field devices render with dedicated fire-alarm hardware symbols and detector marks.',
      'Large mixed-use campuses remain readable because command, network, panel, annunciation, loop, notification, specialty, and field layers are explicitly separated.',
    ],
    diagramTitle: 'Multi-building campus fire alarm network',
    diagramNote: 'The example spans tower, hotel, commons, retail, lab, garage, and specialty suppression / smoke-control integrations on one fire alarm sheet.',
    metrics: [
      { label: 'Nodes', note: 'head-end, nodes, panels, interfaces, and devices in the example', value: (layout) => layout.nodes.length },
      { label: 'Circuits', note: 'network, loop, notification, and specialty paths shown', value: (layout) => layout.edges.length },
      { label: 'Panels', note: 'distributed panel and power-supply devices in the drawing', value: (layout) => countNodesByLane(layout, ['panels']) },
      { label: 'Field Devices', note: 'field and notification endpoints driven from the system', value: (layout) => countNodesByLane(layout, ['field', 'notification']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} devices and interfaces map a campus head-end through distributed nodes, FACPs, annunciation, SLC loops, notification circuits, and releasing integrations all the way down to field appliances.`;
    },
    render(source) {
      const layout = compileFireAlarmDiagram(source);
      return { layout, svg: renderFireAlarmSvg(layout) };
    },
  },
  {
    id: 'lighting-control',
    tabLabel: 'Lighting Control',
    sectionTitle: 'Campus lighting control architecture',
    sourceTitle: 'DSL used for the lighting control showcase',
    source: lightingControlShowcaseSource,
    downloadBase: 'diagjs-lighting-control',
    detailsEyebrow: 'Major Systems',
    detailsTitle: 'Head-end, panel, room, and fixture layers',
    details: lightingControlSystems,
    tagGroupA: {
      eyebrow: 'Control Media',
      title: 'Protocols and control classes represented',
      resolve(layout) {
        return getLaneMediaLabels(layout);
      },
    },
    tagGroupB: {
      eyebrow: 'Functional Bands',
      title: 'Lighting control placement model',
      resolve(layout) {
        return getLaneLabels(layout);
      },
    },
    libraryEyebrow: 'Lighting Library',
    libraryTitle: 'Control and field coverage',
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
    proofEyebrow: 'Why this example',
    proofTitle: 'What the lighting module proves',
    proofPoints: [
      'Enterprise head-end, gateways, panel cabinets, room controls, sensors, fixture groups, exterior controls, and emergency interfaces can live on one lighting control sheet.',
      'Ethernet, DALI, 0-10V, relay, sensor bus, exterior, and emergency sense links each receive their own visual treatment.',
      'The example covers mixed-use office, hospitality, ballroom, retail, food hall, plaza, and garage programs instead of a single-room toy case.',
      'Lighting devices render as recognizable cabinets, controllers, stations, sensors, photocells, and luminaires rather than abstract graph symbols.',
    ],
    diagramTitle: 'Mixed-use campus lighting control system',
    diagramNote: 'The example combines enterprise head-end, panel cabinets, room controls, sensors, fixture groups, site lighting, and emergency sense integration.',
    metrics: [
      { label: 'Nodes', note: 'controllers, cabinets, sensors, and loads on the sheet', value: (layout) => layout.nodes.length },
      { label: 'Control Paths', note: 'backbone, room-control, and fixture-control links', value: (layout) => layout.edges.length },
      { label: 'Panels', note: 'relay and dimming cabinets represented in the example', value: (layout) => countNodesByLane(layout, ['panel']) },
      { label: 'Lighting Loads', note: 'fixture and exterior load groups coordinated by the system', value: (layout) => countNodesByLane(layout, ['fixture', 'exterior']) },
    ],
    summary(layout) {
      return `${layout.nodes.length} devices coordinate head-end software, gateways, relay and dimming cabinets, room controllers, sensors, fixture groups, exterior lighting, and emergency interfaces across a mixed-use campus.`;
    },
    render(source) {
      const layout = compileLightingControlDiagram(source);
      return { layout, svg: renderLightingControlSvg(layout) };
    },
  },
];

const showcaseById = new Map(showcases.map((showcase) => [showcase.id, showcase]));
const renderCache = new Map<string, { layout: DemoLayout; svg: string }>();
let activeShowcaseId = showcases[0]?.id ?? 'electrical';

wireTabs();
wireDownloadButtons();
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
    detailListEl.replaceChildren(...showcase.details.map((detail) => createDetailItem(labelMap.get(detail.id) ?? detail.id, detail.detail)));
    tagGroupAListEl.replaceChildren(...showcase.tagGroupA.resolve(rendered.layout).map(createTag));
    tagGroupBListEl.replaceChildren(...showcase.tagGroupB.resolve(rendered.layout).map(createTag));
    libraryTagListEl.replaceChildren(...showcase.libraryTags.map(createTag));
    proofListEl.replaceChildren(...showcase.proofPoints.map(createBulletItem));
    updateMetrics(showcase, rendered.layout);
  } catch (error) {
    activeSummaryEl.textContent = error instanceof Error ? error.message : String(error);
    detailListEl.replaceChildren();
    tagGroupAListEl.replaceChildren();
    tagGroupBListEl.replaceChildren();
    libraryTagListEl.replaceChildren(...showcase.libraryTags.map(createTag));
    proofListEl.replaceChildren(...showcase.proofPoints.map(createBulletItem));
    renderError(diagramEl, error);
    clearMetrics();
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

function updateMetrics(showcase: ShowcaseDefinition, layout: DemoLayout): void {
  showcase.metrics.forEach((metric, index) => {
    const target = metricElements[index];
    if (!target) {
      return;
    }
    if (target.label) target.label.textContent = metric.label;
    if (target.value) target.value.textContent = String(metric.value(layout));
    if (target.note) target.note.textContent = metric.note;
  });
}

function clearMetrics(): void {
  for (const metric of metricElements) {
    if (metric.label) metric.label.textContent = 'Unavailable';
    if (metric.value) metric.value.textContent = '0';
    if (metric.note) metric.note.textContent = 'Render error prevented metric calculation.';
  }
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
