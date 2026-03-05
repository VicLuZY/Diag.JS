# Usage

Inkline diagrams are plain text blocks rendered into SVG within documentation and internal tools.

## Authoring In Markdown

````md
```inkline-example
stateDiagram-v2
  [*] --> Draft
  Draft --> Review
  Review --> Approved
  Review --> ChangesRequested
  ChangesRequested --> Draft
  Approved --> [*]
```
````

## Recommended Workflow

1. Keep one diagram per responsibility.
2. Use explicit labels for high-risk transitions.
3. Prefer simple structures before adding stylistic complexity.

## Cross-Reference

- [Getting Started](../intro/getting-started.md)
- [Core Syntax](../syntax/sld.md)
- [Examples](../syntax/examples.md)
