# Core Syntax

Inkline syntax stays close to natural writing while preserving structured diagram intent.

## Minimal Diagram

```inkline-example
flowchart LR
  Source --> Target
```

## Labeled Connections

```inkline-example
flowchart LR
  Checkout -->|validate payment| Payments
  Payments -->|record receipt| Ledger[(Ledger)]
```

## Grouped Interaction

```inkline-example
sequenceDiagram
  participant App
  participant Auth
  participant Data

  App->>Auth: Request token
  Auth-->>App: Token issued
  App->>Data: Fetch records
  Data-->>App: Records returned
```

## Structure Rules

- Start with the diagram type declaration.
- Use stable ids and readable labels.
- Keep each diagram focused on one question.
