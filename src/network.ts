import { parseDiagram } from './diagjs';
import { createLaneRenderer } from './lane-renderer';
import type { DiagramInput, DiagramNode, DiagramProgram, LaneDiagramLayout, LaneMediumSpec, LaneNodeVisual, LaneSymbolSpec } from './lane-renderer';

const NETWORK_LANES = [
  { id: 'external', label: 'External / Carrier', order: 0, tint: 'rgba(98, 128, 158, 0.10)', stroke: '#5e7894' },
  { id: 'campus', label: 'Campus Backbone', order: 1, tint: 'rgba(71, 120, 116, 0.10)', stroke: '#48766f' },
  { id: 'core', label: 'Core / Border', order: 2, tint: 'rgba(72, 97, 132, 0.10)', stroke: '#47648c' },
  { id: 'services', label: 'Shared Services', order: 3, tint: 'rgba(105, 96, 140, 0.10)', stroke: '#665d90' },
  { id: 'fabric', label: 'Compute Fabric', order: 4, tint: 'rgba(81, 115, 146, 0.09)', stroke: '#55718d' },
  { id: 'storage', label: 'Storage / Backup', order: 5, tint: 'rgba(84, 124, 110, 0.10)', stroke: '#567c6e' },
  { id: 'building', label: 'Building / Tenant Edge', order: 6, tint: 'rgba(126, 110, 82, 0.10)', stroke: '#7b694b' },
  { id: 'edge', label: 'User / OT Edge', order: 7, tint: 'rgba(112, 118, 124, 0.08)', stroke: '#6e767d' },
] as const;

const NETWORK_SYMBOL_ALIASES: Record<string, string> = {
  cloud: 'carrier_cloud',
  isp: 'carrier_cloud',
  internet: 'carrier_cloud',
  carrier: 'carrier_cloud',
  carrier_cloud: 'carrier_cloud',
  border_router: 'wan_router',
  wan: 'wan_router',
  edge_router: 'wan_router',
  router: 'wan_router',
  core_router: 'core_switch',
  core: 'core_switch',
  agg_switch: 'core_switch',
  aggregation_switch: 'core_switch',
  spine: 'spine_switch',
  leaf: 'leaf_switch',
  firewall_cluster: 'firewall',
  fw: 'firewall',
  adc: 'load_balancer',
  lb: 'load_balancer',
  dns: 'service_cluster',
  dhcp: 'service_cluster',
  ntp: 'service_cluster',
  auth: 'service_cluster',
  virtualization: 'virtualization_cluster',
  vmware: 'virtualization_cluster',
  compute_cluster: 'virtualization_cluster',
  hypervisor_cluster: 'virtualization_cluster',
  gpu: 'gpu_cluster',
  ai_cluster: 'gpu_cluster',
  san: 'san_switch',
  fibre_channel: 'san_switch',
  storage: 'storage_array',
  backup: 'backup_appliance',
  oob: 'mgmt_switch',
  management_switch: 'mgmt_switch',
  idf: 'idf_switch',
  access_switch: 'access_stack',
  access_layer: 'access_stack',
  wlc: 'wireless_controller',
  building_edge: 'building_gateway',
  gateway: 'building_gateway',
  security: 'security_cluster',
};

