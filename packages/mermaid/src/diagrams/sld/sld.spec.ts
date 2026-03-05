import { describe, expect, it } from 'vitest';
import mermaidAPI from '../../mermaidAPI.js';
import { compileSld } from './engine.js';

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

    expect(() => compileSld(input)).toThrow(/Unknown device code "XXXX"/);
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
});

