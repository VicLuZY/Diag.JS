import { DEVICE_CATALOG, isAssemblyCode, isBusCode, isDeviceCode, type DeviceCode } from './device-catalog.js';
import type {
  Diagram,
  Direction,
  Edge,
  EdgeOp,
  Endpoint,
  Metadata,
  MetaValue,
  Node,
  NodeId,
  Statement,
} from './sld-types.js';

type ParsedEndpoint = {
  endpoint: Endpoint;
  node: Node;
};

export type ParsedSld = {
  diagram: Diagram;
  nodes: Node[];
  edges: Edge[];
};

export type ExpandedSld = {
  direction: Direction;
  nodes: Node[];
  edges: Edge[];
  portMap: Record<string, Endpoint>;
  expandedAssemblies: string[];
};

export type AtssProfile = 'basic' | 'bypass' | 'bypass_iso';

export type AtssConfig = {
  profile?: AtssProfile;
  out_breaker?: boolean;
  bypass_norm?: boolean;
  bypass_emer?: boolean;
};

export type ExpandedGraph = {
  nodes: Node[];
  edges: Edge[];
  portMap: Record<string, Endpoint>;
};

const DIRECTION_SET = new Set<Direction>(['LR', 'RL', 'TD', 'BU']);
const EDGE_OPS: EdgeOp[] = ['<-->', '-.->', '-->', '==>', '---'];
const DIRECTIONAL_OPS = new Set<EdgeOp>(['-->', '==>', '-.->']);
const BIDIRECTIONAL_OPS = new Set<EdgeOp>(['<-->', '---']);
const TRANSFORMER_CODES = new Set<DeviceCode>(['TRFM', 'AUTO']);

const isTruthy = (value: MetaValue | undefined): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return undefined;
};

const normalizeState = (value: MetaValue | undefined) => {
  if (value === undefined) {
    return '';
  }
  return String(value).trim().toUpperCase();
};

const skipWhitespace = (line: string, index: number) => {
  let cursor = index;
  while (cursor < line.length && /\s/.test(line[cursor])) {
    cursor++;
  }
  return cursor;
};

const parseCodeFromId = (id: string): DeviceCode => {
  const code = id.slice(0, 4);
  if (!/^[A-Z]{4}$/.test(code)) {
    throw new Error(`Invalid node id "${id}". Device code must be 4 uppercase characters.`);
  }
  if (!isDeviceCode(code)) {
    throw new Error(`Unknown device code "${code}" in node id "${id}".`);
  }
  return code;
};

const createNodeFromId = (
  id: string,
  data: { label?: string; meta?: Metadata } = {}
): Node => {
  const code = parseCodeFromId(id);
  return {
    id: id as NodeId,
    code,
    category: DEVICE_CATALOG[code].category,
    ...(data.label ? { label: data.label } : {}),
    ...(data.meta ? { meta: data.meta } : {}),
  };
};

const mergeNodes = (existing: Node | undefined, incoming: Node) => {
  if (!existing) {
    return incoming;
  }
  const mergedMeta =
    existing.meta || incoming.meta ? { ...(existing.meta ?? {}), ...(incoming.meta ?? {}) } : undefined;
  return {
    ...existing,
    label: incoming.label ?? existing.label,
    ...(mergedMeta ? { meta: mergedMeta } : {}),
  };
};

const readUntil = (
  source: string,
  startIndex: number,
  terminator: string,
  context: string
): { text: string; nextIndex: number } => {
  let cursor = startIndex;
  while (cursor < source.length) {
    if (source[cursor] === terminator) {
      return {
        text: source.slice(startIndex, cursor),
        nextIndex: cursor + 1,
      };
    }
    cursor++;
  }
  throw new Error(`Unterminated ${context}.`);
};

const splitOutsideQuotes = (text: string, separator: string) => {
  const parts: string[] = [];
  let inQuote = false;
  let quoteChar = '';
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
      continue;
    }
    if (inQuote && char === quoteChar && text[i - 1] !== '\\') {
      inQuote = false;
      quoteChar = '';
      continue;
    }
    if (!inQuote && char === separator) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
};

const parseMetaValue = (value: string): MetaValue => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  return trimmed;
};