const NETWORK_SYMBOLS: Record<string, LaneSymbolSpec> = {
  carrier_cloud: { typeLabel: 'WAN', glyph: 'carrier_cloud', width: 188, height: 108, fill: '#f5f9fc', innerFill: '#ffffff', stroke: '#5d7a96', accent: '#5d7a96', labelChars: 20, lane: 'external' },
  wan_router: { typeLabel: 'RTR', glyph: 'wan_router', width: 168, height: 104, fill: '#f5f9fc', innerFill: '#ffffff', stroke: '#55718d', accent: '#55718d', labelChars: 18, lane: 'core' },
  core_switch: { typeLabel: 'CORE', glyph: 'core_switch', width: 182, height: 108, fill: '#f4f8fc', innerFill: '#ffffff', stroke: '#48658a', accent: '#48658a', labelChars: 18, lane: 'core' },
  spine_switch: { typeLabel: 'SPINE', glyph: 'spine_switch', width: 170, height: 102, fill: '#f4f8fc', innerFill: '#ffffff', stroke: '#4f6b8f', accent: '#4f6b8f', labelChars: 18, lane: 'fabric' },
  leaf_switch: { typeLabel: 'LEAF', glyph: 'leaf_switch', width: 170, height: 102, fill: '#f4f8fc', innerFill: '#ffffff', stroke: '#55718d', accent: '#55718d', labelChars: 18, lane: 'fabric' },
  firewall: { typeLabel: 'FW', glyph: 'firewall', width: 176, height: 108, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#915239', accent: '#915239', labelChars: 18, lane: 'services' },
  load_balancer: { typeLabel: 'ADC', glyph: 'load_balancer', width: 176, height: 108, fill: '#f7f6fb', innerFill: '#ffffff', stroke: '#6b5b91', accent: '#6b5b91', labelChars: 18, lane: 'services' },
  service_cluster: { typeLabel: 'SVC', glyph: 'service_cluster', width: 188, height: 112, fill: '#f7f6fb', innerFill: '#ffffff', stroke: '#665d90', accent: '#665d90', labelChars: 20, lane: 'services' },
  virtualization_cluster: { typeLabel: 'VM', glyph: 'virtualization_cluster', width: 204, height: 118, fill: '#f6f9fc', innerFill: '#ffffff', stroke: '#55718d', accent: '#55718d', labelChars: 20, lane: 'fabric' },
  gpu_cluster: { typeLabel: 'GPU', glyph: 'gpu_cluster', width: 204, height: 118, fill: '#f6faf8', innerFill: '#ffffff', stroke: '#5b7d67', accent: '#5b7d67', labelChars: 20, lane: 'fabric' },
  san_switch: { typeLabel: 'SAN', glyph: 'san_switch', width: 170, height: 102, fill: '#f5faf8', innerFill: '#ffffff', stroke: '#567c6e', accent: '#567c6e', labelChars: 18, lane: 'storage' },
  storage_array: { typeLabel: 'STOR', glyph: 'storage_array', width: 194, height: 114, fill: '#f5faf8', innerFill: '#ffffff', stroke: '#5d7f72', accent: '#5d7f72', labelChars: 20, lane: 'storage' },
  backup_appliance: { typeLabel: 'BKP', glyph: 'backup_appliance', width: 184, height: 110, fill: '#f8faf7', innerFill: '#ffffff', stroke: '#667752', accent: '#667752', labelChars: 18, lane: 'storage' },
  mgmt_switch: { typeLabel: 'OOB', glyph: 'mgmt_switch', width: 168, height: 100, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#657381', accent: '#657381', labelChars: 18, lane: 'services' },
  building_gateway: { typeLabel: 'BLDG', glyph: 'building_gateway', width: 180, height: 112, fill: '#fbf8f3', innerFill: '#ffffff', stroke: '#7b694b', accent: '#7b694b', labelChars: 18, lane: 'building' },
  idf_switch: { typeLabel: 'IDF', glyph: 'idf_switch', width: 166, height: 100, fill: '#fbf8f3', innerFill: '#ffffff', stroke: '#7c6a4d', accent: '#7c6a4d', labelChars: 18, lane: 'building' },
  access_stack: { typeLabel: 'ACC', glyph: 'access_stack', width: 178, height: 106, fill: '#faf8f2', innerFill: '#ffffff', stroke: '#7a694d', accent: '#7a694d', labelChars: 18, lane: 'edge' },
  wireless_controller: { typeLabel: 'WLC', glyph: 'wireless_controller', width: 176, height: 106, fill: '#f7f6fb', innerFill: '#ffffff', stroke: '#665d90', accent: '#665d90', labelChars: 18, lane: 'building' },
  security_cluster: { typeLabel: 'SEC', glyph: 'security_cluster', width: 190, height: 112, fill: '#fbf6f3', innerFill: '#ffffff', stroke: '#875845', accent: '#875845', labelChars: 18, lane: 'services' },
  device: { typeLabel: 'NET', glyph: 'device', width: 160, height: 98, fill: '#f7f9fb', innerFill: '#ffffff', stroke: '#5f7080', accent: '#5f7080', labelChars: 18, lane: 'edge' },
};

const NETWORK_MEDIA: Record<string, LaneMediumSpec> = {
  internet: { key: 'internet', label: 'INTERNET', stroke: '#5d7a96', accent: '#e4edf4', width: 5.4, dasharray: '16 8', style: 'band' },
  backbone_400g: { key: 'backbone_400g', label: '400G', stroke: '#48766f', accent: '#dfede8', width: 5.6, style: 'band' },
  core_100g: { key: 'core_100g', label: '100G', stroke: '#4c688c', accent: '#e3edf5', width: 4.8, style: 'band' },
  fabric_100g: { key: 'fabric_100g', label: '100G FABRIC', stroke: '#55718d', accent: '#e6eef5', width: 4.6, style: 'band' },
  storage_fc: { key: 'storage_fc', label: '32G FC', stroke: '#5b7d67', accent: '#e3efe8', width: 4.2, dasharray: '8 5', style: 'line' },
  storage_eth: { key: 'storage_eth', label: '25G', stroke: '#6a8a7d', accent: '#e8f2ed', width: 3.8, style: 'line' },
  mgmt: { key: 'mgmt', label: 'MGMT', stroke: '#667752', accent: '#edf2e3', width: 2.8, dasharray: '10 5 2 5', style: 'signal' },
  access: { key: 'access', label: '10/25G', stroke: '#7b694b', accent: '#f0eae0', width: 3.6, style: 'line' },
  wifi: { key: 'wifi', label: 'WIFI', stroke: '#6b5b91', accent: '#eee8f7', width: 3.0, dasharray: '6 5', style: 'signal' },
  security: { key: 'security', label: 'SEC', stroke: '#915239', accent: '#f5e6df', width: 3.0, style: 'line' },
  generic: { key: 'generic', label: 'LINK', stroke: '#5f7080', accent: '#edf1f4', width: 3.2, style: 'line' },
};

function renderRackColumns(x: number, y: number, width: number, height: number, stroke: string, accent: string, bays: number): string {
  const bayWidth = (width - 16) / bays;
  return Array.from({ length: bays }, (_, index) => {
    const bayX = x + 8 + bayWidth * index;
    return `<rect x="${bayX}" y="${y + 8}" width="${bayWidth - 6}" height="${height - 16}" rx="5" fill="#ffffff" stroke="#cfd8de" stroke-width="0.9"/>
      <path d="M ${bayX + 6} ${y + 18} H ${bayX + bayWidth - 12} M ${bayX + 6} ${y + 30} H ${bayX + bayWidth - 12} M ${bayX + 6} ${y + 42} H ${bayX + bayWidth - 12}" fill="none" stroke="${accent}" stroke-width="1.1" stroke-linecap="round"/>`;
  }).join('');
}

function renderNetworkGlyph(node: LaneNodeVisual, x: number, y: number, width: number, height: number): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = node.spec.stroke;
  const accent = node.spec.accent;
  const fill = node.spec.innerFill;

  switch (node.glyph) {
    case 'carrier_cloud':
      return `<path d="M ${x + 34} ${cy + 18} H ${x + width - 34} C ${x + width - 16} ${cy + 18}, ${x + width - 12} ${cy - 2}, ${x + width - 28} ${cy - 6} C ${x + width - 20} ${cy - 28}, ${x + width - 46} ${cy - 34}, ${x + width - 58} ${cy - 22} C ${cx + 10} ${cy - 44}, ${cx - 22} ${cy - 38}, ${cx - 28} ${cy - 18} C ${x + 22} ${cy - 18}, ${x + 20} ${cy + 8}, ${x + 34} ${cy + 18} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 18} ${cy + 2} H ${cx + 12} M ${cx + 8} ${cy - 8} L ${cx + 22} ${cy + 2} L ${cx + 8} ${cy + 12}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'wan_router': {
      const r = Math.min(width, height) * 0.2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - r * 1.7} ${cy} H ${cx - r * 0.4} M ${cx + r * 0.4} ${cy} H ${cx + r * 1.7}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx} ${cy - r * 1.5} V ${cy - r * 0.5} M ${cx} ${cy + r * 0.5} V ${cy + r * 1.5}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${cx - 12} ${cy - 10} H ${cx + 12} M ${cx - 12} ${cy + 10} H ${cx + 12}" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    case 'core_switch':
    case 'spine_switch':
    case 'leaf_switch':
    case 'idf_switch':
    case 'access_stack':
    case 'mgmt_switch':
      return `<rect x="${x + 18}" y="${y + 22}" width="${width - 36}" height="${height - 44}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 28}" y="${y + 34}" width="${width - 56}" height="10" rx="4" fill="#eef3f6" stroke="#c7d2d9" stroke-width="0.8"/>
        <path d="M ${x + 34} ${cy} H ${x + width - 34}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        ${Array.from({ length: 6 }, (_, index) => {
          const portX = x + 34 + index * ((width - 68) / 5);
          return `<rect x="${portX - 6}" y="${cy + 10}" width="12" height="8" rx="2" fill="#ffffff" stroke="${accent}" stroke-width="1"/>`;
        }).join('')}`;
    case 'firewall':
      return `<rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${y + 30} V ${y + height - 30} M ${x + 34} ${cy} H ${x + width - 34}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - 18} ${cy - 24} H ${cx + 18} M ${cx - 22} ${cy - 10} H ${cx + 22} M ${cx - 18} ${cy + 4} H ${cx + 18}" fill="none" stroke="#b15c3c" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${cx - 8} ${cy + 16} L ${cx} ${cy + 28} L ${cx + 12} ${cy + 8}" fill="none" stroke="#b15c3c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'load_balancer':
      return `<rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 40} ${cy} H ${cx - 8} M ${cx + 8} ${cy} H ${x + width - 40}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="7" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>
        <path d="M ${cx - 18} ${cy - 18} L ${cx} ${cy} L ${cx - 18} ${cy + 18} M ${cx + 18} ${cy - 18} L ${cx} ${cy} L ${cx + 18} ${cy + 18}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'service_cluster':
    case 'security_cluster':
      return `<rect x="${x + 16}" y="${y + 16}" width="${width - 32}" height="${height - 32}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderRackColumns(x + 10, y + 12, width - 20, height - 24, stroke, accent, 3)}
        <path d="M ${x + 28} ${y + height - 26} H ${x + width - 28}" fill="none" stroke="#cad6dd" stroke-width="1.1"/>`;
    case 'virtualization_cluster':
    case 'gpu_cluster':
      return `<rect x="${x + 16}" y="${y + 16}" width="${width - 32}" height="${height - 32}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        ${renderRackColumns(x + 12, y + 14, width - 24, height - 28, stroke, accent, 4)}
        <path d="M ${x + 34} ${y + 34} H ${x + width - 34}" fill="none" stroke="${accent}" stroke-width="1.1" opacity="0.7"/>
        ${node.glyph === 'gpu_cluster' ? `<path d="M ${cx - 24} ${cy + 18} H ${cx + 24}" fill="none" stroke="#7ba05e" stroke-width="1.4" stroke-linecap="round"/>` : ''}`;
    case 'san_switch':
      return `<rect x="${x + 18}" y="${y + 22}" width="${width - 36}" height="${height - 44}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${cy - 6} H ${x + width - 34} M ${x + 34} ${cy + 6} H ${x + width - 34}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        ${Array.from({ length: 4 }, (_, index) => {
          const portX = x + 42 + index * ((width - 84) / 3);
          return `<circle cx="${portX}" cy="${cy + 18}" r="4" fill="#ffffff" stroke="${accent}" stroke-width="1.1"/>`;
        }).join('')}`;
    case 'storage_array':
      return `<rect x="${x + 18}" y="${y + 16}" width="${width - 36}" height="${height - 32}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <rect x="${x + 28}" y="${y + 26}" width="${width - 56}" height="16" rx="5" fill="#eef4f1" stroke="#c9d7d0" stroke-width="0.8"/>
        <rect x="${x + 28}" y="${cy - 6}" width="${width - 56}" height="16" rx="5" fill="#eef4f1" stroke="#c9d7d0" stroke-width="0.8"/>
        <rect x="${x + 28}" y="${y + height - 42}" width="${width - 56}" height="16" rx="5" fill="#eef4f1" stroke="#c9d7d0" stroke-width="0.8"/>
        <circle cx="${x + width - 42}" cy="${y + 34}" r="2.5" fill="${accent}"/>
        <circle cx="${x + width - 42}" cy="${cy + 2}" r="2.5" fill="${accent}"/>
        <circle cx="${x + width - 42}" cy="${y + height - 34}" r="2.5" fill="${accent}"/>`;
    case 'backup_appliance':
      return `<rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${y + 26} V ${y + height - 34}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${cx - 16} ${cy - 6} H ${cx + 16}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${cx - 12} ${cy + 20} L ${cx} ${cy + 34} L ${cx + 14} ${cy + 16}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'wireless_controller':
      return `<rect x="${x + 22}" y="${y + 22}" width="${width - 44}" height="${height - 44}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${cy + 16} V ${cy + 26} M ${cx - 18} ${cy + 2} A 20 20 0 0 1 ${cx + 18} ${cy + 2} M ${cx - 12} ${cy - 8} A 13 13 0 0 1 ${cx + 12} ${cy - 8}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy + 6}" r="3.5" fill="${accent}"/>`;
    case 'building_gateway':
      return `<path d="M ${x + 34} ${y + 30} L ${cx} ${y + 16} L ${x + width - 34} ${y + 30} V ${y + height - 28} H ${x + 34} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="${cx - 16}" y="${cy + 4}" width="32" height="26" rx="6" fill="#ffffff" stroke="${accent}" stroke-width="1.2"/>
        <path d="M ${cx - 26} ${cy - 10} H ${cx + 26} M ${cx - 26} ${cy + 2} H ${cx + 26}" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>`;
    case 'device':
    default:
      return `<rect x="${x + 22}" y="${y + 18}" width="${width - 44}" height="${height - 36}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${x + 34} ${y + 30} L ${x + width - 34} ${y + height - 30} M ${x + width - 34} ${y + 30} L ${x + 34} ${y + height - 30}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}">?</text>`;
  }
}

