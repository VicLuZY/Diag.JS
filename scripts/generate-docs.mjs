import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const generatedDir = path.join(repoRoot, 'docs', 'reference', 'generated');

const systems = [
  {
    key: 'electrical',
    name: 'Electrical',
    sourceFile: 'src/diagjs.ts',
    docFile: 'electrical.md',
    model: 'electrical',
    description: 'Tree-oriented single-line renderer with voltage strata, assembly presentations, and wire-type inference.',
    symbolConst: 'SYMBOL_LIBRARY',
    aliasConst: 'SYMBOL_ALIASES',
    presentationConst: 'ASSEMBLY_SYMBOLS',
    connectionConst: 'WIRE_TYPES',
    groupingConst: 'VOLTAGE_STRATA',
    groupingLabel: 'Voltage strata',
    connectionLabel: 'Wire types',
  },
  {
    key: 'hvac',
    name: 'HVAC',
    sourceFile: 'src/hvac.ts',
    docFile: 'hvac.md',
    model: 'lane',
    description: 'Lane-based HVAC renderer with dedicated air, water, and control media for mechanical schematics.',
    symbolConst: 'HVAC_SYMBOL_LIBRARY',
    aliasConst: 'HVAC_SYMBOL_ALIASES',
    laneConst: 'LANE_SPECS',
    connectionConst: 'HVAC_MEDIA_LIBRARY',
    connectionLabel: 'Media classes',
  },
  {
    key: 'network',
    name: 'Network',
    sourceFile: 'src/network.ts',
    docFile: 'network.md',
    model: 'lane',
    description: 'Lane-based network renderer for campus, core, fabric, storage, and edge infrastructure diagrams.',
    symbolConst: 'NETWORK_SYMBOLS',
    aliasConst: 'NETWORK_SYMBOL_ALIASES',
    laneConst: 'NETWORK_LANES',
    connectionConst: 'NETWORK_MEDIA',
    connectionLabel: 'Link media',
  },
  {
    key: 'fire-alarm',
    name: 'Fire Alarm',
    sourceFile: 'src/fire-alarm.ts',
    docFile: 'fire-alarm.md',
    model: 'lane',
    description: 'Lane-based fire alarm renderer covering command, network, panel, loop, notification, and field layers.',
    symbolConst: 'FIRE_SYMBOLS',
    aliasConst: 'FIRE_SYMBOL_ALIASES',
    laneConst: 'FIRE_LANES',
    connectionConst: 'FIRE_MEDIA',
    connectionLabel: 'Circuit media',
  },
  {
    key: 'lighting-control',
    name: 'Lighting Control',
    sourceFile: 'src/lighting-control.ts',
    docFile: 'lighting-control.md',
    model: 'lane',
    description: 'Lane-based lighting control renderer for enterprise head-end, room control, fixture, site, and emergency integrations.',
    symbolConst: 'LIGHTING_SYMBOLS',
    aliasConst: 'LIGHTING_SYMBOL_ALIASES',
    laneConst: 'LIGHTING_LANES',
    connectionConst: 'LIGHTING_MEDIA',
    connectionLabel: 'Control media',
  },
];

async function main() {
  await fs.mkdir(generatedDir, { recursive: true });

  const summaries = [];
  for (const system of systems) {
    const source = await fs.readFile(path.join(repoRoot, system.sourceFile), 'utf8');
    const symbols = readObjectLiteral(source, system.symbolConst);
    const aliases = readObjectLiteral(source, system.aliasConst);
    const connections = readLiteral(source, system.connectionConst);
    const lanes = system.laneConst ? readLiteral(source, system.laneConst) : [];
    const groupings = system.groupingConst ? readLiteral(source, system.groupingConst) : [];
    const assemblySymbols = system.presentationConst ? readStringSet(source, system.presentationConst) : new Set();

    const page = renderSystemReference(system, {
      symbols,
      aliases,
      connections,
      lanes,
      groupings,
      assemblySymbols,
    });

    await writeIfChanged(path.join(generatedDir, system.docFile), page);
    summaries.push({
      name: system.name,
      key: system.key,
      symbols: Object.keys(symbols).length,
      aliases: Object.keys(aliases).length,
      lanes: Array.isArray(lanes) ? lanes.length : 0,
      groupings: Array.isArray(groupings) ? groupings.length : 0,
      connections: Array.isArray(connections) ? connections.length : Object.keys(connections).length,
      connectionLabel: system.connectionLabel,
      groupingLabel: system.groupingLabel ?? 'Lanes',
      file: system.docFile,
    });
  }

  await writeIfChanged(path.join(generatedDir, 'index.md'), renderIndexPage(summaries));
}

