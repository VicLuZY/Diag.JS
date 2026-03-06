const NODE_ID_RE = '[A-Za-z][A-Za-z0-9_-]*';
const SYMBOL_RE = '[A-Za-z][A-Za-z0-9_-]*';
const TITLE_RE = new RegExp(`^title\\s+"([^"]+)"$`);
const NODE_RE = new RegExp(`^node\\s+(${NODE_ID_RE})\\s+"([^"]+)"(?:\\s+symbol\\s+(${SYMBOL_RE}))?$`);
const EDGE_RE = new RegExp(`^edge\\s+(${NODE_ID_RE})\\s+(${NODE_ID_RE})(?:\\s+"([^"]+)")?$`);
const PARAM_RE = new RegExp(`^param\\s+(${NODE_ID_RE})\\s+([A-Za-z][A-Za-z0-9_-]*)\\s+(?:"([^"]*)"|(\\S+))$`);

interface SymbolSpec {
  typeLabel: string;
  width: number;
  height: number;
  fill: string;
  innerFill: string;
  stroke: string;
  accent: string;
  labelChars: number;
  glyph?: string;
}

interface NodeDeclaration {
  type: 'NodeDeclaration';
  id: string;
  label: string;
  symbol: string | null;
  line: number;
}

interface EdgeDeclaration {
  type: 'EdgeDeclaration';
  from: string;
  to: string;
  label: string | null;
  line: number;
}

interface ParamDeclaration {
  type: 'ParamDeclaration';
  nodeId: string;
  key: string;
  value: string;
  line: number;
}

type DiagramStatement = NodeDeclaration | EdgeDeclaration | ParamDeclaration;

interface DiagramProgram {
  type: 'DiagramProgram';
  title: string | null;
  statements: DiagramStatement[];
}

interface CompiledNode {
  id: string;
  label: string;
  symbol: string | null;
  params: Record<string, string>;
}

interface CompiledEdge {
  from: string;
  to: string;
  label: string | null;
}

interface CompiledDiagram {
  type: 'CompiledDiagram';
  title: string | null;
  nodes: CompiledNode[];
  edges: CompiledEdge[];
}

interface TopologyCounts {
  incomingCount?: number;
  outgoingCount?: number;
}

interface TextRenderOptions {
  anchor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  lineHeightPx?: number;
}

interface LayoutOptions {
  margin?: number;
  columnGap?: number;
  rowGap?: number;
  rootGap?: number;
}

interface GraphInfo {
  outgoing: Map<string, CompiledEdge[]>;
  incoming: Map<string, CompiledEdge[]>;
  topo: string[];
  level: Map<string, number>;
  treeChildren: Map<string, string[]>;
  roots: string[];
}

interface PortLayout {
  key: string;
  x: number;
  y: number;
  index: number;
}

interface NodeVisual extends CompiledNode {
  symbol: string;
  glyph: string;
  spec: SymbolSpec;
  presentation: 'assembly' | 'device';
  role: 'assembly' | 'source' | 'load' | 'inline' | 'isolated';
  incomingCount: number;
  outgoingCount: number;
  hasInputTerminal: boolean;
  hasOutputTerminal: boolean;
  connectionRows: number;
  mainDeviceType: string;
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
  level?: number;
  blockX?: number;
  deviceX?: number;
  paramX?: number;
  blockY?: number;
  deviceY?: number;
  paramY?: number | null;
  anchorY?: number;
  inputTerminalX?: number;
  outputTerminalX?: number;
  inputPorts?: PortLayout[];
  outputPorts?: PortLayout[];
  inputPortMap?: Map<string, PortLayout>;
  outputPortMap?: Map<string, PortLayout>;
}

interface EdgeLayout {
  label: string | null;
  from: NodeVisual;
  to: NodeVisual;
  fromPort: PortLayout;
  toPort: PortLayout;
  path: string;
  labelX: number;
  labelY: number;
}

interface DiagramLayout {
  width: number;
  height: number;
  titleOffset: number;
  nodes: NodeVisual[];
  edges: EdgeLayout[];
}

const SYMBOL_ALIASES: Record<string, string> = {
  gen: 'generator',
  genset: 'generator',
  utility_service: 'utility',
  xfmr: 'transformer',
  tx: 'transformer',
  swbd: 'switchboard',
  switchgear: 'switchboard',
  panelboard: 'panel',
  mcp: 'panel',
  cb: 'breaker',
  ocpd: 'breaker',
  breaker_switch: 'breaker',
  disco: 'disconnect',
  isolator: 'disconnect',
  knife_switch: 'disconnect',
  transfer_switch: 'ats',
  static_switch: 'ats',
  photovoltaic: 'solar',
  pv: 'solar',
  pcs: 'inverter',
  converter: 'inverter',
  capacitor_bank: 'capacitor',
  cap_bank: 'capacitor',
  metering: 'meter',
  protection_relay: 'relay',
  hx: 'heat_exchanger',
  exhaust_fan: 'fan',
  supply_fan: 'fan',
  relief_fan: 'fan',
  air_handler: 'hvac',
  air_handling_unit: 'hvac',
  hvac_unit: 'hvac',
  rtu: 'rtu',
  rooftop_unit: 'rtu',
  chlr: 'chiller',
  boiler_plant: 'boiler',
  elev: 'elevator',
  elv: 'elevator',
  lift: 'elevator',
  load: 'equipment',
};

