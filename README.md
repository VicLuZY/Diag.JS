# DiagJS

DiagJS is a text-to-SVG diagram engine for building systems. The repo now ships five renderers:

- `renderSvg(...)` for electrical single-line diagrams
- `renderHvacSvg(...)` for mechanical HVAC schematics
- `renderNetworkSvg(...)` for data centre and campus network schematics
- `renderFireAlarmSvg(...)` for campus fire alarm and emergency voice schematics
- `renderLightingControlSvg(...)` for lighting control schematics

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

The HVAC, network, fire alarm, and lighting renderers use the same base DSL, but they also respect:

- `param <nodeId> lane <condenser|chilled|air|exhaust|heating|controls|terminal>`
- `param <nodeId> column <number>`
- `param <nodeId> slot <number>`

That makes it possible to place looped systems, campus overlays, and control layers on stable discipline bands instead of forcing everything into a one-direction feeder tree.

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

Lane-based example:

```ts
import { compileNetworkDiagram, renderNetworkSvg } from 'diagjs';

const source = `
  title "Data Centre Fabric"
  node wan "Carrier Internet" symbol cloud
  param wan lane external
  param wan column 0
  node core "Core Switch Pair" symbol core
  param core lane core
  param core column 1
  node spine "Spine Fabric A" symbol spine
  param spine lane fabric
  param spine column 2
  node cluster "Virtualization Cluster A" symbol virtualization
  param cluster lane fabric
  param cluster column 3
  edge wan core "internet"
  edge core spine "100G fabric"
  edge spine cluster "100G fabric"
`;

const schematic = compileNetworkDiagram(source);
const svg = renderNetworkSvg(schematic);
```

## Website

The demo site is built with Vite and the homepage exposes a tabbed showcase for all five diagram families.

```sh
npm install
npm run dev
npm run build
```

## Documentation

The repository also ships a VitePress documentation site under `docs/`.

```sh
npm run docs:dev
npm run docs:build
```

Reference inventory pages are generated from the renderer source files:

```sh
npm run docs:generate
```

## Acknowledgement

DiagJS is inspired by Mermaid.