const parseMetadata = (
  line: string,
  startIndex: number
): { metadata: Metadata; nextIndex: number } | null => {
  if (line[startIndex] !== '{') {
    return null;
  }
  let cursor = startIndex + 1;
  let inQuote = false;
  let quoteChar = '';

  while (cursor < line.length) {
    const char = line[cursor];
    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
      cursor++;
      continue;
    }
    if (inQuote && char === quoteChar && line[cursor - 1] !== '\\') {
      inQuote = false;
      quoteChar = '';
      cursor++;
      continue;
    }
    if (!inQuote && char === '}') {
      const body = line.slice(startIndex + 1, cursor).trim();
      const metadata: Metadata = {};
      if (body.length > 0) {
        for (const segment of splitOutsideQuotes(body, ',')) {
          const pair = segment.trim();
          if (pair.length === 0) {
            continue;
          }
          const indexOfEquals = pair.indexOf('=');
          if (indexOfEquals === -1) {
            throw new Error(`Invalid metadata pair "${pair}". Expected "key=value".`);
          }
          const key = pair.slice(0, indexOfEquals).trim();
          const value = pair.slice(indexOfEquals + 1).trim();
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
            throw new Error(`Invalid metadata key "${key}".`);
          }
          metadata[key] = parseMetaValue(value);
        }
      }
      return {
        metadata,
        nextIndex: cursor + 1,
      };
    }
    cursor++;
  }

  throw new Error('Unterminated metadata block.');
};

const parseNodeRef = (line: string, startIndex: number): { id: string; port?: string; nextIndex: number } => {
  let cursor = startIndex;
  const idMatch = line.slice(cursor).match(/^[A-Za-z][A-Za-z0-9_]*/);
  if (!idMatch) {
    throw new Error(`Expected node identifier at "${line.slice(cursor)}".`);
  }
  const id = idMatch[0];
  cursor += id.length;

  let port: string | undefined;
  if (line[cursor] === ':') {
    const portMatch = line.slice(cursor + 1).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (!portMatch) {
      throw new Error(`Invalid port reference after "${id}:".`);
    }
    port = portMatch[0];
    cursor += 1 + port.length;
  }

  return { id, port, nextIndex: cursor };
};

const parseEndpoint = (line: string, startIndex: number): ParsedEndpoint & { nextIndex: number } => {
  let cursor = skipWhitespace(line, startIndex);
  const ref = parseNodeRef(line, cursor);
  cursor = ref.nextIndex;

  cursor = skipWhitespace(line, cursor);
  let label: string | undefined;
  if (line[cursor] === '[') {
    const parsedLabel = readUntil(line, cursor + 1, ']', 'node label');
    label = parsedLabel.text;
    cursor = parsedLabel.nextIndex;
    cursor = skipWhitespace(line, cursor);
  }

  let meta: Metadata | undefined;
  const parsedMeta = parseMetadata(line, cursor);
  if (parsedMeta) {
    meta = parsedMeta.metadata;
    cursor = skipWhitespace(line, parsedMeta.nextIndex);
  }

  const node = createNodeFromId(ref.id, { label, meta });
  return {
    endpoint: {
      id: node.id,
      ...(ref.port ? { port: ref.port } : {}),
    },
    node,
    nextIndex: cursor,
  };
};

const parseEdgeOp = (line: string, startIndex: number): { op: EdgeOp; nextIndex: number } | null => {
  const cursor = skipWhitespace(line, startIndex);
  const segment = line.slice(cursor);
  for (const candidate of EDGE_OPS) {
    if (segment.startsWith(candidate)) {
      return {
        op: candidate,
        nextIndex: cursor + candidate.length,
      };
    }
  }
  return null;
};

const parseEdgeLabel = (line: string, startIndex: number): { label: string; nextIndex: number } | null => {
  let cursor = skipWhitespace(line, startIndex);
  if (line[cursor] !== '|') {
    return null;
  }
  const parsed = readUntil(line, cursor + 1, '|', 'edge label');
  cursor = skipWhitespace(line, parsed.nextIndex);
  return {
    label: parsed.text,
    nextIndex: cursor,
  };
};

