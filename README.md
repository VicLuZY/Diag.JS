# DiagJS

DiagJS is a minimal text-to-SVG diagram engine.

## DSL

Each non-empty line is one statement:

- `title "Your diagram title"`
- `node <id> "Node label"`
- `edge <fromId> <toId> "Optional edge label"`

Comments start with `#`.

Example:

```txt
title "Release Flow"
node draft "Draft"
node review "Review"
node ship "Ship"
edge draft review "submit"
edge review ship "approve"
```

## API

```js
import { parseDiagram, compileDiagram, renderSvg } from 'diagjs';

const source = `
  title "Release Flow"
  node draft "Draft"
  node review "Review"
  node ship "Ship"
  edge draft review "submit"
  edge review ship "approve"
`;

const ast = parseDiagram(source);
const graph = compileDiagram(ast);
const svg = renderSvg(graph);
```

## Acknowledgement

DiagJS is inspired by Mermaid.
