import { describe, expect, it } from 'vitest';
import mermaidAPI from '../../mermaidAPI.js';
import { compileSld } from './engine.js';
import { DEVICE_CATALOG } from './device-catalog.js';
import { SLD_ICON_PACK } from './symbol-icons.js';
import { SLD_SYMBOL_SPECS } from './symbol-specs.js';

describe('sld', () => {
  it('parses and expands ATSS into bus + single-point devices', () => {
    const input = `sld LR
UTIL1 --> ATSS1:norm
GENS1 --> ATSS1:emer
ATSS1:load ==> SWGR1`;

    const { expanded } = compileSld(input);
    const ids = expanded.nodes.map((node) => node.id);

    expect(ids).toContain('BRKR_ATSS1_NORM');
    expect(ids).toContain('BRKR_ATSS1_EMER');
    expect(ids).toContain('BUSS_ATSS1_COM');
    expect(ids).not.toContain('ATSS1');
  });

  it('rejects unknown device codes', () => {
    const input = `sld LR
XXXX1 --> LOAD1`;

    expect(() => compileSld(input)).toThrow(/Unknown device code "X{4}"/);
  });

  it('enforces single-point constraints on non-bus devices', () => {
    const input = `sld LR
BUSS1 --> BRKR1
BRKR1 --> LOAD1
BRKR1 --> LOAD2`;

    expect(() => compileSld(input)).toThrow(/single-point rule/);
  });

  it('requires explicit assembly input port when ambiguous', () => {
    const input = `sld LR
UTIL1 --> ATSS1`;

    expect(() => compileSld(input)).toThrow(/without a port/);
  });

  it('checks voltage mismatch for direct non-transformer links', () => {
    const input = `sld LR
SWGR1{v="480V"} --> PNLB1{v="208V"}`;

    expect(() => compileSld(input)).toThrow(/Voltage mismatch/);
  });

  it('detects graph-header SLD input through mermaidAPI', async () => {
    const input = `graph LR
UTIL1[Utility]{v="480V"} --> BRKR1 --> SWGR1{v="480V"}`;

    const result = await mermaidAPI.parse(input);
    expect(result.diagramType).toBe('sld');
  });

  it('emits icon-backed flowchart node declarations', () => {
    const input = `sld LR
UTIL1[Utility] --> BRKR1 --> PNLB1[Panel]`;

    const { flowchartText } = compileSld(input);
    expect(flowchartText).toContain('UTIL1@{ icon: "sld:util"');
    expect(flowchartText).toContain('BRKR1@{ icon: "sld:brkr"');
    expect(flowchartText).toContain('classDef sld_node');
    expect(flowchartText).toContain('classDef sld_src');
    expect(flowchartText).toContain('classDef sld_inl');
    expect(flowchartText).toContain('linkStyle default');
    expect(flowchartText).toMatch(/class [^\n]*UTIL1[^\n]* sld_src;/);
    expect(flowchartText).toMatch(/class [^\n]*BRKR1[^\n]* sld_inl;/);
  });

  it('has a symbol spec and icon for every device code', () => {
    const codes = Object.keys(DEVICE_CATALOG);
    expect(Object.keys(SLD_SYMBOL_SPECS).sort()).toEqual([...codes].sort());
    expect(Object.keys(SLD_ICON_PACK.icons).sort()).toEqual(
      [...codes.map((code) => code.toLowerCase())].sort()
    );
  });

  it('has an svg asset file for every device code', async () => {
    const fsPromises = await import('node:fs/promises');
    const path = await import('node:path');
    const files = await fsPromises.readdir(
      path.resolve(process.cwd(), 'packages/mermaid/src/diagrams/sld/symbols')
    );
    const svgCodes = files
      .filter((filename) => filename.endsWith('.svg'))
      .map((filename) => filename.replace(/\.svg$/, ''))
      .sort();
    expect(svgCodes).toEqual([...Object.keys(DEVICE_CATALOG)].sort());
  });
});
