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
