import { parseDiagram } from './diagjs';
import { createLaneRenderer } from './lane-renderer';
import type { DiagramInput, DiagramNode, DiagramProgram, LaneDiagramLayout, LaneMediumSpec, LaneNodeVisual, LaneSymbolSpec } from './lane-renderer';

const LIGHTING_LANES = [
  { id: 'headend', label: 'Head-End / Enterprise', order: 0, tint: 'rgba(76, 96, 134, 0.10)', stroke: '#506585' },
  { id: 'backbone', label: 'Building Backbone', order: 1, tint: 'rgba(92, 110, 144, 0.10)', stroke: '#5c6e90' },
  { id: 'panel', label: 'Relay / Dimming Cabinets', order: 2, tint: 'rgba(110, 91, 128, 0.09)', stroke: '#6e5c84' },
  { id: 'room', label: 'Room / Area Controllers', order: 3, tint: 'rgba(88, 110, 84, 0.10)', stroke: '#5d7357' },
  { id: 'sensor', label: 'Stations / Sensors', order: 4, tint: 'rgba(120, 112, 76, 0.10)', stroke: '#7d734b' },
  { id: 'fixture', label: 'Fixture Groups', order: 5, tint: 'rgba(166, 128, 52, 0.09)', stroke: '#a07831' },
  { id: 'exterior', label: 'Exterior / Site Lighting', order: 6, tint: 'rgba(88, 120, 118, 0.10)', stroke: '#5c7b79' },
  { id: 'emergency', label: 'Emergency Integration', order: 7, tint: 'rgba(154, 86, 58, 0.09)', stroke: '#995c40' },
] as const;

const LIGHTING_SYMBOL_ALIASES: Record<string, string> = {
  server: 'headend_server',
  workstation: 'headend_server',
  graphics: 'headend_server',
  gateway: 'lighting_gateway',
  bacnet_gateway: 'lighting_gateway',
  ethernet_switch: 'backbone_switch',
  switch: 'backbone_switch',
  area_controller: 'area_controller',
  floor_controller: 'area_controller',
  lighting_panel: 'relay_panel',
  relay_cabinet: 'relay_panel',
  relay_panel: 'relay_panel',
  dimming_panel: 'dimming_panel',
  dimmer: 'dimming_panel',
  room_controller: 'room_controller',
  local_controller: 'room_controller',
  wallstation: 'wallstation',
  keypad: 'wallstation',
  occupancy: 'occupancy_sensor',
  occupancy_sensor: 'occupancy_sensor',
  daylight: 'daylight_sensor',
  daylight_sensor: 'daylight_sensor',
  photocell: 'photocell',
  light_sensor: 'photocell',
  fixture: 'fixture_group',
  fixture_group: 'fixture_group',
  luminaire_group: 'fixture_group',
  emergency_interface: 'emergency_interface',
  ats_sense: 'emergency_interface',
  shade_controller: 'shade_controller',
  blind_controller: 'shade_controller',
  scene_station: 'scene_station',
};