const parseEdgeLine = (
  line: string
): { statements: Statement[]; lastEndpoint: Endpoint } | null => {
  let cursor = 0;
  const inlineNodes: Node[] = [];

  const firstEndpoint = parseEndpoint(line, cursor);
  inlineNodes.push(firstEndpoint.node);
  cursor = firstEndpoint.nextIndex;
  const edges: Edge[] = [];
  let previousEndpoint = firstEndpoint.endpoint;

  while (true) {
    const opResult = parseEdgeOp(line, cursor);
    if (!opResult) {
      break;
    }
    cursor = opResult.nextIndex;
    let edgeLabel: string | undefined;
    const labelResult = parseEdgeLabel(line, cursor);
    if (labelResult) {
      edgeLabel = labelResult.label;
      cursor = labelResult.nextIndex;
    } else {
      cursor = skipWhitespace(line, cursor);
    }

    const nextEndpoint = parseEndpoint(line, cursor);
    inlineNodes.push(nextEndpoint.node);
    cursor = nextEndpoint.nextIndex;

    edges.push({
      from: previousEndpoint,
      op: opResult.op,
      ...(edgeLabel ? { label: edgeLabel } : {}),
      to: nextEndpoint.endpoint,
    });
    previousEndpoint = nextEndpoint.endpoint;
  }

  if (edges.length === 0) {
    return null;
  }

  cursor = skipWhitespace(line, cursor);
  let trailingMeta: Metadata | undefined;
  const metadataResult = parseMetadata(line, cursor);
  if (metadataResult) {
    trailingMeta = metadataResult.metadata;
    cursor = skipWhitespace(line, metadataResult.nextIndex);
  }
  if (cursor < line.length) {
    throw new Error(`Unexpected token in edge statement near "${line.slice(cursor)}".`);
  }

  const statements: Statement[] = inlineNodes.map((node) => ({ kind: 'node', node }));
  for (const edge of edges) {
    statements.push({
      kind: 'edge',
      edge: trailingMeta ? { ...edge, meta: trailingMeta } : edge,
    });
  }

  return {
    statements,
    lastEndpoint: previousEndpoint,
  };
};

const parseNodeLine = (line: string): Statement[] => {
  const endpointResult = parseEndpoint(line, 0);
  const cursor = skipWhitespace(line, endpointResult.nextIndex);
  if (cursor < line.length) {
    throw new Error(`Unexpected token in node declaration near "${line.slice(cursor)}".`);
  }
  if (endpointResult.endpoint.port) {
    throw new Error(`Port declarations are not allowed on standalone node statements ("${line}").`);
  }
  return [{ kind: 'node', node: endpointResult.node }];
};

const flattenStatements = (
  statements: Statement[],
  nodeById: Map<string, Node>,
  edges: Edge[]
) => {
  for (const statement of statements) {
    if (statement.kind === 'node') {
      const merged = mergeNodes(nodeById.get(statement.node.id), statement.node);
      nodeById.set(statement.node.id, merged);
      continue;
    }
    if (statement.kind === 'edge') {
      edges.push(statement.edge);
      if (!nodeById.has(statement.edge.from.id)) {
        nodeById.set(statement.edge.from.id, createNodeFromId(statement.edge.from.id));
      }
      if (!nodeById.has(statement.edge.to.id)) {
        nodeById.set(statement.edge.to.id, createNodeFromId(statement.edge.to.id));
      }
      continue;
    }
    if (statement.kind === 'subgraph') {
      flattenStatements(statement.statements, nodeById, edges);
      continue;
    }
  }
};

const listInPorts = (code: DeviceCode) => {
  return Object.entries(DEVICE_CATALOG[code].ports)
    .filter(([, portDef]) => portDef.dir === 'in' || portDef.dir === 'io')
    .map(([name]) => name);
};

const listOutPorts = (code: DeviceCode) => {
  return Object.entries(DEVICE_CATALOG[code].ports)
    .filter(([, portDef]) => portDef.dir === 'out' || portDef.dir === 'io')
    .map(([name]) => name);
};

type PortShape = { dir: 'in' | 'out' | 'io'; kind?: 'power' | 'control'; note?: string };

const getPortDef = (code: DeviceCode, portName: string) => {
  return (DEVICE_CATALOG[code].ports as Record<string, PortShape>)[portName];
};