function renderSystemReference(system, data) {
  const symbolRows = Object.entries(data.symbols)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, spec]) => {
      const row = [
        `\`${key}\``,
        `\`${spec.typeLabel}\``,
        `\`${spec.glyph ?? key}\``,
        `${spec.width} x ${spec.height}`,
      ];

      if (system.model === 'electrical') {
        row.push(data.assemblySymbols.has(key) ? 'Assembly' : 'Device');
      } else {
        row.push(`\`${spec.lane}\``);
      }

      return row;
    });

  const aliasRows = Object.entries(data.aliases)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([alias, canonical]) => [`\`${alias}\``, `\`${canonical}\``]);

  const connectionRows = readConnectionRows(system, data.connections);
  const laneRows = Array.isArray(data.lanes)
    ? data.lanes.map((lane) => [`\`${lane.id}\``, lane.label, String(lane.order)])
    : [];
  const groupingRows = Array.isArray(data.groupings)
    ? data.groupings.map((group) => [`\`${group.key}\``, group.label])
    : [];

  const sections = [];
  sections.push('## Coverage');
  sections.push('');
  sections.push(`- Symbol families: ${symbolRows.length}`);
  sections.push(`- Symbol aliases: ${aliasRows.length}`);
  if (system.model === 'electrical') {
    sections.push(`- Voltage strata: ${groupingRows.length}`);
  } else {
    sections.push(`- Lane bands: ${laneRows.length}`);
  }
  sections.push(`- ${system.connectionLabel}: ${connectionRows.length}`);
  sections.push('');
  sections.push('## Symbol Families');
  sections.push('');
  sections.push(
    markdownTable(
      system.model === 'electrical'
        ? ['Symbol', 'Type Label', 'Glyph', 'Size', 'Presentation']
        : ['Symbol', 'Type Label', 'Glyph', 'Size', 'Default Lane'],
      symbolRows,
    ),
  );
  sections.push('');
  sections.push('## Symbol Aliases');
  sections.push('');
  sections.push('Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.');
  sections.push('');
  sections.push(markdownTable(['Alias', 'Resolves To'], aliasRows));
  sections.push('');

  if (system.model === 'electrical') {
    sections.push('## Voltage Strata');
    sections.push('');
    sections.push('Electrical diagrams group equipment into visual voltage bands based on explicit voltage-like params or symbol heuristics.');
    sections.push('');
    sections.push(markdownTable(['Key', 'Label'], groupingRows));
    sections.push('');
  } else {
    sections.push('## Lanes');
    sections.push('');
    sections.push('Lane renderers use these bands as their stable vertical layout model. Explicit `param <nodeId> lane <laneId>` overrides the default lane assigned by the symbol library or inference rules.');
    sections.push('');
    sections.push(markdownTable(['Lane Id', 'Label', 'Order'], laneRows));
    sections.push('');
  }

  sections.push(`## ${system.connectionLabel}`);
  sections.push('');
  sections.push(
    system.model === 'electrical'
      ? 'Wire types are assigned from edge labels and endpoint types. Use explicit edge labels such as `service`, `branch`, or `control` when you want to steer the visual treatment.'
      : 'Media classes are assigned from edge labels and lane context. Use explicit edge labels for predictable routing legends and line styling.',
  );
  sections.push('');
  sections.push(markdownTable(connectionHeaders(system), connectionRows));
  sections.push('');

  return `# ${system.name} Generated Reference

> Generated from \`${system.sourceFile}\` by \`npm run docs:generate\`. Edit the source library definitions, not this page.

${system.description}

${sections.join('\n')}
`;
}