const LIGHTING_SYMBOLS: Record<string, LaneSymbolSpec> = {
  headend_server: { typeLabel: 'HEAD', glyph: 'headend_server', width: 196, height: 114, fill: '#f5f8fc', innerFill: '#ffffff', stroke: '#506585', accent: '#506585', labelChars: 20, lane: 'headend' },
  lighting_gateway: { typeLabel: 'GW', glyph: 'lighting_gateway', width: 180, height: 106, fill: '#f5f8fc', innerFill: '#ffffff', stroke: '#566c8b', accent: '#566c8b', labelChars: 18, lane: 'backbone' },
  backbone_switch: { typeLabel: 'LAN', glyph: 'backbone_switch', width: 176, height: 104, fill: '#f5f8fc', innerFill: '#ffffff', stroke: '#5c6e90', accent: '#5c6e90', labelChars: 18, lane: 'backbone' },
  area_controller: { typeLabel: 'AREA', glyph: 'area_controller', width: 184, height: 108, fill: '#f7faf6', innerFill: '#ffffff', stroke: '#5d7357', accent: '#5d7357', labelChars: 18, lane: 'room' },
  relay_panel: { typeLabel: 'RELAY', glyph: 'relay_panel', width: 188, height: 112, fill: '#f7f6fb', innerFill: '#ffffff', stroke: '#6e5c84', accent: '#6e5c84', labelChars: 18, lane: 'panel' },
  dimming_panel: { typeLabel: 'DIM', glyph: 'dimming_panel', width: 190, height: 112, fill: '#f7f6fb', innerFill: '#ffffff', stroke: '#6e5c84', accent: '#6e5c84', labelChars: 18, lane: 'panel' },
  room_controller: { typeLabel: 'ROOM', glyph: 'room_controller', width: 176, height: 104, fill: '#f7faf6', innerFill: '#ffffff', stroke: '#5d7357', accent: '#5d7357', labelChars: 18, lane: 'room' },
  wallstation: { typeLabel: 'WS', glyph: 'wallstation', width: 150, height: 96, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#7d734b', accent: '#7d734b', labelChars: 18, lane: 'sensor' },
  scene_station: { typeLabel: 'SCN', glyph: 'scene_station', width: 154, height: 98, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#7d734b', accent: '#7d734b', labelChars: 18, lane: 'sensor' },
  occupancy_sensor: { typeLabel: 'OCC', glyph: 'occupancy_sensor', width: 150, height: 96, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#7d734b', accent: '#7d734b', labelChars: 18, lane: 'sensor' },
  daylight_sensor: { typeLabel: 'DAY', glyph: 'daylight_sensor', width: 150, height: 96, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#a07831', accent: '#a07831', labelChars: 18, lane: 'sensor' },
  photocell: { typeLabel: 'PHOTO', glyph: 'photocell', width: 154, height: 98, fill: '#f6faf8', innerFill: '#ffffff', stroke: '#5c7b79', accent: '#5c7b79', labelChars: 18, lane: 'exterior' },
  fixture_group: { typeLabel: 'LGT', glyph: 'fixture_group', width: 178, height: 104, fill: '#fffbed', innerFill: '#ffffff', stroke: '#a07831', accent: '#a07831', labelChars: 18, lane: 'fixture' },
  emergency_interface: { typeLabel: 'EM', glyph: 'emergency_interface', width: 176, height: 106, fill: '#fbf7f3', innerFill: '#ffffff', stroke: '#995c40', accent: '#995c40', labelChars: 18, lane: 'emergency' },
  shade_controller: { typeLabel: 'SHADE', glyph: 'shade_controller', width: 176, height: 104, fill: '#f7faf6', innerFill: '#ffffff', stroke: '#5d7357', accent: '#5d7357', labelChars: 18, lane: 'room' },
  device: { typeLabel: 'CTRL', glyph: 'device', width: 150, height: 96, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#5f7080', accent: '#5f7080', labelChars: 18, lane: 'fixture' },
};

const LIGHTING_MEDIA: Record<string, LaneMediumSpec> = {
  ethernet: { key: 'ethernet', label: 'IP', stroke: '#566c8b', accent: '#e6edf5', width: 4.2, style: 'band' },
  dali: { key: 'dali', label: 'DALI', stroke: '#6e5c84', accent: '#eee8f5', width: 3.3, style: 'line' },
  analog_010v: { key: 'analog_010v', label: '0-10V', stroke: '#a07831', accent: '#f7ecd8', width: 2.8, dasharray: '8 5', style: 'line' },
  relay: { key: 'relay', label: 'RELAY', stroke: '#7d734b', accent: '#f1ede0', width: 2.8, style: 'line' },
  sensor_bus: { key: 'sensor_bus', label: 'SENSOR', stroke: '#5d7357', accent: '#e8efe5', width: 2.4, dasharray: '8 4', style: 'signal' },
  exterior: { key: 'exterior', label: 'SITE', stroke: '#5c7b79', accent: '#e4efee', width: 3.0, dasharray: '10 5', style: 'line' },
  emergency: { key: 'emergency', label: 'EM SENSE', stroke: '#995c40', accent: '#f4e6de', width: 2.6, dasharray: '10 4 2 4', style: 'signal' },
  generic: { key: 'generic', label: 'CTRL', stroke: '#5f7080', accent: '#edf1f4', width: 2.8, style: 'line' },
};

function renderSensorDisc(cx: number, cy: number, stroke: string, accent: string, ring = false): string {
  return `<circle cx="${cx}" cy="${cy}" r="15" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
    ${ring ? `<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${accent}" stroke-width="1.2"/>` : ''}`;
}

function renderLightingGlyph(node: LaneNodeVisual, x: number, y: number, width: number, height: number): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = node.spec.stroke;
  const accent = node.spec.accent;
  const fill = node.spec.innerFill;

  switch (node.glyph) {
    case 'headend_server':
      return `<rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 30}" y="${y + 28}" width="${width - 60}" height="16" rx="5" fill="#eef3f6" stroke="#ccd6dc" stroke-width="0.8"/>
        <rect x="${x + 30}" y="${cy - 4}" width="${width - 60}" height="16" rx="5" fill="#eef3f6" stroke="#ccd6dc" stroke-width="0.8"/>
        <path d="M ${x + 44} ${y + height - 30} H ${x + width - 44}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    case 'lighting_gateway':
    case 'backbone_switch':
    case 'area_controller':
    case 'room_controller':
      return `<rect x="${x + 20}" y="${y + 20}" width="${width - 40}" height="${height - 40}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 30}" y="${y + 30}" width="${width - 60}" height="18" rx="6" fill="#eef3f6" stroke="#ccd6dc" stroke-width="0.8"/>
        <path d="M ${x + 38} ${cy + 8} H ${x + width - 38}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        ${Array.from({ length: 4 }, (_, index) => {
          const portX = x + 42 + index * ((width - 84) / 3);
          return `<circle cx="${portX}" cy="${cy + 20}" r="2.3" fill="${accent}"/>`;
        }).join('')}`;
    case 'relay_panel':
      return `<rect x="${x + 20}" y="${y + 16}" width="${width - 40}" height="${height - 32}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 38} ${y + 34} H ${x + width - 38} M ${x + 38} ${cy - 2} H ${x + width - 38} M ${x + 38} ${y + height - 34} H ${x + width - 52}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        ${Array.from({ length: 4 }, (_, index) => `<rect x="${x + 42 + index * 24}" y="${cy + 12}" width="14" height="8" rx="2" fill="#ffffff" stroke="${accent}" stroke-width="1"/>`).join('')}`;
    case 'dimming_panel':
      return `<rect x="${x + 20}" y="${y + 16}" width="${width - 40}" height="${height - 32}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 38} ${cy - 4} C ${x + 50} ${cy - 18}, ${x + 62} ${cy + 12}, ${x + 74} ${cy - 4} S ${x + 98} ${cy - 18}, ${x + 110} ${cy - 4} S ${x + 134} ${cy + 12}, ${x + 146} ${cy - 4}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'wallstation':
    case 'scene_station':
      return `<rect x="${cx - 18}" y="${cy - 26}" width="36" height="52" rx="9" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="${cx}" cy="${cy - 8}" r="5" fill="#ffffff" stroke="${accent}" stroke-width="1.2"/>
        <circle cx="${cx}" cy="${cy + 8}" r="5" fill="#ffffff" stroke="${accent}" stroke-width="1.2"/>
        ${node.glyph === 'scene_station' ? `<path d="M ${cx - 8} ${cy + 20} H ${cx + 8}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>` : ''}`;
    case 'occupancy_sensor':
      return `${renderSensorDisc(cx, cy, stroke, accent, true)}
        <path d="M ${cx - 8} ${cy + 6} Q ${cx} ${cy - 4} ${cx + 8} ${cy + 6}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    case 'daylight_sensor':
      return `${renderSensorDisc(cx, cy, stroke, accent)}
        <path d="M ${cx} ${cy - 24} V ${cy - 18} M ${cx} ${cy + 18} V ${cy + 24} M ${cx - 20} ${cy} H ${cx - 14} M ${cx + 14} ${cy} H ${cx + 20}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="6" fill="#fff8d0" stroke="${accent}" stroke-width="1.1"/>`;
    case 'photocell':
      return `${renderSensorDisc(cx, cy, stroke, accent)}
        <path d="M ${cx} ${cy - 24} V ${cy - 18} M ${cx - 18} ${cy - 18} L ${cx - 14} ${cy - 14} M ${cx + 18} ${cy - 18} L ${cx + 14} ${cy - 14}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M ${cx - 8} ${cy + 8} H ${cx + 8}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>`;
    case 'fixture_group':
      return `<path d="M ${cx} ${y + 22} V ${cy - 8}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 28} ${cy - 8} H ${cx + 28} L ${cx + 18} ${cy + 18} H ${cx - 18} Z" fill="#fffef6" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M ${cx - 14} ${cy + 26} H ${cx + 14}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    case 'emergency_interface':
      return `<rect x="${x + 22}" y="${y + 22}" width="${width - 44}" height="${height - 44}" rx="12" fill="#ffffff" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx} ${y + 30} C ${cx + 10} ${y + 22}, ${cx + 12} ${y + 40}, ${cx} ${y + 44} C ${cx - 12} ${y + 40}, ${cx - 10} ${y + 22}, ${cx} ${y + 30}" fill="none" stroke="#c85f41" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M ${cx - 18} ${cy + 14} H ${cx + 18}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    case 'shade_controller':
      return `<rect x="${x + 24}" y="${y + 22}" width="${width - 48}" height="${height - 44}" rx="12" fill="#ffffff" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx - 20} ${y + 32} V ${y + height - 30} M ${cx} ${y + 32} V ${y + height - 30} M ${cx + 20} ${y + 32} V ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M ${cx - 26} ${y + height - 22} H ${cx + 26}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>`;
    case 'device':
    default:
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 30} L ${x + width - 34} ${y + height - 30} M ${x + width - 34} ${y + 30} L ${x + 34} ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}">?</text>`;
  }
}

