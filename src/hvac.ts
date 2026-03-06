import { compileDiagram, parseDiagram } from './diagjs';

type DiagramProgram = ReturnType<typeof parseDiagram>;
type DiagramInput = ReturnType<typeof compileDiagram>;
type DiagramNode = DiagramInput['nodes'][number];
type DiagramEdge = DiagramInput['edges'][number];

interface HvacSymbolSpec {
  typeLabel: string;
  glyph: string;
  width: number;
  height: number;
  fill: string;
  innerFill: string;
  stroke: string;
  accent: string;
  labelChars: number;
  lane: HvacLaneId;
}

interface HvacMediumSpec {
  key: string;
  label: string;
  stroke: string;
  accent: string;
  width: number;
  dasharray?: string;
  className: 'air' | 'pipe' | 'control';
}

interface HvacPort {
  key: string;
  x: number;
  y: number;
  index: number;
}

type HvacLaneId = 'condenser' | 'chilled' | 'air' | 'exhaust' | 'heating' | 'controls' | 'terminal';

type HvacRole = 'source' | 'load' | 'inline' | 'splitter' | 'mixer' | 'isolated';

interface HvacNodeVisual extends DiagramNode {
  symbol: string;
  glyph: string;
  spec: HvacSymbolSpec;
  lane: HvacLaneId;
  laneOrder: number;
  column: number;
  slot: number;
  incomingCount: number;
  outgoingCount: number;
  role: HvacRole;
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
  inputPorts?: HvacPort[];
  outputPorts?: HvacPort[];
  inputPortMap?: Map<string, HvacPort>;
  outputPortMap?: Map<string, HvacPort>;
}

interface LaneSpec {
  id: HvacLaneId;
  label: string;
  order: number;
  tint: string;
  stroke: string;
}

interface LaneLayout extends LaneSpec {
  top: number;
  bottom: number;
  height: number;
}

interface HvacEdgeLayout {
  fromId: string;
  toId: string;
  label: string | null;
  from: HvacNodeVisual;
  to: HvacNodeVisual;
  fromPort: HvacPort;
  toPort: HvacPort;
  medium: HvacMediumSpec;
  path: string;
  labelX: number;
  labelY: number;
  reversed: boolean;
}

interface HvacLayout {
  title: string | null;
  width: number;
  height: number;
  legendX: number;
  legendY: number;
  titleOffset: number;
  lanes: LaneLayout[];
  nodes: HvacNodeVisual[];
  edges: HvacEdgeLayout[];
  media: HvacMediumSpec[];
}

interface HvacRenderOptions {
  margin?: number;
  laneLabelWidth?: number;
  columnGap?: number;
  laneGap?: number;
  slotGap?: number;
}

const LANE_SPECS: LaneSpec[] = [
  { id: 'condenser', label: 'Condenser Water', order: 0, tint: 'rgba(95, 152, 146, 0.12)', stroke: '#5e948f' },
  { id: 'chilled', label: 'Chilled Water', order: 1, tint: 'rgba(72, 132, 176, 0.11)', stroke: '#4b81ad' },
  { id: 'air', label: 'Airside Process', order: 2, tint: 'rgba(95, 111, 126, 0.09)', stroke: '#56697a' },
  { id: 'exhaust', label: 'Relief / Exhaust', order: 3, tint: 'rgba(136, 112, 76, 0.11)', stroke: '#816649' },
  { id: 'heating', label: 'Heating Water', order: 4, tint: 'rgba(176, 112, 68, 0.1)', stroke: '#ab6838' },
  { id: 'controls', label: 'Controls', order: 5, tint: 'rgba(98, 110, 72, 0.1)', stroke: '#637145' },
  { id: 'terminal', label: 'Zones / Terminals', order: 6, tint: 'rgba(119, 124, 130, 0.08)', stroke: '#6c747b' },
];

const HVAC_SYMBOL_ALIASES: Record<string, string> = {
  air_handler: 'ahu',
  air_handling_unit: 'ahu',
  make_up_air_unit: 'ahu',
  makeup_air_unit: 'ahu',
  mau: 'ahu',
  doas: 'doas',
  dedicated_outdoor_air_system: 'doas',
  rtu: 'rtu',
  rooftop_unit: 'rtu',
  mixing_box: 'mixing_box',
  mixed_air_box: 'mixing_box',
  louvers: 'outside_air',
  louver: 'outside_air',
  intake_louver: 'outside_air',
  oa_louver: 'outside_air',
  relief_louver: 'relief_louver',
  exhaust_louver: 'relief_louver',
  outside_air_louver: 'outside_air',
  oad: 'damper',
  rad: 'damper',
  damper_section: 'damper',
  smoke_damper: 'fire_smoke_damper',
  fire_smoke_damper: 'fire_smoke_damper',
  filter_bank: 'filter',
  final_filter: 'filter',
  prefilter: 'filter',
  cooling_coil: 'cooling_coil',
  chilled_water_coil: 'cooling_coil',
  chw_coil: 'cooling_coil',
  dx_coil: 'cooling_coil',
  heating_coil: 'heating_coil',
  hot_water_coil: 'heating_coil',
  hhw_coil: 'heating_coil',
  reheat_coil: 'reheat_coil',
  humidifier_grid: 'humidifier',
  steam_grid: 'humidifier',
  fan_array: 'fan',
  supply_fan: 'fan',
  return_fan: 'return_fan',
  relief_fan: 'relief_fan',
  exhaust_fan: 'exhaust_fan',
  sound_attenuator: 'sound_attenuator',
  silencer: 'sound_attenuator',
  duct: 'duct',
  duct_main: 'duct',
  header: 'header',
  manifold: 'header',
  vav_box: 'vav',
  cav_box: 'vav',
  terminal_unit: 'vav',
  fcu: 'fan_coil',
  fan_coil_unit: 'fan_coil',
  unit_heater: 'unit_heater',
  heater: 'unit_heater',
  diffuser: 'diffuser',
  ceiling_diffuser: 'diffuser',
  grille: 'return_grille',
  return_grille: 'return_grille',
  transfer_grille: 'return_grille',
  zone: 'zone',
  room: 'zone',
  space: 'zone',
  chlr: 'chiller',
  cooling_tower_cell: 'cooling_tower',
  cooling_tower: 'cooling_tower',
  ct: 'cooling_tower',
  boiler_plant: 'boiler',
  boiler: 'boiler',
  heat_exchanger: 'heat_exchanger',
  plate_hx: 'heat_exchanger',
  plate_heat_exchanger: 'heat_exchanger',
  hx: 'heat_exchanger',
  expansion_tank: 'expansion_tank',
  xtank: 'expansion_tank',
  air_separator: 'air_separator',
  dirt_separator: 'dirt_separator',
  y_strainer: 'strainer',
  basket_strainer: 'strainer',
  strainer: 'strainer',
  control_valve: 'control_valve',
  two_way_valve: 'control_valve',
  cv: 'control_valve',
  balancing_valve: 'balancing_valve',
  circuit_setter: 'balancing_valve',
  bv: 'balancing_valve',
  check_valve: 'check_valve',
  isolation_valve: 'isolation_valve',
  butterfly_valve: 'isolation_valve',
  ball_valve: 'isolation_valve',
  iv: 'isolation_valve',
  sensor: 'sensor',
  thermostat: 'thermostat',
  space_sensor: 'thermostat',
  bms: 'bms',
  bas: 'bms',
  controls_panel: 'bms',
  energy_recovery_wheel: 'energy_recovery',
  erv: 'energy_recovery',
  hrv: 'energy_recovery',
  energy_recovery: 'energy_recovery',
  heat_pump: 'heat_pump',
  condensing_unit: 'heat_pump',
  vrf: 'heat_pump',
};