const SYMBOL_LIBRARY: Record<string, SymbolSpec> = {
  utility: {
    typeLabel: 'UTILITY',
    width: 184,
    height: 108,
    fill: '#fff7ef',
    innerFill: '#fffdf9',
    stroke: '#87512e',
    accent: '#87512e',
    labelChars: 18,
  },
  transformer: {
    typeLabel: 'XFMR',
    width: 194,
    height: 112,
    fill: '#fff9ef',
    innerFill: '#fffef9',
    stroke: '#8a6436',
    accent: '#8a6436',
    labelChars: 18,
  },
  switchboard: {
    typeLabel: 'SWBD',
    width: 242,
    height: 148,
    fill: '#f4f9fc',
    innerFill: '#fbfdfe',
    stroke: '#294560',
    accent: '#294560',
    labelChars: 20,
  },
  panel: {
    typeLabel: 'PANEL',
    width: 210,
    height: 138,
    fill: '#f7fbfe',
    innerFill: '#fbfdfe',
    stroke: '#43647c',
    accent: '#43647c',
    labelChars: 18,
  },
  mcc: {
    typeLabel: 'MCC',
    width: 236,
    height: 150,
    fill: '#f4faf7',
    innerFill: '#fbfefc',
    stroke: '#2f6251',
    accent: '#2f6251',
    labelChars: 18,
  },
  generator: {
    typeLabel: 'GEN',
    width: 184,
    height: 104,
    fill: '#f9f7ef',
    innerFill: '#fffdf7',
    stroke: '#7d6331',
    accent: '#7d6331',
    labelChars: 18,
  },
  breaker: {
    typeLabel: 'CB',
    width: 150,
    height: 98,
    fill: '#f8fafb',
    innerFill: '#ffffff',
    stroke: '#415667',
    accent: '#415667',
    labelChars: 16,
  },
  disconnect: {
    typeLabel: 'DISC',
    width: 150,
    height: 98,
    fill: '#faf8f2',
    innerFill: '#ffffff',
    stroke: '#6f6658',
    accent: '#6f6658',
    labelChars: 16,
  },
  fuse: {
    typeLabel: 'FUSE',
    width: 146,
    height: 96,
    fill: '#faf7f0',
    innerFill: '#ffffff',
    stroke: '#7f6a45',
    accent: '#7f6a45',
    labelChars: 16,
  },
  ats: {
    typeLabel: 'ATS',
    width: 178,
    height: 104,
    fill: '#f4f9fc',
    innerFill: '#fbfdfe',
    stroke: '#2f516c',
    accent: '#2f516c',
    labelChars: 18,
  },
  ups: {
    typeLabel: 'UPS',
    width: 170,
    height: 102,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#536776',
    accent: '#536776',
    labelChars: 18,
  },
  battery: {
    typeLabel: 'BATT',
    width: 162,
    height: 100,
    fill: '#f8faf7',
    innerFill: '#ffffff',
    stroke: '#586b53',
    accent: '#586b53',
    labelChars: 17,
  },
  solar: {
    typeLabel: 'PV',
    width: 172,
    height: 102,
    fill: '#fffbee',
    innerFill: '#fffef8',
    stroke: '#97761f',
    accent: '#97761f',
    labelChars: 17,
  },
  inverter: {
    typeLabel: 'INV',
    width: 164,
    height: 100,
    fill: '#f5f9fc',
    innerFill: '#ffffff',
    stroke: '#3d6079',
    accent: '#3d6079',
    labelChars: 17,
  },
  meter: {
    typeLabel: 'METER',
    width: 150,
    height: 96,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#586776',
    accent: '#586776',
    labelChars: 16,
  },
  capacitor: {
    typeLabel: 'CAP',
    width: 150,
    height: 96,
    fill: '#fbfaf4',
    innerFill: '#ffffff',
    stroke: '#85724f',
    accent: '#85724f',
    labelChars: 16,
  },
  relay: {
    typeLabel: 'RELAY',
    width: 156,
    height: 98,
    fill: '#f6f9fb',
    innerFill: '#ffffff',
    stroke: '#4f6676',
    accent: '#4f6676',
    labelChars: 16,
  },
  ground: {
    typeLabel: 'GND',
    width: 138,
    height: 92,
    fill: '#f7f9fa',
    innerFill: '#ffffff',
    stroke: '#5c6872',
    accent: '#5c6872',
    labelChars: 16,
  },
  busway: {
    typeLabel: 'BUS',
    width: 176,
    height: 94,
    fill: '#f4f8fb',
    innerFill: '#fbfdfe',
    stroke: '#355268',
    accent: '#355268',
    labelChars: 18,
  },
  chiller: {
    typeLabel: 'CHLR',
    width: 170,
    height: 102,
    fill: '#f2f8fc',
    innerFill: '#fbfeff',
    stroke: '#35607b',
    accent: '#35607b',
    labelChars: 17,
  },
  motor: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#f5faf6',
    innerFill: '#ffffff',
    stroke: '#2e6a4f',
    accent: '#2e6a4f',
    labelChars: 15,
  },
  lighting: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#fffbed',
    innerFill: '#fffef7',
    stroke: '#a27c18',
    accent: '#a27c18',
    labelChars: 15,
  },
  receptacle: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#faf8f2',
    innerFill: '#ffffff',
    stroke: '#6f6658',
    accent: '#6f6658',
    labelChars: 15,
  },
  equipment: {
    typeLabel: 'LOAD',
    width: 140,
    height: 96,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
  pump: {
    typeLabel: 'PUMP',
    width: 140,
    height: 98,
    fill: '#f5faf7',
    innerFill: '#ffffff',
    stroke: '#2f6251',
    accent: '#2f6251',
    labelChars: 16,
  },
  fan: {
    typeLabel: 'FAN',
    width: 138,
    height: 98,
    fill: '#f4f9fb',
    innerFill: '#ffffff',
    stroke: '#43647c',
    accent: '#43647c',
    labelChars: 16,
  },
  hvac: {
    typeLabel: 'HVAC',
    width: 168,
    height: 102,
    fill: '#f5f9fc',
    innerFill: '#ffffff',
    stroke: '#3f6178',
    accent: '#3f6178',
    labelChars: 18,
  },
  rtu: {
    typeLabel: 'RTU',
    width: 170,
    height: 102,
    fill: '#f5f9fc',
    innerFill: '#ffffff',
    stroke: '#47667a',
    accent: '#47667a',
    labelChars: 18,
  },
  boiler: {
    typeLabel: 'BLR',
    width: 156,
    height: 100,
    fill: '#fff8f1',
    innerFill: '#fffdf9',
    stroke: '#8a5b2c',
    accent: '#8a5b2c',
    labelChars: 16,
  },
  heat_exchanger: {
    typeLabel: 'HX',
    width: 148,
    height: 98,
    fill: '#f7fbfe',
    innerFill: '#ffffff',
    stroke: '#43647c',
    accent: '#43647c',
    labelChars: 16,
  },
  tank: {
    typeLabel: 'TANK',
    width: 146,
    height: 100,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
  valve: {
    typeLabel: 'VALVE',
    width: 136,
    height: 94,
    fill: '#faf8f2',
    innerFill: '#ffffff',
    stroke: '#6f6658',
    accent: '#6f6658',
    labelChars: 16,
  },
  elevator: {
    typeLabel: 'ELEV',
    width: 150,
    height: 100,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
  device: {
    typeLabel: 'DEVICE',
    width: 142,
    height: 96,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
};

const ASSEMBLY_SYMBOLS = new Set(['switchboard', 'panel', 'mcc']);

function syntaxError(lineNumber: number, line: string): SyntaxError {
  return new SyntaxError(`Invalid statement at line ${lineNumber}: ${line}`);
}

function escapeXml(text: string): string {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeSymbol(symbolType: string | null | undefined): string {
  const normalized = String(symbolType ?? 'device').toLowerCase().replace(/-/g, '_');
  return SYMBOL_ALIASES[normalized] ?? normalized;
}

function inferSymbol(node: Pick<CompiledNode, 'id' | 'label' | 'symbol'>): string {
  if (node.symbol) {
    return normalizeSymbol(node.symbol);
  }

  const probe = `${node.id} ${node.label}`.toLowerCase();

  if (probe.includes('generator') || /\bgen(set)?\b/.test(probe)) {
    return 'generator';
  }
  if (probe.includes('meter')) {
    return 'meter';
  }
  if (probe.includes('utility')) {
    return 'utility';
  }
  if (probe.includes('xfmr') || probe.includes('transformer')) {
    return 'transformer';
  }
  if (probe.includes('switchboard') || probe.includes('msb')) {
    return 'switchboard';
  }
  if (probe.includes('switchgear')) {
    return 'switchboard';
  }
  if (probe.includes('mcc')) {
    return 'mcc';
  }
  if (probe.includes('breaker') || /\bcb\b/.test(probe)) {
    return 'breaker';
  }
  if (probe.includes('disconnect') || probe.includes('isolator')) {
    return 'disconnect';
  }
  if (probe.includes('fuse')) {
    return 'fuse';
  }
  if (probe.includes('ats') || probe.includes('transfer switch')) {
    return 'ats';
  }
  if (probe.includes('ups')) {
    return 'ups';
  }
  if (probe.includes('battery')) {
    return 'battery';
  }
  if (probe.includes('solar') || /\bpv\b/.test(probe) || probe.includes('photovoltaic')) {
    return 'solar';
  }
  if (probe.includes('inverter') || /\binv\b/.test(probe)) {
    return 'inverter';
  }
  if (probe.includes('capacitor')) {
    return 'capacitor';
  }
  if (probe.includes('relay')) {
    return 'relay';
  }
  if (probe.includes('ground')) {
    return 'ground';
  }
  if (probe.includes('busway') || probe.includes('bus duct') || /\bbus\b/.test(probe)) {
    return 'busway';
  }
  if (probe.includes('panel') || /\b(lp|rp|dp)-?\d*/.test(probe)) {
    return 'panel';
  }
  if (probe.includes('chiller') || /\bchl(r|lr)?\b/.test(probe)) {
    return 'chiller';
  }
  if (probe.includes('pump')) {
    return 'pump';
  }
  if (/\bfan\b/.test(probe) || probe.includes('exhaust fan') || probe.includes('supply fan') || probe.includes('relief fan')) {
    return 'fan';
  }
  if (probe.includes('boiler')) {
    return 'boiler';
  }
  if (/\brtu\b/.test(probe) || probe.includes('rooftop unit')) {
    return 'rtu';
  }
  if (/\bahu\b/.test(probe) || probe.includes('air handler') || probe.includes('air handling') || probe.includes('hvac')) {
    return 'hvac';
  }
  if (probe.includes('elevator') || probe.includes('lift') || /\belv\b/.test(probe)) {
    return 'elevator';
  }
  if (probe.includes('tank')) {
    return 'tank';
  }
  if (probe.includes('valve')) {
    return 'valve';
  }
  if (probe.includes('lighting')) {
    return 'lighting';
  }
  if (probe.includes('receptacle')) {
    return 'receptacle';
  }
  if (probe.includes('motor')) {
    return 'motor';
  }

  return 'equipment';
}

function getSymbolSpec(symbolType: string | null | undefined): SymbolSpec {
  return SYMBOL_LIBRARY[normalizeSymbol(symbolType)] ?? SYMBOL_LIBRARY.device;
}

function resolveGlyph(symbolType: string | null | undefined, spec: SymbolSpec = getSymbolSpec(symbolType)): string {
  const symbol = normalizeSymbol(symbolType);
  const hasSymbolSpec = Object.prototype.hasOwnProperty.call(SYMBOL_LIBRARY, symbol);

  if (!hasSymbolSpec) {
    return 'device';
  }

  return spec.glyph ?? symbol;
}

function getPresentationKind(symbol: string): 'assembly' | 'device' {
  return ASSEMBLY_SYMBOLS.has(symbol) ? 'assembly' : 'device';
}

function getNodeRole(symbol: string, incomingCount: number, outgoingCount: number): 'assembly' | 'source' | 'load' | 'inline' | 'isolated' {
  if (ASSEMBLY_SYMBOLS.has(symbol) && outgoingCount > 0) {
    return 'assembly';
  }
  if (incomingCount === 0 && outgoingCount > 0) {
    return 'source';
  }
  if (incomingCount > 0 && outgoingCount === 0) {
    return 'load';
  }
  if (incomingCount > 0 && outgoingCount > 0) {
    return 'inline';
  }
  return 'isolated';
}

function getMainDeviceType(node: Pick<CompiledNode, 'params'> & { symbol: string }): string {
  const configured = String(node.params?.main ?? node.params?.input ?? '').toLowerCase();
  if (configured.includes('lug') || configured.includes('mlo')) {
    return 'mlo';
  }
  if (configured.includes('fuse')) {
    return 'fuse';
  }
  if (configured.includes('switch')) {
    return 'disconnect';
  }

  return node.symbol === 'panel' ? 'mlo' : 'breaker';
}

function wrapText(text: string, maxChars: number): string[] {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [''];
  }

  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      if (word.length <= maxChars) {
        current = word;
        continue;
      }

      const chunks = word.match(new RegExp(`.{1,${Math.max(1, maxChars)}}`, 'g')) ?? [word];
      lines.push(...chunks.slice(0, -1));
      current = chunks[chunks.length - 1] ?? '';
      continue;
    }

    const candidate = `${current} ${word}`;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    lines.push(current);
    if (word.length <= maxChars) {
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

function textY(baseY: number, index: number, lineHeightPx: number): number {
  return baseY + index * lineHeightPx;
}

function renderTextLines(lines: string[], x: number, y: number, options: TextRenderOptions = {}): string {
  const {
    anchor = 'middle',
    fontSize = 12,
    fontFamily = 'Trebuchet MS, Verdana, sans-serif',
    fontWeight = '400',
    fill = '#1a2833',
    lineHeightPx = Math.round(fontSize * 1.2),
  } = options;

  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${textY(y, index, lineHeightPx)}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${escapeXml(line)}</text>`,
    )
    .join('');
}

function getNodeVisual(node: CompiledNode, topology: TopologyCounts = {}): NodeVisual {
  const incomingCount = topology.incomingCount ?? 0;
  const outgoingCount = topology.outgoingCount ?? 0;
  const symbol = inferSymbol(node);
  const spec = getSymbolSpec(symbol);
  const glyph = resolveGlyph(symbol, spec);
  const presentation = getPresentationKind(symbol);
  const role = getNodeRole(symbol, incomingCount, outgoingCount);
  const labelLines = wrapText(node.label, spec.labelChars);
  const labelFontSize = 13;
  const labelLineHeight = 15;
  const labelHeight = labelLines.length * labelLineHeight;
  const labelBlockHeight = labelHeight + 14;
  const hasInputTerminal = incomingCount > 0;
  const hasOutputTerminal = outgoingCount > 0;
  const connectionRows = Math.max(1, incomingCount, outgoingCount);
  const assemblyCoreHeight = presentation === 'assembly' ? Math.max(64, connectionRows * 20 + 18) : 0;
  const deviceWidth = spec.width;
  const deviceHeight =
    presentation === 'assembly'
      ? Math.max(spec.height, 52 + assemblyCoreHeight + labelBlockHeight)
      : Math.max(spec.height, 74 + labelHeight, 72 + connectionRows * 6 + labelHeight);
  const paramLines = Object.entries(node.params ?? {}).map(([key, value]) => `${key}: ${value}`);
  const paramWidth = paramLines.length
    ? Math.max(deviceWidth - 20, ...paramLines.map((line) => line.length * 6.4 + 24))
    : 0;
  const paramHeight = paramLines.length ? paramLines.length * 16 + 20 : 0;
  const totalWidth = Math.max(deviceWidth, paramWidth);
  const totalHeight = deviceHeight + (paramHeight ? 14 + paramHeight : 0);

  return {
    ...node,
    symbol,
    glyph,
    spec,
    presentation,
    role,
    incomingCount,
    outgoingCount,
    hasInputTerminal,
    hasOutputTerminal,
    connectionRows,
    mainDeviceType: getMainDeviceType({ ...node, symbol }),
    labelLines,
    labelFontSize,
    labelLineHeight,
    labelBlockHeight,
    paramLines,
    deviceWidth,
    deviceHeight,
    paramWidth,
    paramHeight,
    totalWidth,
    totalHeight,
  };
}

function renderSymbolGlyph(symbolType: string, x: number, y: number, width: number, height: number, spec: SymbolSpec): string {
  const symbol = resolveGlyph(symbolType, spec);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = spec.stroke;
  const accent = spec.accent;
  const fill = spec.innerFill;

  switch (symbol) {
    case 'utility': {
      const bodyX = x + 18;
      const bodyY = y + 12;
      const bodyW = width - 36;
      const bodyH = height - 24;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${bodyX + 10}" y="${bodyY + 10}" width="${bodyW - 20}" height="${bodyH - 20}" rx="8" fill="#ffffff" stroke="#d3dde3" stroke-width="1"/>
        <path d="M ${bodyX + 16} ${bodyY + bodyH - 18} H ${bodyX + bodyW - 16}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${bodyX + bodyW * 0.28} ${bodyY} V ${bodyY - 10} M ${bodyX + bodyW * 0.5} ${bodyY} V ${bodyY - 14} M ${bodyX + bodyW * 0.72} ${bodyY} V ${bodyY - 10}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${bodyX + bodyW * 0.28}" cy="${bodyY - 10}" r="3" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>
        <circle cx="${bodyX + bodyW * 0.5}" cy="${bodyY - 14}" r="3" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>
        <circle cx="${bodyX + bodyW * 0.72}" cy="${bodyY - 10}" r="3" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>
        <path d="M ${cx} ${bodyY + bodyH} V ${bodyY + bodyH + 10} M ${cx - 16} ${bodyY + bodyH + 10} H ${cx + 16} M ${cx - 11} ${bodyY + bodyH + 16} H ${cx + 11} M ${cx - 6} ${bodyY + bodyH + 22} H ${cx + 6}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    case 'transformer': {
      const bodyX = x + 20;
      const bodyY = y + 10;
      const bodyW = width - 40;
      const bodyH = height - 20;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${bodyX + 10}" y="${bodyY + 10}" width="${bodyW - 20}" height="${bodyH - 20}" rx="7" fill="#ffffff" stroke="#d3dde3" stroke-width="1"/>
        <path d="M ${bodyX + 18} ${bodyY + 20} H ${bodyX + bodyW - 18} M ${bodyX + 18} ${bodyY + 28} H ${bodyX + bodyW - 18} M ${bodyX + 18} ${bodyY + 36} H ${bodyX + bodyW - 18} M ${bodyX + 18} ${bodyY + 44} H ${bodyX + bodyW - 18}" fill="none" stroke="#b3c2cb" stroke-width="1" stroke-linecap="round"/>
        <path d="M ${bodyX + bodyW * 0.34} ${bodyY} V ${bodyY - 10} M ${bodyX + bodyW * 0.66} ${bodyY} V ${bodyY - 10}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${bodyX + bodyW * 0.34}" cy="${bodyY - 10}" r="3" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>
        <circle cx="${bodyX + bodyW * 0.66}" cy="${bodyY - 10}" r="3" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>
        <rect x="${bodyX + 16}" y="${bodyY + bodyH - 18}" width="${bodyW - 32}" height="8" rx="3" fill="#eef2f5" stroke="#c7d2d9" stroke-width="0.8"/>`;
    }
    case 'switchboard': {
      const bodyX = x + 18;
      const bodyY = y + 10;
      const bodyW = width - 36;
      const bodyH = height - 20;
      const sectionWidth = bodyW / 4;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 10} ${bodyY + 16} H ${bodyX + bodyW - 10}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M ${bodyX + 10} ${bodyY + bodyH - 14} H ${bodyX + bodyW - 10}" fill="none" stroke="#cc8a2f" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M ${bodyX + sectionWidth} ${bodyY + 10} V ${bodyY + bodyH - 10} M ${bodyX + sectionWidth * 2} ${bodyY + 10} V ${bodyY + bodyH - 10} M ${bodyX + sectionWidth * 3} ${bodyY + 10} V ${bodyY + bodyH - 10}" fill="none" stroke="#9eb0bc" stroke-width="1.1"/>`;
    }
    case 'panel': {
      const bodyX = x + 28;
      const bodyY = y + 8;
      const bodyW = width - 56;
      const bodyH = height - 16;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + bodyW / 2} ${bodyY + 10} V ${bodyY + bodyH - 10}" fill="none" stroke="#9eb0bc" stroke-width="1.1"/>
        <path d="M ${bodyX + 12} ${bodyY + 18} H ${bodyX + bodyW - 12}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="${bodyX + bodyW / 2}" cy="${bodyY + bodyH - 18}" r="4.5" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>`;
    }
    case 'mcc': {
      const bodyX = x + 14;
      const bodyY = y + 8;
      const bodyW = width - 28;
      const bodyH = height - 16;
      const bucketWidth = (bodyW - 16) / 3;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 8} ${bodyY + 16} H ${bodyX + bodyW - 8}" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
        <rect x="${bodyX + 8}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>
        <rect x="${bodyX + 8 + bucketWidth + 8}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>
        <rect x="${bodyX + 8 + (bucketWidth + 8) * 2}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>`;
    }
    case 'generator': {
      const r = Math.min(width, height) * 0.24;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - r * 1.7} ${cy} H ${cx - r * 0.4} M ${cx + r * 0.4} ${cy} H ${cx + r * 1.7}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(r * 0.95)}" font-weight="700" fill="${accent}">G</text>
        <path d="M ${cx - r * 0.75} ${cy - r * 1.18} Q ${cx} ${cy - r * 1.5} ${cx + r * 0.75} ${cy - r * 1.18}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    case 'breaker': {
      const leftX = cx - width * 0.18;
      const rightX = cx + width * 0.18;
      return `<path d="M ${x + 12} ${cy} H ${leftX - 6} M ${rightX + 6} ${cy} H ${x + width - 12}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="${leftX}" cy="${cy}" r="4.5" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="${rightX}" cy="${cy}" r="4.5" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${leftX + 4} ${cy - 14} L ${rightX - 4} ${cy + 8}" fill="none" stroke="${accent}" stroke-width="2.1" stroke-linecap="round"/>`;
    }
    case 'disconnect': {
      const leftX = cx - width * 0.18;
      const rightX = cx + width * 0.18;
      return `<path d="M ${x + 12} ${cy} H ${leftX - 6} M ${rightX + 6} ${cy} H ${x + width - 12}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="${leftX}" cy="${cy}" r="4.5" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="${rightX}" cy="${cy}" r="4.5" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${leftX + 4} ${cy} L ${rightX - 8} ${cy - 16}" fill="none" stroke="${accent}" stroke-width="2.1" stroke-linecap="round"/>
        <circle cx="${rightX - 5}" cy="${cy - 16}" r="2.8" fill="${accent}"/>`;
    }
    case 'fuse': {
      const bodyX = cx - width * 0.18;
      const bodyY = cy - height * 0.12;
      const bodyW = width * 0.36;
      const bodyH = height * 0.24;
      return `<path d="M ${x + 12} ${cy} H ${bodyX} M ${bodyX + bodyW} ${cy} H ${x + width - 12}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${bodyX + 10} ${cy} H ${bodyX + bodyW - 10}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M ${cx - 10} ${cy - 8} L ${cx + 10} ${cy + 8}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    case 'ats': {
      const bodyX = x + 18;
      const bodyY = y + 12;
      const bodyW = width - 36;
      const bodyH = height - 24;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 18} ${cy - 16} H ${cx - 10} L ${cx + 8} ${cy} L ${cx - 10} ${cy + 16} H ${bodyX + 18}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${bodyX + bodyW - 18} ${cy - 16} H ${cx + 10} M ${bodyX + bodyW - 18} ${cy + 16} H ${cx + 10}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${accent}"/>`;
    }
    case 'ups': {
      const bodyX = x + 20;
      const bodyY = y + 10;
      const bodyW = width - 40;
      const bodyH = height - 20;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 14} ${cy} C ${bodyX + 28} ${cy - 10}, ${bodyX + 36} ${cy + 10}, ${bodyX + 50} ${cy} S ${bodyX + 72} ${cy - 10}, ${bodyX + 86} ${cy}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <rect x="${bodyX + bodyW - 34}" y="${cy - 12}" width="18" height="24" rx="4" fill="#ffffff" stroke="${stroke}" stroke-width="1.2"/>
        <path d="M ${bodyX + bodyW - 12} ${cy - 4} H ${bodyX + bodyW - 8} M ${bodyX + bodyW - 12} ${cy + 4} H ${bodyX + bodyW - 8}" fill="none" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    case 'battery': {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.14;
      const bodyW = width * 0.32;
      const bodyH = height * 0.28;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <rect x="${bodyX + bodyW}" y="${cy - 8}" width="8" height="16" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
        <path d="M ${bodyX + 16} ${cy} H ${bodyX + 30} M ${bodyX + 54} ${cy} H ${bodyX + 68} M ${bodyX + 61} ${cy - 7} V ${cy + 7}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>`;
    }
    case 'solar': {
      const panelX = cx - width * 0.16;
      const panelY = cy - height * 0.02;
      const panelW = width * 0.32;
      const panelH = height * 0.22;
      return `<circle cx="${cx + panelW * 0.45}" cy="${cy - panelH - 12}" r="9" fill="#fff7c7" stroke="${accent}" stroke-width="1.3"/>
        <path d="M ${cx + panelW * 0.45} ${cy - panelH - 28} V ${cy - panelH - 22} M ${cx + panelW * 0.45} ${cy - panelH - 2} V ${cy - panelH + 4} M ${cx + panelW * 0.45 - 14} ${cy - panelH - 12} H ${cx + panelW * 0.45 - 8} M ${cx + panelW * 0.45 + 8} ${cy - panelH - 12} H ${cx + panelW * 0.45 + 14}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
        <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${panelX + panelW / 3} ${panelY} V ${panelY + panelH} M ${panelX + (panelW / 3) * 2} ${panelY} V ${panelY + panelH} M ${panelX} ${panelY + panelH / 2} H ${panelX + panelW}" fill="none" stroke="${accent}" stroke-width="1.1"/>`;
    }
    case 'inverter': {
      const bodyX = x + 18;
      const bodyY = y + 12;
      const bodyW = width - 36;
      const bodyH = height - 24;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 18} ${cy} C ${bodyX + 26} ${cy - 10}, ${bodyX + 36} ${cy + 10}, ${bodyX + 46} ${cy} S ${bodyX + 66} ${cy - 10}, ${bodyX + 76} ${cy}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M ${bodyX + bodyW - 70} ${cy - 10} L ${bodyX + bodyW - 42} ${cy} L ${bodyX + bodyW - 70} ${cy + 10}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${bodyX + bodyW - 70} ${cy} H ${bodyX + bodyW - 22}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    case 'meter': {
      const r = Math.min(width, height) * 0.22;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx} ${cy} L ${cx + r * 0.62} ${cy - r * 0.38}" fill="none" stroke="${accent}" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M ${cx - r * 0.72} ${cy + r * 0.46} Q ${cx} ${cy + r * 0.84} ${cx + r * 0.72} ${cy + r * 0.46}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    case 'capacitor': {
      return `<path d="M ${x + 18} ${cy} H ${cx - 16} M ${cx + 16} ${cy} H ${x + width - 18}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - 8} ${cy - 16} V ${cy + 16} M ${cx + 8} ${cy - 16} V ${cy + 16}" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`;
    }
    case 'relay': {
      const bodyX = x + 20;
      const bodyY = y + 12;
      const bodyW = width - 40;
      const bodyH = height - 24;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 18} ${cy + 10} q 6 -20 12 0 t 12 0 t 12 0" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M ${bodyX + bodyW - 44} ${cy - 12} V ${cy + 12} M ${bodyX + bodyW - 32} ${cy - 4} L ${bodyX + bodyW - 16} ${cy - 12}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'ground': {
      return `<path d="M ${cx} ${cy - 20} V ${cy - 2} M ${cx - 18} ${cy - 2} H ${cx + 18} M ${cx - 12} ${cy + 6} H ${cx + 12} M ${cx - 6} ${cy + 14} H ${cx + 6}" fill="none" stroke="${accent}" stroke-width="1.9" stroke-linecap="round"/>`;
    }
    case 'busway': {
      return `<path d="M ${x + 18} ${cy} H ${x + width - 18}" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${cx - 34} ${cy - 16} V ${cy + 16} M ${cx} ${cy - 16} V ${cy + 16} M ${cx + 34} ${cy - 16} V ${cy + 16}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'chiller': {
      const bodyX = x + 16;
      const bodyY = y + 12;
      const bodyW = width - 32;
      const bodyH = height - 24;
      const fanR = Math.min(bodyW, bodyH) * 0.17;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="${bodyX + bodyW * 0.33}" cy="${cy}" r="${fanR}" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="${bodyX + bodyW * 0.67}" cy="${cy}" r="${fanR}" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <path d="M ${bodyX + 12} ${bodyY + bodyH - 10} C ${bodyX + 24} ${bodyY + bodyH - 4}, ${bodyX + 34} ${bodyY + bodyH - 16}, ${bodyX + 46} ${bodyY + bodyH - 10} S ${bodyX + 68} ${bodyY + bodyH - 4}, ${bodyX + 80} ${bodyY + bodyH - 10}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'motor': {
      const r = Math.min(width, height) * 0.27;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(r)}" font-weight="700" fill="${accent}">M</text>`;
    }
    case 'lighting': {
      const r = Math.min(width, height) * 0.2;
      return `<circle cx="${cx}" cy="${cy + 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${cy - r - 10} V ${cy - r * 0.35} M ${cx - r * 1.4} ${cy + 2} H ${cx + r * 1.4} M ${cx - r * 0.8} ${cy + r * 1.15} H ${cx + r * 0.8}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    case 'receptacle': {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.18;
      const bodyW = width * 0.32;
      const bodyH = height * 0.36;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 8} ${cy - 6} V ${cy + 4} M ${cx + 8} ${cy - 6} V ${cy + 4}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy + 12}" r="2.2" fill="${accent}"/>`;
    }
    case 'pump': {
      const r = Math.min(width, height) * 0.24;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - r * 1.6} ${cy} H ${cx - r * 0.3} M ${cx + r * 0.3} ${cy} H ${cx + r * 1.6}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - r * 0.55} ${cy} H ${cx + r * 0.55} M ${cx + r * 0.25} ${cy - r * 0.35} L ${cx + r * 0.55} ${cy} L ${cx + r * 0.25} ${cy + r * 0.35}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'fan': {
      const r = Math.min(width, height) * 0.24;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${accent}"/>
        <path d="M ${cx} ${cy - 2} Q ${cx + r * 0.75} ${cy - r * 0.9} ${cx + r * 0.25} ${cy + r * 0.08}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M ${cx - 2} ${cy + 1} Q ${cx - r * 0.95} ${cy + r * 0.28} ${cx - r * 0.12} ${cy + r * 0.54}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M ${cx + 1} ${cy + 2} Q ${cx + r * 0.2} ${cy + r * 1.02} ${cx - r * 0.38} ${cy + r * 0.08}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    case 'hvac': {
      const bodyX = x + 16;
      const bodyY = y + 12;
      const bodyW = width - 32;
      const bodyH = height - 24;
      const fanR = Math.min(bodyW, bodyH) * 0.16;
      const fanCx = bodyX + bodyW * 0.32;
      const coilX = bodyX + bodyW * 0.56;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="${fanCx}" cy="${cy}" r="${fanR}" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="${fanCx}" cy="${cy}" r="3.5" fill="${accent}"/>
        <path d="M ${fanCx} ${cy - 2} Q ${fanCx + fanR * 0.7} ${cy - fanR * 0.8} ${fanCx + fanR * 0.22} ${cy + fanR * 0.05} M ${fanCx - 2} ${cy + 1} Q ${fanCx - fanR * 0.88} ${cy + fanR * 0.28} ${fanCx - fanR * 0.1} ${cy + fanR * 0.5} M ${fanCx + 1} ${cy + 2} Q ${fanCx + fanR * 0.18} ${cy + fanR * 0.95} ${fanCx - fanR * 0.35} ${cy + fanR * 0.08}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${coilX} ${bodyY + 14} C ${coilX + 8} ${bodyY + 8}, ${coilX + 18} ${bodyY + 20}, ${coilX + 26} ${bodyY + 14} S ${coilX + 42} ${bodyY + 20}, ${coilX + 50} ${bodyY + 14} M ${coilX} ${bodyY + 28} C ${coilX + 8} ${bodyY + 22}, ${coilX + 18} ${bodyY + 34}, ${coilX + 26} ${bodyY + 28} S ${coilX + 42} ${bodyY + 34}, ${coilX + 50} ${bodyY + 28}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'rtu': {
      const bodyX = x + 16;
      const bodyY = y + 16;
      const bodyW = width - 32;
      const bodyH = height - 30;
      const fanR = Math.min(bodyW, bodyH) * 0.15;
      return `<path d="M ${bodyX + 8} ${bodyY - 6} H ${bodyX + bodyW - 8}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="${bodyX + bodyW * 0.3}" cy="${cy + 4}" r="${fanR}" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="${bodyX + bodyW * 0.3}" cy="${cy + 4}" r="3.5" fill="${accent}"/>
        <path d="M ${bodyX + bodyW * 0.55} ${bodyY + 12} H ${bodyX + bodyW - 16} M ${bodyX + bodyW * 0.55} ${bodyY + 22} H ${bodyX + bodyW - 16} M ${bodyX + bodyW * 0.55} ${bodyY + 32} H ${bodyX + bodyW - 16}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${bodyX + bodyW - 18} ${bodyY} V ${bodyY - 8} H ${bodyX + bodyW - 6}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'boiler': {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.18;
      const bodyW = width * 0.32;
      const bodyH = height * 0.42;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${bodyY + 14} C ${cx + 8} ${bodyY + 8}, ${cx + 10} ${bodyY + 24}, ${cx} ${bodyY + 30} C ${cx - 10} ${bodyY + 24}, ${cx - 8} ${bodyY + 8}, ${cx} ${bodyY + 14}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${bodyX + 14} ${bodyY + bodyH} H ${bodyX + bodyW - 14} M ${cx} ${bodyY + bodyH} V ${bodyY + bodyH + 10}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'heat_exchanger': {
      const bodyX = x + 16;
      const bodyY = y + 10;
      const bodyW = width - 32;
      const bodyH = height - 20;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 10} ${bodyY + 12} L ${bodyX + bodyW - 10} ${bodyY + bodyH - 12} M ${bodyX + bodyW - 10} ${bodyY + 12} L ${bodyX + 10} ${bodyY + bodyH - 12}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    case 'tank': {
      const r = Math.min(width, height) * 0.22;
      const top = cy - r * 1.2;
      const bottom = cy + r * 1.25;
      return `<ellipse cx="${cx}" cy="${top}" rx="${r}" ry="${r * 0.45}" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx - r} ${top} V ${bottom} M ${cx + r} ${top} V ${bottom}" fill="none" stroke="${stroke}" stroke-width="1.7"/>
        <ellipse cx="${cx}" cy="${bottom}" rx="${r}" ry="${r * 0.45}" fill="none" stroke="${stroke}" stroke-width="1.7"/>`;
    }
    case 'valve': {
      const r = Math.min(width, height) * 0.16;
      return `<path d="M ${cx - r * 2.4} ${cy} H ${cx - r} M ${cx + r} ${cy} H ${cx + r * 2.4}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - r} ${cy - r} L ${cx} ${cy} L ${cx - r} ${cy + r} M ${cx + r} ${cy - r} L ${cx} ${cy} L ${cx + r} ${cy + r}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'elevator': {
      const shaftX = cx - width * 0.14;
      const shaftY = cy - height * 0.22;
      const shaftW = width * 0.28;
      const shaftH = height * 0.44;
      return `<rect x="${shaftX}" y="${shaftY}" width="${shaftW}" height="${shaftH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${shaftX + 10}" y="${cy - 10}" width="${shaftW - 20}" height="20" rx="4" fill="#ffffff" stroke="${accent}" stroke-width="1.3"/>
        <path d="M ${cx} ${shaftY + 12} L ${cx - 7} ${shaftY + 22} H ${cx + 7} Z M ${cx} ${shaftY + shaftH - 12} L ${cx - 7} ${shaftY + shaftH - 22} H ${cx + 7} Z" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    case 'equipment': {
      const bodyX = cx - width * 0.18;
      const bodyY = cy - height * 0.2;
      const bodyW = width * 0.36;
      const bodyH = height * 0.4;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="${bodyX + 14}" cy="${bodyY + 14}" r="4" fill="#ffffff" stroke="${accent}" stroke-width="1.2"/>
        <path d="M ${bodyX + 26} ${bodyY + 14} H ${bodyX + bodyW - 12} M ${bodyX + 12} ${bodyY + bodyH - 16} H ${bodyX + bodyW - 12}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'device':
    default: {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.18;
      const bodyW = width * 0.32;
      const bodyH = height * 0.36;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 8} ${bodyY + 8} L ${bodyX + bodyW - 8} ${bodyY + bodyH - 8} M ${bodyX + bodyW - 8} ${bodyY + 8} L ${bodyX + 8} ${bodyY + bodyH - 8}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}">?</text>`;
    }
  }
}

