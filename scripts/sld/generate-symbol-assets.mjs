#!/usr/bin/env node
/* eslint-disable no-console, no-useless-escape */
/* cspell:disable */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const catalogPath = path.join(repoRoot, 'packages/mermaid/src/diagrams/sld/device-catalog.ts');
const symbolsDir = path.join(repoRoot, 'packages/mermaid/src/diagrams/sld/symbols');
const iconsTsPath = path.join(repoRoot, 'packages/mermaid/src/diagrams/sld/symbol-icons.ts');
const specsTsPath = path.join(repoRoot, 'packages/mermaid/src/diagrams/sld/symbol-specs.ts');

const catalogSource = fs.readFileSync(catalogPath, 'utf8');
const codeCategoryPairs = [...catalogSource.matchAll(/^\s{2}([\dA-Z]{4}):\s*{\s*category:\s*'([A-Z]{3})'/gm)].map(
  (match) => ({
    code: match[1],
    category: match[2],
  })
);

if (codeCategoryPairs.length === 0) {
  throw new Error('Failed to parse DEVICE_CATALOG entries.');
}

fs.mkdirSync(symbolsDir, { recursive: true });

const STROKE = 'currentColor';
const MAIN_STROKE_WIDTH = 2.4;
const BUS_STROKE_WIDTH = 5.6;
const VIEWBOX = '0 0 96 96';

const strokeGroup = (inner, strokeWidth = MAIN_STROKE_WIDTH) =>
  `<g fill=\"none\" stroke=\"${STROKE}\" stroke-width=\"${strokeWidth}\" stroke-linecap=\"round\" stroke-linejoin=\"round\">${inner}</g>`;

const term = (x, y, r = 2.15) => `<circle cx=\"${x}\" cy=\"${y}\" r=\"${r}\" fill=\"${STROKE}\" stroke=\"none\"/>`;

const sourceFrame = (glyph) =>
  `${term(88, 48)}${strokeGroup(`
<line x1=\"64\" y1=\"48\" x2=\"85\" y2=\"48\"/>
<circle cx=\"40\" cy=\"48\" r=\"24\"/>
${glyph}`)}`;

const busFrame = (glyph) =>
  `${term(8, 48)}${term(88, 48)}${strokeGroup(`
<line x1=\"10\" y1=\"48\" x2=\"86\" y2=\"48\" stroke-width=\"${BUS_STROKE_WIDTH}\"/>
<line x1=\"40\" y1=\"37\" x2=\"40\" y2=\"59\"/>
<line x1=\"56\" y1=\"37\" x2=\"56\" y2=\"59\"/>
${glyph}`)}`;

const inlineFrame = (glyph) =>
  `${term(8, 48)}${term(88, 48)}${strokeGroup(`
<line x1=\"10\" y1=\"48\" x2=\"21\" y2=\"48\"/>
<line x1=\"75\" y1=\"48\" x2=\"86\" y2=\"48\"/>
<rect x=\"21\" y=\"25\" width=\"54\" height=\"46\" rx=\"5\"/>
${glyph}`)}`;

const loadFrame = (glyph) =>
  `${term(8, 48)}${strokeGroup(`
<line x1=\"10\" y1=\"48\" x2=\"24\" y2=\"48\"/>
${glyph}`)}`;

const assemblyFrame = (glyph) =>
  `${term(8, 34)}${term(8, 62)}${term(88, 48)}${strokeGroup(`
<line x1=\"10\" y1=\"34\" x2=\"18\" y2=\"34\"/>
<line x1=\"10\" y1=\"62\" x2=\"18\" y2=\"62\"/>
<line x1=\"79\" y1=\"48\" x2=\"86\" y2=\"48\"/>
<rect x=\"18\" y=\"18\" width=\"61\" height=\"60\" rx=\"8\" stroke-dasharray=\"6 4\"/>
${glyph}`)}`;

const SRC_GLYPHS = {
  UTIL: '<path d="M24 50c4-8 8 8 12 0s8-8 12 0"/>',
  GENS:
    '<circle cx="40" cy="48" r="9"/><line x1="40" y1="39" x2="40" y2="57"/><line x1="31" y1="48" x2="49" y2="48"/><path d="M24 48h7M49 48h7"/>',
  PVIN:
    '<rect x="24" y="38" width="24" height="16" rx="2"/><line x1="32" y1="38" x2="32" y2="54"/><line x1="40" y1="38" x2="40" y2="54"/><line x1="24" y1="46" x2="48" y2="46"/><circle cx="54" cy="34" r="5"/><line x1="54" y1="25" x2="54" y2="22"/><line x1="61" y1="34" x2="64" y2="34"/>',
  BESS:
    '<rect x="23" y="41" width="28" height="14" rx="2"/><line x1="51" y1="45" x2="54" y2="45"/><line x1="31" y1="45" x2="37" y2="45"/><line x1="34" y1="42" x2="34" y2="48"/><line x1="40" y1="51" x2="46" y2="51"/>',
  TURB:
    '<circle cx="40" cy="48" r="3"/><line x1="40" y1="48" x2="40" y2="29"/><line x1="40" y1="48" x2="24" y2="57"/><line x1="40" y1="48" x2="56" y2="57"/><path d="M40 29l3 6h-6zM24 57l7-1-3-5zM56 57l-7-1 3-5z"/>',
};

const BUS_GLYPHS = {
  BUSS: '<path d="M22 30h10M64 30h10M22 66h10M64 66h10"/>',
  SWGR:
    '<rect x="24" y="22" width="40" height="16" rx="2"/><line x1="34" y1="22" x2="34" y2="38"/><line x1="44" y1="22" x2="44" y2="38"/><line x1="54" y1="22" x2="54" y2="38"/>',
  SWBD:
    '<rect x="24" y="22" width="40" height="16" rx="2"/><line x1="36" y1="22" x2="36" y2="38"/><line x1="50" y1="22" x2="50" y2="38"/><path d="M28 30h32"/>',
  PNLB:
    '<rect x="26" y="22" width="30" height="16" rx="2"/><line x1="31" y1="38" x2="31" y2="44"/><line x1="41" y1="38" x2="41" y2="44"/><line x1="51" y1="38" x2="51" y2="44"/>',
  MCCB:
    '<rect x="24" y="22" width="40" height="16" rx="2"/><circle cx="44" cy="30" r="5"/><path d="M41 33v-6l3 3 3-3v6"/>',
  PDUB:
    '<rect x="24" y="22" width="40" height="20" rx="2"/><circle cx="32" cy="28" r="1.4"/><circle cx="40" cy="28" r="1.4"/><circle cx="48" cy="28" r="1.4"/><circle cx="56" cy="28" r="1.4"/><line x1="28" y1="36" x2="60" y2="36"/>',
  RPPB:
    '<rect x="26" y="20" width="28" height="18" rx="2"/><line x1="30" y1="26" x2="50" y2="26"/><line x1="30" y1="32" x2="50" y2="32"/><path d="M54 29h10" stroke-dasharray="3 3"/>',
  BUSW:
    '<rect x="20" y="40" width="44" height="16" rx="2"/><line x1="26" y1="40" x2="26" y2="56"/><line x1="34" y1="40" x2="34" y2="56"/><line x1="42" y1="40" x2="42" y2="56"/><line x1="50" y1="40" x2="50" y2="56"/>',
  TAPB:
    '<rect x="32" y="26" width="18" height="24" rx="2"/><line x1="41" y1="22" x2="41" y2="26"/><line x1="41" y1="50" x2="41" y2="56"/>',
  PARB:
    '<line x1="18" y1="42" x2="78" y2="42" stroke-width="5"/><line x1="18" y1="54" x2="78" y2="54" stroke-width="5"/><line x1="48" y1="42" x2="48" y2="54"/>',
  MVBS: '<path d="M44 24l-8 14h8l-6 12 14-18h-8l6-8z"/><line x1="20" y1="30" x2="66" y2="30"/>',
  MVSW:
    '<rect x="24" y="22" width="40" height="16" rx="2"/><path d="M44 22v16M34 22v16M54 22v16"/><path d="M44 42l-6 8h6l-4 8 10-12h-6l4-4z"/>',
  RMUB:
    '<circle cx="42" cy="48" r="14"/><circle cx="42" cy="34" r="2"/><circle cx="30" cy="54" r="2"/><circle cx="54" cy="54" r="2"/><line x1="56" y1="48" x2="72" y2="48"/>',
};

const INL_GLYPHS = {
  BRKR: '<line x1="34" y1="34" x2="62" y2="62"/><line x1="34" y1="62" x2="62" y2="34"/>',
  ACBR: '<line x1="34" y1="34" x2="62" y2="62"/><path d="M42 58l6-16 6 16M44 52h8"/>',
  VCBR: '<circle cx="40" cy="48" r="6"/><circle cx="56" cy="48" r="6"/><line x1="46" y1="48" x2="50" y2="48"/>',
  LBSW:
    '<line x1="34" y1="58" x2="46" y2="48"/><line x1="46" y1="48" x2="62" y2="38"/><circle cx="34" cy="58" r="2"/><circle cx="62" cy="38" r="2"/>',
  DISC: '<line x1="34" y1="58" x2="58" y2="38"/><circle cx="34" cy="58" r="2"/><line x1="58" y1="38" x2="62" y2="38"/>',
  FUSD: '<path d="M34 48h6l4-6 6 12 6-12 6 12h0"/>',
  SWCH: '<line x1="34" y1="48" x2="62" y2="48"/><circle cx="34" cy="48" r="2"/><circle cx="62" cy="48" r="2"/>',
  CONT:
    '<line x1="34" y1="42" x2="42" y2="42"/><line x1="54" y1="42" x2="62" y2="42"/><line x1="34" y1="54" x2="42" y2="54"/><line x1="54" y1="54" x2="62" y2="54"/><circle cx="48" cy="48" r="5"/>',
  TRFM: '<path d="M34 54c2-6 4-6 6 0s4 6 6 0"/><path d="M50 54c2-6 4-6 6 0s4 6 6 0"/>',
  AUTO:
    '<path d="M34 54c2-6 4-6 6 0s4 6 6 0"/><path d="M50 54c2-6 4-6 6 0s4 6 6 0"/><line x1="48" y1="34" x2="48" y2="43"/><path d="M46 41l2 2 2-2"/>',
  RECT: '<path d="M34 56l10-16 10 16z"/><line x1="54" y1="40" x2="62" y2="40"/><line x1="54" y1="56" x2="62" y2="56"/>',
  INVT: '<path d="M32 50c4-8 8 8 12 0s8-8 12 0"/>',
  CHRG:
    '<rect x="35" y="42" width="16" height="10" rx="1"/><line x1="51" y1="45" x2="54" y2="45"/><line x1="40" y1="45" x2="45" y2="45"/><line x1="42.5" y1="42.5" x2="42.5" y2="47.5"/><path d="M54 57l8-6-8-6"/>',
  VFDR: '<path d="M32 56h5l3-10 3 10 3-10 3 10h5"/><path d="M32 38c4 0 8 4 12 4s8-4 12-4"/>',
  SOFT: '<line x1="34" y1="58" x2="34" y2="38"/><line x1="34" y1="58" x2="62" y2="58"/><line x1="34" y1="58" x2="62" y2="38"/>',
  REAC: '<path d="M34 50c2-6 4-6 6 0s4 6 6 0 4-6 6 0 4 6 6 0"/>',
  HFLT:
    '<line x1="34" y1="40" x2="42" y2="40"/><line x1="42" y1="34" x2="42" y2="46"/><line x1="48" y1="34" x2="48" y2="46"/><line x1="48" y1="40" x2="62" y2="40"/><path d="M34 56h28"/>',
  METR: '<circle cx="48" cy="48" r="10"/><path d="M43 53v-10l5 5 5-5v10"/>',
  ENRG: '<circle cx="48" cy="48" r="10"/><path d="M45 40l-3 8h5l-2 8 7-10h-5l2-6z"/>',
  PQMT: '<circle cx="48" cy="48" r="10"/><path d="M40 48h4l2-4 2 8 2-4h6"/>',
  CTXF: '<circle cx="48" cy="48" r="11"/><circle cx="48" cy="48" r="5"/>',
  VTXF: '<path d="M36 56V40l12-6 12 6v16"/><line x1="48" y1="34" x2="48" y2="56"/>',
  CABX: '<path d="M34 56c5-14 9 14 14 0s9-14 14 0"/><path d="M34 44c5 14 9-14 14 0s9 14 14 0"/>',
  COND: '<circle cx="48" cy="48" r="12"/><circle cx="48" cy="48" r="6"/>',
  TRAY:
    '<line x1="34" y1="40" x2="62" y2="40"/><line x1="34" y1="56" x2="62" y2="56"/><line x1="38" y1="40" x2="38" y2="56"/><line x1="44" y1="40" x2="44" y2="56"/><line x1="50" y1="40" x2="50" y2="56"/><line x1="56" y1="40" x2="56" y2="56"/>',
  DUCT: '<circle cx="40" cy="44" r="4"/><circle cx="48" cy="44" r="4"/><circle cx="56" cy="44" r="4"/><circle cx="44" cy="52" r="4"/><circle cx="52" cy="52" r="4"/>',
  WIRE: '<path d="M34 54c4-10 8 10 12 0s8-10 12 0"/><circle cx="34" cy="54" r="1.6"/><circle cx="58" cy="54" r="1.6"/>',
  JBOX: '<rect x="36" y="36" width="24" height="24" rx="2"/><line x1="40" y1="40" x2="56" y2="56"/><line x1="56" y1="40" x2="40" y2="56"/>',
};

const LOD_GLYPHS = {
  LOAD: '<rect x="28" y="32" width="40" height="32" rx="4"/><path d="M34 50h6l4-8 4 16 4-8h10"/>',
  LGHT: '<circle cx="48" cy="45" r="12"/><path d="M44 58h8M45 62h6"/><path d="M42 45c2-3 4-3 6 0s4 3 6 0"/>',
  RCPT: '<rect x="30" y="34" width="36" height="28" rx="5"/><line x1="42" y1="42" x2="42" y2="50"/><line x1="54" y1="42" x2="54" y2="50"/><circle cx="48" cy="56" r="2"/>',
  MOTR: '<circle cx="48" cy="48" r="14"/><path d="M42 56V40l6 8 6-8v16"/>',
  EVCH: '<rect x="34" y="34" width="22" height="26" rx="3"/><line x1="41" y1="36" x2="41" y2="31"/><line x1="49" y1="36" x2="49" y2="31"/><path d="M39 46h12M45 40v12"/>',
  AHUX: '<rect x="30" y="32" width="36" height="32" rx="4"/><circle cx="48" cy="48" r="8"/><path d="M48 40l4 8h-8zM40 52l8-4v8zM56 52l-8-4v8z"/>',
  RTUX: '<rect x="30" y="34" width="36" height="28" rx="4"/><line x1="34" y1="34" x2="62" y2="34"/><circle cx="48" cy="49" r="7"/><path d="M48 42l3 7h-6zM41 52l7-3v6zM55 52l-7-3v6z"/>',
  CHLR: '<rect x="30" y="32" width="36" height="32" rx="4"/><path d="M48 38v20M40 42l16 12M56 42L40 54"/><circle cx="48" cy="48" r="5"/>',
  PUMP: '<circle cx="46" cy="48" r="12"/><path d="M46 42v12M40 48h12"/><path d="M58 48h10l-6 5z"/>',
  FANX: '<circle cx="48" cy="48" r="13"/><path d="M48 48l0-10c4 0 7 3 7 7zM48 48l9 5c-2 3-6 5-10 3zM48 48l-9 5c-2-3-1-8 3-10z"/>',
  FPMP: '<circle cx="42" cy="50" r="10"/><path d="M42 44v12M36 50h12"/><path d="M56 44c4 3 4 8 0 11-3-2-4-6-2-9 1-2 2-3 2-6 1 1 2 3 0 4z"/>',
  ELEV: '<rect x="32" y="32" width="32" height="32" rx="4"/><path d="M40 50l8-10 8 10M40 46l8 10 8-10"/>',
  ESCL: '<path d="M30 60h36l-8-8h-8l-8-8h-12"/><line x1="30" y1="60" x2="30" y2="48"/><line x1="66" y1="60" x2="66" y2="48"/>',
  ITLD: '<rect x="34" y="30" width="28" height="36" rx="3"/><line x1="38" y1="38" x2="58" y2="38"/><line x1="38" y1="46" x2="58" y2="46"/><line x1="38" y1="54" x2="58" y2="54"/><circle cx="40" cy="61" r="1.5"/><circle cx="45" cy="61" r="1.5"/>',
  TENL: '<rect x="32" y="30" width="34" height="36" rx="2"/><line x1="40" y1="36" x2="40" y2="60"/><line x1="48" y1="36" x2="48" y2="60"/><line x1="56" y1="36" x2="56" y2="60"/><line x1="32" y1="44" x2="66" y2="44"/><line x1="32" y1="52" x2="66" y2="52"/>',
  SPDV: '<path d="M48 34l-8 14h8l-6 12 14-18h-8l6-8z"/><path d="M48 60v6M44 66h8M45 69h6"/>',
  CAPB: '<line x1="38" y1="38" x2="38" y2="60"/><line x1="52" y1="38" x2="52" y2="60"/><line x1="30" y1="49" x2="38" y2="49"/><line x1="52" y1="49" x2="64" y2="49"/>',
  SVGV: '<rect x="32" y="34" width="32" height="28" rx="3"/><path d="M36 48c3-6 6 6 9 0s6-6 9 0 6 6 9 0"/>',
  SVCV: '<rect x="32" y="34" width="32" height="28" rx="3"/><path d="M36 56l8-14 8 14"/><line x1="52" y1="42" x2="60" y2="42"/><line x1="52" y1="56" x2="60" y2="56"/>',
};

const ASM_GLYPHS = {
  ATSS:
    '<rect x="30" y="30" width="16" height="10" rx="2"/><rect x="30" y="56" width="16" height="10" rx="2"/><line x1="46" y1="35" x2="58" y2="48"/><line x1="46" y1="61" x2="58" y2="48"/><circle cx="60" cy="48" r="4"/>',
  STSS:
    '<path d="M30 34l10 0 6 8"/><path d="M30 62l10 0 6-8"/><path d="M52 42l8 6-8 6"/><path d="M60 42l8 6-8 6"/><line x1="68" y1="48" x2="74" y2="48"/>',
  UPSS:
    '<rect x="26" y="30" width="14" height="12" rx="2"/><rect x="26" y="54" width="14" height="12" rx="2"/><rect x="50" y="42" width="12" height="12" rx="2"/><line x1="40" y1="36" x2="50" y2="48"/><line x1="40" y1="60" x2="50" y2="48"/><line x1="62" y1="48" x2="74" y2="48"/>',
};

const byCategory = {
  SRC: (code) => sourceFrame(SRC_GLYPHS[code] ?? '<path d="M26 48h28"/>'),
  BUS: (code) => busFrame(BUS_GLYPHS[code] ?? '<path d="M22 30h52"/>'),
  INL: (code) => inlineFrame(INL_GLYPHS[code] ?? '<path d="M34 48h28"/>'),
  LOD: (code) => loadFrame(LOD_GLYPHS[code] ?? '<rect x="30" y="34" width="34" height="28" rx="4"/>'),
  ASM: (code) => assemblyFrame(ASM_GLYPHS[code] ?? '<line x1="30" y1="48" x2="66" y2="48"/>'),
};

const sizeByCategory = {
  SRC: { w: 76, h: 76, className: 'sld_src' },
  BUS: { w: 94, h: 66, className: 'sld_bus' },
  INL: { w: 74, h: 74, className: 'sld_inl' },
  LOD: { w: 74, h: 74, className: 'sld_lod' },
  ASM: { w: 90, h: 80, className: 'sld_asm' },
};

const sizeOverrides = {
  PARB: { w: 98, h: 66 },
  BUSW: { w: 98, h: 68 },
  RMUB: { w: 96, h: 70 },
  STSS: { w: 92, h: 82 },
  UPSS: { w: 92, h: 82 },
};

const symbols = {};
for (const { code, category } of codeCategoryPairs) {
  const build = byCategory[category];
  if (!build) {
    throw new Error(`Unsupported category ${category} for ${code}.`);
  }

  const body = build(code).trim();
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${VIEWBOX}\">\n${body}\n</svg>\n`;
  fs.writeFileSync(path.join(symbolsDir, `${code}.svg`), svg, 'utf8');
  symbols[code] = { body, category };
}

const iconPack = {
  prefix: 'sld',
  icons: Object.fromEntries(
    Object.entries(symbols).map(([code, { body }]) => [code.toLowerCase(), { body, width: 96, height: 96 }])
  ),
};

const iconTs = `/* eslint-disable @cspell/spellchecker */\nimport type { IconifyJSON } from '@iconify/types';\n\n// Generated by scripts/sld/generate-symbol-assets.mjs\nexport const SLD_ICON_PACK = ${JSON.stringify(iconPack, null, 2)} as const satisfies IconifyJSON;\n`;
fs.writeFileSync(iconsTsPath, iconTs, 'utf8');

const specs = Object.fromEntries(
  codeCategoryPairs.map(({ code, category }) => {
    const base = sizeByCategory[category];
    const override = sizeOverrides[code];
    return [
      code,
      {
        icon: `sld:${code.toLowerCase()}`,
        w: override?.w ?? base.w,
        h: override?.h ?? base.h,
        pos: 'b',
        className: base.className,
        category,
      },
    ];
  })
);

const specsTs = `/* eslint-disable @cspell/spellchecker */\n// Generated by scripts/sld/generate-symbol-assets.mjs\nexport type SldSymbolSpec = {\n  icon: string;\n  w: number;\n  h: number;\n  pos: 't' | 'b';\n  className: 'sld_src' | 'sld_bus' | 'sld_inl' | 'sld_lod' | 'sld_asm';\n  category: 'SRC' | 'BUS' | 'INL' | 'LOD' | 'ASM';\n};\n\nexport const SLD_SYMBOL_SPECS = ${JSON.stringify(specs, null, 2)} as const satisfies Record<string, SldSymbolSpec>;\n`;
fs.writeFileSync(specsTsPath, specsTs, 'utf8');

console.log(`Generated ${Object.keys(symbols).length} SVG symbols, symbol-icons.ts, and symbol-specs.ts.`);
