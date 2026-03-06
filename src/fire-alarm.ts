import { parseDiagram } from './diagjs';
import { createLaneRenderer } from './lane-renderer';
import type { DiagramInput, DiagramNode, DiagramProgram, LaneDiagramLayout, LaneMediumSpec, LaneNodeVisual, LaneSymbolSpec } from './lane-renderer';

const FIRE_LANES = [
  { id: 'command', label: 'Head-End / Command', order: 0, tint: 'rgba(154, 66, 46, 0.10)', stroke: '#944b37' },
  { id: 'network', label: 'Campus Fire Network', order: 1, tint: 'rgba(110, 74, 56, 0.10)', stroke: '#7f563f' },
  { id: 'panels', label: 'Distributed Panels', order: 2, tint: 'rgba(126, 84, 56, 0.09)', stroke: '#8b6243' },
  { id: 'annunciation', label: 'Annunciation / Repeater', order: 3, tint: 'rgba(92, 101, 117, 0.09)', stroke: '#5f6878' },
  { id: 'slc', label: 'SLC Device Loops', order: 4, tint: 'rgba(124, 89, 62, 0.08)', stroke: '#896247' },
  { id: 'notification', label: 'Notification / Audio', order: 5, tint: 'rgba(159, 92, 61, 0.09)', stroke: '#9b5d3f' },
  { id: 'specialty', label: 'Interfaces / Releasing', order: 6, tint: 'rgba(102, 111, 84, 0.10)', stroke: '#667150' },
  { id: 'field', label: 'Field Devices / Inputs', order: 7, tint: 'rgba(114, 118, 124, 0.08)', stroke: '#70767b' },
] as const;

const FIRE_SYMBOL_ALIASES: Record<string, string> = {
  command_center: 'headend',
  head_node: 'headend',
  head_end: 'headend',
  graphics_workstation: 'headend',
  network_node: 'distributed_node',
  node: 'distributed_node',
  fire_node: 'distributed_node',
  facp: 'fire_panel',
  panel: 'fire_panel',
  fire_panel: 'fire_panel',
  remote_annunciator: 'annunciator',
  ann: 'annunciator',
  repeater_panel: 'repeater',
  repeater: 'repeater',
  power_supply: 'power_supply',
  nac_extender: 'nac_extender',
  booster: 'nac_extender',
  smoke: 'smoke_detector',
  smoke_detector: 'smoke_detector',
  heat: 'heat_detector',
  heat_detector: 'heat_detector',
  pull: 'pull_station',
  pull_station: 'pull_station',
  horn: 'horn_strobe',
  horn_strobe: 'horn_strobe',
  speaker: 'speaker_strobe',
  speaker_strobe: 'speaker_strobe',
  duct_detector: 'duct_detector',
  monitor: 'monitor_module',
  monitor_module: 'monitor_module',
  control: 'control_module',
  control_module: 'control_module',
  flow: 'flow_switch',
  flow_switch: 'flow_switch',
  tamper: 'tamper_switch',
  tamper_switch: 'tamper_switch',
  beam: 'beam_detector',
  beam_detector: 'beam_detector',
  air_sampling: 'aspirating_detector',
  vesda: 'aspirating_detector',
  aspirating_detector: 'aspirating_detector',
  releasing: 'releasing_panel',
  releasing_panel: 'releasing_panel',
  elevator_interface: 'elevator_interface',
  smoke_control: 'smoke_control',
  firefighter_telephone: 'telephone_master',
  phone_master: 'telephone_master',
};