export function parseDiagram(source: string): DiagramProgram {
  if (typeof source !== 'string' || source.trim() === '') {
    throw new TypeError('Diagram source must be a non-empty string.');
  }

  const lines = source.split(/\r?\n/);
  const ast: DiagramProgram = {
    type: 'DiagramProgram',
    title: null,
    statements: [],
  };

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      if (ast.title !== null) {
        throw new SyntaxError(`Only one title is allowed. Duplicate at line ${lineNumber}.`);
      }
      ast.title = titleMatch[1];
      continue;
    }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      ast.statements.push({
        type: 'NodeDeclaration',
        id: nodeMatch[1],
        label: nodeMatch[2],
        symbol: nodeMatch[3] ?? null,
        line: lineNumber,
      });
      continue;
    }

    const edgeMatch = line.match(EDGE_RE);
    if (edgeMatch) {
      ast.statements.push({
        type: 'EdgeDeclaration',
        from: edgeMatch[1],
        to: edgeMatch[2],
        label: edgeMatch[3] ?? null,
        line: lineNumber,
      });
      continue;
    }

    const paramMatch = line.match(PARAM_RE);
    if (paramMatch) {
      ast.statements.push({
        type: 'ParamDeclaration',
        nodeId: paramMatch[1],
        key: paramMatch[2],
        value: paramMatch[3] !== undefined ? paramMatch[3] : paramMatch[4],
        line: lineNumber,
      });
      continue;
    }

    throw syntaxError(lineNumber, rawLine);
  }

  if (ast.statements.length === 0) {
    throw new SyntaxError('Diagram source must include at least one node or edge statement.');
  }

  return ast;
}