const validatePortReferences = (nodes: Map<string, Node>, edges: Edge[]) => {
  for (const edge of edges) {
    const fromNode = nodes.get(edge.from.id);
    const toNode = nodes.get(edge.to.id);
    if (!fromNode || !toNode) {
      throw new Error(`Unknown endpoint in edge ${edge.from.id} ${edge.op} ${edge.to.id}.`);
    }

    if (edge.from.port) {
      const fromCode = parseCodeFromId(fromNode.id);
      const fromPortDef = getPortDef(fromCode, edge.from.port);
      if (!fromPortDef) {
        throw new Error(`Unknown port "${edge.from.port}" on node "${edge.from.id}".`);
      }
      if (DIRECTIONAL_OPS.has(edge.op) && fromPortDef.dir === 'in') {
        throw new Error(`Port "${edge.from.id}:${edge.from.port}" cannot be used as edge source.`);
      }
    }

    if (edge.to.port) {
      const toCode = parseCodeFromId(toNode.id);
      const toPortDef = getPortDef(toCode, edge.to.port);
      if (!toPortDef) {
        throw new Error(`Unknown port "${edge.to.port}" on node "${edge.to.id}".`);
      }
      if (DIRECTIONAL_OPS.has(edge.op) && toPortDef.dir === 'out') {
        throw new Error(`Port "${edge.to.id}:${edge.to.port}" cannot be used as edge target.`);
      }
    }
  }
};

const resolveAssemblyEndpoint = (
  endpoint: Endpoint,
  role: 'from' | 'to',
  expansionMap: Map<string, AssemblyExpansion>
): Endpoint => {
  const expansion = expansionMap.get(endpoint.id);
  if (!expansion) {
    return endpoint;
  }

  if (endpoint.port) {
    const specific = expansion.portMap[`${endpoint.id}:${endpoint.port}`];
    if (!specific) {
      throw new Error(`Unknown assembly port "${endpoint.id}:${endpoint.port}".`);
    }
    return specific;
  }

  if (role === 'from') {
    const loadEndpoint = expansion.portMap[`${endpoint.id}:load`];
    if (loadEndpoint) {
      return loadEndpoint;
    }
    const outputPorts = listOutPorts(parseCodeFromId(expansion.originalNode.id));
    if (outputPorts.length === 1) {
      const fallback = expansion.portMap[`${endpoint.id}:${outputPorts[0]}`];
      if (fallback) {
        return fallback;
      }
    }
    throw new Error(
      `Assembly "${endpoint.id}" used as source without a port, but no unique output port exists.`
    );
  }

  const inputPorts = listInPorts(parseCodeFromId(expansion.originalNode.id));
  if (inputPorts.length === 1) {
    const fallback = expansion.portMap[`${endpoint.id}:${inputPorts[0]}`];
    if (fallback) {
      return fallback;
    }
  }
  throw new Error(
    `Assembly "${endpoint.id}" used as target without a port, but multiple input ports exist.`
  );
};

export const parseSld = (input: string): ParsedSld => {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const rootStatements: Statement[] = [];
  const statementStack: Statement[][] = [rootStatements];
  let direction: Direction = 'LR';
  let headerSeen = false;
  let lastEndpoint: Endpoint | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (!headerSeen) {
      const headerMatch = trimmed.match(/^(?:sld|graph)\s+(LR|RL|TD|BU)\s*$/i);
      if (headerMatch) {
        const candidate = headerMatch[1].toUpperCase() as Direction;
        if (!DIRECTION_SET.has(candidate)) {
          throw new Error(`Unknown direction "${headerMatch[1]}".`);
        }
        direction = candidate;
        headerSeen = true;
        continue;
      }
    }

    if (trimmed.startsWith('%%')) {
      statementStack.at(-1)?.push({ kind: 'comment', text: trimmed.slice(2).trim() });
      continue;
    }

    const subgraphMatch = trimmed.match(/^subgraph\s+(.+)$/i);
    if (subgraphMatch) {
      const subgraphStatement: Statement = {
        kind: 'subgraph',
        title: subgraphMatch[1].trim(),
        statements: [],
      };
      statementStack.at(-1)?.push(subgraphStatement);
      statementStack.push(subgraphStatement.statements);
      lastEndpoint = null;
      continue;
    }

    if (/^end$/i.test(trimmed)) {
      if (statementStack.length === 1) {
        throw new Error('Unexpected "end" without matching "subgraph".');
      }
      statementStack.pop();
      lastEndpoint = null;
      continue;
    }

    let statementLine = trimmed;
    if (/^(<-->|-.->|-->|==>|---)/.test(statementLine)) {
      if (!lastEndpoint) {
        throw new Error(`Edge continuation "${statementLine}" has no previous endpoint.`);
      }
      const endpointRef = lastEndpoint.port ? `${lastEndpoint.id}:${lastEndpoint.port}` : lastEndpoint.id;
      statementLine = `${endpointRef} ${statementLine}`;
    }

    const edgeParseResult = parseEdgeLine(statementLine);
    if (edgeParseResult) {
      statementStack.at(-1)?.push(...edgeParseResult.statements);
      lastEndpoint = edgeParseResult.lastEndpoint;
      continue;
    }

    const nodeStatements = parseNodeLine(statementLine);
    statementStack.at(-1)?.push(...nodeStatements);
    lastEndpoint = null;
  }

  if (statementStack.length !== 1) {
    throw new Error('Unclosed subgraph block. Missing "end".');
  }
  if (!headerSeen) {
    throw new Error('Missing SLD header. Expected "sld <DIR>" or "graph <DIR>".');
  }

  const nodeById = new Map<string, Node>();
  const edges: Edge[] = [];
  flattenStatements(rootStatements, nodeById, edges);
  validatePortReferences(nodeById, edges);

  return {
    diagram: {
      direction,
      statements: rootStatements,
    },
    nodes: [...nodeById.values()],
    edges,
  };
};

