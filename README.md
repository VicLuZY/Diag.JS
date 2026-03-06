# DiagJS

DiagJS is a text-to-SVG diagram engine for building systems. The repo now ships two renderers:

- `renderSvg(...)` for electrical single-line diagrams
- `renderHvacSvg(...)` for mechanical HVAC schematics

## DSL

Each non-empty line is one statement:

- `title "Your diagram title"`
- `node <id> "Node label" [symbol <type>]`
- `edge <fromId> <toId> "Optional edge label"`
- `param <nodeId> <key> <value>`

Comments start with `#`.

Example:

```txt
title "Mechanical Distribution"
node util "Utility Service" symbol utility
param util voltage 13.8kV
node msb "Main Switchboard" symbol switchboard
param msb ampacity 3000A
node pump1 "CHW Pump" symbol pump
param pump1 power 40HP
node rtu1 "RTU-1" symbol rtu
param rtu1 demand 50kVA
edge util msb "service"
edge msb pump1 "mechanical"
edge msb rtu1 "roof load"
```

DiagJS includes dedicated SVG symbols for common power and building-distribution devices such as transformers, switchboards, panels, MCCs, pumps, fans, HVAC units, RTUs, boilers, elevators, and more. Assemblies like switchboards, panelboards, and MCCs render as main-device plus bus plus feeder sections, while source and load terminals are suppressed on the impossible side. When no explicit `symbol` is provided, the renderer infers a matching device family from the node id and label where possible.

The HVAC renderer uses the same base DSL, but it also respects:

- `param <nodeId> lane <condenser|chilled|air|exhaust|heating|controls|terminal>`
- `param <nodeId> column <number>`
- `param <nodeId> slot <number>`

That makes it possible to place looped hydronic returns and controls on stable mechanical bands instead of forcing everything into a one-direction feeder tree.

## API

```ts
import { parseDiagram, compileDiagram, renderSvg } from 'diagjs';

const source = `
  title "Mechanical Distribution"
  node util "Utility Service" symbol utility
  param util voltage 13.8kV
  node msb "Main Switchboard" symbol switchboard
  param msb ampacity 3000A
  node pump1 "CHW Pump" symbol pump
  param pump1 power 40HP
  edge util msb "service"
  edge msb pump1 "mechanical"
`;

const ast = parseDiagram(source);
const graph = compileDiagram(ast);
const svg = renderSvg(graph);
```

HVAC example:

```ts
import { compileHvacDiagram, renderHvacSvg } from 'diagjs';

const source = `
  title "Office Tower HVAC Mechanical Schematic"
  node OA1 "Outside Air Intake Louver" symbol outside-air
  param OA1 lane air
  param OA1 column 0
  node MX1 "AHU-1 Mixing Box" symbol mixing-box
  param MX1 lane air
  param MX1 column 1
  node SF1 "Supply Fan Array" symbol fan
  param SF1 lane air
  param SF1 column 2
  node VAV1 "VAV-1 East Open Office" symbol vav
  param VAV1 lane air
  param VAV1 column 3
  edge OA1 MX1 "OA"
  edge MX1 SF1 "mixed air"
  edge SF1 VAV1 "SA"
`;

const schematic = compileHvacDiagram(source);
const svg = renderHvacSvg(schematic);
```

## Website

The demo site is built with Vite.

```sh
npm install
npm run dev
npm run build
```

## Acknowledgement

DiagJS is inspired by Mermaid.
