# Getting Started

Diag.JS is a text-to-SVG diagram engine for building systems. It exposes one base DSL and multiple renderers:

- Electrical single-line diagrams
- HVAC mechanical schematics
- Network infrastructure schematics
- Fire alarm schematics
- Lighting control schematics

## Install

```sh
npm install
```

## Run the app and the docs

```sh
npm run dev
npm run docs:dev
```

- `npm run dev` starts the existing Vite demo/playground.
- `npm run docs:dev` generates the source-backed reference pages and starts the VitePress documentation site.

## Build

```sh
npm run build
npm run docs:build
```

Use `npm run docs:generate` whenever you change symbol libraries, aliases, lanes, media classes, wire types, or voltage strata and want to refresh the generated reference pages without starting the docs dev server.

## First diagram

```txt
title "Simple Distribution"
node util "Utility Service" symbol utility
param util voltage 25kV
node xfmr "Main Transformer" symbol transformer
param xfmr secondary 480Y/277V
node msb "Main Switchboard" symbol switchboard
param msb system 480Y/277V
node panel1 "Lighting Panel LP-1" symbol panel
param panel1 system 208Y/120V
node load1 "Lobby Lighting" symbol lighting
edge util xfmr "service"
edge xfmr msb "main secondary"
edge msb panel1 "feeder"
edge panel1 load1 "branch"
```

## Render it

```ts
import { parseDiagram, compileDiagram, renderSvg } from 'diagjs';

const source = `
title "Simple Distribution"
node util "Utility Service" symbol utility
param util voltage 25kV
node xfmr "Main Transformer" symbol transformer
param xfmr secondary 480Y/277V
node msb "Main Switchboard" symbol switchboard
param msb system 480Y/277V
edge util xfmr "service"
edge xfmr msb "main secondary"
`;

const ast = parseDiagram(source);
const compiled = compileDiagram(ast);
const svg = renderSvg(compiled);
```

## Choose the right renderer

Use the electrical renderer when your diagram is fundamentally feeder-oriented and benefits from voltage strata and assembly glyphs.

Use the lane-based renderers when you need stable vertical bands, looped or reversed connections, or multiple functional layers on the same sheet.

Start with these pages next:

- [Grammar](/language/grammar)
- [Statements](/language/statements)
- [Systems Overview](/systems/)
- [Generated Reference](/reference/generated/)