const parseAtssConfig = (meta: Metadata | undefined): Required<AtssConfig> => {
  const profileRaw = meta?.profile;
  const profile =
    profileRaw === 'bypass' || profileRaw === 'bypass_iso' || profileRaw === 'basic'
      ? profileRaw
      : 'basic';

  const explicitOutBreaker = isTruthy(meta?.out_breaker);
  const explicitBypassNorm = isTruthy(meta?.bypass_norm);
  const explicitBypassEmer = isTruthy(meta?.bypass_emer);

  const defaultsByProfile: Record<AtssProfile, Pick<Required<AtssConfig>, 'bypass_norm' | 'bypass_emer'>> = {
    basic: { bypass_norm: false, bypass_emer: false },
    bypass: { bypass_norm: true, bypass_emer: false },
    bypass_iso: { bypass_norm: true, bypass_emer: true },
  };

  return {
    profile,
    out_breaker: explicitOutBreaker ?? true,
    bypass_norm: explicitBypassNorm ?? defaultsByProfile[profile].bypass_norm,
    bypass_emer: explicitBypassEmer ?? defaultsByProfile[profile].bypass_emer,
  };
};

const makeBreakerNode = (id: string, label: string) => createNodeFromId(id, { label });
const makeBusNode = (id: string, label: string) => createNodeFromId(id, { label });

export function expandATSS(atss: Node<'ATSS'>): ExpandedGraph {
  const config = parseAtssConfig(atss.meta);

  const normId = `BRKR_${atss.id}_NORM`;
  const emerId = `BRKR_${atss.id}_EMER`;
  const commonBusId = `BUSS_${atss.id}_COM`;
  const outId = `BRKR_${atss.id}_OUT`;
  const bypassNormId = `BRKR_${atss.id}_BPN`;
  const bypassEmerId = `BRKR_${atss.id}_BPE`;

  const nodes: Node[] = [
    makeBreakerNode(normId, `${atss.id} Normal In`),
    makeBreakerNode(emerId, `${atss.id} Emergency In`),
    makeBusNode(commonBusId, `${atss.id} Common Bus`),
  ];

  const edges: Edge[] = [
    {
      from: { id: normId as NodeId, port: 'out' },
      op: '-->',
      to: { id: commonBusId as NodeId, port: 'bus' },
    },
    {
      from: { id: emerId as NodeId, port: 'out' },
      op: '-->',
      to: { id: commonBusId as NodeId, port: 'bus' },
    },
  ];

  if (config.out_breaker) {
    nodes.push(makeBreakerNode(outId, `${atss.id} Out`));
    edges.push({
      from: { id: commonBusId as NodeId, port: 'bus' },
      op: '-->',
      to: { id: outId as NodeId, port: 'in' },
    });
  }

  if (config.bypass_norm) {
    nodes.push(makeBreakerNode(bypassNormId, `${atss.id} Bypass Normal`));
    edges.push({
      from: { id: bypassNormId as NodeId, port: 'out' },
      op: '-.->',
      to: { id: commonBusId as NodeId, port: 'bus' },
      meta: { state: 'NO' },
    });
  }

  if (config.bypass_emer) {
    nodes.push(makeBreakerNode(bypassEmerId, `${atss.id} Bypass Emergency`));
    edges.push({
      from: { id: bypassEmerId as NodeId, port: 'out' },
      op: '-.->',
      to: { id: commonBusId as NodeId, port: 'bus' },
      meta: { state: 'NO' },
    });
  }

  const portMap: Record<string, Endpoint> = {
    [`${atss.id}:norm`]: { id: normId as NodeId, port: 'in' },
    [`${atss.id}:emer`]: { id: emerId as NodeId, port: 'in' },
    [`${atss.id}:load`]: config.out_breaker
      ? { id: outId as NodeId, port: 'out' }
      : { id: commonBusId as NodeId, port: 'bus' },
  };

  return { nodes, edges, portMap };
}