const HVAC_SYMBOL_LIBRARY: Record<string, HvacSymbolSpec> = {
  outside_air: { typeLabel: 'OA', glyph: 'outside_air', width: 176, height: 112, fill: '#f5faf8', innerFill: '#ffffff', stroke: '#4f7b66', accent: '#4f7b66', labelChars: 20, lane: 'air' },
  relief_louver: { typeLabel: 'EA', glyph: 'relief_louver', width: 176, height: 112, fill: '#faf7f1', innerFill: '#ffffff', stroke: '#806548', accent: '#806548', labelChars: 20, lane: 'exhaust' },
  damper: { typeLabel: 'DMP', glyph: 'damper', width: 156, height: 102, fill: '#f8fbfd', innerFill: '#ffffff', stroke: '#5a6d7d', accent: '#5a6d7d', labelChars: 18, lane: 'air' },
  fire_smoke_damper: { typeLabel: 'FSD', glyph: 'fire_smoke_damper', width: 156, height: 104, fill: '#fbf7f4', innerFill: '#ffffff', stroke: '#8a593f', accent: '#8a593f', labelChars: 18, lane: 'air' },
  mixing_box: { typeLabel: 'MIX', glyph: 'mixing_box', width: 188, height: 118, fill: '#f6fafc', innerFill: '#ffffff', stroke: '#587284', accent: '#587284', labelChars: 20, lane: 'air' },
  filter: { typeLabel: 'FLT', glyph: 'filter', width: 156, height: 102, fill: '#f8fafb', innerFill: '#ffffff', stroke: '#667582', accent: '#667582', labelChars: 18, lane: 'air' },
  cooling_coil: { typeLabel: 'CC', glyph: 'cooling_coil', width: 162, height: 108, fill: '#f2f8fc', innerFill: '#ffffff', stroke: '#39739a', accent: '#39739a', labelChars: 18, lane: 'air' },
  heating_coil: { typeLabel: 'HC', glyph: 'heating_coil', width: 162, height: 108, fill: '#fff7f1', innerFill: '#ffffff', stroke: '#a55d31', accent: '#a55d31', labelChars: 18, lane: 'air' },
  reheat_coil: { typeLabel: 'RH', glyph: 'reheat_coil', width: 162, height: 104, fill: '#fff7f1', innerFill: '#ffffff', stroke: '#b46d3b', accent: '#b46d3b', labelChars: 18, lane: 'heating' },
  humidifier: { typeLabel: 'HUM', glyph: 'humidifier', width: 170, height: 108, fill: '#f4fafc', innerFill: '#ffffff', stroke: '#5b7f8f', accent: '#5b7f8f', labelChars: 18, lane: 'air' },
  energy_recovery: { typeLabel: 'ERV', glyph: 'energy_recovery', width: 180, height: 112, fill: '#f5faf8', innerFill: '#ffffff', stroke: '#557765', accent: '#557765', labelChars: 20, lane: 'air' },
  fan: { typeLabel: 'SF', glyph: 'fan', width: 156, height: 104, fill: '#f5f9fc', innerFill: '#ffffff', stroke: '#4c677d', accent: '#4c677d', labelChars: 18, lane: 'air' },
  return_fan: { typeLabel: 'RF', glyph: 'return_fan', width: 156, height: 104, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#67727d', accent: '#67727d', labelChars: 18, lane: 'air' },
  relief_fan: { typeLabel: 'REL', glyph: 'relief_fan', width: 156, height: 104, fill: '#faf7f2', innerFill: '#ffffff', stroke: '#84694e', accent: '#84694e', labelChars: 18, lane: 'exhaust' },
  exhaust_fan: { typeLabel: 'EF', glyph: 'exhaust_fan', width: 156, height: 104, fill: '#faf7f2', innerFill: '#ffffff', stroke: '#806548', accent: '#806548', labelChars: 18, lane: 'exhaust' },
  sound_attenuator: { typeLabel: 'SIL', glyph: 'sound_attenuator', width: 170, height: 102, fill: '#f8fafb', innerFill: '#ffffff', stroke: '#63727d', accent: '#63727d', labelChars: 18, lane: 'air' },
  duct: { typeLabel: 'DUCT', glyph: 'duct', width: 208, height: 86, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#607080', accent: '#607080', labelChars: 22, lane: 'air' },
  header: { typeLabel: 'HDR', glyph: 'header', width: 228, height: 88, fill: '#f7fbfd', innerFill: '#ffffff', stroke: '#5b7283', accent: '#5b7283', labelChars: 22, lane: 'chilled' },
  ahu: { typeLabel: 'AHU', glyph: 'ahu', width: 238, height: 132, fill: '#f5fafc', innerFill: '#ffffff', stroke: '#486778', accent: '#486778', labelChars: 20, lane: 'air' },
  doas: { typeLabel: 'DOAS', glyph: 'doas', width: 242, height: 136, fill: '#f4faf8', innerFill: '#ffffff', stroke: '#4f765f', accent: '#4f765f', labelChars: 20, lane: 'air' },
  rtu: { typeLabel: 'RTU', glyph: 'rtu', width: 218, height: 128, fill: '#f5f9fc', innerFill: '#ffffff', stroke: '#557083', accent: '#557083', labelChars: 20, lane: 'air' },
  vav: { typeLabel: 'VAV', glyph: 'vav', width: 170, height: 108, fill: '#f6f9fb', innerFill: '#ffffff', stroke: '#647482', accent: '#647482', labelChars: 18, lane: 'air' },
  fan_coil: { typeLabel: 'FCU', glyph: 'fan_coil', width: 182, height: 112, fill: '#f6f9fb', innerFill: '#ffffff', stroke: '#60717f', accent: '#60717f', labelChars: 18, lane: 'terminal' },
  unit_heater: { typeLabel: 'UH', glyph: 'unit_heater', width: 176, height: 108, fill: '#fbf7f1', innerFill: '#ffffff', stroke: '#8b643f', accent: '#8b643f', labelChars: 18, lane: 'terminal' },
  diffuser: { typeLabel: 'SUP', glyph: 'diffuser', width: 150, height: 96, fill: '#f8fafb', innerFill: '#ffffff', stroke: '#63707b', accent: '#63707b', labelChars: 18, lane: 'terminal' },
  return_grille: { typeLabel: 'RET', glyph: 'return_grille', width: 150, height: 96, fill: '#f8fafb', innerFill: '#ffffff', stroke: '#6b727a', accent: '#6b727a', labelChars: 18, lane: 'terminal' },
  zone: { typeLabel: 'ZONE', glyph: 'zone', width: 176, height: 104, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#767c82', accent: '#767c82', labelChars: 20, lane: 'terminal' },
  chiller: { typeLabel: 'CHLR', glyph: 'chiller', width: 214, height: 128, fill: '#f2f8fc', innerFill: '#ffffff', stroke: '#3b7197', accent: '#3b7197', labelChars: 20, lane: 'chilled' },
  cooling_tower: { typeLabel: 'CT', glyph: 'cooling_tower', width: 190, height: 128, fill: '#f4faf8', innerFill: '#ffffff', stroke: '#4f7b66', accent: '#4f7b66', labelChars: 20, lane: 'condenser' },
  boiler: { typeLabel: 'BLR', glyph: 'boiler', width: 188, height: 124, fill: '#fff8f2', innerFill: '#ffffff', stroke: '#a05f34', accent: '#a05f34', labelChars: 20, lane: 'heating' },
  pump: { typeLabel: 'PUMP', glyph: 'pump', width: 166, height: 108, fill: '#f6faf8', innerFill: '#ffffff', stroke: '#44735f', accent: '#44735f', labelChars: 18, lane: 'chilled' },
  heat_exchanger: { typeLabel: 'HX', glyph: 'heat_exchanger', width: 174, height: 112, fill: '#f6fafc', innerFill: '#ffffff', stroke: '#557285', accent: '#557285', labelChars: 18, lane: 'chilled' },
  expansion_tank: { typeLabel: 'XT', glyph: 'expansion_tank', width: 160, height: 116, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#667380', accent: '#667380', labelChars: 18, lane: 'heating' },
  air_separator: { typeLabel: 'SEP', glyph: 'air_separator', width: 166, height: 112, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#5f707d', accent: '#5f707d', labelChars: 18, lane: 'heating' },
  dirt_separator: { typeLabel: 'DIRT', glyph: 'dirt_separator', width: 166, height: 112, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#5f707d', accent: '#5f707d', labelChars: 18, lane: 'chilled' },
  strainer: { typeLabel: 'STR', glyph: 'strainer', width: 160, height: 102, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7f6a46', accent: '#7f6a46', labelChars: 18, lane: 'chilled' },
  control_valve: { typeLabel: 'CV', glyph: 'control_valve', width: 150, height: 98, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7a6648', accent: '#7a6648', labelChars: 18, lane: 'chilled' },
  balancing_valve: { typeLabel: 'BV', glyph: 'balancing_valve', width: 150, height: 98, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7a6648', accent: '#7a6648', labelChars: 18, lane: 'heating' },
  check_valve: { typeLabel: 'CHK', glyph: 'check_valve', width: 148, height: 94, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7a6648', accent: '#7a6648', labelChars: 18, lane: 'chilled' },
  isolation_valve: { typeLabel: 'IV', glyph: 'isolation_valve', width: 148, height: 94, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7a6648', accent: '#7a6648', labelChars: 18, lane: 'heating' },
  sensor: { typeLabel: 'SNS', glyph: 'sensor', width: 140, height: 90, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#66734d', accent: '#66734d', labelChars: 18, lane: 'controls' },
  thermostat: { typeLabel: 'TSTAT', glyph: 'thermostat', width: 144, height: 94, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#66734d', accent: '#66734d', labelChars: 18, lane: 'controls' },
  bms: { typeLabel: 'BMS', glyph: 'bms', width: 176, height: 104, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#66734d', accent: '#66734d', labelChars: 18, lane: 'controls' },
  heat_pump: { typeLabel: 'HP', glyph: 'heat_pump', width: 188, height: 120, fill: '#f5faf8', innerFill: '#ffffff', stroke: '#567968', accent: '#567968', labelChars: 18, lane: 'air' },
  device: { typeLabel: 'HVAC', glyph: 'device', width: 156, height: 100, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#5f7080', accent: '#5f7080', labelChars: 18, lane: 'air' },
};

const HVAC_MEDIA_LIBRARY: Record<string, HvacMediumSpec> = {
  outside_air: { key: 'outside_air', label: 'OA', stroke: '#4f7b66', accent: '#d8e9df', width: 5.2, className: 'air', dasharray: '14 7' },
  mixed_air: { key: 'mixed_air', label: 'MA', stroke: '#6d7a83', accent: '#ebeff2', width: 5.4, className: 'air', dasharray: '10 6' },
  supply_air: { key: 'supply_air', label: 'SA', stroke: '#586c7b', accent: '#e6edf2', width: 5.8, className: 'air' },
  return_air: { key: 'return_air', label: 'RA', stroke: '#7a858d', accent: '#f0f3f5', width: 5.3, className: 'air', dasharray: '12 7' },
  exhaust_air: { key: 'exhaust_air', label: 'EA', stroke: '#82684b', accent: '#f2ece4', width: 5.1, className: 'air', dasharray: '8 6' },
  relief_air: { key: 'relief_air', label: 'REL', stroke: '#9a7b56', accent: '#f4ece2', width: 5.1, className: 'air', dasharray: '6 6' },
  chilled_water_supply: { key: 'chilled_water_supply', label: 'CHWS', stroke: '#2f719a', accent: '#dcebF5', width: 3.6, className: 'pipe' },
  chilled_water_return: { key: 'chilled_water_return', label: 'CHWR', stroke: '#5a98bf', accent: '#e4f0f7', width: 3.6, className: 'pipe', dasharray: '10 6' },
  heating_water_supply: { key: 'heating_water_supply', label: 'HHWS', stroke: '#b45d2c', accent: '#fae7dd', width: 3.6, className: 'pipe' },
  heating_water_return: { key: 'heating_water_return', label: 'HHWR', stroke: '#d28b5e', accent: '#fff0e6', width: 3.6, className: 'pipe', dasharray: '10 6' },
  condenser_water_supply: { key: 'condenser_water_supply', label: 'CWS', stroke: '#2d8078', accent: '#dcf0ec', width: 3.5, className: 'pipe' },
  condenser_water_return: { key: 'condenser_water_return', label: 'CWR', stroke: '#63aaa1', accent: '#e8f5f3', width: 3.5, className: 'pipe', dasharray: '10 6' },
  condensate: { key: 'condensate', label: 'COND', stroke: '#5c90a1', accent: '#e4f1f5', width: 2.6, className: 'pipe', dasharray: '4 4' },
  controls: { key: 'controls', label: 'CTRL', stroke: '#66734d', accent: '#edf2e3', width: 2.4, className: 'control', dasharray: '10 4 2 4' },
  generic: { key: 'generic', label: 'LINE', stroke: '#5f7080', accent: '#edf1f4', width: 3.2, className: 'pipe' },
};

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

function normalizeSymbol(symbolType: string | null | undefined): string {
  const normalized = String(symbolType ?? 'device').toLowerCase().replace(/-/g, '_');
  return HVAC_SYMBOL_ALIASES[normalized] ?? normalized;
}

function inferSymbol(node: DiagramNode): string {
  if (node.symbol) {
    return normalizeSymbol(node.symbol);
  }

  const probe = `${node.id} ${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();

  if (probe.includes('outside air') || probe.includes('oa louver') || probe.includes('intake louver')) {
    return 'outside_air';
  }
  if (probe.includes('relief louver') || probe.includes('exhaust louver')) {
    return 'relief_louver';
  }
  if (probe.includes('mixing box') || probe.includes('mixed air')) {
    return 'mixing_box';
  }
  if (probe.includes('damper')) {
    return probe.includes('smoke') || probe.includes('fire') ? 'fire_smoke_damper' : 'damper';
  }
  if (probe.includes('filter')) {
    return 'filter';
  }
  if (probe.includes('energy recovery') || /\b(erv|hrv)\b/.test(probe)) {
    return 'energy_recovery';
  }
  if (probe.includes('cooling coil') || probe.includes('chw coil') || probe.includes('dx coil')) {
    return 'cooling_coil';
  }
  if (probe.includes('reheat')) {
    return 'reheat_coil';
  }
  if (probe.includes('heating coil') || probe.includes('hhw coil') || probe.includes('hot water coil')) {
    return 'heating_coil';
  }
  if (probe.includes('humidifier') || probe.includes('steam grid')) {
    return 'humidifier';
  }
  if (probe.includes('air handler') || /\bahu\b/.test(probe)) {
    return 'ahu';
  }
  if (probe.includes('dedicated outdoor air') || /\bdoas\b/.test(probe)) {
    return 'doas';
  }
  if (probe.includes('rooftop unit') || /\brtu\b/.test(probe)) {
    return 'rtu';
  }
  if (probe.includes('fan coil') || /\bfcu\b/.test(probe)) {
    return 'fan_coil';
  }
  if (probe.includes('unit heater')) {
    return 'unit_heater';
  }
  if (probe.includes('return fan')) {
    return 'return_fan';
  }
  if (probe.includes('relief fan')) {
    return 'relief_fan';
  }
  if (probe.includes('exhaust fan')) {
    return 'exhaust_fan';
  }
  if (probe.includes('fan')) {
    return 'fan';
  }
  if (probe.includes('attenuator') || probe.includes('silencer')) {
    return 'sound_attenuator';
  }
  if (probe.includes('header') || probe.includes('manifold')) {
    return 'header';
  }
  if (probe.includes('duct')) {
    return 'duct';
  }
  if (probe.includes('vav')) {
    return 'vav';
  }
  if (probe.includes('diffuser')) {
    return 'diffuser';
  }
  if (probe.includes('grille')) {
    return 'return_grille';
  }
  if (probe.includes('zone') || probe.includes('space') || probe.includes('office') || probe.includes('lobby')) {
    return 'zone';
  }
  if (probe.includes('cooling tower') || /\bct\b/.test(probe)) {
    return 'cooling_tower';
  }
  if (probe.includes('chiller') || /\bchl\w*\b/.test(probe)) {
    return 'chiller';
  }
  if (probe.includes('boiler')) {
    return 'boiler';
  }
  if (probe.includes('heat exchanger') || /\bhx\b/.test(probe)) {
    return 'heat_exchanger';
  }
  if (probe.includes('expansion tank')) {
    return 'expansion_tank';
  }
  if (probe.includes('air separator')) {
    return 'air_separator';
  }
  if (probe.includes('dirt separator')) {
    return 'dirt_separator';
  }
  if (probe.includes('strainer')) {
    return 'strainer';
  }
  if (probe.includes('control valve') || /\bcv\b/.test(probe)) {
    return 'control_valve';
  }
  if (probe.includes('balancing valve') || /\bbv\b/.test(probe)) {
    return 'balancing_valve';
  }
  if (probe.includes('check valve')) {
    return 'check_valve';
  }
  if (probe.includes('isolation valve') || probe.includes('butterfly valve') || probe.includes('ball valve')) {
    return 'isolation_valve';
  }
  if (probe.includes('thermostat')) {
    return 'thermostat';
  }
  if (probe.includes('sensor') || probe.includes('transmitter')) {
    return 'sensor';
  }
  if (probe.includes('bms') || probe.includes('bas panel') || probe.includes('controls panel')) {
    return 'bms';
  }
  if (probe.includes('heat pump') || probe.includes('vrf')) {
    return 'heat_pump';
  }
  if (probe.includes('pump')) {
    return 'pump';
  }

  return 'device';
}

function getSymbolSpec(symbol: string): HvacSymbolSpec {
  return HVAC_SYMBOL_LIBRARY[symbol] ?? HVAC_SYMBOL_LIBRARY.device;
}

function inferLane(node: DiagramNode, symbol: string): HvacLaneId {
  const configured = String(node.params?.lane ?? '').toLowerCase().trim();
  const laneMatch = LANE_SPECS.find((lane) => lane.id === configured);
  if (laneMatch) {
    return laneMatch.id;
  }

  const systemProbe = `${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();

  if (configured.includes('air')) {
    return 'air';
  }
  if (configured.includes('control')) {
    return 'controls';
  }
  if (configured.includes('exhaust') || configured.includes('relief')) {
    return 'exhaust';
  }
  if (configured.includes('heat') || configured.includes('hhw')) {
    return 'heating';
  }
  if (configured.includes('condens') || configured.includes('tower')) {
    return 'condenser';
  }
  if (configured.includes('terminal') || configured.includes('zone')) {
    return 'terminal';
  }

  if (systemProbe.includes('condenser') || systemProbe.includes('tower')) {
    return 'condenser';
  }
  if (systemProbe.includes('boiler') || systemProbe.includes('hhw') || systemProbe.includes('hot water') || symbol === 'reheat_coil') {
    return 'heating';
  }
  if (systemProbe.includes('control') || symbol === 'sensor' || symbol === 'thermostat' || symbol === 'bms') {
    return 'controls';
  }
  if (systemProbe.includes('relief') || systemProbe.includes('exhaust') || symbol === 'relief_fan' || symbol === 'exhaust_fan' || symbol === 'relief_louver') {
    return 'exhaust';
  }
  if (systemProbe.includes('zone') || systemProbe.includes('space') || symbol === 'diffuser' || symbol === 'return_grille' || symbol === 'fan_coil' || symbol === 'unit_heater' || symbol === 'zone') {
    return 'terminal';
  }
  if (symbol === 'chiller' || symbol === 'pump' || symbol === 'heat_exchanger' || symbol === 'strainer' || symbol === 'control_valve' || symbol === 'check_valve' || symbol === 'balancing_valve' || symbol === 'isolation_valve' || symbol === 'dirt_separator' || systemProbe.includes('chw') || systemProbe.includes('chilled water')) {
    return 'chilled';
  }

  return getSymbolSpec(symbol).lane;
}

function getRole(incomingCount: number, outgoingCount: number): HvacRole {
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

function buildNodeVisual(node: DiagramNode, incomingCount: number, outgoingCount: number): HvacNodeVisual {
  const symbol = inferSymbol(node);
  const spec = getSymbolSpec(symbol);
  const lane = inferLane(node, symbol);
  const laneOrder = LANE_SPECS.find((entry) => entry.id === lane)?.order ?? 0;
  const labelLines = wrapText(node.label, spec.labelChars);
  const labelFontSize = 12;
  const labelLineHeight = 14;
  const labelBlockHeight = labelLines.length * labelLineHeight + 14;
  const paramLines = Object.entries(node.params ?? {})
    .filter(([key]) => !new Set(['lane', 'column', 'slot']).has(key))
    .map(([key, value]) => `${key}: ${value}`);
  const baseWidth = symbol === 'header' ? Math.max(spec.width, 186 + Math.max(incomingCount, outgoingCount) * 18) : spec.width;
  const baseHeight = spec.height;
  const paramWidth = paramLines.length
    ? Math.max(baseWidth - 18, ...paramLines.map((line) => line.length * 6.2 + 22))
    : 0;
  const paramHeight = paramLines.length ? paramLines.length * 15 + 18 : 0;
  const totalWidth = Math.max(baseWidth, paramWidth);
  const totalHeight = baseHeight + labelBlockHeight + (paramHeight ? paramHeight + 12 : 0);

  return {
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
    role: getRole(incomingCount, outgoingCount),
    labelLines,
    labelFontSize,
    labelLineHeight,
    labelBlockHeight,
    paramLines,
    deviceWidth: baseWidth,
    deviceHeight: baseHeight,
    paramWidth,
    paramHeight,
    totalWidth,
    totalHeight,
  };
}

function getMedium(edge: DiagramEdge, from: HvacNodeVisual, to: HvacNodeVisual): HvacMediumSpec {
  const probe = `${edge.label ?? ''} ${from.label} ${to.label} ${Object.values(from.params ?? {}).join(' ')} ${Object.values(to.params ?? {}).join(' ')}`.toLowerCase();

  if (/(^|\b)(oa|outside air)(\b|$)/.test(probe)) {
    return HVAC_MEDIA_LIBRARY.outside_air;
  }
  if (probe.includes('mixed air') || /(^|\b)ma(\b|$)/.test(probe)) {
    return HVAC_MEDIA_LIBRARY.mixed_air;
  }
  if (/(^|\b)(sa|supply air)(\b|$)/.test(probe)) {
    return HVAC_MEDIA_LIBRARY.supply_air;
  }
  if (/(^|\b)(ra|return air)(\b|$)/.test(probe)) {
    return HVAC_MEDIA_LIBRARY.return_air;
  }
  if (probe.includes('relief')) {
    return HVAC_MEDIA_LIBRARY.relief_air;
  }
  if (/(^|\b)(ea|exhaust air)(\b|$)/.test(probe)) {
    return HVAC_MEDIA_LIBRARY.exhaust_air;
  }
  if (probe.includes('chws') || probe.includes('chw supply') || probe.includes('chilled water supply')) {
    return HVAC_MEDIA_LIBRARY.chilled_water_supply;
  }
  if (probe.includes('chwr') || probe.includes('chw return') || probe.includes('chilled water return')) {
    return HVAC_MEDIA_LIBRARY.chilled_water_return;
  }
  if (probe.includes('hhws') || probe.includes('heating water supply') || probe.includes('hot water supply')) {
    return HVAC_MEDIA_LIBRARY.heating_water_supply;
  }
  if (probe.includes('hhwr') || probe.includes('heating water return') || probe.includes('hot water return')) {
    return HVAC_MEDIA_LIBRARY.heating_water_return;
  }
  if (probe.includes('cws') || probe.includes('condenser water supply')) {
    return HVAC_MEDIA_LIBRARY.condenser_water_supply;
  }
  if (probe.includes('cwr') || probe.includes('condenser water return')) {
    return HVAC_MEDIA_LIBRARY.condenser_water_return;
  }
  if (probe.includes('condensate')) {
    return HVAC_MEDIA_LIBRARY.condensate;
  }
  if (probe.includes('control') || from.lane === 'controls' || to.lane === 'controls') {
    return HVAC_MEDIA_LIBRARY.controls;
  }
  if (from.lane === 'air' || to.lane === 'air' || from.lane === 'terminal' || to.lane === 'terminal' || from.lane === 'exhaust' || to.lane === 'exhaust') {
    return HVAC_MEDIA_LIBRARY.supply_air;
  }
  if (from.lane === 'heating' || to.lane === 'heating') {
    return HVAC_MEDIA_LIBRARY.heating_water_supply;
  }
  if (from.lane === 'condenser' || to.lane === 'condenser') {
    return HVAC_MEDIA_LIBRARY.condenser_water_supply;
  }
  if (from.lane === 'chilled' || to.lane === 'chilled') {
    return HVAC_MEDIA_LIBRARY.chilled_water_supply;
  }

  return HVAC_MEDIA_LIBRARY.generic;
}

function buildCompiledInput(input: string | DiagramProgram | DiagramInput): DiagramInput {
  if (typeof input === 'string') {
    return compileDiagram(parseDiagram(input)) as DiagramInput;
  }
  if ((input as DiagramInput)?.type === 'CompiledDiagram') {
    return input as DiagramInput;
  }
  return compileDiagram(input as DiagramProgram) as DiagramInput;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

function layoutDiagram(input: DiagramInput, options: HvacRenderOptions = {}): HvacLayout {
  const margin = options.margin ?? 54;
  const laneLabelWidth = options.laneLabelWidth ?? 132;
  const columnGap = options.columnGap ?? 250;
  const laneGap = options.laneGap ?? 28;
  const slotGap = options.slotGap ?? 22;
  const titleOffset = input.title ? 92 : 38;

  const incoming = new Map<string, DiagramEdge[]>(input.nodes.map((node) => [node.id, []]));
  const outgoing = new Map<string, DiagramEdge[]>(input.nodes.map((node) => [node.id, []]));
  for (const edge of input.edges) {
    incoming.get(edge.to)?.push(edge);
    outgoing.get(edge.from)?.push(edge);
  }

  const nodes = input.nodes.map((node) => buildNodeVisual(node, incoming.get(node.id)?.length ?? 0, outgoing.get(node.id)?.length ?? 0));
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const lanesInUse = [...new Set(nodes.map((node) => node.lane))]
    .map((laneId) => LANE_SPECS.find((lane) => lane.id === laneId))
    .filter(Boolean)
    .sort((left, right) => left.order - right.order);

  const laneLayouts: LaneLayout[] = [];
  let laneCursor = margin + titleOffset;

  for (const laneSpec of lanesInUse) {
    const laneNodes = nodes.filter((node) => node.lane === laneSpec.id);
    const groups = new Map<number, HvacNodeVisual[]>();
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

    const height = Math.max(172, maxGroupHeight + 46);
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
    const groups = new Map<number, HvacNodeVisual[]>();
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
        const inputYs = spreadPorts(inputEdges.length, node.centerY, portTop, portBottom, symbolPortGap(node.symbol));
        const outputYs = spreadPorts(outputEdges.length, node.centerY, portTop, portBottom, symbolPortGap(node.symbol));

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
  const edges: HvacEdgeLayout[] = input.edges.map((edge) => {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    const key = `${edge.from}->${edge.to}`;
    const medium = getMedium(edge, from, to);
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
    title: input.title,
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

function symbolPortGap(symbol: string): number {
  if (symbol === 'header') {
    return 16;
  }
  if (symbol === 'ahu' || symbol === 'doas' || symbol === 'rtu') {
    return 20;
  }
  return 18;
}

function renderPipeCoil(x: number, y: number, width: number, height: number, stroke: string): string {
  const rows = 3;
  const rowGap = height / (rows + 1);
  return Array.from({ length: rows }, (_, index) => {
    const rowY = y + rowGap * (index + 1);
    return `<path d="M ${x + 8} ${rowY} C ${x + 18} ${rowY - 6}, ${x + 28} ${rowY + 6}, ${x + 38} ${rowY} S ${x + 58} ${rowY - 6}, ${x + 68} ${rowY} S ${x + 88} ${rowY + 6}, ${x + 98} ${rowY}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>`;
  }).join('');
}

function renderFanWheel(cx: number, cy: number, r: number, stroke: string, accent: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="3.2" fill="${accent}"/>
    <path d="M ${cx} ${cy - 2} Q ${cx + r * 0.72} ${cy - r * 0.82} ${cx + r * 0.24} ${cy + r * 0.08}
      M ${cx - 2} ${cy + 1} Q ${cx - r * 0.9} ${cy + r * 0.26} ${cx - r * 0.12} ${cy + r * 0.54}
      M ${cx + 1} ${cy + 2} Q ${cx + r * 0.18} ${cy + r * 0.95} ${cx - r * 0.36} ${cy + r * 0.08}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
}

function renderValveBody(cx: number, cy: number, size: number, stroke: string, accent: string): string {
  return `<path d="M ${cx - size * 1.9} ${cy} H ${cx - size} M ${cx + size} ${cy} H ${cx + size * 1.9}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M ${cx - size} ${cy - size} L ${cx} ${cy} L ${cx - size} ${cy + size} M ${cx + size} ${cy - size} L ${cx} ${cy} L ${cx + size} ${cy + size}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function renderGlyph(node: HvacNodeVisual, x: number, y: number, width: number, height: number): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = node.spec.stroke;
  const accent = node.spec.accent;
  const fill = node.spec.innerFill;

  switch (node.glyph) {
    case 'outside_air': {
      return `<path d="M ${x + 20} ${y + 22} H ${x + width - 20} V ${y + 42} H ${x + width * 0.66} V ${y + height - 18} H ${x + 34} V ${y + 42} H ${x + 20} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M ${x + 34} ${y + 48} H ${x + width - 38} M ${x + 34} ${y + 60} H ${x + width - 44} M ${x + 34} ${y + 72} H ${x + width - 50}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${x + width - 52} ${cy} H ${x + width - 18}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M ${x + width - 28} ${cy - 8} L ${x + width - 18} ${cy} L ${x + width - 28} ${cy + 8}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'relief_louver': {
      return `<path d="M ${x + 22} ${y + 28} H ${x + width - 32} V ${y + height - 22} H ${x + 34} V ${y + 44} H ${x + 22} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M ${x + 38} ${y + 52} H ${x + width - 40} M ${x + 38} ${y + 64} H ${x + width - 46} M ${x + 38} ${y + 76} H ${x + width - 52}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${x + 18} ${cy} H ${x + 54}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M ${x + 28} ${cy - 8} L ${x + 18} ${cy} L ${x + 28} ${cy + 8}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'damper': {
      return `<rect x="${x + 18}" y="${y + 20}" width="${width - 36}" height="${height - 40}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${x + 30} ${cy} H ${x + width - 30}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${x + 44} ${y + 34} L ${x + width - 44} ${y + height - 34} M ${x + 44} ${y + height - 34} L ${x + width - 44} ${y + 34}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    case 'fire_smoke_damper': {
      return `<rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${x + 34} ${cy} H ${x + width - 34}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${x + 42} ${y + 32} L ${x + width - 42} ${y + height - 30} M ${x + 42} ${y + height - 30} L ${x + width - 42} ${y + 32}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M ${cx} ${y + 26} C ${cx + 8} ${y + 20}, ${cx + 10} ${y + 38}, ${cx} ${y + 42} C ${cx - 10} ${y + 38}, ${cx - 8} ${y + 20}, ${cx} ${y + 26}" fill="none" stroke="#b15430" stroke-width="1.4" stroke-linejoin="round"/>`;
    }
    case 'mixing_box': {
      const bodyX = x + 18;
      const bodyY = y + 18;
      const bodyW = width - 36;
      const bodyH = height - 36;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + bodyW * 0.36} ${bodyY + 12} V ${bodyY + bodyH - 12}" fill="none" stroke="#c8d3da" stroke-width="1"/>
        <path d="M ${bodyX + 12} ${cy - 10} H ${bodyX + bodyW * 0.36 - 10} M ${bodyX + 12} ${cy + 10} H ${bodyX + bodyW * 0.36 - 10} M ${bodyX + bodyW * 0.36 + 10} ${cy} H ${bodyX + bodyW - 12}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${bodyX + 28} ${cy - 20} L ${bodyX + 52} ${cy - 4} M ${bodyX + 28} ${cy + 20} L ${bodyX + 52} ${cy + 4} M ${bodyX + bodyW * 0.36 + 18} ${cy - 18} L ${bodyX + bodyW * 0.36 + 42} ${cy} L ${bodyX + bodyW * 0.36 + 18} ${cy + 18}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'filter': {
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 30} L ${x + 48} ${y + height - 30} L ${x + 62} ${y + 30} L ${x + 76} ${y + height - 30} L ${x + 90} ${y + 30} L ${x + 104} ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'cooling_coil':
    case 'heating_coil':
    case 'reheat_coil': {
      const coilColor = node.glyph === 'cooling_coil' ? '#3b7da5' : '#b66a37';
      return `<rect x="${x + 18}" y="${y + 16}" width="${width - 36}" height="${height - 32}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderPipeCoil(x + 24, y + 18, width - 48, height - 36, coilColor)}`;
    }
    case 'humidifier': {
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 38} ${cy} H ${x + width - 38}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${cx - 16} ${cy - 6} V ${cy + 16} M ${cx} ${cy - 10} V ${cy + 16} M ${cx + 16} ${cy - 6} V ${cy + 16}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - 14} ${cy - 18} C ${cx - 8} ${cy - 28}, ${cx - 2} ${cy - 28}, ${cx + 4} ${cy - 18} M ${cx + 2} ${cy - 22} C ${cx + 10} ${cy - 34}, ${cx + 16} ${cy - 34}, ${cx + 22} ${cy - 22}" fill="none" stroke="#7eb8c4" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'energy_recovery': {
      const r = Math.min(width, height) * 0.22;
      return `<rect x="${x + 16}" y="${y + 16}" width="${width - 32}" height="${height - 32}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${accent}" stroke-width="1.7"/>
        <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="#6f8f7d" stroke-width="1.6"/>
        <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy + r}" fill="none" stroke="#8b6c43" stroke-width="1.6"/>
        <path d="M ${x + 26} ${cy} H ${cx - r - 8} M ${cx + r + 8} ${cy} H ${x + width - 26}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'fan':
    case 'return_fan':
    case 'relief_fan':
    case 'exhaust_fan': {
      const r = Math.min(width, height) * 0.21;
      const arrowX = node.glyph === 'return_fan' ? cx - r * 1.8 : cx + r * 1.8;
      const arrowDir = node.glyph === 'return_fan' ? -1 : 1;
      const housing = node.glyph === 'exhaust_fan' || node.glyph === 'relief_fan';
      return `${housing ? `<path d="M ${x + 24} ${y + 26} H ${x + width - 24} V ${y + height - 26} H ${x + 24} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>` : ''}
        ${renderFanWheel(cx, cy, r, stroke, accent)}
        <path d="M ${cx - r * 1.9} ${cy} H ${cx - r - 6} M ${cx + r + 6} ${cy} H ${cx + r * 1.9}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${arrowX - 10 * arrowDir} ${cy - 8} L ${arrowX} ${cy} L ${arrowX - 10 * arrowDir} ${cy + 8}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'sound_attenuator': {
      return `<rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 40} ${y + 28} V ${y + height - 28} M ${x + 60} ${y + 28} V ${y + height - 28} M ${x + 80} ${y + 28} V ${y + height - 28} M ${x + 100} ${y + 28} V ${y + height - 28}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'duct': {
      return `<rect x="${x + 12}" y="${y + 20}" width="${width - 24}" height="${height - 40}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 26} ${cy} H ${x + width - 26}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M ${x + width - 40} ${cy - 10} L ${x + width - 26} ${cy} L ${x + width - 40} ${cy + 10}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'header': {
      const bodyX = x + 16;
      const bodyY = y + 28;
      const bodyW = width - 32;
      const bodyH = Math.max(16, height - 58);
      const tapCount = Math.max(node.incomingCount + node.outgoingCount, 2);
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${bodyX + 12} ${bodyY + bodyH / 2} H ${bodyX + bodyW - 12}" fill="none" stroke="${accent}" stroke-width="3.8" stroke-linecap="round"/>
        ${Array.from({ length: tapCount }, (_, index) => {
          const offset = bodyX + 18 + (index * Math.max(18, (bodyW - 36) / Math.max(1, tapCount - 1)));
          return `<path d="M ${offset} ${bodyY - 10} V ${bodyY + bodyH + 10}" fill="none" stroke="#b6c5cf" stroke-width="1.1" opacity="0.85"/>`;
        }).join('')}`;
    }
    case 'ahu':
    case 'doas': {
      const bodyX = x + 12;
      const bodyY = y + 14;
      const bodyW = width - 24;
      const bodyH = height - 30;
      const sectionW = bodyW / (node.glyph === 'doas' ? 5 : 4);
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + sectionW} ${bodyY + 8} V ${bodyY + bodyH - 8} M ${bodyX + sectionW * 2} ${bodyY + 8} V ${bodyY + bodyH - 8} M ${bodyX + sectionW * 3} ${bodyY + 8} V ${bodyY + bodyH - 8}" fill="none" stroke="#c8d4db" stroke-width="1.1"/>
        ${node.glyph === 'doas' ? `<path d="M ${bodyX + sectionW * 4} ${bodyY + 8} V ${bodyY + bodyH - 8}" fill="none" stroke="#c8d4db" stroke-width="1.1"/>` : ''}
        <path d="M ${bodyX + 12} ${cy} H ${bodyX + sectionW - 12}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${bodyX + 18} ${bodyY + 26} L ${bodyX + 30} ${bodyY + bodyH - 24} L ${bodyX + 42} ${bodyY + 26} L ${bodyX + 54} ${bodyY + bodyH - 24}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round"/>
        ${renderPipeCoil(bodyX + sectionW + 10, bodyY + 18, sectionW - 20, bodyH - 36, '#3b7da5')}
        ${renderPipeCoil(bodyX + sectionW * 2 + 10, bodyY + 18, sectionW - 20, bodyH - 36, '#b66a37')}
        ${renderFanWheel(bodyX + sectionW * 3.5, cy, Math.min(sectionW, bodyH) * 0.18, stroke, accent)}
        ${node.glyph === 'doas' ? `<circle cx="${bodyX + sectionW * 4.5}" cy="${cy}" r="${Math.min(sectionW, bodyH) * 0.18}" fill="#ffffff" stroke="#6f8f7d" stroke-width="1.5"/>
          <path d="M ${bodyX + sectionW * 4.5} ${cy - 14} A 14 14 0 0 1 ${bodyX + sectionW * 4.5 + 14} ${cy}" fill="none" stroke="#6f8f7d" stroke-width="1.4"/>` : ''}`;
    }
    case 'rtu': {
      const bodyX = x + 14;
      const bodyY = y + 18;
      const bodyW = width - 28;
      const bodyH = height - 34;
      return `<path d="M ${bodyX + 10} ${bodyY - 6} H ${bodyX + bodyW - 10}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderFanWheel(bodyX + bodyW * 0.28, cy + 4, Math.min(bodyW, bodyH) * 0.12, stroke, accent)}
        <path d="M ${bodyX + bodyW * 0.52} ${bodyY + 16} H ${bodyX + bodyW - 18} M ${bodyX + bodyW * 0.52} ${bodyY + 28} H ${bodyX + bodyW - 18} M ${bodyX + bodyW * 0.52} ${bodyY + 40} H ${bodyX + bodyW - 18}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'vav': {
      return `<path d="M ${x + 22} ${cy - 20} H ${x + 58} L ${x + width - 32} ${cy - 14} V ${cy + 14} L ${x + 58} ${cy + 20} H ${x + 22} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M ${x + 48} ${cy - 14} L ${x + 48} ${cy + 14}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${x + 74}" cy="${cy - 22}" r="7" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>
        <path d="M ${x + 74} ${cy - 15} V ${cy - 4}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'fan_coil': {
      return `<rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 36}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderPipeCoil(x + 30, y + 24, width * 0.34, height - 48, '#3b7da5')}
        ${renderFanWheel(x + width * 0.7, cy, Math.min(width, height) * 0.16, stroke, accent)}
        <path d="M ${x + 30} ${y + height - 26} H ${x + width - 30}" fill="none" stroke="#cdd7de" stroke-width="1"/>`;
    }
    case 'unit_heater': {
      return `<rect x="${x + 18}" y="${y + 22}" width="${width - 36}" height="${height - 40}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderPipeCoil(x + 30, y + 28, width - 60, (height - 56) / 2, '#b66a37')}
        ${renderFanWheel(cx, y + height - 38, Math.min(width, height) * 0.12, stroke, accent)}`;
    }
    case 'diffuser': {
      return `<path d="M ${cx} ${y + 24} L ${x + width - 30} ${cy} L ${cx} ${y + height - 22} L ${x + 30} ${cy} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M ${cx} ${y + 34} L ${x + width - 42} ${cy} L ${cx} ${y + height - 32} L ${x + 42} ${cy} Z" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linejoin="round"/>`;
    }
    case 'return_grille': {
      return `<rect x="${x + 24}" y="${y + 24}" width="${width - 48}" height="${height - 48}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 36} H ${x + width - 34} M ${x + 38} ${y + 46} H ${x + width - 38} M ${x + 42} ${y + 56} H ${x + width - 42}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'zone': {
      return `<rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 36}" rx="14" fill="#ffffff" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="6 5"/>
        <path d="M ${x + 34} ${y + height - 30} H ${x + width - 34}" fill="none" stroke="#cdd5db" stroke-width="1" stroke-dasharray="4 4"/>
        <circle cx="${cx}" cy="${cy - 6}" r="8" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>
        <path d="M ${cx} ${cy + 2} V ${cy + 16}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'chiller': {
      const bodyX = x + 14;
      const bodyY = y + 18;
      const bodyW = width - 28;
      const bodyH = height - 34;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${bodyX + 14}" y="${bodyY + bodyH - 30}" width="${bodyW - 28}" height="12" rx="5" fill="#edf3f6" stroke="#c9d5db" stroke-width="0.9"/>
        <circle cx="${bodyX + bodyW * 0.28}" cy="${bodyY + 34}" r="14" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="${bodyX + bodyW * 0.5}" cy="${bodyY + 34}" r="14" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="${bodyX + bodyW * 0.72}" cy="${bodyY + 34}" r="14" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <path d="M ${bodyX + 24} ${bodyY + bodyH - 48} H ${bodyX + bodyW - 24} M ${bodyX + 24} ${bodyY + bodyH - 40} H ${bodyX + bodyW - 24}" fill="none" stroke="#b2c2cb" stroke-width="1.1"/>`;
    }
    case 'cooling_tower': {
      return `<path d="M ${x + 34} ${y + 24} H ${x + width - 34} L ${x + width - 48} ${y + height - 22} H ${x + 48} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
        <ellipse cx="${cx}" cy="${y + 30}" rx="24" ry="8" fill="#ffffff" stroke="${accent}" stroke-width="1.5"/>
        <path d="M ${cx - 24} ${y + 30} A 24 8 0 0 0 ${cx + 24} ${y + 30}" fill="none" stroke="${accent}" stroke-width="1.3"/>
        <path d="M ${x + 56} ${cy} H ${x + width - 56} M ${x + 62} ${cy + 12} H ${x + width - 62} M ${x + 68} ${cy + 24} H ${x + width - 68}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'boiler': {
      return `<rect x="${x + 28}" y="${y + 18}" width="${width - 56}" height="${height - 30}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${y + 36} C ${cx + 10} ${y + 28}, ${cx + 12} ${y + 46}, ${cx} ${y + 50} C ${cx - 12} ${y + 46}, ${cx - 10} ${y + 28}, ${cx} ${y + 36}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linejoin="round"/>
        <rect x="${cx - 22}" y="${cy}" width="44" height="24" rx="8" fill="#ffffff" stroke="#d2dde2" stroke-width="1"/>
        <path d="M ${cx} ${y + 12} V ${y + 18} M ${cx + 16} ${y + 12} V ${y + 18}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    case 'pump': {
      const r = Math.min(width, height) * 0.18;
      return `<path d="M ${x + 24} ${cy} H ${cx - r - 8}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx - 8}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 8 - r * 0.5} ${cy} H ${cx - 8 + r * 0.5} M ${cx - 8 + r * 0.2} ${cy - r * 0.35} L ${cx - 8 + r * 0.55} ${cy} L ${cx - 8 + r * 0.2} ${cy + r * 0.35}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="${cx + 20}" y="${cy - 18}" width="34" height="36" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.4"/>
        <path d="M ${cx + 54} ${cy} H ${x + width - 24}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 18} ${cy + 26} H ${cx + 56}" fill="none" stroke="#b9c7cf" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    case 'heat_exchanger': {
      return `<rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 34} ${y + 28} L ${cx + 34} ${y + height - 28} M ${cx + 34} ${y + 28} L ${cx - 34} ${y + height - 28}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M ${x + 14} ${cy - 14} H ${x + 20} M ${x + 14} ${cy + 14} H ${x + 20} M ${x + width - 20} ${cy - 14} H ${x + width - 14} M ${x + width - 20} ${cy + 14} H ${x + width - 14}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    case 'expansion_tank': {
      const r = Math.min(width, height) * 0.2;
      const top = cy - r * 1.4;
      const bottom = cy + r * 1.6;
      return `<ellipse cx="${cx}" cy="${top}" rx="${r}" ry="${r * 0.42}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - r} ${top} V ${bottom} M ${cx + r} ${top} V ${bottom}" fill="none" stroke="${stroke}" stroke-width="1.6"/>
        <ellipse cx="${cx}" cy="${bottom}" rx="${r}" ry="${r * 0.42}" fill="none" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx} ${bottom + 10} V ${bottom + 18}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'air_separator':
    case 'dirt_separator': {
      return `<path d="M ${x + 18} ${cy} H ${x + 42}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <rect x="${x + 42}" y="${y + 20}" width="${width - 84}" height="${height - 40}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${x + width - 42} ${cy} H ${x + width - 18}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx} ${y + 12} V ${y + 20} M ${cx} ${y + height - 20} V ${y + height - 12}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="10" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>`;
    }
    case 'strainer': {
      return `<path d="M ${x + 18} ${cy} H ${x + 44}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${x + 44} ${cy - 16} L ${x + 88} ${cy} L ${x + 44} ${cy + 16} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M ${x + 88} ${cy} H ${x + width - 18}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${x + 54} ${cy - 8} L ${x + 78} ${cy + 8} M ${x + 54} ${cy + 2} L ${x + 68} ${cy + 12}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'control_valve': {
      return `${renderValveBody(cx, cy, 16, stroke, accent)}
        <rect x="${cx - 8}" y="${cy - 34}" width="16" height="18" rx="4" fill="#ffffff" stroke="${accent}" stroke-width="1.3"/>
        <path d="M ${cx} ${cy - 16} V ${cy - 4}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'balancing_valve': {
      return `${renderValveBody(cx, cy, 16, stroke, accent)}
        <path d="M ${cx} ${cy - 18} V ${cy - 30} M ${cx - 10} ${cy - 30} H ${cx + 10}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx - 20}" cy="${cy}" r="2.1" fill="${accent}"/>
        <circle cx="${cx + 20}" cy="${cy}" r="2.1" fill="${accent}"/>`;
    }
    case 'check_valve': {
      return `<path d="M ${cx - 34} ${cy} H ${cx - 12} M ${cx + 14} ${cy} H ${cx + 34}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 12} ${cy - 16} L ${cx + 10} ${cy} L ${cx - 12} ${cy + 16} Z" fill="${fill}" stroke="${accent}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M ${cx + 14} ${cy - 18} V ${cy + 18}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'isolation_valve': {
      return `${renderValveBody(cx, cy, 16, stroke, accent)}
        <circle cx="${cx}" cy="${cy}" r="3" fill="${accent}"/>`;
    }
    case 'sensor': {
      return `<circle cx="${cx}" cy="${cy}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx} ${cy + 18} V ${cy + 32}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 8} ${cy} H ${cx + 8}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'thermostat': {
      return `<rect x="${cx - 18}" y="${cy - 22}" width="36" height="44" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx - 8} ${cy - 8} H ${cx + 8} M ${cx - 10} ${cy + 6} H ${cx + 10}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy + 14}" r="3" fill="${accent}"/>`;
    }
    case 'bms': {
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 34}" y="${y + 30}" width="${width - 68}" height="${height - 60}" rx="8" fill="#ffffff" stroke="#d0dac5" stroke-width="1"/>
        <circle cx="${x + 48}" cy="${cy}" r="3" fill="${accent}"/>
        <path d="M ${x + 60} ${cy - 10} H ${x + width - 40} M ${x + 60} ${cy} H ${x + width - 50} M ${x + 60} ${cy + 10} H ${x + width - 58}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    case 'heat_pump': {
      return `<rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 36}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderFanWheel(cx, cy - 6, Math.min(width, height) * 0.17, stroke, accent)}
        <path d="M ${x + 36} ${y + height - 34} H ${x + width - 36}" fill="none" stroke="#bcc8cf" stroke-width="1.1"/>
        <path d="M ${cx - 14} ${cy + 24} H ${cx + 14}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'device':
    default: {
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 30} L ${x + width - 34} ${y + height - 30} M ${x + width - 34} ${y + 30} L ${x + 34} ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}">?</text>`;
    }
  }
}

function renderNode(node: HvacNodeVisual): string {
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
    ${renderGlyph(node, faceX, faceY, faceWidth, faceHeight)}
    ${renderTextLines(node.labelLines, bodyX + bodyWidth / 2, labelStartY, {
      fontSize: node.labelFontSize,
      fontWeight: '700',
      lineHeightPx: node.labelLineHeight,
      fill: '#1b2933',
    })}
    ${paramRect}
  </g>`;
}

function renderEdge(edge: HvacEdgeLayout): string {
  const strokeDash = edge.medium.dasharray ? ` stroke-dasharray="${edge.medium.dasharray}"` : '';
  const edgeLabel = edge.label ? edge.label.toUpperCase() : edge.medium.label;
  const labelWidth = Math.max(42, edgeLabel.length * 6.8 + 12);
  const label = `<rect x="${edge.labelX - 6}" y="${edge.labelY - 12}" width="${labelWidth}" height="18" rx="9" fill="#ffffff" stroke="${edge.medium.stroke}" stroke-opacity="0.28" stroke-width="0.8"/>
    <text x="${edge.labelX}" y="${edge.labelY + 1}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10.5" font-weight="700" fill="${edge.medium.stroke}">${escapeXml(edgeLabel)}</text>`;

  if (edge.medium.className === 'air') {
    return `<g data-edge-from="${escapeXml(edge.fromId)}" data-edge-to="${escapeXml(edge.toId)}" data-medium="${edge.medium.key}" data-reversed="${edge.reversed}">
      <path d="${edge.path}" fill="none" stroke="${edge.medium.accent}" stroke-width="${edge.medium.width + 2.6}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>
      <path d="${edge.path}" fill="none" stroke="${edge.medium.stroke}" stroke-width="${edge.medium.width}" stroke-linecap="round" stroke-linejoin="round"${strokeDash}/>
      ${label}
    </g>`;
  }

  return `<g data-edge-from="${escapeXml(edge.fromId)}" data-edge-to="${escapeXml(edge.toId)}" data-medium="${edge.medium.key}" data-reversed="${edge.reversed}">
    <path d="${edge.path}" fill="none" stroke="${edge.medium.accent}" stroke-width="${edge.medium.width + 1.8}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
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

function renderLegend(layout: HvacLayout): string {
  const titleY = layout.legendY + 10;
  return `<g transform="translate(${layout.legendX}, ${layout.legendY})">
    <rect x="0" y="0" width="238" height="${Math.max(86, 26 + layout.media.length * 18)}" rx="16" fill="#ffffff" stroke="#c9d5db" stroke-width="1.1"/>
    <text x="16" y="${titleY + 4}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" font-weight="700" fill="#4c6070" letter-spacing="0.7">MEDIA LEGEND</text>
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

export function compileHvacDiagram(input: string | DiagramProgram | DiagramInput, options: HvacRenderOptions = {}): HvacLayout {
  return layoutDiagram(buildCompiledInput(input), options);
}

export function renderHvacSvg(input: string | DiagramProgram | DiagramInput | HvacLayout, options: HvacRenderOptions = {}): string {
  const layout = (input as HvacLayout)?.lanes ? (input as HvacLayout) : compileHvacDiagram(input as string | DiagramProgram | DiagramInput, options);
  const title = layout.title
    ? `<text x="${layout.width / 2}" y="44" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="22" font-weight="700" fill="#1b2933">${escapeXml(layout.title)}</text>
      <text x="${layout.width / 2}" y="66" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#5f7383">Mechanical-style HVAC schematic with dedicated lane bands, media-aware piping and ductwork, and component-specific equipment symbols</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="hvac schematic">
    <defs>
      <pattern id="hvac-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 H 0 V 32" fill="none" stroke="#d9e0e5" stroke-width="0.8" opacity="0.55"/>
      </pattern>
    </defs>
    <rect x="10" y="10" width="${layout.width - 20}" height="${layout.height - 20}" rx="26" fill="#fcfbf8" stroke="#c7d1d8" stroke-width="1.2"/>
    <rect x="24" y="24" width="${layout.width - 48}" height="${layout.height - 48}" rx="18" fill="url(#hvac-grid)" opacity="0.55"/>
    ${title}
    ${layout.lanes.map((lane) => renderLaneGuide(lane, layout.width, 54 + 132)).join('')}
    ${renderLegend(layout)}
    ${layout.edges.map(renderEdge).join('')}
    ${layout.nodes.map(renderNode).join('')}
  </svg>`;
}

export class HvacJS {
  static parse(source: string): DiagramProgram {
    return parseDiagram(source) as DiagramProgram;
  }

  static compile(input: string | DiagramProgram | DiagramInput, options: HvacRenderOptions = {}): HvacLayout {
    return compileHvacDiagram(input, options);
  }

  static render(input: string | DiagramProgram | DiagramInput | HvacLayout, options: HvacRenderOptions = {}): string {
    return renderHvacSvg(input, options);
  }
}
