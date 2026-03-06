import { compileDiagram, compileHvacDiagram, parseDiagram, renderHvacSvg, renderSvg } from './index';
import { electricalPrimaryFeeders, electricalShowcaseSource, hvacShowcaseSource, hvacSystems } from './showcase-data';
import { siteVersion } from './version';

const electricalDiagramEl = document.getElementById('electricalDiagram');
const electricalSourceEl = document.querySelector('#electricalSource code');
const electricalSummaryEl = document.getElementById('electricalSummary');
const electricalBranchListEl = document.getElementById('electricalBranchList');
const electricalVoltageTagsEl = document.getElementById('electricalVoltageTags');

const hvacDiagramEl = document.getElementById('hvacDiagram');
const hvacSourceEl = document.querySelector('#hvacSource code');
const hvacSummaryEl = document.getElementById('hvacSummary');
const hvacBranchListEl = document.getElementById('hvacBranchList');
const hvacMediaTagsEl = document.getElementById('hvacMediaTags');
const hvacLaneTagsEl = document.getElementById('hvacLaneTags');
const footerVersionEl = document.getElementById('footerVersion');

const saveElectricalSvgButton = document.getElementById('saveElectricalSvg');
const saveElectricalPngButton = document.getElementById('saveElectricalPng');
const saveHvacSvgButton = document.getElementById('saveHvacSvg');
const saveHvacPngButton = document.getElementById('saveHvacPng');

renderElectricalShowcase();
renderHvacShowcase();
renderFooterVersion();
wireDownloadButtons();

function renderElectricalShowcase(): void {
  if (!electricalDiagramEl || !electricalSourceEl || !electricalSummaryEl || !electricalBranchListEl || !electricalVoltageTagsEl) {
    return;
  }

  electricalSourceEl.textContent = electricalShowcaseSource;

  try {
    const compiled = compileDiagram(parseDiagram(electricalShowcaseSource));
    electricalDiagramEl.innerHTML = renderSvg(compiled);

    const nodeMap = new Map(compiled.nodes.map((node) => [node.id, node]));
    const voltages = collectVoltages(compiled.nodes);

    setStat('electricalNodes', compiled.nodes.length);
    setStat('electricalEdges', compiled.edges.length);

    electricalSummaryEl.textContent = `${compiled.nodes.length} nodes and ${compiled.edges.length} orthogonal feeder runs are arranged as a utility-to-load hierarchy, with source, assembly, and load terminal behavior reflected directly in the SVG equipment elevations.`;

    electricalBranchListEl.replaceChildren(
      ...electricalPrimaryFeeders.map((branch) => createDetailItem(nodeMap.get(branch.id)?.label ?? branch.id, branch.detail)),
    );

    electricalVoltageTagsEl.replaceChildren(...voltages.map((value) => createTag(value)));
  } catch (error) {
    renderError(electricalDiagramEl, error);
  }
}

function renderHvacShowcase(): void {
  if (!hvacDiagramEl || !hvacSourceEl || !hvacSummaryEl || !hvacBranchListEl || !hvacMediaTagsEl || !hvacLaneTagsEl) {
    return;
  }

  hvacSourceEl.textContent = hvacShowcaseSource;

  try {
    const compiled = compileHvacDiagram(hvacShowcaseSource);
    hvacDiagramEl.innerHTML = renderHvacSvg(compiled);

    const nodeMap = new Map(compiled.nodes.map((node) => [node.id, node]));

    setStat('hvacComponents', compiled.nodes.length);
    setStat('hvacMedia', compiled.media.length);

    hvacSummaryEl.textContent = `${compiled.nodes.length} HVAC components are placed on ${compiled.lanes.length} dedicated mechanical bands so supply air, return air, condenser water, chilled water, heating water, and controls read like a coordinated schematic instead of a generic graph.`;

    hvacBranchListEl.replaceChildren(
      ...hvacSystems.map((system) => createDetailItem(nodeMap.get(system.id)?.label ?? system.id, system.detail)),
    );

    hvacMediaTagsEl.replaceChildren(...compiled.media.map((medium) => createTag(medium.label)));
    hvacLaneTagsEl.replaceChildren(...compiled.lanes.map((lane) => createTag(lane.label)));
  } catch (error) {
    renderError(hvacDiagramEl, error);
  }
}

function setStat(key: string, value: number): void {
  const target = document.querySelector<HTMLElement>(`[data-stat="${key}"]`);
  if (target) {
    target.textContent = String(value);
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

function renderFooterVersion(): void {
  if (footerVersionEl) {
    footerVersionEl.textContent = siteVersion;
  }
}

function wireDownloadButtons(): void {
  saveElectricalSvgButton?.addEventListener('click', () => {
    void saveDiagramSvg('electricalDiagram', 'diagjs-electrical.svg');
  });

  saveElectricalPngButton?.addEventListener('click', () => {
    void saveDiagramPng('electricalDiagram', 'diagjs-electrical.png');
  });

  saveHvacSvgButton?.addEventListener('click', () => {
    void saveDiagramSvg('hvacDiagram', 'diagjs-hvac.svg');
  });

  saveHvacPngButton?.addEventListener('click', () => {
    void saveDiagramPng('hvacDiagram', 'diagjs-hvac.png');
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

  image.src = objectUrl;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(objectUrl);
    return;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  URL.revokeObjectURL(objectUrl);
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
  link.click();
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function collectVoltages(nodes: Array<{ params?: Record<string, string> }>): string[] {
  const keys = new Set(['voltage', 'secondary', 'system']);
  const seen = new Set<string>();
  const levels: string[] = [];

  for (const node of nodes) {
    for (const [key, value] of Object.entries(node.params ?? {})) {
      if (keys.has(key) && !seen.has(value)) {
        seen.add(value);
        levels.push(String(value));
      }
    }
  }

  return levels;
}
