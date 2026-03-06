import test from 'node:test';
import assert from 'node:assert/strict';

import { compileFireAlarmDiagram, renderFireAlarmSvg } from '../src/index';
import { fireAlarmShowcaseSource } from '../src/showcase-data';

test('renderFireAlarmSvg returns campus fire alarm output', () => {
  const svg = renderFireAlarmSvg(`
    title "Fire"
    node head "Campus Fire Command Center"
    param head lane command
    param head column 0
    node node1 "Distributed Node - Tower"
    param node1 lane network
    param node1 column 1
    node panel "Tower FACP Main"
    param panel lane panels
    param panel column 2
    edge head node1 "peer ring"
    edge node1 panel "network"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-lane-guide="command"/);
  assert.match(svg, /data-lane-guide="panels"/);
  assert.match(svg, /data-edge-from="head" data-edge-to="node1" data-medium="peer_ring"/);
  assert.match(svg, /data-edge-from="node1" data-edge-to="panel" data-medium="network"/);
});

test('renderFireAlarmSvg infers fire alarm symbols from labels', () => {
  const svg = renderFireAlarmSvg(`
    node ann "Tower Lobby Annunciator"
    param ann lane annunciation
    param ann column 0
    node pull "Tower Exit Pull Station"
    param pull lane field
    param pull column 1
    node smoke "Residential Corridor Smoke Detector"
    param smoke lane field
    param smoke column 2
    node horn "Tower Guestroom Horn Strobe"
    param horn lane notification
    param horn column 3
    edge ann pull "network"
    edge pull smoke "slc"
    edge smoke horn "nac"
  `);

  assert.match(svg, /data-id="ann" data-symbol="annunciator" data-glyph="annunciator"/);
  assert.match(svg, /data-id="pull" data-symbol="pull_station" data-glyph="pull_station"/);
  assert.match(svg, /data-id="smoke" data-symbol="smoke_detector" data-glyph="smoke_detector"/);
  assert.match(svg, /data-id="horn" data-symbol="horn_strobe" data-glyph="horn_strobe"/);
});

test('compileFireAlarmDiagram exposes campus lanes and media', () => {
  const compiled = compileFireAlarmDiagram(fireAlarmShowcaseSource);

  assert.ok(compiled.nodes.length > 25);
  assert.ok(compiled.lanes.some((lane) => lane.id === 'command'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'network'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'notification'));
  assert.ok(compiled.lanes.some((lane) => lane.id === 'field'));
  assert.ok(compiled.media.some((medium) => medium.key === 'peer_ring'));
  assert.ok(compiled.media.some((medium) => medium.key === 'slc'));
  assert.ok(compiled.media.some((medium) => medium.key === 'nac'));
  assert.ok(compiled.media.some((medium) => medium.key === 'releasing'));
});

test('homepage fire alarm example renders without fallback glyphs', () => {
  const svg = renderFireAlarmSvg(fireAlarmShowcaseSource);

  assert.doesNotMatch(svg, /data-glyph="device"/);
  assert.match(svg, /data-medium="peer_ring" data-reversed="true"/);
  assert.match(svg, /data-medium="releasing"/);
});
