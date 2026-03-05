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
    node draft "Draft"
    node done "Done"
    edge draft done "finish"
  `);

  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.match(svg, /data-id="draft"/);
  assert.match(svg, /marker-end="url\(#arrowhead\)"/);
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