const networkRenderer = createLaneRenderer({
  laneSpecs: [...NETWORK_LANES],
  symbolAliases: NETWORK_SYMBOL_ALIASES,
  symbolLibrary: NETWORK_SYMBOLS,
  mediaLibrary: NETWORK_MEDIA,
  defaultMedium: 'generic',
  legendTitle: 'LINK LEGEND',
  subtitle: 'Data centre network schematic with campus backbone, services, compute fabric, storage, and building edge rendered as lane-based infrastructure',
  inferSymbol(node, normalizeSymbol) {
    if (node.symbol) {
      return normalizeSymbol(node.symbol);
    }

    const probe = `${node.id} ${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();

    if (probe.includes('internet') || probe.includes('carrier') || probe.includes('wan cloud')) return 'carrier_cloud';
    if (probe.includes('router') || probe.includes('wan edge') || probe.includes('border')) return 'wan_router';
    if (probe.includes('core')) return 'core_switch';
    if (probe.includes('spine')) return 'spine_switch';
    if (probe.includes('leaf')) return 'leaf_switch';
    if (probe.includes('firewall')) return 'firewall';
    if (probe.includes('load balancer') || probe.includes('adc')) return 'load_balancer';
    if (probe.includes('dns') || probe.includes('dhcp') || probe.includes('ntp') || probe.includes('identity') || probe.includes('service')) return 'service_cluster';
    if (probe.includes('gpu') || probe.includes('ai cluster')) return 'gpu_cluster';
    if (probe.includes('vmware') || probe.includes('hypervisor') || probe.includes('compute cluster') || probe.includes('virtualization')) return 'virtualization_cluster';
    if (probe.includes('san')) return 'san_switch';
    if (probe.includes('storage') || probe.includes('nas')) return 'storage_array';
    if (probe.includes('backup')) return 'backup_appliance';
    if (probe.includes('management') || probe.includes('oob')) return 'mgmt_switch';
    if (probe.includes('wlc') || probe.includes('wireless controller')) return 'wireless_controller';
    if (probe.includes('building gateway') || probe.includes('mixed-use')) return 'building_gateway';
    if (probe.includes('idf')) return 'idf_switch';
    if (probe.includes('access')) return 'access_stack';
    if (probe.includes('security') || probe.includes('camera') || probe.includes('acs')) return 'security_cluster';
    return 'device';
  },
  inferLane(node, symbol) {
    const probe = `${node.label} ${Object.values(node.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('internet') || probe.includes('carrier')) return 'external';
    if (probe.includes('campus') || probe.includes('metro') || probe.includes('backbone')) return 'campus';
    if (probe.includes('service') || probe.includes('dns') || probe.includes('dhcp') || probe.includes('identity') || symbol === 'firewall' || symbol === 'load_balancer' || symbol === 'service_cluster' || symbol === 'mgmt_switch' || symbol === 'security_cluster') return 'services';
    if (probe.includes('storage') || probe.includes('backup') || symbol === 'san_switch' || symbol === 'storage_array' || symbol === 'backup_appliance') return 'storage';
    if (probe.includes('building') || probe.includes('tenant') || probe.includes('mixed-use') || symbol === 'building_gateway' || symbol === 'idf_switch' || symbol === 'wireless_controller') return 'building';
    if (probe.includes('access') || probe.includes('wifi') || probe.includes('camera') || probe.includes('badge')) return 'edge';
    if (symbol === 'wan_router' || symbol === 'core_switch') return 'core';
    if (symbol === 'spine_switch' || symbol === 'leaf_switch' || symbol === 'virtualization_cluster' || symbol === 'gpu_cluster') return 'fabric';
    return NETWORK_SYMBOLS[symbol]?.lane ?? 'edge';
  },
  getMedium(edge, from, to, mediaLibrary) {
    const probe = `${edge.label ?? ''} ${from.label} ${to.label} ${Object.values(from.params ?? {}).join(' ')} ${Object.values(to.params ?? {}).join(' ')}`.toLowerCase();
    if (probe.includes('internet') || probe.includes('dia') || probe.includes('wan')) return mediaLibrary.internet;
    if (probe.includes('400g') || probe.includes('campus backbone') || probe.includes('metro ring')) return mediaLibrary.backbone_400g;
    if (probe.includes('fabric') || probe.includes('leaf-spine') || probe.includes('spine')) return mediaLibrary.fabric_100g;
    if (probe.includes('100g') || probe.includes('core')) return mediaLibrary.core_100g;
    if (probe.includes('fc') || probe.includes('32g') || probe.includes('san')) return mediaLibrary.storage_fc;
    if (probe.includes('storage')) return mediaLibrary.storage_eth;
    if (probe.includes('mgmt') || probe.includes('oob')) return mediaLibrary.mgmt;
    if (probe.includes('wifi')) return mediaLibrary.wifi;
    if (probe.includes('security') || probe.includes('camera') || probe.includes('badge')) return mediaLibrary.security;
    if (probe.includes('access') || to.lane === 'building' || to.lane === 'edge' || from.lane === 'building' || from.lane === 'edge') return mediaLibrary.access;
    if (from.lane === 'campus') return mediaLibrary.backbone_400g;
    if (from.lane === 'core' || to.lane === 'core') return mediaLibrary.core_100g;
    if (from.lane === 'fabric' || to.lane === 'fabric') return mediaLibrary.fabric_100g;
    if (from.lane === 'storage' || to.lane === 'storage') return mediaLibrary.storage_eth;
    return mediaLibrary.generic;
  },
  renderGlyph: renderNetworkGlyph,
});

export function compileNetworkDiagram(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
  return networkRenderer.compile(input, { columnGap: 244 });
}

export function renderNetworkSvg(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
  return networkRenderer.render(input, { columnGap: 244 });
}

export class NetworkJS {
  static parse(source: string): DiagramProgram {
    return parseDiagram(source);
  }

  static compile(input: string | DiagramProgram | DiagramInput): LaneDiagramLayout {
    return compileNetworkDiagram(input);
  }

  static render(input: string | DiagramProgram | DiagramInput | LaneDiagramLayout): string {
    return renderNetworkSvg(input);
  }
}