export function compileDiagram(ast: DiagramProgram): CompiledDiagram {
  if (!ast || ast.type !== 'DiagramProgram' || !Array.isArray(ast.statements)) {
    throw new TypeError('compileDiagram expects the output of parseDiagram.');
  }

  const nodes = new Map<string, CompiledNode>();
  const edges: CompiledEdge[] = [];

  for (const statement of ast.statements) {
    if (statement.type === 'NodeDeclaration') {
      if (nodes.has(statement.id)) {
        throw new SyntaxError(`Duplicate node id "${statement.id}" at line ${statement.line}.`);
      }

      nodes.set(statement.id, {
        id: statement.id,
        label: statement.label,
        symbol: statement.symbol ?? null,
        params: {},
      });
      continue;
    }

    if (statement.type === 'ParamDeclaration') {
      if (!nodes.has(statement.nodeId)) {
        throw new SyntaxError(`Unknown node "${statement.nodeId}" for param at line ${statement.line}.`);
      }

      nodes.get(statement.nodeId).params[statement.key] = statement.value;
      continue;
    }

    if (statement.type === 'EdgeDeclaration') {
      if (!nodes.has(statement.from)) {
        throw new SyntaxError(`Unknown source node "${statement.from}" for edge at line ${statement.line}.`);
      }
      if (!nodes.has(statement.to)) {
        throw new SyntaxError(`Unknown target node "${statement.to}" for edge at line ${statement.line}.`);
      }

      edges.push({
        from: statement.from,
        to: statement.to,
        label: statement.label,
      });
    }
  }

  return {
    type: 'CompiledDiagram',
    title: ast.title,
    nodes: [...nodes.values()],
    edges,
  };
}

