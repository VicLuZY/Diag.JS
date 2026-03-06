import { compileDiagram, parseDiagram } from './diagjs';

export type DiagramProgram = ReturnType<typeof parseDiagram>;
export type DiagramInput = ReturnType<typeof compileDiagram>;
export type DiagramNode = DiagramInput['nodes'][number];
export type DiagramEdge = DiagramInput['edges'][number];

export interface LaneSpec {
  id: string;
  label: string;
  order: number;
  tint: string;
  stroke: string;
}

export interface LaneSymbolSpec {
  typeLabel: string;
  glyph: string;
  width: number;
  height: number;
  fill: string;
  innerFill: string;
  stroke: string;
  accent: string;
  labelChars: number;
  lane: string;
}

export interface LaneMediumSpec {
  key: string;
  label: string;
  stroke: string;
  accent: string;
  width: number;
  dasharray?: string;
  style?: 'band' | 'line' | 'signal';
}

export interface LanePort {
  key: string;
  x: number;
  y: number;
  index: number;
}

export interface LaneNodeVisual extends DiagramNode {
  symbol: string;
  glyph: string;
  spec: LaneSymbolSpec;
  lane: string;
  laneOrder: number;
  column: number;
  slot: number;
  incomingCount: number;
  outgoingCount: number;
  role: 'source' | 'load' | 'inline' | 'splitter' | 'mixer' | 'isolated';
  labelLines: string[];
  labelFontSize: number;
  labelLineHeight: number;
  labelBlockHeight: number;
  paramLines: string[];
  deviceWidth: number;
  deviceHeight: number;
  paramWidth: number;
  paramHeight: number;
  totalWidth: number;
  totalHeight: number;
  boxX?: number;
  boxY?: number;
  deviceX?: number;
  deviceY?: number;
  paramX?: number;
  paramY?: number | null;
  centerX?: number;
  centerY?: number;
  inputTerminalX?: number;
  outputTerminalX?: number;
  inputPorts?: LanePort[];
  outputPorts?: LanePort[];
  inputPortMap?: Map<string, LanePort>;
  outputPortMap?: Map<string, LanePort>;
}

export interface LaneLayout extends LaneSpec {
  top: number;
  bottom: number;
  height: number;
}

export interface LaneEdgeLayout {
  fromId: string;
  toId: string;
  label: string | null;
  from: LaneNodeVisual;
  to: LaneNodeVisual;
  fromPort: LanePort;
  toPort: LanePort;
  medium: LaneMediumSpec;
  path: string;
  labelX: number;
  labelY: number;
  reversed: boolean;
}

export interface LaneDiagramLayout {
  title: string | null;
  width: number;
  height: number;
  legendX: number;
  legendY: number;
  titleOffset: number;
  lanes: LaneLayout[];
  nodes: LaneNodeVisual[];
  edges: LaneEdgeLayout[];
  media: LaneMediumSpec[];
}

export interface LaneRenderOptions {
  margin?: number;
  laneLabelWidth?: number;
  columnGap?: number;
  laneGap?: number;
  slotGap?: number;
}

export interface LaneRendererConfig {
  laneSpecs: LaneSpec[];
  symbolAliases: Record<string, string>;
  symbolLibrary: Record<string, LaneSymbolSpec>;
  mediaLibrary: Record<string, LaneMediumSpec>;
  defaultMedium: string;
  legendTitle?: string;
  subtitle?: string;
  gridStroke?: string;
  backgroundFill?: string;
  innerFrameStroke?: string;
  inferSymbol(node: DiagramNode, normalizeSymbol: (value: string | null | undefined) => string): string;
  inferLane?(node: DiagramNode, symbol: string): string;
  getMedium(edge: DiagramEdge, from: LaneNodeVisual, to: LaneNodeVisual, mediaLibrary: Record<string, LaneMediumSpec>): LaneMediumSpec;
  renderGlyph(node: LaneNodeVisual, x: number, y: number, width: number, height: number): string;
  getParamLines?(node: DiagramNode): string[];
  getDeviceWidth?(node: LaneNodeVisual): number;
  getDeviceHeight?(node: LaneNodeVisual): number;
  getPortGap?(node: LaneNodeVisual): number;
}