const FIRE_SYMBOLS: Record<string, LaneSymbolSpec> = {
  headend: { typeLabel: 'FCC', glyph: 'headend', width: 210, height: 120, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#944b37', accent: '#944b37', labelChars: 20, lane: 'command' },
  distributed_node: { typeLabel: 'NODE', glyph: 'distributed_node', width: 184, height: 108, fill: '#fbf7f3', innerFill: '#ffffff', stroke: '#8b6243', accent: '#8b6243', labelChars: 18, lane: 'network' },
  fire_panel: { typeLabel: 'FACP', glyph: 'fire_panel', width: 196, height: 116, fill: '#fbf7f3', innerFill: '#ffffff', stroke: '#8f6647', accent: '#8f6647', labelChars: 18, lane: 'panels' },
  annunciator: { typeLabel: 'ANN', glyph: 'annunciator', width: 172, height: 104, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'annunciation' },
  repeater: { typeLabel: 'RPT', glyph: 'repeater', width: 172, height: 104, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'annunciation' },
  power_supply: { typeLabel: 'PSU', glyph: 'power_supply', width: 176, height: 106, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#6a7480', accent: '#6a7480', labelChars: 18, lane: 'panels' },
  nac_extender: { typeLabel: 'NAC', glyph: 'nac_extender', width: 176, height: 106, fill: '#fbf7f3', innerFill: '#ffffff', stroke: '#8f6647', accent: '#8f6647', labelChars: 18, lane: 'notification' },
  smoke_detector: { typeLabel: 'SMK', glyph: 'smoke_detector', width: 148, height: 94, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#70767b', accent: '#70767b', labelChars: 18, lane: 'field' },
  heat_detector: { typeLabel: 'HEAT', glyph: 'heat_detector', width: 148, height: 94, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#7e6a50', accent: '#7e6a50', labelChars: 18, lane: 'field' },
  pull_station: { typeLabel: 'PULL', glyph: 'pull_station', width: 150, height: 98, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#944b37', accent: '#944b37', labelChars: 18, lane: 'field' },
  horn_strobe: { typeLabel: 'H/S', glyph: 'horn_strobe', width: 150, height: 98, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#9b5d3f', accent: '#9b5d3f', labelChars: 18, lane: 'notification' },
  speaker_strobe: { typeLabel: 'SPKR', glyph: 'speaker_strobe', width: 156, height: 98, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#9b5d3f', accent: '#9b5d3f', labelChars: 18, lane: 'notification' },
  duct_detector: { typeLabel: 'DUCT', glyph: 'duct_detector', width: 166, height: 100, fill: '#f8fafb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'slc' },
  monitor_module: { typeLabel: 'MON', glyph: 'monitor_module', width: 156, height: 98, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'slc' },
  control_module: { typeLabel: 'CTL', glyph: 'control_module', width: 156, height: 98, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'specialty' },
  flow_switch: { typeLabel: 'FLOW', glyph: 'flow_switch', width: 154, height: 96, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#70767b', accent: '#70767b', labelChars: 18, lane: 'field' },
  tamper_switch: { typeLabel: 'TMP', glyph: 'tamper_switch', width: 154, height: 96, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#70767b', accent: '#70767b', labelChars: 18, lane: 'field' },
  beam_detector: { typeLabel: 'BEAM', glyph: 'beam_detector', width: 162, height: 98, fill: '#fbfbfa', innerFill: '#ffffff', stroke: '#70767b', accent: '#70767b', labelChars: 18, lane: 'field' },
  aspirating_detector: { typeLabel: 'ASD', glyph: 'aspirating_detector', width: 168, height: 102, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#667150', accent: '#667150', labelChars: 18, lane: 'specialty' },
  releasing_panel: { typeLabel: 'REL', glyph: 'releasing_panel', width: 182, height: 108, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#667150', accent: '#667150', labelChars: 18, lane: 'specialty' },
  smoke_control: { typeLabel: 'SMK', glyph: 'smoke_control', width: 184, height: 108, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#667150', accent: '#667150', labelChars: 18, lane: 'specialty' },
  elevator_interface: { typeLabel: 'ELEV', glyph: 'elevator_interface', width: 176, height: 106, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#667150', accent: '#667150', labelChars: 18, lane: 'specialty' },
  telephone_master: { typeLabel: 'TEL', glyph: 'telephone_master', width: 168, height: 102, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'annunciation' },
  device: { typeLabel: 'FA', glyph: 'device', width: 150, height: 96, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#65707d', accent: '#65707d', labelChars: 18, lane: 'field' },
};

const FIRE_MEDIA: Record<string, LaneMediumSpec> = {
  peer_ring: { key: 'peer_ring', label: 'NODE RING', stroke: '#7f563f', accent: '#f0e5df', width: 4.8, dasharray: '12 6', style: 'band' },
  network: { key: 'network', label: 'NETWORK', stroke: '#8b6243', accent: '#f3e9e1', width: 4.2, style: 'line' },
  slc: { key: 'slc', label: 'SLC', stroke: '#896247', accent: '#f3e9e1', width: 3.2, style: 'line' },
  nac: { key: 'nac', label: 'NAC', stroke: '#9b5d3f', accent: '#f5e5de', width: 3.4, style: 'line' },
  speaker: { key: 'speaker', label: 'AUDIO', stroke: '#b16344', accent: '#f7e8df', width: 3.0, dasharray: '8 5', style: 'line' },
  monitor: { key: 'monitor', label: 'MON', stroke: '#65707d', accent: '#edf1f4', width: 2.6, dasharray: '8 4', style: 'signal' },
  releasing: { key: 'releasing', label: 'REL', stroke: '#667150', accent: '#edf1e6', width: 2.8, dasharray: '10 4 2 4', style: 'signal' },
  generic: { key: 'generic', label: 'LINK', stroke: '#65707d', accent: '#edf1f4', width: 2.8, style: 'line' },
};

function renderDetector(cx: number, cy: number, r: number, stroke: string, accent: string, mark: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="#d1d9de" stroke-width="1"/>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10" font-weight="700" fill="${accent}">${mark}</text>`;
}

function renderFireGlyph(node: LaneNodeVisual, x: number, y: number, width: number, height: number): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = node.spec.stroke;
  const accent = node.spec.accent;
  const fill = node.spec.innerFill;

  switch (node.glyph) {
    case 'headend':
      return `<rect x="${x + 18}" y="${y + 16}" width="${width - 36}" height="${height - 32}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 30}" y="${y + 28}" width="${width - 60}" height="${height - 64}" rx="8" fill="#ffffff" stroke="#d4dde2" stroke-width="1"/>
        <path d="M ${x + 42} ${cy - 8} H ${x + width - 42} M ${x + 42} ${cy + 6} H ${x + width - 56}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${x + 48}" cy="${cy - 18}" r="3" fill="#c85f41"/>
        <circle cx="${x + 62}" cy="${cy - 18}" r="3" fill="#d1a24a"/>
        <circle cx="${x + 76}" cy="${cy - 18}" r="3" fill="#7da35d"/>`;
    case 'distributed_node':
      return `<path d="M ${cx} ${y + 16} L ${x + width - 26} ${cy - 8} V ${cy + 18} L ${cx} ${y + height - 16} L ${x + 26} ${cy + 18} V ${cy - 8} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M ${x + 38} ${cy} H ${x + width - 38} M ${cx} ${y + 28} V ${y + height - 28}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${accent}"/>`;
    case 'fire_panel':
    case 'nac_extender':
    case 'power_supply':
    case 'releasing_panel':
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 34}" y="${y + 30}" width="${width - 68}" height="${height - 72}" rx="8" fill="#ffffff" stroke="#d2dbe0" stroke-width="1"/>
        <path d="M ${x + 42} ${cy} H ${x + width - 42}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${x + 48}" cy="${cy - 14}" r="3" fill="#c85f41"/>
        <circle cx="${x + 62}" cy="${cy - 14}" r="3" fill="#d1a24a"/>
        <circle cx="${x + 76}" cy="${cy - 14}" r="3" fill="#7da35d"/>`;
    case 'annunciator':
    case 'repeater':
    case 'telephone_master':
      return `<rect x="${x + 20}" y="${y + 20}" width="${width - 40}" height="${height - 40}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 30}" y="${y + 30}" width="${width - 60}" height="22" rx="6" fill="#eef3f6" stroke="#cdd7dd" stroke-width="0.8"/>
        <path d="M ${x + 38} ${cy + 4} H ${x + width - 38}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${x + width - 54} ${cy - 16} L ${x + width - 40} ${cy - 2} L ${x + width - 54} ${cy + 12}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>`;
    case 'smoke_detector':
      return renderDetector(cx, cy, Math.min(width, height) * 0.22, stroke, accent, 'S');
    case 'heat_detector':
      return `${renderDetector(cx, cy, Math.min(width, height) * 0.22, stroke, accent, 'H')}
        <path d="M ${cx} ${cy - 24} C ${cx + 8} ${cy - 30}, ${cx + 10} ${cy - 14}, ${cx} ${cy - 10} C ${cx - 10} ${cy - 14}, ${cx - 8} ${cy - 30}, ${cx} ${cy - 24}" fill="none" stroke="#b87a37" stroke-width="1.4" stroke-linejoin="round"/>`;
    case 'pull_station':
      return `<rect x="${cx - 18}" y="${cy - 26}" width="36" height="52" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 10} ${cy - 6} H ${cx + 10} M ${cx - 8} ${cy + 8} H ${cx + 8}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${cx - 10} ${cy + 14} L ${cx} ${cy + 24} L ${cx + 10} ${cy + 14}" fill="none" stroke="#c85f41" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'horn_strobe':
      return `<rect x="${cx - 18}" y="${cy - 18}" width="36" height="36" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx - 10} ${cy + 4} L ${cx - 2} ${cy - 4} H ${cx + 8} V ${cy + 12} H ${cx - 2} Z" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M ${cx + 12} ${cy - 14} H ${cx + 20} M ${cx + 12} ${cy + 14} H ${cx + 20}" fill="none" stroke="#c85f41" stroke-width="1.3" stroke-linecap="round"/>`;
    case 'speaker_strobe':
      return `<circle cx="${cx - 6}" cy="${cy}" r="12" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - 6} ${cy - 6} V ${cy + 6} M ${cx - 12} ${cy} H ${cx} M ${cx + 12} ${cy - 14} H ${cx + 20} M ${cx + 12} ${cy + 14} H ${cx + 20}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    case 'duct_detector':
      return `<rect x="${x + 18}" y="${cy - 12}" width="${width - 36}" height="24" rx="10" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="${cx - 12}" cy="${cy}" r="7" fill="#ffffff" stroke="${accent}" stroke-width="1.3"/>
        <path d="M ${cx + 6} ${cy - 10} H ${cx + 22} M ${cx + 6} ${cy} H ${cx + 16} M ${cx + 6} ${cy + 10} H ${cx + 22}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>`;
    case 'monitor_module':
    case 'control_module':
      return `<rect x="${cx - 18}" y="${cy - 16}" width="36" height="32" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - 10} ${cy} H ${cx + 10}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="${accent}"/>`;
    case 'flow_switch':
      return `<path d="M ${cx - 26} ${cy} H ${cx - 6} M ${cx + 6} ${cy} H ${cx + 26}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 6} ${cy - 12} L ${cx + 6} ${cy} L ${cx - 6} ${cy + 12} Z" fill="#ffffff" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round"/>`;
    case 'tamper_switch':
      return `<circle cx="${cx}" cy="${cy}" r="14" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - 10} ${cy - 10} L ${cx + 10} ${cy + 10} M ${cx + 10} ${cy - 10} L ${cx - 10} ${cy + 10}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'beam_detector':
      return `<rect x="${cx - 28}" y="${cy - 8}" width="16" height="16" rx="4" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <rect x="${cx + 12}" y="${cy - 8}" width="16" height="16" rx="4" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - 12} ${cy} H ${cx + 12}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    case 'aspirating_detector':
      return `<rect x="${x + 22}" y="${y + 20}" width="${width - 44}" height="${height - 40}" rx="12" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${x + 36} ${cy - 12} H ${x + width - 36} M ${x + 36} ${cy} H ${x + width - 48} M ${x + 36} ${cy + 12} H ${x + width - 42}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="${x + width - 36}" cy="${cy - 12}" r="2.5" fill="${accent}"/>`;
    case 'smoke_control':
      return `<rect x="${x + 20}" y="${y + 20}" width="${width - 40}" height="${height - 40}" rx="12" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx - 14} ${cy - 18} H ${cx + 14} M ${cx - 18} ${cy - 6} H ${cx + 18} M ${cx - 14} ${cy + 6} H ${cx + 14}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M ${cx - 12} ${cy + 18} L ${cx} ${cy + 30} L ${cx + 12} ${cy + 18}" fill="none" stroke="#7ea865" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'elevator_interface':
      return `<rect x="${cx - 18}" y="${cy - 24}" width="36" height="48" rx="10" fill="#ffffff" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M ${cx} ${cy - 14} L ${cx - 7} ${cy - 4} H ${cx + 7} Z M ${cx} ${cy + 14} L ${cx - 7} ${cy + 4} H ${cx + 7} Z" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round"/>`;
    case 'device':
    default:
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 30} L ${x + width - 34} ${y + height - 30} M ${x + width - 34} ${y + 30} L ${x + 34} ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}">?</text>`;
  }
}

const fireRenderer = createLaneRenderer({
  laneSpecs: [...FIRE_LANES],
  symbolAliases: FIRE_SYMBOL_ALIASES,
  symbolLibrary: FIRE_SYMBOLS,
  mediaLibrary: FIRE_MEDIA,
  defaultMedium: 'generic',
  legendTitle: 'CIRCUIT LEGEND',
  subtitle: 'Campus fire alarm schematic with command head-end, distributed network nodes, FACPs, annunciation, loop devices, notification, and releasing interfaces',
  inferSymbol(node, normalizeSymbol) {
    if (node.symbol) return normalizeSymbol(node.symbol);
    const probe = `${node.id} ${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('head end') || probe.includes('command center') || probe.includes('graphics')) return 'headend';
    if (probe.includes('network node') || probe.includes('distributed node')) return 'distributed_node';
    if (probe.includes('facp') || probe.includes('fire alarm control panel')) return 'fire_panel';
    if (probe.includes('annunciator')) return 'annunciator';
    if (probe.includes('repeater')) return 'repeater';
    if (probe.includes('booster') || probe.includes('nac extender')) return 'nac_extender';
    if (probe.includes('power supply')) return 'power_supply';
    if (probe.includes('smoke detector')) return 'smoke_detector';
    if (probe.includes('heat detector')) return 'heat_detector';
    if (probe.includes('pull station')) return 'pull_station';
    if (probe.includes('horn/strobe') || probe.includes('horn strobe')) return 'horn_strobe';
    if (probe.includes('speaker/strobe') || probe.includes('speaker strobe')) return 'speaker_strobe';
    if (probe.includes('duct detector')) return 'duct_detector';
    if (probe.includes('monitor module')) return 'monitor_module';
    if (probe.includes('control module')) return 'control_module';
    if (probe.includes('flow switch')) return 'flow_switch';
    if (probe.includes('tamper')) return 'tamper_switch';
    if (probe.includes('beam detector')) return 'beam_detector';
    if (probe.includes('vesda') || probe.includes('aspirating')) return 'aspirating_detector';
    if (probe.includes('releasing')) return 'releasing_panel';
    if (probe.includes('smoke control')) return 'smoke_control';
    if (probe.includes('elevator')) return 'elevator_interface';
    if (probe.includes('telephone')) return 'telephone_master';
    return 'device';
  },
  inferLane(node, symbol) {
    const probe = `${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('head') || probe.includes('command') || probe.includes('graphics')) return 'command';
    if (probe.includes('network node') || probe.includes('fiber ring') || probe.includes('campus')) return 'network';
    if (probe.includes('annunciator') || probe.includes('repeater') || probe.includes('telephone') || symbol === 'annunciator' || symbol === 'repeater' || symbol === 'telephone_master') return 'annunciation';
    if (probe.includes('speaker') || probe.includes('horn') || probe.includes('strobe') || symbol === 'horn_strobe' || symbol === 'speaker_strobe' || symbol === 'nac_extender') return 'notification';
    if (probe.includes('releasing') || probe.includes('smoke control') || probe.includes('elevator') || probe.includes('vesda') || symbol === 'releasing_panel' || symbol === 'smoke_control' || symbol === 'elevator_interface' || symbol === 'aspirating_detector' || symbol === 'control_module') return 'specialty';
    if (probe.includes('detector') || probe.includes('pull') || probe.includes('flow') || probe.includes('tamper')) return 'field';
    if (symbol === 'fire_panel' || symbol === 'power_supply') return 'panels';
    if (symbol === 'monitor_module' || symbol === 'duct_detector') return 'slc';
    return FIRE_SYMBOLS[symbol]?.lane ?? 'field';
  },
  getMedium(edge, from, to, mediaLibrary) {
    const probe = `${edge.label ?? ''} ${from.label} ${to.label}`.toLowerCase();
    if (probe.includes('ring') || probe.includes('peer') || probe.includes('fiber')) return mediaLibrary.peer_ring;
    if (probe.includes('network')) return mediaLibrary.network;
    if (probe.includes('slc')) return mediaLibrary.slc;
    if (probe.includes('nac')) return mediaLibrary.nac;
    if (probe.includes('audio') || probe.includes('speaker')) return mediaLibrary.speaker;
    if (probe.includes('monitor') || probe.includes('supervisory')) return mediaLibrary.monitor;
    if (probe.includes('release') || probe.includes('smoke control') || probe.includes('elevator recall')) return mediaLibrary.releasing;
    if (from.lane === 'network' || to.lane === 'network') return mediaLibrary.network;
    if (from.lane === 'notification' || to.lane === 'notification') return mediaLibrary.nac;
    if (from.lane === 'specialty' || to.lane === 'specialty') return mediaLibrary.releasing;
    if (from.lane === 'slc' || to.lane === 'slc' || to.lane === 'field') return mediaLibrary.slc;
    return mediaLibrary.generic;
  },
  renderGlyph: renderFireGlyph,
});

export function compileFireAlarmDiagram(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
  return fireRenderer.compile(input, { columnGap: 238 });
}

export function renderFireAlarmSvg(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
  return fireRenderer.render(input, { columnGap: 238 });
}

export class FireAlarmJS {
  static parse(source: string): DiagramProgram {
    return parseDiagram(source);
  }

  static compile(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
    return compileFireAlarmDiagram(input);
  }

  static render(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
    return renderFireAlarmSvg(input);
  }
}
