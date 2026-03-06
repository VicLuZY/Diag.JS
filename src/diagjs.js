const NODE_ID_RE = '[A-Za-z][A-Za-z0-9_-]*';
const SYMBOL_RE = '[A-Za-z][A-Za-z0-9_-]*';
const TITLE_RE = new RegExp(`^title\\s+"([^"]+)"$`);
const NODE_RE = new RegExp(`^node\\s+(${NODE_ID_RE})\\s+"([^"]+)"(?:\\s+symbol\\s+(${SYMBOL_RE}))?$`);
const EDGE_RE = new RegExp(`^edge\\s+(${NODE_ID_RE})\\s+(${NODE_ID_RE})(?:\\s+"([^"]+)")?$`);
const PARAM_RE = new RegExp(`^param\\s+(${NODE_ID_RE})\\s+([A-Za-z][A-Za-z0-9_-]*)\\s+(?:"([^"]*)"|(\\S+))$`);

const SYMBOL_LIBRARY = {
  utility: {
    typeLabel: 'UTILITY',
    width: 170,
    height: 102,
    fill: '#fff7ef',
    innerFill: '#fffdf9',
    stroke: '#87512e',
    accent: '#87512e',
    labelChars: 18,
  },
  transformer: {
    typeLabel: 'XFMR',
    width: 182,
    height: 104,
    fill: '#fff9ef',
    innerFill: '#fffef9',
    stroke: '#8a6436',
    accent: '#8a6436',
    labelChars: 18,
  },
  switchboard: {
    typeLabel: 'SWBD',
    width: 212,
    height: 106,
    fill: '#f4f9fc',
    innerFill: '#fbfdfe',
    stroke: '#294560',
    accent: '#294560',
    labelChars: 20,
  },
  panel: {
    typeLabel: 'PANEL',
    width: 182,
    height: 102,
    fill: '#f7fbfe',
    innerFill: '#fbfdfe',
    stroke: '#43647c',
    accent: '#43647c',
    labelChars: 18,
  },
  mcc: {
    typeLabel: 'MCC',
    width: 194,
    height: 104,
    fill: '#f4faf7',
    innerFill: '#fbfefc',
    stroke: '#2f6251',
    accent: '#2f6251',
    labelChars: 18,
  },
  motor: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#f5faf6',
    innerFill: '#ffffff',
    stroke: '#2e6a4f',
    accent: '#2e6a4f',
    labelChars: 15,
  },
  lighting: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#fffbed',
    innerFill: '#fffef7',
    stroke: '#a27c18',
    accent: '#a27c18',
    labelChars: 15,
  },
  receptacle: {
    typeLabel: 'LOAD',
    width: 132,
    height: 96,
    fill: '#faf8f2',
    innerFill: '#ffffff',
    stroke: '#6f6658',
    accent: '#6f6658',
    labelChars: 15,
  },
  equipment: {
    typeLabel: 'LOAD',
    width: 140,
    height: 96,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
  pump: {
    typeLabel: 'PUMP',
    width: 140,
    height: 98,
    fill: '#f5faf7',
    innerFill: '#ffffff',
    stroke: '#2f6251',
    accent: '#2f6251',
    labelChars: 16,
  },
  heat_exchanger: {
    typeLabel: 'HX',
    width: 148,
    height: 98,
    fill: '#f7fbfe',
    innerFill: '#ffffff',
    stroke: '#43647c',
    accent: '#43647c',
    labelChars: 16,
  },
  tank: {
    typeLabel: 'TANK',
    width: 146,
    height: 100,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
  valve: {
    typeLabel: 'VALVE',
    width: 136,
    height: 94,
    fill: '#faf8f2',
    innerFill: '#ffffff',
    stroke: '#6f6658',
    accent: '#6f6658',
    labelChars: 16,
  },
  device: {
    typeLabel: 'DEVICE',
    width: 142,
    height: 96,
    fill: '#f7f9fb',
    innerFill: '#ffffff',
    stroke: '#566675',
    accent: '#566675',
    labelChars: 16,
  },
};

function syntaxError(lineNumber, line) {
  return new SyntaxError(`Invalid statement at line ${lineNumber}: ${line}`);
}

function escapeXml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeSymbol(symbolType) {
  return String(symbolType ?? 'device').toLowerCase().replace(/-/g, '_');
}

function inferSymbol(node) {
  if (node.symbol) {
    return normalizeSymbol(node.symbol);
  }

  const probe = `${node.id} ${node.label}`.toLowerCase();

  if (probe.includes('utility')) {
    return 'utility';
  }
  if (probe.includes('xfmr') || probe.includes('transformer')) {
    return 'transformer';
  }
  if (probe.includes('switchboard') || probe.includes('msb')) {
    return 'switchboard';
  }
  if (probe.includes('mcc')) {
    return 'mcc';
  }
  if (probe.includes('panel') || /\b(lp|rp|dp)-?\d*/.test(probe)) {
    return 'panel';
  }
  if (probe.includes('lighting')) {
    return 'lighting';
  }
  if (probe.includes('receptacle')) {
    return 'receptacle';
  }
  if (probe.includes('motor')) {
    return 'motor';
  }

  return 'equipment';
}

function getSymbolSpec(symbolType) {
  return SYMBOL_LIBRARY[normalizeSymbol(symbolType)] ?? SYMBOL_LIBRARY.device;
}

function wrapText(text, maxChars) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [''];
  }

  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      if (word.length <= maxChars) {
        current = word;
        continue;
      }

      const chunks = word.match(new RegExp(`.{1,${Math.max(1, maxChars)}}`, 'g')) ?? [word];
      lines.push(...chunks.slice(0, -1));
      current = chunks[chunks.length - 1] ?? '';
      continue;
    }

    const candidate = `${current} ${word}`;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    lines.push(current);
    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    const chunks = word.match(new RegExp(`.{1,${Math.max(1, maxChars)}}`, 'g')) ?? [word];
    lines.push(...chunks.slice(0, -1));
    current = chunks[chunks.length - 1] ?? '';
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function textY(baseY, index, lineHeightPx) {
  return baseY + index * lineHeightPx;
}