function escapeXml(text: string): string {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [''];
  }

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    const chunks = word.match(new RegExp(`.{1,${Math.max(1, maxChars)}}`, 'g')) ?? [word];
    lines.push(...chunks.slice(0, -1));
    current = chunks[chunks.length - 1] ?? '';
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function renderTextLines(
  lines: string[],
  x: number,
  y: number,
  options: {
    anchor?: 'start' | 'middle' | 'end';
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fill?: string;
    lineHeightPx?: number;
  } = {},
): string {
  const {
    anchor = 'middle',
    fontSize = 12,
    fontFamily = 'Trebuchet MS, Verdana, sans-serif',
    fontWeight = '400',
    fill = '#1b2933',
    lineHeightPx = Math.round(fontSize * 1.2),
  } = options;

  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeightPx}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${escapeXml(line)}</text>`,
    )
    .join('');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function spreadPorts(count: number, centerY: number, topY: number, bottomY: number, gap: number): number[] {
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [centerY];
  }

  const totalSpan = gap * (count - 1);
  const start = clamp(centerY - totalSpan / 2, topY, bottomY - totalSpan);
  return Array.from({ length: count }, (_, index) => start + index * gap);
}

function getRole(incomingCount: number, outgoingCount: number): LaneNodeVisual['role'] {
  if (incomingCount === 0 && outgoingCount === 0) {
    return 'isolated';
  }
  if (incomingCount === 0) {
    return 'source';
  }
  if (outgoingCount === 0) {
    return 'load';
  }
  if (incomingCount > 1 && outgoingCount === 1) {
    return 'mixer';
  }
  if (outgoingCount > 1) {
    return 'splitter';
  }
  return 'inline';
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildInput(input: string | DiagramProgram | DiagramInput): DiagramInput {
  if (typeof input === 'string') {
    return compileDiagram(parseDiagram(input));
  }
  if ((input as DiagramInput)?.type === 'CompiledDiagram') {
    return input as DiagramInput;
  }
  return compileDiagram(input as DiagramProgram);
}

function createNormalizeSymbol(config: LaneRendererConfig): (value: string | null | undefined) => string {
  return (value: string | null | undefined): string => {
    const normalized = String(value ?? 'device').toLowerCase().replace(/-/g, '_');
    return config.symbolAliases[normalized] ?? normalized;
  };
}

export function createLaneRenderer(config: LaneRendererConfig) {
  const normalizeSymbol = createNormalizeSymbol(config);

  function getSymbolSpec(symbol: string): LaneSymbolSpec {
    return config.symbolLibrary[symbol] ?? config.symbolLibrary.device;
  }

  function inferLane(node: DiagramNode, symbol: string): string {
    const configured = String(node.params?.lane ?? '').trim().toLowerCase();
    if (configured && config.laneSpecs.some((lane) => lane.id === configured)) {
      return configured;
    }

    const inferred = config.inferLane?.(node, symbol);
    if (inferred && config.laneSpecs.some((lane) => lane.id === inferred)) {
      return inferred;
    }

    return getSymbolSpec(symbol).lane;
  }

  function buildNodeVisual(node: DiagramNode, incomingCount: number, outgoingCount: number): LaneNodeVisual {
    const symbol = config.inferSymbol(node, normalizeSymbol);
    const spec = getSymbolSpec(symbol);
    const lane = inferLane(node, symbol);
    const laneOrder = config.laneSpecs.find((entry) => entry.id === lane)?.order ?? 0;
    const labelLines = wrapText(node.label, spec.labelChars);
    const labelFontSize = 12;
    const labelLineHeight = 14;
    const labelBlockHeight = labelLines.length * labelLineHeight + 14;
    const paramLines = config.getParamLines
      ? config.getParamLines(node)
      : Object.entries(node.params ?? {})
          .filter(([key]) => !new Set(['lane', 'column', 'slot']).has(key))
          .map(([key, value]) => `${key}: ${value}`);
    const role = getRole(incomingCount, outgoingCount);
    const draftNode = {
      ...node,
      symbol,
      glyph: spec.glyph,
      spec,
      lane,
      laneOrder,
      column: toInt(node.params?.column, 0),
      slot: toInt(node.params?.slot, 0),
      incomingCount,
      outgoingCount,
      role,
      labelLines,
      labelFontSize,
      labelLineHeight,
      labelBlockHeight,
      paramLines,
      deviceWidth: spec.width,
      deviceHeight: spec.height,
      paramWidth: 0,
      paramHeight: 0,
      totalWidth: 0,
      totalHeight: 0,
    } as LaneNodeVisual;

    const deviceWidth = config.getDeviceWidth?.(draftNode) ?? spec.width;
    const deviceHeight = config.getDeviceHeight?.(draftNode) ?? spec.height;
    const paramWidth = paramLines.length
      ? Math.max(deviceWidth - 18, ...paramLines.map((line) => line.length * 6.2 + 22))
      : 0;
    const paramHeight = paramLines.length ? paramLines.length * 15 + 18 : 0;

    return {
      ...draftNode,
      deviceWidth,
      deviceHeight,
      paramWidth,
      paramHeight,
      totalWidth: Math.max(deviceWidth, paramWidth),
      totalHeight: deviceHeight + labelBlockHeight + (paramHeight ? paramHeight + 12 : 0),
    };
  }

  function compile(input: string | DiagramProgram | DiagramInput, options: LaneRenderOptions = {}): LaneDiagramLayout {
    const compiled = buildInput(input);
    const margin = options.margin ?? 54;
    const laneLabelWidth = options.laneLabelWidth ?? 132;
    const columnGap = options.columnGap ?? 248;
    const laneGap = options.laneGap ?? 28;
    const slotGap = options.slotGap ?? 22;
    const titleOffset = compiled.title ? 92 : 38;

    const incoming = new Map<string, DiagramEdge[]>(compiled.nodes.map((node) => [node.id, []]));
    const outgoing = new Map<string, DiagramEdge[]>(compiled.nodes.map((node) => [node.id, []]));
    for (const edge of compiled.edges) {
      incoming.get(edge.to)?.push(edge);
      outgoing.get(edge.from)?.push(edge);
    }

    const nodes = compiled.nodes.map((node) => buildNodeVisual(node, incoming.get(node.id)?.length ?? 0, outgoing.get(node.id)?.length ?? 0));
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const lanesInUse = [...new Set(nodes.map((node) => node.lane))]
      .map((laneId) => config.laneSpecs.find((lane) => lane.id === laneId))
      .filter((lane): lane is LaneSpec => Boolean(lane))
      .sort((left, right) => left.order - right.order);

    const laneLayouts: LaneLayout[] = [];
    let laneCursor = margin + titleOffset;

    for (const laneSpec of lanesInUse) {
      const laneNodes = nodes.filter((node) => node.lane === laneSpec.id);
      const groups = new Map<number, LaneNodeVisual[]>();
      for (const node of laneNodes) {
        const group = groups.get(node.column) ?? [];
        group.push(node);
        groups.set(node.column, group);
      }

      let maxGroupHeight = 0;
      for (const group of groups.values()) {
        group.sort((left, right) => left.slot - right.slot || left.id.localeCompare(right.id));
        const groupHeight = group.reduce((sum, node, index) => sum + node.totalHeight + (index > 0 ? slotGap : 0), 0);
        maxGroupHeight = Math.max(maxGroupHeight, groupHeight);
      }

      const height = Math.max(170, maxGroupHeight + 46);
      laneLayouts.push({
        ...laneSpec,
        top: laneCursor,
        bottom: laneCursor + height,
        height,
      });
      laneCursor += height + laneGap;
    }

    const laneById = new Map(laneLayouts.map((lane) => [lane.id, lane]));
    const maxColumn = Math.max(...nodes.map((node) => node.column), 0);

    for (const lane of laneLayouts) {
      const laneNodes = nodes.filter((node) => node.lane === lane.id);
      const groups = new Map<number, LaneNodeVisual[]>();
      for (const node of laneNodes) {
        const group = groups.get(node.column) ?? [];
        group.push(node);
        groups.set(node.column, group);
      }

      for (const [column, group] of groups.entries()) {
        group.sort((left, right) => left.slot - right.slot || left.id.localeCompare(right.id));
        const groupHeight = group.reduce((sum, node, index) => sum + node.totalHeight + (index > 0 ? slotGap : 0), 0);
        let cursorY = lane.top + (lane.height - groupHeight) / 2;
        const columnX = margin + laneLabelWidth + column * columnGap;

        for (const node of group) {
          node.boxX = columnX + (columnGap - node.totalWidth) / 2;
          node.boxY = cursorY;
          node.deviceX = node.boxX + (node.totalWidth - node.deviceWidth) / 2;
          node.deviceY = node.boxY;
          node.paramX = node.paramWidth ? node.boxX + (node.totalWidth - node.paramWidth) / 2 : node.boxX;
          node.paramY = node.paramHeight ? node.deviceY + node.deviceHeight + node.labelBlockHeight + 6 : null;
          node.centerX = node.deviceX + node.deviceWidth / 2;
          node.centerY = node.deviceY + Math.min(node.deviceHeight - 34, node.deviceHeight / 2);

          const leftTerminalX = node.deviceX;
          const rightTerminalX = node.deviceX + node.deviceWidth;
          const portTop = node.deviceY + 20;
          const portBottom = node.deviceY + Math.max(24, node.deviceHeight - node.labelBlockHeight - 16);
          const inputEdges = [...(incoming.get(node.id) ?? [])].sort((left, right) => {
            const leftNode = nodesById.get(left.from);
            const rightNode = nodesById.get(right.from);
            return (leftNode?.centerY ?? 0) - (rightNode?.centerY ?? 0);
          });
          const outputEdges = [...(outgoing.get(node.id) ?? [])].sort((left, right) => {
            const leftNode = nodesById.get(left.to);
            const rightNode = nodesById.get(right.to);
            return (leftNode?.centerY ?? 0) - (rightNode?.centerY ?? 0);
          });
          const gap = config.getPortGap?.(node) ?? 18;
          const inputYs = spreadPorts(inputEdges.length, node.centerY, portTop, portBottom, gap);
          const outputYs = spreadPorts(outputEdges.length, node.centerY, portTop, portBottom, gap);

          node.inputTerminalX = leftTerminalX;
          node.outputTerminalX = rightTerminalX;
          node.inputPorts = inputEdges.map((edge, index) => ({ key: `${edge.from}->${edge.to}`, x: leftTerminalX, y: inputYs[index], index }));
          node.outputPorts = outputEdges.map((edge, index) => ({ key: `${edge.from}->${edge.to}`, x: rightTerminalX, y: outputYs[index], index }));
          node.inputPortMap = new Map(node.inputPorts.map((port) => [port.key, port]));
          node.outputPortMap = new Map(node.outputPorts.map((port) => [port.key, port]));

          cursorY += node.totalHeight + slotGap;
        }
      }
    }

    const reverseTrackers = new Map<string, number>();
    const edges: LaneEdgeLayout[] = compiled.edges.map((edge) => {
      const from = nodesById.get(edge.from);
      const to = nodesById.get(edge.to);
      const key = `${edge.from}->${edge.to}`;
      const medium = config.getMedium(edge, from, to, config.mediaLibrary) ?? config.mediaLibrary[config.defaultMedium];
      const fromPort = from.outputPortMap?.get(key) ?? { key, x: from.outputTerminalX ?? from.deviceX ?? 0, y: from.centerY ?? 0, index: 0 };
      const toPort = to.inputPortMap?.get(key) ?? { key, x: to.inputTerminalX ?? to.deviceX ?? 0, y: to.centerY ?? 0, index: 0 };
      const forward = (from.column ?? 0) <= (to.column ?? 0);

      let path = '';
      let labelX = 0;
      let labelY = 0;

      if (forward) {
        const laneX = Math.min(toPort.x - 24, fromPort.x + 48 + fromPort.index * 10);
        path = `M ${fromPort.x} ${fromPort.y} H ${laneX} V ${toPort.y} H ${toPort.x}`;
        labelX = Math.min(laneX + 10, toPort.x - 44);
        labelY = fromPort.y === toPort.y ? fromPort.y - 10 : (fromPort.y + toPort.y) / 2 - 8;
      } else {
        const trackerKey = `${from.lane}->${to.lane}:${medium.key}`;
        const lane = laneById.get(from.lane) ?? laneById.get(to.lane);
        const trackIndex = reverseTrackers.get(trackerKey) ?? 0;
        reverseTrackers.set(trackerKey, trackIndex + 1);
        const detourY = lane ? lane.top - 22 - trackIndex * 12 : Math.min(fromPort.y, toPort.y) - 24 - trackIndex * 12;
        const leadX = fromPort.x + 20;
        const tailX = toPort.x - 20;
        path = `M ${fromPort.x} ${fromPort.y} H ${leadX} V ${detourY} H ${tailX} V ${toPort.y} H ${toPort.x}`;
        labelX = (leadX + tailX) / 2;
        labelY = detourY - 8;
      }

      return {
        fromId: edge.from,
        toId: edge.to,
        label: edge.label,
        from,
        to,
        fromPort,
        toPort,
        medium,
        path,
        labelX,
        labelY,
        reversed: !forward,
      };
    });

    const width = margin * 2 + laneLabelWidth + (maxColumn + 1) * columnGap + 120;
    const height = laneCursor + margin - laneGap;
    const media = [...new Map(edges.map((edge) => [edge.medium.key, edge.medium])).values()];

    return {
      title: compiled.title,
      width,
      height,
      legendX: width - 284,
      legendY: margin + 24,
      titleOffset,
      lanes: laneLayouts,
      nodes,
      edges,
      media,
    };
  }

  function renderNode(node: LaneNodeVisual): string {
    const chipWidth = Math.max(52, node.spec.typeLabel.length * 7.2 + 18);
    const leftPad = node.incomingCount ? 14 : 8;
    const rightPad = node.outgoingCount ? 14 : 8;
    const bodyX = (node.deviceX ?? 0) + leftPad;
    const bodyY = node.deviceY ?? 0;
    const bodyWidth = node.deviceWidth - leftPad - rightPad;
    const bodyHeight = node.deviceHeight;
    const faceX = bodyX + 10;
    const faceY = bodyY + 28;
    const faceWidth = bodyWidth - 20;
    const faceHeight = Math.max(28, bodyHeight - node.labelBlockHeight - 36);
    const labelStartY = bodyY + bodyHeight - 18 - (node.labelLines.length - 1) * node.labelLineHeight;

    const inputStubs = (node.inputPorts ?? [])
      .map((port) => `<path d="M ${port.x} ${port.y} H ${bodyX}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.35" stroke-linecap="round" opacity="0.9"/>`)
      .join('');
    const outputStubs = (node.outputPorts ?? [])
      .map((port) => `<path d="M ${bodyX + bodyWidth} ${port.y} H ${port.x}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.35" stroke-linecap="round" opacity="0.9"/>`)
      .join('');

    const paramRect = node.paramHeight
      ? `<rect x="${node.paramX}" y="${node.paramY}" width="${node.paramWidth}" height="${node.paramHeight}" rx="12" fill="#ffffff" stroke="#c9d5db" stroke-width="1.05"/>
        ${renderTextLines(node.paramLines, (node.paramX ?? 0) + 10, (node.paramY ?? 0) + 14, {
          anchor: 'start',
          fontSize: 10.5,
          fontFamily: 'Cascadia Code, Source Code Pro, monospace',
          fill: '#4b6070',
          lineHeightPx: 15,
        })}`
      : '';

    return `<g data-id="${escapeXml(node.id)}" data-symbol="${escapeXml(node.symbol)}" data-glyph="${escapeXml(node.glyph)}" data-lane="${node.lane}" data-role="${node.role}" data-column="${node.column}" data-slot="${node.slot}" data-inputs="${node.incomingCount}" data-outputs="${node.outgoingCount}">
      ${inputStubs}
      ${outputStubs}
      <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="16" fill="${node.spec.fill}" stroke="${node.spec.stroke}" stroke-width="1.7"/>
      <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyWidth - 8}" height="${bodyHeight - 8}" rx="13" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1"/>
      <rect x="${bodyX + 10}" y="${bodyY + 8}" width="${chipWidth}" height="18" rx="9" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1"/>
      <text x="${bodyX + 10 + chipWidth / 2}" y="${bodyY + 21}" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10" font-weight="700" fill="${node.spec.accent}">${escapeXml(node.spec.typeLabel)}</text>
      <path d="M ${bodyX + 10} ${bodyY + 32} H ${bodyX + bodyWidth - 10}" fill="none" stroke="#ced9df" stroke-width="1.05" stroke-linecap="round"/>
      <rect x="${faceX}" y="${faceY}" width="${faceWidth}" height="${faceHeight}" rx="12" fill="${node.spec.innerFill}" stroke="#d8e1e6" stroke-width="1"/>
      ${config.renderGlyph(node, faceX, faceY, faceWidth, faceHeight)}
      ${renderTextLines(node.labelLines, bodyX + bodyWidth / 2, labelStartY, {
        fontSize: node.labelFontSize,
        fontWeight: '700',
        lineHeightPx: node.labelLineHeight,
        fill: '#1b2933',
      })}
      ${paramRect}
    </g>`;
  }

  function renderEdge(edge: LaneEdgeLayout): string {
    const strokeDash = edge.medium.dasharray ? ` stroke-dasharray="${edge.medium.dasharray}"` : '';
    const edgeLabel = edge.label ? edge.label.toUpperCase() : edge.medium.label;
    const labelWidth = Math.max(42, edgeLabel.length * 6.8 + 12);
    const label = `<rect x="${edge.labelX - 6}" y="${edge.labelY - 12}" width="${labelWidth}" height="18" rx="9" fill="#ffffff" stroke="${edge.medium.stroke}" stroke-opacity="0.28" stroke-width="0.8"/>
      <text x="${edge.labelX}" y="${edge.labelY + 1}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10.5" font-weight="700" fill="${edge.medium.stroke}">${escapeXml(edgeLabel)}</text>`;
    const haloWidth = edge.medium.style === 'signal' ? edge.medium.width + 1.2 : edge.medium.width + 2.2;

    return `<g data-edge-from="${escapeXml(edge.fromId)}" data-edge-to="${escapeXml(edge.toId)}" data-medium="${edge.medium.key}" data-reversed="${edge.reversed}">
      <path d="${edge.path}" fill="none" stroke="${edge.medium.accent}" stroke-width="${haloWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>
      <path d="${edge.path}" fill="none" stroke="${edge.medium.stroke}" stroke-width="${edge.medium.width}" stroke-linecap="round" stroke-linejoin="round"${strokeDash}/>
      ${label}
    </g>`;
  }

  function renderLaneGuide(lane: LaneLayout, width: number, labelWidth: number): string {
    return `<g data-lane-guide="${lane.id}">
      <rect x="18" y="${lane.top}" width="${width - 36}" height="${lane.height}" rx="22" fill="${lane.tint}" stroke="${lane.stroke}" stroke-opacity="0.12" stroke-width="1"/>
      <path d="M ${labelWidth - 12} ${lane.top + 24} V ${lane.bottom - 24}" fill="none" stroke="${lane.stroke}" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="6 7"/>
      <text x="42" y="${lane.top + lane.height / 2 - 2}" font-family="Georgia, Times New Roman, serif" font-size="16" font-weight="700" fill="${lane.stroke}" letter-spacing="0.2">${escapeXml(lane.label)}</text>
    </g>`;
  }

  function renderLegend(layout: LaneDiagramLayout): string {
    const titleY = layout.legendY + 10;
    return `<g transform="translate(${layout.legendX}, ${layout.legendY})">
      <rect x="0" y="0" width="238" height="${Math.max(86, 26 + layout.media.length * 18)}" rx="16" fill="#ffffff" stroke="#c9d5db" stroke-width="1.1"/>
      <text x="16" y="${titleY + 4}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" font-weight="700" fill="#4c6070" letter-spacing="0.7">${escapeXml(config.legendTitle ?? 'MEDIA LEGEND')}</text>
      ${layout.media
        .map((medium, index) => {
          const rowY = 26 + index * 18;
          const dash = medium.dasharray ? ` stroke-dasharray="${medium.dasharray}"` : '';
          return `<path d="M 16 ${rowY + 12} H 54" fill="none" stroke="${medium.stroke}" stroke-width="${Math.min(5, medium.width)}" stroke-linecap="round"${dash}/>
            <text x="64" y="${rowY + 16}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10.5" fill="#314654">${escapeXml(medium.label)}</text>`;
        })
        .join('')}
    </g>`;
  }

  function render(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout, options: LaneRenderOptions = {}): string {
    const layout = (input as LaneDiagramLayout)?.lanes ? (input as LaneDiagramLayout) : compile(input as string | DiagramProgram | DiagramInput, options);
    const title = layout.title
      ? `<text x="${layout.width / 2}" y="44" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="22" font-weight="700" fill="#1b2933">${escapeXml(layout.title)}</text>
        <text x="${layout.width / 2}" y="66" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#5f7383">${escapeXml(config.subtitle ?? 'Lane-based building systems schematic with dedicated symbols, media-aware connections, and deliverable-style presentation')}</text>`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="lane diagram">
      <defs>
        <pattern id="lane-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 H 0 V 32" fill="none" stroke="${config.gridStroke ?? '#d9e0e5'}" stroke-width="0.8" opacity="0.55"/>
        </pattern>
      </defs>
      <rect x="10" y="10" width="${layout.width - 20}" height="${layout.height - 20}" rx="26" fill="${config.backgroundFill ?? '#fcfbf8'}" stroke="#c7d1d8" stroke-width="1.2"/>
      <rect x="24" y="24" width="${layout.width - 48}" height="${layout.height - 48}" rx="18" fill="url(#lane-grid)" opacity="0.55"/>
      <rect x="24" y="24" width="${layout.width - 48}" height="${layout.height - 48}" rx="18" fill="none" stroke="${config.innerFrameStroke ?? '#dce3e8'}" stroke-width="1"/>
      ${title}
      ${layout.lanes.map((lane) => renderLaneGuide(lane, layout.width, 54 + 132)).join('')}
      ${renderLegend(layout)}
      ${layout.edges.map(renderEdge).join('')}
      ${layout.nodes.map(renderNode).join('')}
    </svg>`;
  }

  return {
    compile,
    render,
    normalizeSymbol,
  };
}
