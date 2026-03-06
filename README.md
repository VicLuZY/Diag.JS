# DiagJS

DiagJS is a minimal text-to-SVG diagram engine.

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

DiagJS includes dedicated SVG symbols for common power and building-distribution devices such as transformers, switchboards, panels, MCCs, pumps, fans, HVAC units, RTUs, boilers, elevators, and more. When no explicit `symbol` is provided, the renderer infers a matching device family from the node id and label where possible.

## API

```js
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

## Acknowledgement

DiagJS is inspired by Mermaid.
