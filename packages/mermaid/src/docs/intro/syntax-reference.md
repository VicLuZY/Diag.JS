# Syntax Overview

## Diagram Block

Use an `inkline-example` fence for runnable examples in docs.

````md
```inkline-example
flowchart LR
  A --> B
```
````

## Common Diagram Types

- `flowchart` for topology and process maps.
- `sequenceDiagram` for request/response timelines.
- `stateDiagram-v2` for state transitions.
- `classDiagram` for domain models.

## Labels And Metadata

Use descriptive node labels and link labels where context is important.

```text
Checkout -->|validates card| Payments
Payments -->|stores record| Ledger
```

## Complete Multi-Service Example

```inkline-example
flowchart TB
  Gateway --> Orders
  Gateway --> Customers
  Orders --> Inventory
  Orders --> Payments
  Payments --> Ledger[(Ledger DB)]
  Inventory --> Stock[(Stock DB)]
```
