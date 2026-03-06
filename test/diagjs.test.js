import test from 'node:test';
import assert from 'node:assert/strict';

import { compileDiagram, parseDiagram, renderSvg } from '../src/index.js';

test('parseDiagram builds an AST', () => {
  const source = `
    title "Pipeline"
    node a "Input"
    node b "Process"
    edge a b "run"
  `;

  const ast = parseDiagram(source);

  assert.equal(ast.type, 'DiagramProgram');
  assert.equal(ast.title, 'Pipeline');
  assert.equal(ast.statements.length, 3);
});

test('compileDiagram validates edge nodes', () => {
  const ast = parseDiagram(`
    node a "One"
    edge a b
  `);

  assert.throws(() => compileDiagram(ast), /Unknown target node "b"/);
});

test('renderSvg returns valid svg output', () => {
  const svg = renderSvg(`
    node utility "Utility Service" symbol utility
    node msb "Main Switchboard" symbol switchboard
    edge utility msb "service"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-id="utility"/);
  assert.match(svg, /data-symbol="utility"/);
  assert.match(svg, /data-edge-from="utility" data-edge-to="msb"/);
  assert.doesNotMatch(svg, /marker-end=/);
});

test('parseDiagram accepts SLD param statements', () => {
  const source = `
    title "Equipment"
    node P1 "Pump"
    param P1 power 5.5kW
    param P1 head "12 m"
    node T1 "Tank"
    edge P1 T1 "feed"
  `;
  const ast = parseDiagram(source);
  assert.equal(ast.title, 'Equipment');
  const paramStmts = ast.statements.filter((s) => s.type === 'ParamDeclaration');
  assert.equal(paramStmts.length, 2);
  assert.equal(paramStmts[0].key, 'power');
  assert.equal(paramStmts[0].value, '5.5kW');
  assert.equal(paramStmts[1].value, '12 m');
});

test('compileDiagram attaches params to nodes', () => {
  const compiled = compileDiagram(
    parseDiagram(`
    node A "Device A"
    param A rating 100
    param A unit kW
  `)
  );
  const nodeA = compiled.nodes.find((n) => n.id === 'A');
  assert.ok(nodeA);
  assert.deepEqual(nodeA.params, { rating: '100', unit: 'kW' });
});

test('renderSvg includes param labels next to devices', () => {
  const svg = renderSvg(`
    node P "Pump"
    param P power 5.5kW
    param P head 12m
  `);
  assert.match(svg, /power: 5\.5kW/);
  assert.match(svg, /head: 12m/);
});

test('renderSvg lays nodes out hierarchically with level metadata', () => {
  const svg = renderSvg(`
    node a "Utility Service" symbol utility
    node b "XFMR-1" symbol transformer
    node c "MSB-1" symbol switchboard
    edge a b
    edge b c
  `);

  assert.match(svg, /data-id="a" data-symbol="utility" data-level="0"/);
  assert.match(svg, /data-id="b" data-symbol="transformer" data-level="1"/);
  assert.match(svg, /data-id="c" data-symbol="switchboard" data-level="2"/);
});

test('renderSvg routes connections from the source right side to the target left side', () => {
  const svg = renderSvg(`
    node a "Utility Service" symbol utility
    node b "XFMR-1" symbol transformer
    edge a b
  `);

  const match = svg.match(/data-edge-from="a" data-edge-to="b">[\s\S]*?<path d="M ([0-9.]+) ([0-9.]+) H ([0-9.]+) V ([0-9.]+) H ([0-9.]+)"/);
  assert.ok(match);

  const startX = Number(match[1]);
  const laneX = Number(match[3]);
  const endX = Number(match[5]);

  assert.ok(startX < laneX);
  assert.ok(laneX < endX);
});

test('renderSvg supports expanded electrical symbol aliases', () => {
  const svg = renderSvg(`
    node gen1 "Emergency Generator" symbol gen
    node cb1 "Main Breaker" symbol cb
    node ds1 "Service Disconnect" symbol disco
    node ats1 "Automatic Transfer Switch" symbol transfer-switch
    node ups1 "UPS-1" symbol ups
    node batt1 "Battery Bank" symbol battery
    node pv1 "PV Array" symbol pv
    node inv1 "Inverter" symbol converter
    node mtr1 "Revenue Meter" symbol metering
    node cap1 "Capacitor Bank" symbol capacitor-bank
    node rel1 "Protective Relay" symbol protection-relay
    node grd1 "Ground Grid" symbol ground
  `);

  assert.match(svg, /data-id="gen1" data-symbol="generator"/);
  assert.match(svg, /data-id="cb1" data-symbol="breaker"/);
  assert.match(svg, /data-id="ds1" data-symbol="disconnect"/);
  assert.match(svg, /data-id="ats1" data-symbol="ats"/);
  assert.match(svg, /data-id="ups1" data-symbol="ups"/);
  assert.match(svg, /data-id="batt1" data-symbol="battery"/);
  assert.match(svg, /data-id="pv1" data-symbol="solar"/);
  assert.match(svg, /data-id="inv1" data-symbol="inverter"/);
  assert.match(svg, /data-id="mtr1" data-symbol="meter"/);
  assert.match(svg, /data-id="cap1" data-symbol="capacitor"/);
  assert.match(svg, /data-id="rel1" data-symbol="relay"/);
  assert.match(svg, /data-id="grd1" data-symbol="ground"/);
});

test('renderSvg infers broader symbol families from device names', () => {
  const svg = renderSvg(`
    node gen "Emergency Generator"
    node ats "ATS-1"
    node meter "Utility Meter"
    node cap "Capacitor Bank"
    node relay "Protective Relay"
    node bus "Bus Duct Section"
    edge gen ats
    edge ats meter
    edge meter cap
    edge cap relay
    edge relay bus
  `);

  assert.match(svg, /data-id="gen" data-symbol="generator"/);
  assert.match(svg, /data-id="ats" data-symbol="ats"/);
  assert.match(svg, /data-id="meter" data-symbol="meter"/);
  assert.match(svg, /data-id="cap" data-symbol="capacitor"/);
  assert.match(svg, /data-id="relay" data-symbol="relay"/);
  assert.match(svg, /data-id="bus" data-symbol="busway"/);
});
