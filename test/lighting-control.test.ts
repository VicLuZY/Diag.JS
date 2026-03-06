import test from 'node:test';
import assert from 'node:assert/strict';

import { compileLightingControlDiagram, renderLightingControlSvg } from '../src/index';
import { lightingControlShowcaseSource } from '../src/showcase-data';

test('renderLightingControlSvg returns lighting control schematic output', () => {
  const svg = renderLightingControlSvg(`
    title "Lighting"
    node head "Enterprise Lighting Head-End"
    param head lane headend
    param head column 0
    node gw "Lighting Gateway"
    param gw lane backbone
    param gw column 1
    node room "Open Office Room Controller"
    param room lane room
    param room column 2
    node sensor "Office Wallstation"
    param sensor lane sensor
    param sensor column 3
    edge head gw "Ethernet"
    edge gw room "Ethernet"
    edge room sensor "sensor bus"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-lane-guide="headend"/);
  assert.match(svg, /data-lane-guide="room"/);
  assert.match(svg, /data-edge-from="head" data-edge-to="gw" data-medium="ethernet"/);
  assert.match(svg, /data-edge-from="gw" data-edge-to="room" data-medium="ethernet"/);
  assert.match(svg, /data-edge-from="room" data-edge-to="sensor" data-medium="sensor_bus"/);
});

test('renderLightingControlSvg infers lighting control symbols from labels', () => {
  const svg = renderLightingControlSvg(`
    node panel "Ballroom Dimming Panel"
    param panel lane panel
    param panel column 0
    node scene "Ballroom Scene Station"
    param scene lane sensor
    param scene column 1
    node day "Perimeter Daylight Sensor"
    param day lane sensor
    param day column 2
    node fixture "Open Office Luminaires"
    param fixture lane fixture
    param fixture column 3
    edge panel scene "DALI"
    edge scene day "sensor"
    edge day fixture "0-10V"
  `);

  assert.match(svg, /data-id="panel" data-symbol="dimming_panel" data-glyph="dimming_panel"/);
  assert.match(svg, /data-id="scene" data-symbol="scene_station" data-glyph="scene_station"/);
  assert.match(svg, /data-id="day" data-symbol="daylight_sensor" data-glyph="daylight_sensor"/);
  assert.match(svg, /data-id="fixture" data-symbol="fixture_group" data-glyph="fixture_group"/);
});

test('compileLightingControlDiagram exposes control lanes and media', () => {
  const compiled = compileLightingControlDiagram(lightingControlShowcaseSource);

  assert.ok(compiled.nodes.length > 20);
  assert.ok(compiled.lanes.some((lane) => lane.id === 'headend'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'panel'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'sensor'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'exterior'));
  assert.ok(compiled.media.some((medium) => medium.key === 'ethernet'));
  assert.ok(compiled.media.some((medium) => medium.key === 'dali'));
  assert.ok(compiled.media.some((medium) => medium.key === 'analog_010v'));
  assert.ok(compiled.media.some((medium) => medium.key === 'emergency'));
});

test('homepage lighting control example renders without fallback glyphs', () => {
  const svg = renderLightingControlSvg(lightingControlShowcaseSource);

  assert.doesNotMatch(svg, /data-glyph="device"/);
  assert.match(svg, /data-medium="exterior"/);
  assert.match(svg, /data-medium="emergency"/);
});
