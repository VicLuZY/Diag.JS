# What Is Inkline

Inkline is a diagram-as-code workflow for teams that need accurate visuals without leaving their docs and repos.

## Core Idea

Write diagrams as plain text, commit them with the rest of your work, and render clean SVG output where you publish documentation.

## Best Fit Use Cases

- Architecture overviews for distributed systems.
- Service interaction flows and sequence timelines.
- State models, decision maps, and dependency charts.

## Design Principles

- Keep source readable enough for non-designers.
- Keep changes auditable in regular diffs.
- Keep rendering deterministic for repeatable outputs.

## First Diagram

```inkline-example
flowchart LR
  Browser --> CDN
  CDN --> App[App Server]
  App --> Cache[(Cache)]
  App --> DB[(Primary DB)]
```

## Continue

- [Getting Started](./getting-started.md)
- [Syntax Overview](./syntax-reference.md)
- [Core Syntax](../syntax/sld.md)