function buildGraph(compiled: CompiledDiagram): GraphInfo {
  const order = compiled.nodes.map((node) => node.id);
  const outgoing = new Map<string, CompiledEdge[]>(order.map((id) => [id, []]));
  const incoming = new Map<string, CompiledEdge[]>(order.map((id) => [id, []]));
  const indegree = new Map<string, number>(order.map((id) => [id, 0]));

  for (const edge of compiled.edges) {
    outgoing.get(edge.from).push(edge);
    incoming.get(edge.to).push(edge);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = order.filter((id) => (indegree.get(id) ?? 0) === 0);
  const topo: string[] = [];
  const seen = new Set();

  while (queue.length) {
    const id = queue.shift();
    topo.push(id);
    seen.add(id);

    for (const edge of outgoing.get(id) ?? []) {
      const nextDegree = (indegree.get(edge.to) ?? 0) - 1;
      indegree.set(edge.to, nextDegree);
      if (nextDegree === 0) {
        queue.push(edge.to);
      }
    }
  }

  for (const id of order) {
    if (!seen.has(id)) {
      topo.push(id);
    }
  }

  const level = new Map<string, number>();
  for (const id of topo) {
    let maxLevel = 0;
    for (const edge of incoming.get(id) ?? []) {
      maxLevel = Math.max(maxLevel, (level.get(edge.from) ?? 0) + 1);
    }
    level.set(id, maxLevel);
  }

  const primaryParent = new Map<string, string>();
  for (const edge of compiled.edges) {
    if (!primaryParent.has(edge.to)) {
      primaryParent.set(edge.to, edge.from);
    }
  }

  const treeChildren = new Map<string, string[]>(order.map((id) => [id, []]));
  for (const edge of compiled.edges) {
    if (primaryParent.get(edge.to) === edge.from) {
      treeChildren.get(edge.from).push(edge.to);
    }
  }

  const roots: string[] = [];
  const rootSet = new Set();
  for (const id of order) {
    if ((incoming.get(id) ?? []).length === 0) {
      roots.push(id);
      rootSet.add(id);
    }
  }
  for (const id of topo) {
    if (!primaryParent.has(id) && !rootSet.has(id)) {
      roots.push(id);
      rootSet.add(id);
    }
  }
  if (!roots.length && topo.length) {
    roots.push(topo[0]);
  }

  return {
    outgoing,
    incoming,
    topo,
    level,
    treeChildren,
    roots,
  };
}

function layoutDiagram(compiled: CompiledDiagram, options: LayoutOptions = {}): DiagramLayout {
  const margin = options.margin ?? 52;
  const titleOffset = compiled.title ? 64 : 28;
  const columnGap = options.columnGap ?? 136;
  const rowGap = options.rowGap ?? 46;
  const rootGap = options.rootGap ?? 70;

  const graph = buildGraph(compiled);
  const nodesById = new Map(
    compiled.nodes.map((node) => [
      node.id,
      getNodeVisual(node, {
        incomingCount: (graph.incoming.get(node.id) ?? []).length,
        outgoingCount: (graph.outgoing.get(node.id) ?? []).length,
      }),
    ]),
  );
  const maxLevel = Math.max(...compiled.nodes.map((node) => graph.level.get(node.id) ?? 0), 0);
  const levelWidths = Array.from({ length: maxLevel + 1 }, (): number => 0);

  for (const node of nodesById.values()) {
    const nodeLevel = graph.level.get(node.id) ?? 0;
    levelWidths[nodeLevel] = Math.max(levelWidths[nodeLevel], node.totalWidth);
  }

  const xPositions: number[] = [];
  for (let index = 0; index <= maxLevel; index += 1) {
    if (index === 0) {
      xPositions.push(margin);
      continue;
    }
    xPositions.push(xPositions[index - 1] + levelWidths[index - 1] + columnGap);
  }

  for (const node of nodesById.values()) {
    const nodeLevel = graph.level.get(node.id) ?? 0;
    const blockX = xPositions[nodeLevel] + (levelWidths[nodeLevel] - node.totalWidth) / 2;
    node.level = nodeLevel;
    node.blockX = blockX;
    node.deviceX = blockX + (node.totalWidth - node.deviceWidth) / 2;
    node.paramX = node.paramWidth ? blockX + (node.totalWidth - node.paramWidth) / 2 : blockX;
  }

  const subtreeHeightMemo = new Map<string, number>();
  function getSubtreeHeight(nodeId: string): number {
    if (subtreeHeightMemo.has(nodeId)) {
      return subtreeHeightMemo.get(nodeId);
    }

    const node = nodesById.get(nodeId);
    const children = graph.treeChildren.get(nodeId) ?? [];
    let subtreeHeight = node.totalHeight;

    if (children.length) {
      const childHeight = children.reduce((sum, childId, index) => {
        return sum + getSubtreeHeight(childId) + (index > 0 ? rowGap : 0);
      }, 0);
      subtreeHeight = Math.max(subtreeHeight, childHeight);
    }

    subtreeHeightMemo.set(nodeId, subtreeHeight);
    return subtreeHeight;
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  function assignNode(nodeId: string, top: number): void {
    const node = nodesById.get(nodeId);
    const children = graph.treeChildren.get(nodeId) ?? [];
    const subtreeHeight = getSubtreeHeight(nodeId);
    let firstChildCenterY = null;
    let lastChildCenterY = null;

    if (children.length) {
      const totalChildrenHeight = children.reduce((sum, childId, index) => {
        return sum + getSubtreeHeight(childId) + (index > 0 ? rowGap : 0);
      }, 0);
      let cursor = top + (subtreeHeight - totalChildrenHeight) / 2;

      for (const childId of children) {
        assignNode(childId, cursor);
        const child = nodesById.get(childId);
        if (firstChildCenterY === null) {
          firstChildCenterY = child.anchorY;
        }
        lastChildCenterY = child.anchorY;
        cursor += getSubtreeHeight(childId) + rowGap;
      }
    }

    if (firstChildCenterY !== null && lastChildCenterY !== null) {
      const desiredTop = (firstChildCenterY + lastChildCenterY) / 2 - node.deviceHeight / 2;
      node.blockY = clamp(desiredTop, top, top + subtreeHeight - node.totalHeight);
    } else {
      node.blockY = top + (subtreeHeight - node.totalHeight) / 2;
    }

    node.deviceY = node.blockY;
    node.paramY = node.paramHeight ? node.deviceY + node.deviceHeight + 14 : null;
    node.anchorY = node.deviceY + node.deviceHeight / 2;
  }

  const assigned = new Set();
  let cursor = margin + titleOffset;
  for (const rootId of graph.roots) {
    if (assigned.has(rootId)) {
      continue;
    }
    assignNode(rootId, cursor);

    const stack = [rootId];
    while (stack.length) {
      const currentId = stack.pop();
      if (assigned.has(currentId)) {
        continue;
      }
      assigned.add(currentId);
      for (const childId of graph.treeChildren.get(currentId) ?? []) {
        stack.push(childId);
      }
    }

    cursor += getSubtreeHeight(rootId) + rootGap;
  }

  for (const nodeId of graph.topo) {
    if (!assigned.has(nodeId)) {
      assignNode(nodeId, cursor);
      assigned.add(nodeId);
      cursor += getSubtreeHeight(nodeId) + rootGap;
    }
  }

  function spreadPorts(count: number, centerY: number, topY: number, bottomY: number, gap = 18): number[] {
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

  function getTerminalBand(node: NodeVisual): { top: number; bottom: number } {
    const top = node.presentation === 'assembly' ? node.deviceY + 58 : node.deviceY + 42;
    const bottom = node.deviceY + node.deviceHeight - node.labelBlockHeight - 18;
    const safeBottom = Math.max(top, bottom);

    return { top, bottom: safeBottom };
  }

  for (const node of nodesById.values()) {
    const terminalBand = getTerminalBand(node);
    const orderedInputs = [...(graph.incoming.get(node.id) ?? [])].sort((left, right) => {
      const leftSource = nodesById.get(left.from);
      const rightSource = nodesById.get(right.from);
      return leftSource.anchorY - rightSource.anchorY;
    });
    const orderedOutputs = [...(graph.outgoing.get(node.id) ?? [])].sort((left, right) => {
      const leftTarget = nodesById.get(left.to);
      const rightTarget = nodesById.get(right.to);
      return leftTarget.anchorY - rightTarget.anchorY;
    });

    node.inputTerminalX = node.deviceX;
    node.outputTerminalX = node.deviceX + node.deviceWidth;
    node.inputPorts = orderedInputs.map((edge, index) => ({
      key: `${edge.from}->${edge.to}`,
      x: node.inputTerminalX,
      y: spreadPorts(orderedInputs.length, node.anchorY, terminalBand.top, terminalBand.bottom)[index],
      index,
    }));
    node.outputPorts = orderedOutputs.map((edge, index) => ({
      key: `${edge.from}->${edge.to}`,
      x: node.outputTerminalX,
      y: spreadPorts(orderedOutputs.length, node.anchorY, terminalBand.top, terminalBand.bottom)[index],
      index,
    }));
    node.inputPortMap = new Map(node.inputPorts.map((port) => [port.key, port]));
    node.outputPortMap = new Map(node.outputPorts.map((port) => [port.key, port]));
  }

  const edgeLayouts: EdgeLayout[] = compiled.edges.map((edge) => {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    const key = `${edge.from}->${edge.to}`;
    const fromPort: PortLayout = from.outputPortMap.get(key) ?? {
      key,
      x: from.outputTerminalX,
      y: from.anchorY,
      index: 0,
    };
    const toPort: PortLayout = to.inputPortMap.get(key) ?? {
      key,
      x: to.inputTerminalX,
      y: to.anchorY,
      index: 0,
    };
    const siblingCount = from.outputPorts.length;
    const slot = fromPort.index;
    const availableGap = Math.max(28, toPort.x - fromPort.x - 48);
    const slotStep = siblingCount > 1 ? Math.min(18, availableGap / (siblingCount + 1)) : 0;
    let laneX = fromPort.x + 28 + slot * slotStep;
    const maxLaneX = toPort.x - 28;

    if (laneX > maxLaneX) {
      laneX = fromPort.x + Math.max(18, (toPort.x - fromPort.x) / 2);
    }

    const path = `M ${fromPort.x} ${fromPort.y} H ${laneX} V ${toPort.y} H ${toPort.x}`;

    return {
      ...edge,
      from,
      to,
      fromPort,
      toPort,
      path,
      labelX: Math.min(laneX + 8, toPort.x - 52),
      labelY: fromPort.y === toPort.y ? fromPort.y - 8 : (fromPort.y + toPort.y) / 2 - 6,
    };
  });

  const width = xPositions[maxLevel] + levelWidths[maxLevel] + margin;
  const height = cursor + margin - rootGap;

  return {
    width: Math.max(width, 320),
    height: Math.max(height, 240),
    titleOffset,
    nodes: [...nodesById.values()],
    edges: edgeLayouts,
  };
}

function renderTerminalSets(node: NodeVisual, bodyX: number, bodyWidth: number): string {
  const inputTerminalBlocks = node.inputPorts
    .map(
      (port) => `<path d="M ${node.inputTerminalX} ${port.y} H ${bodyX}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.8" stroke-linecap="round"/>
        <circle data-terminal-side="input" cx="${node.inputTerminalX}" cy="${port.y}" r="3.2" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1.5"/>`,
    )
    .join('');
  const outputTerminalBlocks = node.outputPorts
    .map(
      (port) => `<path d="M ${bodyX + bodyWidth} ${port.y} H ${node.outputTerminalX}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.8" stroke-linecap="round"/>
        <circle data-terminal-side="output" cx="${node.outputTerminalX}" cy="${port.y}" r="3.2" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1.5"/>`,
    )
    .join('');

  return `${inputTerminalBlocks}${outputTerminalBlocks}`;
}

function renderDeviceBlock(kind: string, x: number, y: number, width: number, height: number, stroke: string, accent: string): string {
  if (kind === 'mlo') {
    const lugY = y + height / 2;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="#ffffff" stroke="${stroke}" stroke-width="1.3"/>
      <path d="M ${x + 8} ${lugY} H ${x + width - 8}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="${x + width * 0.32}" cy="${lugY}" r="2.4" fill="${accent}"/>
      <circle cx="${x + width * 0.5}" cy="${lugY}" r="2.4" fill="${accent}"/>
      <circle cx="${x + width * 0.68}" cy="${lugY}" r="2.4" fill="${accent}"/>`;
  }

  if (kind === 'fuse') {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="#ffffff" stroke="${stroke}" stroke-width="1.3"/>
      <path d="M ${x + 8} ${y + height / 2} H ${x + width - 8}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="${x + width * 0.22}" y="${y + 6}" width="${width * 0.18}" height="${height - 12}" rx="3" fill="#eef2f5" stroke="${accent}" stroke-width="1.1"/>
      <rect x="${x + width * 0.6}" y="${y + 6}" width="${width * 0.18}" height="${height - 12}" rx="3" fill="#eef2f5" stroke="${accent}" stroke-width="1.1"/>`;
  }

  if (kind === 'disconnect') {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="#ffffff" stroke="${stroke}" stroke-width="1.3"/>
      <circle cx="${x + width * 0.28}" cy="${y + height / 2}" r="3" fill="#ffffff" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="${x + width * 0.72}" cy="${y + height / 2}" r="3" fill="#ffffff" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M ${x + width * 0.3} ${y + height / 2} L ${x + width * 0.66} ${y + height * 0.28}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>`;
  }

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="#ffffff" stroke="${stroke}" stroke-width="1.3"/>
    <rect x="${x + 6}" y="${y + 6}" width="${width - 12}" height="${Math.max(10, height - 14)}" rx="3" fill="#eef3f6" stroke="#bfd0da" stroke-width="0.9"/>
    <path d="M ${x + width * 0.58} ${y + 5} V ${y + height - 5}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="${x + width * 0.34}" cy="${y + height * 0.34}" r="2" fill="${accent}"/>`;
}

function renderMccBucket(x: number, y: number, width: number, height: number, stroke: string, accent: string): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="#ffffff" stroke="${stroke}" stroke-width="1.2"/>
    <rect x="${x + 6}" y="${y + 4}" width="${width - 18}" height="${height - 8}" rx="3" fill="#eff4f6" stroke="#c3d0d8" stroke-width="0.9"/>
    <circle cx="${x + width - 8}" cy="${y + height / 2}" r="2.4" fill="${accent}"/>
    <path d="M ${x + width - 14} ${y + height / 2} H ${x + width - 4}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="${x + 10}" cy="${y + height / 2}" r="1.8" fill="${accent}"/>`;
}

function renderAssemblyFace(node: NodeVisual, bodyX: number, bodyY: number, bodyWidth: number, bodyHeight: number): string {
  const coreX = bodyX + 12;
  const coreY = bodyY + 36;
  const coreWidth = bodyWidth - 24;
  const coreHeight = Math.max(56, bodyHeight - 52 - node.labelBlockHeight);
  const stroke = node.spec.stroke;
  const accent = node.spec.accent;
  const shellFill = node.spec.innerFill;
  const copperFill = '#cb8c33';
  const mainSectionWidth = node.symbol === 'panel' ? 46 : 54;
  const outputSectionWidth = node.symbol === 'mcc' ? 66 : 58;
  const busX = coreX + mainSectionWidth + 12;
  const busWidth = Math.max(44, coreWidth - mainSectionWidth - outputSectionWidth - 24);
  const outputX = busX + busWidth + 12;
  const busHeight = node.symbol === 'panel' ? 10 : 12;
  const busY = coreY + coreHeight / 2 - busHeight / 2;
  const sectionCount = Math.max(3, Math.ceil(Math.max(1, node.outputPorts.length) / 2) + 1);
  const sectionWidth = coreWidth / sectionCount;

  let shellDetails = '';
  if (node.symbol === 'switchboard') {
    shellDetails = Array.from({ length: sectionCount - 1 }, (_, index) => {
      const seamX = coreX + sectionWidth * (index + 1);
      return `<path d="M ${seamX} ${coreY + 4} V ${coreY + coreHeight - 4}" fill="none" stroke="#b9c8d1" stroke-width="1"/>
        <circle cx="${seamX - 8}" cy="${coreY + 18}" r="1.8" fill="#9cb0bc"/>
        <circle cx="${seamX - 8}" cy="${coreY + coreHeight - 18}" r="1.8" fill="#9cb0bc"/>`;
    }).join('');
    shellDetails += `<rect x="${coreX + 8}" y="${coreY + 8}" width="${sectionWidth - 16}" height="16" rx="4" fill="#eef3f6" stroke="#c2d0d8" stroke-width="0.9"/>
      <rect x="${coreX + 8}" y="${coreY + coreHeight - 22}" width="${coreWidth - 16}" height="10" rx="3" fill="#edf2f4" stroke="#cad4db" stroke-width="0.8"/>`;
  } else if (node.symbol === 'panel') {
    shellDetails = `<rect x="${coreX + 6}" y="${coreY + 6}" width="${coreWidth - 12}" height="${coreHeight - 12}" rx="8" fill="#fbfdfe" stroke="#cad6dd" stroke-width="1"/>
      <path d="M ${coreX + coreWidth * 0.5} ${coreY + 10} V ${coreY + coreHeight - 10}" fill="none" stroke="#c8d4db" stroke-width="1"/>
      <circle cx="${coreX + coreWidth - 18}" cy="${coreY + coreHeight / 2}" r="2.2" fill="${accent}"/>`;
  } else {
    shellDetails = Array.from({ length: Math.max(2, Math.ceil(Math.max(1, node.outputPorts.length) / 2)) }, (_, index) => {
      const bucketTop = coreY + 10 + index * 26;
      return bucketTop + 18 > coreY + coreHeight - 10
        ? ''
        : `<rect x="${coreX + 8}" y="${bucketTop}" width="${coreWidth - 16}" height="20" rx="4" fill="#fbfdfe" stroke="#cad6dd" stroke-width="0.9"/>`;
    }).join('');
    shellDetails += `<rect x="${coreX + 8}" y="${coreY + 6}" width="${coreWidth - 16}" height="14" rx="4" fill="#eef3f6" stroke="#c2d0d8" stroke-width="0.9"/>`;
  }

  const inputBlocks = node.inputPorts
    .map((port, index) => {
      const singleInput = node.inputPorts.length === 1;
      const blockHeight = singleInput ? Math.min(42, coreHeight - 14) : 18;
      const blockY = singleInput ? busY - blockHeight / 2 : port.y - blockHeight / 2;
      const blockX = coreX + 4;
      const blockWidth = mainSectionWidth - 8;
      const internalY = singleInput ? busY + busHeight / 2 : port.y;
      return `${renderDeviceBlock(node.mainDeviceType, blockX, blockY, blockWidth, blockHeight, stroke, accent)}
        <path d="M ${bodyX} ${port.y} H ${blockX}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${blockX + blockWidth} ${internalY} H ${busX}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    })
    .join('');

  const outputBlocks = node.outputPorts
    .map((port, index) => {
      const blockHeight = node.symbol === 'mcc' ? 22 : 16;
      const blockY = port.y - blockHeight / 2;
      const blockX = outputX;
      const blockWidth = Math.max(30, bodyX + bodyWidth - outputX - 6);
      const branchKind = node.symbol === 'panel' ? 'breaker' : index % 3 === 2 ? 'fuse' : 'breaker';
      const blockSvg =
        node.symbol === 'mcc'
          ? renderMccBucket(blockX, blockY, blockWidth, blockHeight, stroke, accent)
          : renderDeviceBlock(branchKind, blockX, blockY, blockWidth, blockHeight, stroke, accent);
      return `${blockSvg}
        <path d="M ${busX + busWidth} ${port.y} H ${blockX}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${blockX + blockWidth} ${port.y} H ${bodyX + bodyWidth}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>`;
    })
    .join('');

  const busConnections = [...node.inputPorts, ...node.outputPorts]
    .map((port, index) => `<rect x="${busX + 6 + index * Math.max(8, (busWidth - 20) / Math.max(1, node.inputPorts.length + node.outputPorts.length - 1))}" y="${busY - 2}" width="6" height="${busHeight + 4}" rx="2" fill="#e2b36a" opacity="0.72"/>`)
    .join('');

  return `<rect x="${coreX}" y="${coreY}" width="${coreWidth}" height="${coreHeight}" rx="12" fill="${shellFill}" stroke="#d0d9df" stroke-width="1"/>
    ${shellDetails}
    <rect data-bus="true" x="${busX}" y="${busY}" width="${busWidth}" height="${busHeight}" rx="3" fill="${copperFill}" stroke="#98611d" stroke-width="1"/>
    <path d="M ${busX + 4} ${busY + 3} H ${busX + busWidth - 4}" fill="none" stroke="#f6d59f" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>
    ${busConnections}
    ${inputBlocks}
    ${outputBlocks}`;
}

function renderNodeBlock(node: NodeVisual): string {
  const leftPad = node.hasInputTerminal ? 18 : 8;
  const rightPad = node.hasOutputTerminal ? 18 : 8;
  const bodyX = node.deviceX + leftPad;
  const bodyY = node.deviceY;
  const bodyWidth = node.deviceWidth - leftPad - rightPad;
  const bodyHeight = node.deviceHeight;
  const chipWidth = Math.max(54, node.spec.typeLabel.length * 7 + 18);
  const visualX = bodyX + 12;
  const visualY = bodyY + (node.presentation === 'assembly' ? 36 : 28);
  const labelStartY = bodyY + bodyHeight - 18 - (node.labelLines.length - 1) * node.labelLineHeight;
  const visualHeight = Math.max(28, labelStartY - visualY - 10);
  const terminalBlocks = renderTerminalSets(node, bodyX, bodyWidth);
  const deviceFace =
    node.presentation === 'assembly'
      ? renderAssemblyFace(node, bodyX, bodyY, bodyWidth, bodyHeight)
      : `<rect x="${visualX}" y="${visualY}" width="${bodyWidth - 24}" height="${visualHeight}" rx="12" fill="${node.spec.innerFill}" stroke="#d7e0e6" stroke-width="1"/>
        ${renderSymbolGlyph(node.glyph, visualX, visualY, bodyWidth - 24, visualHeight, node.spec)}`;
  const paramRect = node.paramHeight
    ? `<rect x="${node.paramX}" y="${node.paramY}" width="${node.paramWidth}" height="${node.paramHeight}" rx="12" fill="#ffffff" stroke="#c4d0d8" stroke-width="1.1"/>
      ${renderTextLines(node.paramLines, node.paramX + 12, node.paramY + 16, {
        anchor: 'start',
        fontSize: 11,
        fontFamily: 'Cascadia Code, Source Code Pro, monospace',
        fill: '#4c6070',
        lineHeightPx: 16,
      })}`
    : '';

  return `<g data-id="${escapeXml(node.id)}" data-symbol="${escapeXml(node.symbol)}" data-glyph="${escapeXml(node.glyph)}" data-role="${node.role}" data-inputs="${node.incomingCount}" data-outputs="${node.outgoingCount}" data-level="${node.level}">
    ${terminalBlocks}
    <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="16" fill="${node.spec.fill}" stroke="${node.spec.stroke}" stroke-width="1.8"/>
    <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyWidth - 8}" height="${bodyHeight - 8}" rx="13" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1"/>
    <rect x="${bodyX + 10}" y="${bodyY + 8}" width="${chipWidth}" height="18" rx="9" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1"/>
    <text x="${bodyX + 10 + chipWidth / 2}" y="${bodyY + 21}" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10" font-weight="700" letter-spacing="0.5" fill="${node.spec.accent}">${escapeXml(node.spec.typeLabel)}</text>
    <path d="M ${bodyX + 10} ${bodyY + 32} H ${bodyX + bodyWidth - 10}" fill="none" stroke="#cad6dd" stroke-width="1.1" stroke-linecap="round"/>
    ${deviceFace}
    ${renderTextLines(node.labelLines, bodyX + bodyWidth / 2, labelStartY, {
      fontSize: node.labelFontSize,
      fontWeight: '700',
      fill: '#1a2833',
      lineHeightPx: node.labelLineHeight,
    })}
    ${paramRect}
  </g>`;
}

function renderEdge(edge: EdgeLayout): string {
  const label = edge.label
    ? `<rect x="${edge.labelX - 6}" y="${edge.labelY - 11}" width="${Math.max(44, edge.label.length * 6.7 + 12)}" height="18" rx="9" fill="#fcfcfb" stroke="#d1dae0" stroke-width="0.8"/>
      <text x="${edge.labelX}" y="${edge.labelY + 2}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#425664">${escapeXml(edge.label)}</text>`
    : '';

  return `<g data-edge-from="${escapeXml(edge.from.id)}" data-edge-to="${escapeXml(edge.to.id)}">
    <path d="${edge.path}" fill="none" stroke="#314e62" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    ${label}
  </g>`;
}

function renderCompiledSvg(compiled: CompiledDiagram, options: LayoutOptions = {}): string {
  if (!compiled || compiled.type !== 'CompiledDiagram') {
    throw new TypeError('renderSvg expects a source string or compileDiagram output.');
  }
  if (!compiled.nodes.length) {
    throw new Error('Compiled diagram has no nodes.');
  }

  const layout = layoutDiagram(compiled, options);
  const title = compiled.title
    ? `<text x="${layout.width / 2}" y="44" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="20" font-weight="700" fill="#1a2833">${escapeXml(compiled.title)}</text>
      <text x="${layout.width / 2}" y="64" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#637583">Hierarchical single-line arrangement with role-aware terminals and assembly-driven device elevations</text>`
    : '';

  const edgeBlocks = layout.edges.map(renderEdge).join('');
  const nodeBlocks = layout.nodes.map(renderNodeBlock).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="diagjs diagram">
    <rect x="10" y="10" width="${layout.width - 20}" height="${layout.height - 20}" rx="26" fill="#fcfbf7" stroke="#c7d1d8" stroke-width="1.2"/>
    <rect x="24" y="24" width="${layout.width - 48}" height="${layout.height - 48}" rx="18" fill="none" stroke="#dce3e8" stroke-width="1"/>
    ${title}
    ${edgeBlocks}
    ${nodeBlocks}
  </svg>`;
}

export function renderSvg(input: string | CompiledDiagram, options: LayoutOptions = {}): string {
  if (typeof input === 'string') {
    return renderCompiledSvg(compileDiagram(parseDiagram(input)), options);
  }

  return renderCompiledSvg(input, options);
}

export class DiagJS {
  static parse(source: string): DiagramProgram {
    return parseDiagram(source);
  }

  static compile(sourceOrAst: string | DiagramProgram): CompiledDiagram {
    if (typeof sourceOrAst === 'string') {
      return compileDiagram(parseDiagram(sourceOrAst));
    }
    return compileDiagram(sourceOrAst);
  }

  static render(sourceOrCompiled: string | CompiledDiagram, options: LayoutOptions = {}): string {
    return renderSvg(sourceOrCompiled, options);
  }
}
