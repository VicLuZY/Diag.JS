# Examples

## Service Flow

```inkline-example
flowchart LR
  Web[Web Client] --> Edge[Edge API]
  Edge --> Orders[Orders API]
  Edge --> Accounts[Accounts API]
  Orders --> Queue[(Job Queue)]
```

## Incident Timeline

```inkline-example
sequenceDiagram
  participant Alerting
  participant OnCall
  participant API

  Alerting->>OnCall: Trigger page
  OnCall->>API: Enable mitigation flag
  API-->>OnCall: Traffic stabilized
```

## State Lifecycle

```inkline-example
stateDiagram-v2
  [*] --> Pending
  Pending --> Running
  Running --> Succeeded
  Running --> Failed
  Failed --> Retried
  Retried --> Running
```

## Domain Model Sketch

```inkline-example
classDiagram
  class Order {
    +string id
    +decimal total
    +submit()
  }
  class Invoice {
    +string number
    +pay()
  }
  Order "1" --> "1" Invoice : produces
```