type AssemblyExpansion = ExpandedGraph & {
  originalNode: Node;
  requiredIds: string[];
};

const expandSTSS = (stss: Node<'STSS'>): AssemblyExpansion => {
  const srcA = `BRKR_${stss.id}_SRCA`;
  const srcB = `BRKR_${stss.id}_SRCB`;
  const common = `BUSS_${stss.id}_COM`;
  const out = `BRKR_${stss.id}_OUT`;

  const nodes = [
    makeBreakerNode(srcA, `${stss.id} Source A`),
    makeBreakerNode(srcB, `${stss.id} Source B`),
    makeBusNode(common, `${stss.id} Common Bus`),
    makeBreakerNode(out, `${stss.id} Out`),
  ];

  const edges: Edge[] = [
    {
      from: { id: srcA as NodeId, port: 'out' },
      op: '-->',
      to: { id: common as NodeId, port: 'bus' },
    },
    {
      from: { id: srcB as NodeId, port: 'out' },
      op: '-->',
      to: { id: common as NodeId, port: 'bus' },
    },
    {
      from: { id: common as NodeId, port: 'bus' },
      op: '-->',
      to: { id: out as NodeId, port: 'in' },
    },
  ];

  return {
    originalNode: stss,
    nodes,
    edges,
    portMap: {
      [`${stss.id}:srcA`]: { id: srcA as NodeId, port: 'in' },
      [`${stss.id}:srcB`]: { id: srcB as NodeId, port: 'in' },
      [`${stss.id}:load`]: { id: out as NodeId, port: 'out' },
    },
    requiredIds: [srcA, srcB, common],
  };
};

const expandUPSS = (upss: Node<'UPSS'>): AssemblyExpansion => {
  const inBreaker = `BRKR_${upss.id}_IN`;
  const internalBus = `BUSS_${upss.id}_COM`;
  const outBreaker = `BRKR_${upss.id}_OUT`;

  const nodes = [
    makeBreakerNode(inBreaker, `${upss.id} In`),
    makeBusNode(internalBus, `${upss.id} Internal Bus`),
    makeBreakerNode(outBreaker, `${upss.id} Out`),
  ];

  const edges: Edge[] = [
    {
      from: { id: inBreaker as NodeId, port: 'out' },
      op: '-->',
      to: { id: internalBus as NodeId, port: 'bus' },
    },
    {
      from: { id: internalBus as NodeId, port: 'bus' },
      op: '-->',
      to: { id: outBreaker as NodeId, port: 'in' },
    },
  ];

  return {
    originalNode: upss,
    nodes,
    edges,
    portMap: {
      [`${upss.id}:in`]: { id: inBreaker as NodeId, port: 'in' },
      [`${upss.id}:out`]: { id: outBreaker as NodeId, port: 'out' },
    },
    requiredIds: [inBreaker, internalBus, outBreaker],
  };
};

const expandAssemblyNode = (node: Node): AssemblyExpansion => {
  const code = parseCodeFromId(node.id);

  if (code === 'ATSS') {
    const expansion = expandATSS({ ...node, code } as Node<'ATSS'>);
    return {
      ...expansion,
      originalNode: node,
      requiredIds: [`BRKR_${node.id}_NORM`, `BRKR_${node.id}_EMER`, `BUSS_${node.id}_COM`],
    };
  }
  if (code === 'STSS') {
    return expandSTSS({ ...node, code } as Node<'STSS'>);
  }
  if (code === 'UPSS') {
    return expandUPSS({ ...node, code } as Node<'UPSS'>);
  }
  throw new Error(`Assembly "${code}" is not supported.`);
};

