import test from 'node:test';
import assert from 'node:assert/strict';

import { compileHvacDiagram, renderHvacSvg } from '../src/index';
import { hvacShowcaseSource } from '../src/showcase-data';

function getNodeBlock(svg: string, id: string): string {
  const match = svg.match(new RegExp(`<g data-id="${id}"[\\s\\S]*?<\\/g>`));
  assert.ok(match, `Missing node block for ${id}`);
  return match[0];
}

test('renderHvacSvg returns valid mechanical schematic output', () => {
  const svg = renderHvacSvg(`
    title "Airside"
    node oa "Outside Air Intake Louver"
    param oa lane air
    param oa column 0
    node ahu "AHU-1"
    param ahu lane air
    param ahu column 1
    node zn "Open Office East"
    param zn lane terminal
    param zn column 2
    edge oa ahu "OA"
    edge ahu zn "SA"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-lane-guide="air"/);
  assert.match(svg, /data-lane-guide="terminal"/);
  assert.match(svg, /data-edge-from="oa" data-edge-to="ahu" data-medium="outside_air"/);
  assert.match(svg, /data-edge-from="ahu" data-edge-to="zn" data-medium="supply_air"/);
});

test('renderHvacSvg infers dedicated HVAC symbol families from labels', () => {
  const svg = renderHvacSvg(`
    node oa "Outside Air Intake Louver"
    param oa lane air
    param oa column 0
    node vav "VAV-1 East"
    param vav lane air
    param vav column 1
    node fcu "Lobby Fan Coil Unit"
    param fcu lane terminal
    param fcu column 2
    node ch "Chiller CH-1"
    param ch lane chilled
    param ch column 0
    node blr "Condensing Boiler B-1"
    param blr lane heating
    param blr column 1
    edge oa vav "OA"
    edge vav fcu "SA"
    edge ch blr "CHWS"
  `);

  assert.match(svg, /data-id="oa" data-symbol="outside_air" data-glyph="outside_air"/);
  assert.match(svg, /data-id="vav" data-symbol="vav" data-glyph="vav"/);
  assert.match(svg, /data-id="fcu" data-symbol="fan_coil" data-glyph="fan_coil"/);
  assert.match(svg, /data-id="ch" data-symbol="chiller" data-glyph="chiller"/);
  assert.match(svg, /data-id="blr" data-symbol="boiler" data-glyph="boiler"/);
});

test('compileHvacDiagram exposes lane and media metadata for the homepage example', () => {
  const compiled = compileHvacDiagram(hvacShowcaseSource);

  assert.ok(compiled.nodes.length > 40);
  assert.ok(compiled.lanes.some((lane) => lane.id === 'condenser'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'chilled'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'air'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'heating'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'controls'));
  assert.ok(compiled.media.some((medium) => medium.key === 'outside_air'));
  assert.ok(compiled.media.some((medium) => medium.key === 'supply_air'));
  assert.ok(compiled.media.some((medium) => medium.key === 'chilled_water_supply'));
  assert.ok(compiled.media.some((medium) => medium.key === 'heating_water_supply'));
  assert.ok(compiled.media.some((medium) => medium.key === 'controls'));
});

test('homepage HVAC example renders without generic fallback devices and includes return loops', () => {
  const svg = renderHvacSvg(hvacShowcaseSource);
  const returnDuct = getNodeBlock(svg, 'RA1');

  assert.doesNotMatch(svg, /data-glyph="device"/);
  assert.match(svg, /data-medium="chilled_water_return" data-reversed="true"/);
  assert.match(svg, /data-medium="return_air" data-reversed="true"/);
  assert.match(returnDuct, /data-symbol="duct" data-glyph="duct" data-lane="exhaust"/);
});