const lightingRenderer = createLaneRenderer({
  laneSpecs: [...LIGHTING_LANES],
  symbolAliases: LIGHTING_SYMBOL_ALIASES,
  symbolLibrary: LIGHTING_SYMBOLS,
  mediaLibrary: LIGHTING_MEDIA,
  defaultMedium: 'generic',
  legendTitle: 'CONTROL LEGEND',
  subtitle: 'Lighting control schematic with enterprise head-end, gateways, relay and dimming panels, room controls, sensors, fixture groups, and emergency interfaces',
  inferSymbol(node, normalizeSymbol) {
    if (node.symbol) return normalizeSymbol(node.symbol);
    const probe = `${node.id} ${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('server') || probe.includes('head-end') || probe.includes('enterprise')) return 'headend_server';
    if (probe.includes('gateway')) return 'lighting_gateway';
    if (probe.includes('ethernet switch') || probe.includes('backbone switch')) return 'backbone_switch';
    if (probe.includes('area controller') || probe.includes('floor controller')) return 'area_controller';
    if (probe.includes('relay panel') || probe.includes('relay cabinet')) return 'relay_panel';
    if (probe.includes('dimming panel') || probe.includes('dimmer cabinet')) return 'dimming_panel';
    if (probe.includes('room controller')) return 'room_controller';
    if (probe.includes('wallstation') || probe.includes('keypad')) return 'wallstation';
    if (probe.includes('scene station')) return 'scene_station';
    if (probe.includes('occupancy')) return 'occupancy_sensor';
    if (probe.includes('daylight')) return 'daylight_sensor';
    if (probe.includes('photocell')) return 'photocell';
    if (probe.includes('fixture') || probe.includes('luminaires') || probe.includes('troffer') || probe.includes('downlight')) return 'fixture_group';
    if (probe.includes('emergency')) return 'emergency_interface';
    if (probe.includes('shade')) return 'shade_controller';
    return 'device';
  },
  inferLane(node, symbol) {
    const probe = `${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('head-end') || probe.includes('enterprise') || probe.includes('server')) return 'headend';
    if (probe.includes('gateway') || probe.includes('switch') || probe.includes('bacnet') || symbol === 'lighting_gateway' || symbol === 'backbone_switch') return 'backbone';
    if (probe.includes('relay') || probe.includes('dimming') || symbol === 'relay_panel' || symbol === 'dimming_panel') return 'panel';
    if (probe.includes('room') || probe.includes('area') || probe.includes('shade') || symbol === 'room_controller' || symbol === 'area_controller' || symbol === 'shade_controller') return 'room';
    if (probe.includes('sensor') || probe.includes('station') || probe.includes('keypad') || symbol === 'wallstation' || symbol === 'scene_station' || symbol === 'occupancy_sensor' || symbol === 'daylight_sensor') return 'sensor';
    if (probe.includes('site') || probe.includes('exterior') || probe.includes('pole') || symbol === 'photocell') return 'exterior';
    if (probe.includes('emergency') || symbol === 'emergency_interface') return 'emergency';
    if (probe.includes('fixture') || probe.includes('luminaires') || probe.includes('troffer')) return 'fixture';
    return LIGHTING_SYMBOLS[symbol]?.lane ?? 'fixture';
  },
  getMedium(edge, from, to, mediaLibrary) {
    const probe = `${edge.label ?? ''} ${from.label} ${to.label}`.toLowerCase();
    if (probe.includes('ethernet') || probe.includes('bacnet') || probe.includes('ip')) return mediaLibrary.ethernet;
    if (probe.includes('dali')) return mediaLibrary.dali;
    if (probe.includes('0-10v') || probe.includes('analog')) return mediaLibrary.analog_010v;
    if (probe.includes('relay')) return mediaLibrary.relay;
    if (probe.includes('sensor') || probe.includes('station') || probe.includes('shade')) return mediaLibrary.sensor_bus;
    if (probe.includes('site') || probe.includes('photocell') || from.lane === 'exterior' || to.lane === 'exterior') return mediaLibrary.exterior;
    if (probe.includes('emergency')) return mediaLibrary.emergency;
    if (from.lane === 'headend' || from.lane === 'backbone' || to.lane === 'backbone') return mediaLibrary.ethernet;
    if (from.lane === 'panel' || to.lane === 'panel') return mediaLibrary.dali;
    if (to.lane === 'sensor' || from.lane === 'sensor') return mediaLibrary.sensor_bus;
    if (to.lane === 'fixture' || from.lane === 'fixture') return mediaLibrary.analog_010v;
    return mediaLibrary.generic;
  },
  renderGlyph: renderLightingGlyph,
});

export function compileLightingControlDiagram(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
  return lightingRenderer.compile(input, { columnGap: 238 });
}

export function renderLightingControlSvg(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
  return lightingRenderer.render(input, { columnGap: 238 });
}

export class LightingControlJS {
  static parse(source: string): DiagramProgram {
    return parseDiagram(source);
  }

  static compile(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
    return compileLightingControlDiagram(input);
  }

  static render(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
    return renderLightingControlSvg(input);
  }
}
