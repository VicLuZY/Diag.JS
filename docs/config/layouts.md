# Layouts

Layout direction controls reading order and visual emphasis.

## Left To Right

Use `LR` when showing pipelines or request flow.

```inkline-example
flowchart LR
  Client --> API --> Worker --> Store[(Data Store)]
```

## Top To Bottom

Use `TB` when showing layered systems or staged processes.

```inkline-example
flowchart TB
  Input[Incoming Events]
  Normalize[Normalization]
  Route[Routing]
  Persist[(Data Lake)]

  Input --> Normalize --> Route --> Persist
```

## Practical Guidance

- Keep edge labels short and specific.
- Reduce edge crossings before adding more nodes.
- Split oversized diagrams into focused views.
