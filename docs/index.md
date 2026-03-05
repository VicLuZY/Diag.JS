---
layout: home
sidebar: false

title: Inkline
titleTemplate: Diagrams that evolve with your code

hero:
  name: Inkline
  text: Diagram your systems in plain text
  tagline: Build flow, sequence, state, and architecture visuals directly from versionable source.

  actions:
    - theme: brand
      text: Start With Intro
      link: /intro/
    - theme: alt
      text: Explore Syntax
      link: /syntax/sld

features:
  - title: Documentation-native
    details: Author diagrams where you write docs so implementation and visuals stay aligned.
  - title: Code review friendly
    details: Diagram changes show up as readable text diffs instead of opaque binary assets.
  - title: Fast iteration loop
    details: Edit source, render instantly, and keep visual communication up to date.
---

## Quick Example

```inkline-example
flowchart LR
  Client[Web App] --> API[Gateway]
  API --> Auth[Auth Service]
  API --> Billing[Billing Service]
  Billing --> Ledger[(Ledger DB)]
```

## Why Teams Choose Inkline

- Keep architecture discussions inside pull requests.
- Generate consistent visuals from concise syntax.
- Reuse the same approach across product, platform, and operations docs.