export const expandAssemblies = (parsed: ParsedSld): ExpandedSld => {
  const nodeById = new Map<string, Node>();
  for (const node of parsed.nodes) {
    nodeById.set(node.id, node);
  }

  const expansionMap = new Map<string, AssemblyExpansion>();
  const combinedPortMap: Record<string, Endpoint> = {};
  const expandedAssemblies: string[] = [];

  for (const node of parsed.nodes) {
    const code = parseCodeFromId(node.id);
    if (!isAssemblyCode(code)) {
      continue;
    }
    const expansion = expandAssemblyNode(node);
    expansionMap.set(node.id, expansion);
    expandedAssemblies.push(node.id);
    for (const [portRef, endpoint] of Object.entries(expansion.portMap)) {
      combinedPortMap[portRef] = endpoint;
    }
  }

  for (const [assemblyId, expansion] of expansionMap.entries()) {
    nodeById.delete(assemblyId);
    for (const expandedNode of expansion.nodes) {
      nodeById.set(expandedNode.id, expandedNode);
    }
  }

  const rewrittenEdges: Edge[] = [];
  for (const edge of parsed.edges) {
    const from = resolveAssemblyEndpoint(edge.from, 'from', expansionMap);
    const to = resolveAssemblyEndpoint(edge.to, 'to', expansionMap);
    rewrittenEdges.push({
      ...edge,
      from,
      to,
    });
  }

  for (const expansion of expansionMap.values()) {
    rewrittenEdges.push(...expansion.edges);
  }

  for (const edge of rewrittenEdges) {
    if (!nodeById.has(edge.from.id)) {
      nodeById.set(edge.from.id, createNodeFromId(edge.from.id));
    }
    if (!nodeById.has(edge.to.id)) {
      nodeById.set(edge.to.id, createNodeFromId(edge.to.id));
    }
  }

  for (const expansion of expansionMap.values()) {
    for (const requiredId of expansion.requiredIds) {
      if (!nodeById.has(requiredId)) {
        throw new Error(
          `Assembly "${expansion.originalNode.id}" failed expansion. Missing node "${requiredId}".`
        );
      }
    }
  }

  return {
    direction: parsed.diagram.direction,
    nodes: [...nodeById.values()],
    edges: rewrittenEdges,
    portMap: combinedPortMap,
    expandedAssemblies,
  };
};

type DegreeCount = { in: number; out: number };

const ensureDegreeEntry = (degrees: Map<string, DegreeCount>, nodeId: string) => {
  if (!degrees.has(nodeId)) {
    degrees.set(nodeId, { in: 0, out: 0 });
  }
  return degrees.get(nodeId)!;
};

const directedConnectionsForEdge = (edge: Edge): Array<[Endpoint, Endpoint]> => {
  if (DIRECTIONAL_OPS.has(edge.op)) {
    return [[edge.from, edge.to]];
  }
  if (BIDIRECTIONAL_OPS.has(edge.op)) {
    return [
      [edge.from, edge.to],
      [edge.to, edge.from],
    ];
  }
  return [];
};

const validateVoltageConsistency = (nodes: Map<string, Node>, edges: Edge[]) => {
  for (const edge of edges) {
    for (const [from, to] of directedConnectionsForEdge(edge)) {
      const fromNode = nodes.get(from.id);
      const toNode = nodes.get(to.id);
      if (!fromNode || !toNode) {
        continue;
      }
      const fromVoltage = fromNode.meta?.v;
      const toVoltage = toNode.meta?.v;
      if (fromVoltage === undefined || toVoltage === undefined) {
        continue;
      }
      if (String(fromVoltage) === String(toVoltage)) {
        continue;
      }
      if (
        TRANSFORMER_CODES.has(parseCodeFromId(fromNode.id)) ||
        TRANSFORMER_CODES.has(parseCodeFromId(toNode.id))
      ) {
        continue;
      }
      throw new Error(
        `Voltage mismatch on edge ${fromNode.id} ${edge.op} ${toNode.id}: "${fromVoltage}" != "${toVoltage}".`
      );
    }
  }
};