function renderIndexPage(summaries) {
  const rows = summaries.map((summary) => [
    summary.name,
    String(summary.symbols),
    String(summary.aliases),
    summary.groupings ? `${summary.groupings} ${summary.groupingLabel.toLowerCase()}` : `${summary.lanes} lanes`,
    `${summary.connections} ${summary.connectionLabel.toLowerCase()}`,
    `[Open](./${summary.file})`,
  ]);

  return `# Generated Reference

> Generated from the renderer source files by \`npm run docs:generate\`. Do not edit files in this directory by hand.

This section is the source-backed inventory for:

- Symbol families and fallback device entries
- Symbol aliases
- Lane or voltage grouping definitions
- Wire and media classes used in legends and routed connections

${markdownTable(['System', 'Symbols', 'Aliases', 'Layout Grouping', 'Connection Classes', 'Reference'], rows)}
`;
}

function readConnectionRows(system, connections) {
  if (Array.isArray(connections)) {
    return connections.map((connection) => [
      `\`${connection.key}\``,
      connection.label,
      String(connection.width),
      connection.dasharray ? `\`${connection.dasharray}\`` : 'Solid',
    ]);
  }

  return Object.entries(connections)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, connection]) => [
      `\`${key}\``,
      connection.label,
      `\`${connection.style ?? connection.className ?? 'line'}\``,
      String(connection.width),
      connection.dasharray ? `\`${connection.dasharray}\`` : 'Solid',
    ]);
}

function connectionHeaders(system) {
  return system.model === 'electrical'
    ? ['Key', 'Label', 'Stroke Width', 'Dash Pattern']
    : ['Key', 'Label', 'Style', 'Stroke Width', 'Dash Pattern'];
}

function markdownTable(headers, rows) {
  const safeRows = rows.length ? rows : [headers.map(() => 'None')];
  const body = safeRows.map((row) => `| ${row.map(escapeTableCell).join(' | ')} |`).join('\n');
  return `| ${headers.map(escapeTableCell).join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${body}`;
}

function escapeTableCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function readStringSet(source, constName) {
  const match = source.match(new RegExp(`const\\s+${constName}\\s*=\\s*new Set\\((\\[[\\s\\S]*?\\])\\);`));
  if (!match) {
    throw new Error(`Could not find set literal for ${constName}.`);
  }
  return new Set(evaluateLiteral(match[1]));
}

function readObjectLiteral(source, constName) {
  const value = readLiteral(source, constName);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${constName} did not resolve to an object literal.`);
  }
  return value;
}

function readLiteral(source, constName) {
  const declarationIndex = source.indexOf(`const ${constName}`);
  if (declarationIndex === -1) {
    throw new Error(`Could not find declaration for ${constName}.`);
  }

  const equalsIndex = source.indexOf('=', declarationIndex);
  if (equalsIndex === -1) {
    throw new Error(`Could not find assignment for ${constName}.`);
  }

  const objectIndex = source.indexOf('{', equalsIndex);
  const arrayIndex = source.indexOf('[', equalsIndex);
  const startIndex = chooseLiteralStart(objectIndex, arrayIndex);
  if (startIndex === -1) {
    throw new Error(`Could not find literal start for ${constName}.`);
  }

  const literal = source[startIndex] === '{'
    ? source.slice(startIndex, findMatching(source, startIndex, '{', '}') + 1)
    : source.slice(startIndex, findMatching(source, startIndex, '[', ']') + 1);

  return evaluateLiteral(literal);
}

function chooseLiteralStart(objectIndex, arrayIndex) {
  if (objectIndex === -1) return arrayIndex;
  if (arrayIndex === -1) return objectIndex;
  return Math.min(objectIndex, arrayIndex);
}

function findMatching(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error(`Unbalanced literal starting at index ${startIndex}.`);
}

function evaluateLiteral(literal) {
  return vm.runInNewContext(`(${literal})`, Object.create(null));
}

async function writeIfChanged(filePath, content) {
  let current = null;
  try {
    current = await fs.readFile(filePath, 'utf8');
  } catch {
    current = null;
  }

  if (current === content) {
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

await main();