function renderTextLines(lines, x, y, options = {}) {
  const {
    anchor = 'middle',
    fontSize = 12,
    fontFamily = 'Trebuchet MS, Verdana, sans-serif',
    fontWeight = '400',
    fill = '#1a2833',
    lineHeightPx = Math.round(fontSize * 1.2),
  } = options;

  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${textY(y, index, lineHeightPx)}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${escapeXml(line)}</text>`,
    )
    .join('');
}

function getNodeVisual(node) {
  const symbol = inferSymbol(node);
  const spec = getSymbolSpec(symbol);
  const labelLines = wrapText(node.label, spec.labelChars);
  const labelFontSize = 13;
  const labelLineHeight = 15;
  const labelHeight = labelLines.length * labelLineHeight;
  const deviceWidth = spec.width;
  const deviceHeight = Math.max(spec.height, 74 + labelHeight);
  const paramLines = Object.entries(node.params ?? {}).map(([key, value]) => `${key}: ${value}`);
  const paramWidth = paramLines.length
    ? Math.max(deviceWidth - 20, ...paramLines.map((line) => line.length * 6.4 + 24))
    : 0;
  const paramHeight = paramLines.length ? paramLines.length * 16 + 20 : 0;
  const totalWidth = Math.max(deviceWidth, paramWidth);
  const totalHeight = deviceHeight + (paramHeight ? 14 + paramHeight : 0);

  return {
    ...node,
    symbol,
    spec,
    labelLines,
    labelFontSize,
    labelLineHeight,
    paramLines,
    deviceWidth,
    deviceHeight,
    paramWidth,
    paramHeight,
    totalWidth,
    totalHeight,
  };
}

function renderSymbolGlyph(symbolType, x, y, width, height, spec) {
  const symbol = normalizeSymbol(symbolType);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const stroke = spec.stroke;
  const accent = spec.accent;
  const fill = spec.innerFill;

  switch (symbol) {
    case 'utility': {
      const r = Math.min(width, height) * 0.3;
      return `<circle cx="${cx}" cy="${cy + 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - r * 0.18} ${cy - r * 0.82} L ${cx + r * 0.14} ${cy - r * 0.1} L ${cx - r * 0.02} ${cy - r * 0.1} L ${cx + r * 0.22} ${cy + r * 0.74}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${cx - r * 0.72} ${cy - r * 1.15} Q ${cx} ${cy - r * 1.55} ${cx + r * 0.72} ${cy - r * 1.15}" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M ${x + 14} ${cy + 2} H ${cx - r}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M ${cx + r} ${cy + 2} H ${x + width - 14}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'transformer': {
      const r = Math.min(width, height) * 0.22;
      return `<path d="M ${x + 12} ${cy} H ${cx - r * 1.9}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${cx - r * 0.95}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <circle cx="${cx + r * 0.95}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - r * 0.2} ${cy} H ${cx + r * 0.2}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx + r * 1.9} ${cy} H ${x + width - 12}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    case 'switchboard': {
      const bodyX = x + 18;
      const bodyY = y + 10;
      const bodyW = width - 36;
      const bodyH = height - 20;
      const sectionWidth = bodyW / 4;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 10} ${bodyY + 16} H ${bodyX + bodyW - 10}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M ${bodyX + 10} ${bodyY + bodyH - 14} H ${bodyX + bodyW - 10}" fill="none" stroke="#cc8a2f" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M ${bodyX + sectionWidth} ${bodyY + 10} V ${bodyY + bodyH - 10} M ${bodyX + sectionWidth * 2} ${bodyY + 10} V ${bodyY + bodyH - 10} M ${bodyX + sectionWidth * 3} ${bodyY + 10} V ${bodyY + bodyH - 10}" fill="none" stroke="#9eb0bc" stroke-width="1.1"/>`;
    }
    case 'panel': {
      const bodyX = x + 28;
      const bodyY = y + 8;
      const bodyW = width - 56;
      const bodyH = height - 16;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + bodyW / 2} ${bodyY + 10} V ${bodyY + bodyH - 10}" fill="none" stroke="#9eb0bc" stroke-width="1.1"/>
        <path d="M ${bodyX + 12} ${bodyY + 18} H ${bodyX + bodyW - 12}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="${bodyX + bodyW / 2}" cy="${bodyY + bodyH - 18}" r="4.5" fill="#ffffff" stroke="${accent}" stroke-width="1.4"/>`;
    }
    case 'mcc': {
      const bodyX = x + 14;
      const bodyY = y + 8;
      const bodyW = width - 28;
      const bodyH = height - 16;
      const bucketWidth = (bodyW - 16) / 3;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 8} ${bodyY + 16} H ${bodyX + bodyW - 8}" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
        <rect x="${bodyX + 8}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>
        <rect x="${bodyX + 8 + bucketWidth + 8}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>
        <rect x="${bodyX + 8 + (bucketWidth + 8) * 2}" y="${bodyY + 26}" width="${bucketWidth}" height="${bodyH - 36}" rx="5" fill="#ffffff" stroke="#a8beb3" stroke-width="1"/>`;
    }
    case 'motor': {
      const r = Math.min(width, height) * 0.27;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(r)}" font-weight="700" fill="${accent}">M</text>`;
    }
    case 'lighting': {
      const r = Math.min(width, height) * 0.2;
      return `<circle cx="${cx}" cy="${cy + 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx} ${cy - r - 10} V ${cy - r * 0.35} M ${cx - r * 1.4} ${cy + 2} H ${cx + r * 1.4} M ${cx - r * 0.8} ${cy + r * 1.15} H ${cx + r * 0.8}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    case 'receptacle': {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.18;
      const bodyW = width * 0.32;
      const bodyH = height * 0.36;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${cx - 8} ${cy - 6} V ${cy + 4} M ${cx + 8} ${cy - 6} V ${cy + 4}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy + 12}" r="2.2" fill="${accent}"/>`;
    }
    case 'pump': {
      const r = Math.min(width, height) * 0.24;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - r * 1.6} ${cy} H ${cx - r * 0.3} M ${cx + r * 0.3} ${cy} H ${cx + r * 1.6}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - r * 0.55} ${cy} H ${cx + r * 0.55} M ${cx + r * 0.25} ${cy - r * 0.35} L ${cx + r * 0.55} ${cy} L ${cx + r * 0.25} ${cy + r * 0.35}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'heat_exchanger': {
      const bodyX = x + 16;
      const bodyY = y + 10;
      const bodyW = width - 32;
      const bodyH = height - 20;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 10} ${bodyY + 12} L ${bodyX + bodyW - 10} ${bodyY + bodyH - 12} M ${bodyX + bodyW - 10} ${bodyY + 12} L ${bodyX + 10} ${bodyY + bodyH - 12}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    case 'tank': {
      const r = Math.min(width, height) * 0.22;
      const top = cy - r * 1.2;
      const bottom = cy + r * 1.25;
      return `<ellipse cx="${cx}" cy="${top}" rx="${r}" ry="${r * 0.45}" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
        <path d="M ${cx - r} ${top} V ${bottom} M ${cx + r} ${top} V ${bottom}" fill="none" stroke="${stroke}" stroke-width="1.7"/>
        <ellipse cx="${cx}" cy="${bottom}" rx="${r}" ry="${r * 0.45}" fill="none" stroke="${stroke}" stroke-width="1.7"/>`;
    }
    case 'valve': {
      const r = Math.min(width, height) * 0.16;
      return `<path d="M ${cx - r * 2.4} ${cy} H ${cx - r} M ${cx + r} ${cy} H ${cx + r * 2.4}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M ${cx - r} ${cy - r} L ${cx} ${cy} L ${cx - r} ${cy + r} M ${cx + r} ${cy - r} L ${cx} ${cy} L ${cx + r} ${cy + r}" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'equipment':
    case 'device':
    default: {
      const bodyX = cx - width * 0.16;
      const bodyY = cy - height * 0.18;
      const bodyW = width * 0.32;
      const bodyH = height * 0.36;
      return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <path d="M ${bodyX + 8} ${bodyY + 8} L ${bodyX + bodyW - 8} ${bodyY + bodyH - 8} M ${bodyX + bodyW - 8} ${bodyY + 8} L ${bodyX + 8} ${bodyY + bodyH - 8}" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  }
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
        symbol: nodeMatch[3] ?? null,
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

    const paramMatch = line.match(PARAM_RE);
    if (paramMatch) {
      ast.statements.push({
        type: 'ParamDeclaration',
        nodeId: paramMatch[1],
        key: paramMatch[2],
        value: paramMatch[3] !== undefined ? paramMatch[3] : paramMatch[4],
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

      nodes.set(statement.id, {
        id: statement.id,
        label: statement.label,
        symbol: statement.symbol ?? null,
        params: {},
      });
      continue;
    }

    if (statement.type === 'ParamDeclaration') {
      if (!nodes.has(statement.nodeId)) {
        throw new SyntaxError(`Unknown node "${statement.nodeId}" for param at line ${statement.line}.`);
      }

      nodes.get(statement.nodeId).params[statement.key] = statement.value;
      continue;
    }

    if (statement.type === 'EdgeDeclaration') {
      if (!nodes.has(statement.from)) {
        throw new SyntaxError(`Unknown source node "${statement.from}" for edge at line ${statement.line}.`);
      }
      if (!nodes.has(statement.to)) {
        throw new SyntaxError(`Unknown target node "${statement.to}" for edge at line ${statement.line}.`);
      }

      edges.push({
        from: statement.from,
        to: statement.to,
        label: statement.label,
      });
    }
  }

  return {
    type: 'CompiledDiagram',
    title: ast.title,
    nodes: [...nodes.values()],
    edges,
  };
}

function buildGraph(compiled) {
  const order = compiled.nodes.map((node) => node.id);
  const outgoing = new Map(order.map((id) => [id, []]));
  const incoming = new Map(order.map((id) => [id, []]));
  const indegree = new Map(order.map((id) => [id, 0]));

  for (const edge of compiled.edges) {
    outgoing.get(edge.from).push(edge);
    incoming.get(edge.to).push(edge);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = order.filter((id) => (indegree.get(id) ?? 0) === 0);
  const topo = [];
  const seen = new Set();

  while (queue.length) {
    const id = queue.shift();
    topo.push(id);
    seen.add(id);

    for (const edge of outgoing.get(id) ?? []) {
      const nextDegree = (indegree.get(edge.to) ?? 0) - 1;
      indegree.set(edge.to, nextDegree);
      if (nextDegree === 0) {
        queue.push(edge.to);
      }
    }
  }

  for (const id of order) {
    if (!seen.has(id)) {
      topo.push(id);
    }
  }

  const level = new Map();
  for (const id of topo) {
    let maxLevel = 0;
    for (const edge of incoming.get(id) ?? []) {
      maxLevel = Math.max(maxLevel, (level.get(edge.from) ?? 0) + 1);
    }
    level.set(id, maxLevel);
  }

  const primaryParent = new Map();
  for (const edge of compiled.edges) {
    if (!primaryParent.has(edge.to)) {
      primaryParent.set(edge.to, edge.from);
    }
  }

  const treeChildren = new Map(order.map((id) => [id, []]));
  for (const edge of compiled.edges) {
    if (primaryParent.get(edge.to) === edge.from) {
      treeChildren.get(edge.from).push(edge.to);
    }
  }

  const roots = [];
  const rootSet = new Set();
  for (const id of order) {
    if ((incoming.get(id) ?? []).length === 0) {
      roots.push(id);
      rootSet.add(id);
    }
  }
  for (const id of topo) {
    if (!primaryParent.has(id) && !rootSet.has(id)) {
      roots.push(id);
      rootSet.add(id);
    }
  }
  if (!roots.length && topo.length) {
    roots.push(topo[0]);
  }

  return {
    outgoing,
    incoming,
    topo,
    level,
    treeChildren,
    roots,
  };
}

function layoutDiagram(compiled, options = {}) {
  const margin = options.margin ?? 52;
  const titleOffset = compiled.title ? 64 : 28;
  const columnGap = options.columnGap ?? 136;
  const rowGap = options.rowGap ?? 46;
  const rootGap = options.rootGap ?? 70;

  const graph = buildGraph(compiled);
  const nodesById = new Map(compiled.nodes.map((node) => [node.id, getNodeVisual(node)]));
  const maxLevel = Math.max(...compiled.nodes.map((node) => graph.level.get(node.id) ?? 0), 0);
  const levelWidths = Array.from({ length: maxLevel + 1 }, () => 0);

  for (const node of nodesById.values()) {
    const nodeLevel = graph.level.get(node.id) ?? 0;
    levelWidths[nodeLevel] = Math.max(levelWidths[nodeLevel], node.totalWidth);
  }

  const xPositions = [];
  for (let index = 0; index <= maxLevel; index += 1) {
    if (index === 0) {
      xPositions.push(margin);
      continue;
    }
    xPositions.push(xPositions[index - 1] + levelWidths[index - 1] + columnGap);
  }

  for (const node of nodesById.values()) {
    const nodeLevel = graph.level.get(node.id) ?? 0;
    const blockX = xPositions[nodeLevel] + (levelWidths[nodeLevel] - node.totalWidth) / 2;
    node.level = nodeLevel;
    node.blockX = blockX;
    node.deviceX = blockX + (node.totalWidth - node.deviceWidth) / 2;
    node.paramX = node.paramWidth ? blockX + (node.totalWidth - node.paramWidth) / 2 : blockX;
  }

  const subtreeHeightMemo = new Map();
  function getSubtreeHeight(nodeId) {
    if (subtreeHeightMemo.has(nodeId)) {
      return subtreeHeightMemo.get(nodeId);
    }

    const node = nodesById.get(nodeId);
    const children = graph.treeChildren.get(nodeId) ?? [];
    let subtreeHeight = node.totalHeight;

    if (children.length) {
      const childHeight = children.reduce((sum, childId, index) => {
        return sum + getSubtreeHeight(childId) + (index > 0 ? rowGap : 0);
      }, 0);
      subtreeHeight = Math.max(subtreeHeight, childHeight);
    }

    subtreeHeightMemo.set(nodeId, subtreeHeight);
    return subtreeHeight;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function assignNode(nodeId, top) {
    const node = nodesById.get(nodeId);
    const children = graph.treeChildren.get(nodeId) ?? [];
    const subtreeHeight = getSubtreeHeight(nodeId);
    let firstChildCenterY = null;
    let lastChildCenterY = null;

    if (children.length) {
      const totalChildrenHeight = children.reduce((sum, childId, index) => {
        return sum + getSubtreeHeight(childId) + (index > 0 ? rowGap : 0);
      }, 0);
      let cursor = top + (subtreeHeight - totalChildrenHeight) / 2;

      for (const childId of children) {
        assignNode(childId, cursor);
        const child = nodesById.get(childId);
        if (firstChildCenterY === null) {
          firstChildCenterY = child.portY;
        }
        lastChildCenterY = child.portY;
        cursor += getSubtreeHeight(childId) + rowGap;
      }
    }

    if (firstChildCenterY !== null && lastChildCenterY !== null) {
      const desiredTop = (firstChildCenterY + lastChildCenterY) / 2 - node.deviceHeight / 2;
      node.blockY = clamp(desiredTop, top, top + subtreeHeight - node.totalHeight);
    } else {
      node.blockY = top + (subtreeHeight - node.totalHeight) / 2;
    }

    node.deviceY = node.blockY;
    node.paramY = node.paramHeight ? node.deviceY + node.deviceHeight + 14 : null;
    node.portY = node.deviceY + node.deviceHeight / 2;
    node.portInX = node.deviceX;
    node.portOutX = node.deviceX + node.deviceWidth;
  }

  const assigned = new Set();
  let cursor = margin + titleOffset;
  for (const rootId of graph.roots) {
    if (assigned.has(rootId)) {
      continue;
    }
    assignNode(rootId, cursor);

    const stack = [rootId];
    while (stack.length) {
      const currentId = stack.pop();
      if (assigned.has(currentId)) {
        continue;
      }
      assigned.add(currentId);
      for (const childId of graph.treeChildren.get(currentId) ?? []) {
        stack.push(childId);
      }
    }

    cursor += getSubtreeHeight(rootId) + rootGap;
  }

  for (const nodeId of graph.topo) {
    if (!assigned.has(nodeId)) {
      assignNode(nodeId, cursor);
      assigned.add(nodeId);
      cursor += getSubtreeHeight(nodeId) + rootGap;
    }
  }

  const outgoingSlots = new Map();
  for (const [sourceId, edges] of graph.outgoing.entries()) {
    const ordered = [...edges].sort((left, right) => {
      const leftTarget = nodesById.get(left.to);
      const rightTarget = nodesById.get(right.to);
      return leftTarget.portY - rightTarget.portY;
    });

    ordered.forEach((edge, index) => {
      outgoingSlots.set(`${sourceId}->${edge.to}`, index);
    });
  }

  const edgeLayouts = compiled.edges.map((edge) => {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    const siblingCount = (graph.outgoing.get(edge.from) ?? []).length;
    const slot = outgoingSlots.get(`${edge.from}->${edge.to}`) ?? 0;
    const availableGap = Math.max(28, to.portInX - from.portOutX - 48);
    const slotStep = siblingCount > 1 ? Math.min(18, availableGap / (siblingCount + 1)) : 0;
    let laneX = from.portOutX + 28 + slot * slotStep;
    const maxLaneX = to.portInX - 28;

    if (laneX > maxLaneX) {
      laneX = from.portOutX + Math.max(18, (to.portInX - from.portOutX) / 2);
    }

    const path = `M ${from.portOutX} ${from.portY} H ${laneX} V ${to.portY} H ${to.portInX}`;

    return {
      ...edge,
      from,
      to,
      path,
      labelX: Math.min(laneX + 8, to.portInX - 52),
      labelY: from.portY === to.portY ? from.portY - 8 : (from.portY + to.portY) / 2 - 6,
    };
  });

  const width = xPositions[maxLevel] + levelWidths[maxLevel] + margin;
  const height = cursor + margin - rootGap;

  return {
    width: Math.max(width, 320),
    height: Math.max(height, 240),
    titleOffset,
    nodes: [...nodesById.values()],
    edges: edgeLayouts,
  };
}

function renderNodeBlock(node) {
  const portPad = 18;
  const bodyX = node.deviceX + portPad;
  const bodyY = node.deviceY;
  const bodyWidth = node.deviceWidth - portPad * 2;
  const bodyHeight = node.deviceHeight;
  const chipWidth = Math.max(54, node.spec.typeLabel.length * 7 + 18);
  const symbolPanelX = bodyX + 12;
  const symbolPanelY = bodyY + 28;
  const labelStartY = bodyY + bodyHeight - 18 - (node.labelLines.length - 1) * node.labelLineHeight;
  const symbolPanelHeight = Math.max(28, labelStartY - symbolPanelY - 10);
  const paramRect = node.paramHeight
    ? `<rect x="${node.paramX}" y="${node.paramY}" width="${node.paramWidth}" height="${node.paramHeight}" rx="12" fill="#ffffff" stroke="#c4d0d8" stroke-width="1.1"/>
      ${renderTextLines(node.paramLines, node.paramX + 12, node.paramY + 16, {
        anchor: 'start',
        fontSize: 11,
        fontFamily: 'Cascadia Code, Source Code Pro, monospace',
        fill: '#4c6070',
        lineHeightPx: 16,
      })}`
    : '';

  return `<g data-id="${escapeXml(node.id)}" data-symbol="${escapeXml(node.symbol)}" data-level="${node.level}">
    <path d="M ${node.portInX} ${node.portY} H ${bodyX}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M ${bodyX + bodyWidth} ${node.portY} H ${node.portOutX}" fill="none" stroke="${node.spec.stroke}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="${node.portInX}" cy="${node.portY}" r="3.2" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1.5"/>
    <circle cx="${node.portOutX}" cy="${node.portY}" r="3.2" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1.5"/>
    <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="16" fill="${node.spec.fill}" stroke="${node.spec.stroke}" stroke-width="1.8"/>
    <rect x="${bodyX + 10}" y="${bodyY + 8}" width="${chipWidth}" height="18" rx="9" fill="#ffffff" stroke="${node.spec.stroke}" stroke-width="1"/>
    <text x="${bodyX + 10 + chipWidth / 2}" y="${bodyY + 21}" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="10" font-weight="700" letter-spacing="0.5" fill="${node.spec.accent}">${escapeXml(node.spec.typeLabel)}</text>
    <path d="M ${bodyX + 10} ${bodyY + 32} H ${bodyX + bodyWidth - 10}" fill="none" stroke="#cad6dd" stroke-width="1.1" stroke-linecap="round"/>
    <rect x="${symbolPanelX}" y="${symbolPanelY}" width="${bodyWidth - 24}" height="${symbolPanelHeight}" rx="12" fill="${node.spec.innerFill}" stroke="#d7e0e6" stroke-width="1"/>
    ${renderSymbolGlyph(node.symbol, symbolPanelX, symbolPanelY, bodyWidth - 24, symbolPanelHeight, node.spec)}
    ${renderTextLines(node.labelLines, bodyX + bodyWidth / 2, labelStartY, {
      fontSize: node.labelFontSize,
      fontWeight: '700',
      fill: '#1a2833',
      lineHeightPx: node.labelLineHeight,
    })}
    ${paramRect}
  </g>`;
}

function renderEdge(edge) {
  const label = edge.label
    ? `<rect x="${edge.labelX - 6}" y="${edge.labelY - 11}" width="${Math.max(44, edge.label.length * 6.7 + 12)}" height="18" rx="9" fill="#fcfcfb" stroke="#d1dae0" stroke-width="0.8"/>
      <text x="${edge.labelX}" y="${edge.labelY + 2}" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#425664">${escapeXml(edge.label)}</text>`
    : '';

  return `<g data-edge-from="${escapeXml(edge.from.id)}" data-edge-to="${escapeXml(edge.to.id)}">
    <path d="${edge.path}" fill="none" stroke="#314e62" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    ${label}
  </g>`;
}

function renderCompiledSvg(compiled, options) {
  if (!compiled || compiled.type !== 'CompiledDiagram') {
    throw new TypeError('renderSvg expects a source string or compileDiagram output.');
  }
  if (!compiled.nodes.length) {
    throw new Error('Compiled diagram has no nodes.');
  }

  const layout = layoutDiagram(compiled, options);
  const title = compiled.title
    ? `<text x="${layout.width / 2}" y="44" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="20" font-weight="700" fill="#1a2833">${escapeXml(compiled.title)}</text>
      <text x="${layout.width / 2}" y="64" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-size="11" fill="#637583">Hierarchical single-line arrangement with left/right ports and device-specific symbols</text>`
    : '';

  const edgeBlocks = layout.edges.map(renderEdge).join('');
  const nodeBlocks = layout.nodes.map(renderNodeBlock).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="diagjs diagram">
    <rect x="10" y="10" width="${layout.width - 20}" height="${layout.height - 20}" rx="26" fill="#fcfbf7" stroke="#c7d1d8" stroke-width="1.2"/>
    <rect x="24" y="24" width="${layout.width - 48}" height="${layout.height - 48}" rx="18" fill="none" stroke="#dce3e8" stroke-width="1"/>
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
