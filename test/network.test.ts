import test from 'node:test';
import assert from 'node:assert/strict';

import { compileNetworkDiagram, renderNetworkSvg } from '../src/index';
import { networkShowcaseSource } from '../src/showcase-data';

test('renderNetworkSvg returns lane-based network output', () => {
  const svg = renderNetworkSvg(`
    title "Network"
    node wan "Carrier Internet" 
    param wan lane external
    param wan column 0
    node core "Core Switch Pair"
    param core lane core
    param core column 1
    node fabric "Spine Fabric A"
    param fabric lane fabric
    param fabric column 2
    edge wan core "internet"
    edge core fabric "100G fabric"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-lane-guide="external"/);
  assert.match(svg, /data-lane-guide="core"/);
  assert.match(svg, /data-edge-from="wan" data-edge-to="core" data-medium="internet"/);
  assert.match(svg, /data-edge-from="core" data-edge-to="fabric" data-medium="fabric_100g"/);
});

test('renderNetworkSvg infers dedicated network symbols from labels', () => {
  const svg = renderNetworkSvg(`
    node fw "Perimeter Firewall Cluster"
    param fw lane services
    param fw column 0
    node spine "Spine Fabric A"
    param spine lane fabric
    param spine column 1
    node gpu "GPU Training Cluster"
    param gpu lane fabric
    param gpu column 2
    node san "SAN Switch A"
    param san lane storage
    param san column 1
    node bldg "Mixed-Use Tower Gateway"
    param bldg lane building
    param bldg column 3
    edge fw spine "100G core"
    edge spine gpu "100G fabric"
    edge spine san "25G storage"
    edge san bldg "10/25G access"
  `);

  assert.match(svg, /data-id="fw" data-symbol="firewall" data-glyph="firewall"/);
  assert.match(svg, /data-id="spine" data-symbol="spine_switch" data-glyph="spine_switch"/);
  assert.match(svg, /data-id="gpu" data-symbol="gpu_cluster" data-glyph="gpu_cluster"/);
  assert.match(svg, /data-id="san" data-symbol="san_switch" data-glyph="san_switch"/);
  assert.match(svg, /data-id="bldg" data-symbol="building_gateway" data-glyph="building_gateway"/);
});

test('compileNetworkDiagram exposes lanes and media for the homepage example', () => {
  const compiled = compileNetworkDiagram(networkShowcaseSource);

  assert.ok(compiled.nodes.length > 25);
  assert.ok(compiled.lanes.some((lane) => lane.id === 'external'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'fabric'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'storage'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'building'));
  assert.ok(compiled.media.some((medium) => medium.key === 'internet'));
  assert.ok(compiled.media.some((medium) => medium.key === 'backbone_400g'));
  assert.ok(compiled.media.some((medium) => medium.key === 'fabric_100g'));
  assert.ok(compiled.media.some((medium) => medium.key === 'storage_fc'));
  assert.ok(compiled.media.some((medium) => medium.key === 'mgmt'));
});

test('homepage network example renders without fallback glyphs', () => {
  const svg = renderNetworkSvg(networkShowcaseSource);

  assert.doesNotMatch(svg, /data-glyph="device"/);
  assert.match(svg, /data-medium="wifi"/);
  assert.match(svg, /data-medium="security"/);
});
