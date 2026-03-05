# Getting Started

## Prerequisites

- Node.js 20+
- pnpm

## Run The Docs Locally

```bash
pnpm install
pnpm dev
```

Run `pnpm dev` from the docs package directory. After the server opens, edit markdown files and diagram previews update immediately.

## First Authoring Block

```inkline-example
sequenceDiagram
  participant User
  participant API
  participant Worker

  User->>API: Submit order
  API->>Worker: Queue job
  Worker-->>API: Job complete
  API-->>User: Confirmation
```

## Next Reading

- [Syntax Overview](./syntax-reference.md)
- [Core Syntax](../syntax/sld.md)
- [Examples](../syntax/examples.md)