const validateNoUnintendedParalleling = (nodes: Map<string, Node>, edges: Edge[]) => {
  for (const node of nodes.values()) {
    if (!isBusCode(parseCodeFromId(node.id))) {
      continue;
    }

    const activeIncoming = edges.filter(
      (edge) =>
        edge.to.id === node.id &&
        edge.op !== '-.->' &&
        normalizeState(edge.meta?.state) !== 'NO' &&
        normalizeState(edge.meta?.state) !== 'NORMALLY_OPEN'
    );
    if (activeIncoming.length === 0) {
      continue;
    }

    const sourceFeeds = new Set<string>();
    let hasInterlock = false;
    for (const edge of activeIncoming) {
      const sourceNode = nodes.get(edge.from.id);
      if (sourceNode?.category === 'SRC') {
        sourceFeeds.add(sourceNode.id);
      }
      hasInterlock = hasInterlock || isTruthy(edge.meta?.interlock) === true;
    }

    if (sourceFeeds.size > 1 && !hasInterlock) {
      throw new Error(
        `Bus "${node.id}" has multiple active direct source feeds (${[...sourceFeeds].join(
          ', '
        )}) without explicit interlock metadata.`
      );
    }
  }
};

export const validateExpandedGraph = (expanded: ExpandedSld) => {
  const nodeById = new Map<string, Node>();
  for (const node of expanded.nodes) {
    nodeById.set(node.id, node);
  }

  validatePortReferences(nodeById, expanded.edges);

  const degrees = new Map<string, DegreeCount>();
  for (const node of expanded.nodes) {
    ensureDegreeEntry(degrees, node.id);
  }

  for (const edge of expanded.edges) {
    const connections = directedConnectionsForEdge(edge);
    for (const [from, to] of connections) {
      const fromDegree = ensureDegreeEntry(degrees, from.id);
      const toDegree = ensureDegreeEntry(degrees, to.id);
      fromDegree.out += 1;
      toDegree.in += 1;
    }
  }

  for (const node of expanded.nodes) {
    const degree = degrees.get(node.id) ?? { in: 0, out: 0 };
    const isBus = isBusCode(parseCodeFromId(node.id));

    if (!isBus && degree.in > 1) {
      throw new Error(`Node "${node.id}" violates single-point rule (in_degree=${degree.in}).`);
    }
    if (!isBus && degree.out > 1) {
      throw new Error(`Node "${node.id}" violates single-point rule (out_degree=${degree.out}).`);
    }
    if (!isBus && (degree.in > 1 || degree.out > 1)) {
      throw new Error(`Branching is only allowed on BUS nodes. Node "${node.id}" is ${node.category}.`);
    }
    if (node.category === 'LOD' && degree.out > 0) {
      throw new Error(`Load "${node.id}" cannot have outgoing power connections.`);
    }
    if (node.category === 'SRC' && degree.in > 0) {
      throw new Error(`Source "${node.id}" cannot have incoming power connections.`);
    }
  }

  validateVoltageConsistency(nodeById, expanded.edges);
  validateNoUnintendedParalleling(nodeById, expanded.edges);
};

const sanitizeNodeLabel = (label: string) => label.replace(/\]/g, ')');
const sanitizeEdgeLabel = (label: string) => label.replace(/\|/g, '/');

export const toFlowchartText = (expanded: ExpandedSld) => {
  const lines: string[] = [`flowchart ${expanded.direction}`];

  const sortedNodes = [...expanded.nodes].sort((left, right) => left.id.localeCompare(right.id));
  for (const node of sortedNodes) {
    if (node.label) {
      lines.push(`${node.id}[${sanitizeNodeLabel(node.label)}]`);
    } else {
      lines.push(node.id);
    }
  }

  for (const edge of expanded.edges) {
    const fromId = edge.from.id;
    const toId = edge.to.id;
    if (edge.label) {
      lines.push(`${fromId} ${edge.op}|${sanitizeEdgeLabel(edge.label)}| ${toId}`);
    } else {
      lines.push(`${fromId} ${edge.op} ${toId}`);
    }
  }

  return `${lines.join('\n')}\n`;
};

export const compileSld = (input: string) => {
  const parsed = parseSld(input);
  const expanded = expandAssemblies(parsed);
  validateExpandedGraph(expanded);
  const flowchartText = toFlowchartText(expanded);
  return {
    parsed,
    expanded,
    flowchartText,
  };
};
