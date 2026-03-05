const NODE_ID_RE = '[A-Za-z][A-Za-z0-9_-]*';
const TITLE_RE = new RegExp(`^title\\s+\"([^\"]+)\"$`);
const NODE_RE = new RegExp(`^node\\s+(${NODE_ID_RE})\\s+\"([^\"]+)\"$`);
const EDGE_RE = new RegExp(`^edge\\s+(${NODE_ID_RE})\\s+(${NODE_ID_RE})(?:\\s+\"([^\"]+)\")?$`);

function syntaxError(lineNumber, line) {
  return new SyntaxError(`Invalid statement at line ${lineNumber}: ${line}`);
}

function escapeXml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function parseDiagram(source) {
  if (typeof source !== 'string' || source.trim() === '') {
    throw new TypeError('Diagram source must be a non-empty string.');
  }

  const lines = source.split(/\r?\n/);
  const ast = {
    type: 'DiagramProgram',
    title: null,
    statements: [],
  };

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      if (ast.title !== null) {
        throw new SyntaxError(`Only one title is allowed. Duplicate at line ${lineNumber}.`);
      }
      ast.title = titleMatch[1];
      continue;
    }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      ast.statements.push({
        type: 'NodeDeclaration',
        id: nodeMatch[1],
        label: nodeMatch[2],
        line: lineNumber,
      });
      continue;
    }

    const edgeMatch = line.match(EDGE_RE);
    if (edgeMatch) {
      ast.statements.push({
        type: 'EdgeDeclaration',
        from: edgeMatch[1],
        to: edgeMatch[2],
        label: edgeMatch[3] ?? null,
        line: lineNumber,
      });
      continue;
    }

    throw syntaxError(lineNumber, rawLine);
  }

  if (ast.statements.length === 0) {
    throw new SyntaxError('Diagram source must include at least one node or edge statement.');
  }

  return ast;
}

export function compileDiagram(ast) {
  if (!ast || ast.type !== 'DiagramProgram' || !Array.isArray(ast.statements)) {
    throw new TypeError('compileDiagram expects the output of parseDiagram.');
  }

  const nodes = new Map();
  const edges = [];

  for (const statement of ast.statements) {
    if (statement.type === 'NodeDeclaration') {
      if (nodes.has(statement.id)) {
        throw new SyntaxError(`Duplicate node id "${statement.id}" at line ${statement.line}.`);
      }
      nodes.set(statement.id, { id: statement.id, label: statement.label });
      continue;
    }

    if (statement.type === 'EdgeDeclaration') {
      if (!nodes.has(statement.from)) {
        throw new SyntaxError(
          `Unknown source node "${statement.from}" for edge at line ${statement.line}.`
        );
      }
      if (!nodes.has(statement.to)) {
        throw new SyntaxError(`Unknown target node "${statement.to}" for edge at line ${statement.line}.`);
      }
      edges.push({ from: statement.from, to: statement.to, label: statement.label });
    }
  }

  return {
    type: 'CompiledDiagram',
    title: ast.title,
    nodes: [...nodes.values()],
    edges,
  };
}

function layoutDiagram(compiled, options = {}) {
  const margin = options.margin ?? 32;
  const nodeHeight = options.nodeHeight ?? 52;
  const rowGap = options.rowGap ?? 84;
  const minNodeWidth = options.minNodeWidth ?? 104;
  const textScale = options.textScale ?? 8;

  const rowOffset = compiled.title ? 44 : 0;
  const nodeX = margin;

  const measured = compiled.nodes.map((node, index) => {
    const width = Math.max(minNodeWidth, node.label.length * textScale + 28);
    const y = margin + rowOffset + index * rowGap;
    return { ...node, width, height: nodeHeight, x: nodeX, y };
  });

  const widest = measured.reduce((max, node) => Math.max(max, node.width), minNodeWidth);
  const edgeLaneX = nodeX + widest + 96;
  const map = new Map(measured.map((node) => [node.id, node]));

  const drawnEdges = compiled.edges.map((edge, index) => {
    const from = map.get(edge.from);
    const to = map.get(edge.to);
    const laneX = edgeLaneX + (index % 3) * 26;

    return {
      ...edge,
      fromX: from.x + from.width,
      fromY: from.y + from.height / 2,
      toX: to.x,
      toY: to.y + to.height / 2,
      laneX,
    };
  });

  const width = edgeLaneX + 140;
  const lastNode = measured[measured.length - 1];
  const height = lastNode ? lastNode.y + nodeHeight + margin : margin * 2;

  return {
    width,
    height,
    nodes: measured,
    edges: drawnEdges,
  };
}

function renderCompiledSvg(compiled, options) {
  if (!compiled || compiled.type !== 'CompiledDiagram') {
    throw new TypeError('renderSvg expects a source string or compileDiagram output.');
  }

  if (!compiled.nodes.length) {
    throw new Error('Compiled diagram has no nodes.');
  }

  const layout = layoutDiagram(compiled, options);
  const titleY = 28;

  const title = compiled.title
    ? `<text x="${layout.width / 2}" y="${titleY}" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="16" font-weight="700" fill="#0f172a">${escapeXml(compiled.title)}</text>`
    : '';

  const nodeBlocks = layout.nodes
    .map(
      (node) => `
<g data-id="${escapeXml(node.id)}">
  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="10" fill="#e2e8f0" stroke="#334155" stroke-width="1.5"/>
  <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2 + 5}" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="14" fill="#0f172a">${escapeXml(node.label)}</text>
</g>`
    )
    .join('');

  const edgeBlocks = layout.edges
    .map((edge) => {
      const path = `M ${edge.fromX} ${edge.fromY} C ${edge.laneX} ${edge.fromY}, ${edge.laneX} ${edge.toY}, ${edge.toX} ${edge.toY}`;
      const label = edge.label
        ? `<text x="${edge.laneX + 6}" y="${(edge.fromY + edge.toY) / 2 - 6}" font-family="ui-sans-serif, system-ui" font-size="12" fill="#1e293b">${escapeXml(edge.label)}</text>`
        : '';

      return `
<g>
  <path d="${path}" fill="none" stroke="#1d4ed8" stroke-width="1.7" marker-end="url(#arrowhead)"/>
  ${label}
</g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="diagjs diagram">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#1d4ed8"/>
    </marker>
  </defs>
  ${title}
  ${edgeBlocks}
  ${nodeBlocks}
</svg>`;
}

export function renderSvg(input, options = {}) {
  if (typeof input === 'string') {
    return renderCompiledSvg(compileDiagram(parseDiagram(input)), options);
  }

  return renderCompiledSvg(input, options);
}

export class DiagJS {
  static parse(source) {
    return parseDiagram(source);
  }

  static compile(sourceOrAst) {
    if (typeof sourceOrAst === 'string') {
      return compileDiagram(parseDiagram(sourceOrAst));
    }
    return compileDiagram(sourceOrAst);
  }

  static render(sourceOrCompiled, options = {}) {
    return renderSvg(sourceOrCompiled, options);
  }
}
