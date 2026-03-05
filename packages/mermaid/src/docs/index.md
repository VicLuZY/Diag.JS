---
layout: home
sidebar: false

title: DiagJS
titleTemplate: SLD-first diagram library

hero:
  name: DiagJS
  text: SLD-first diagram library
  tagline: Single-line diagrams (SLD), flowcharts, and automatic layout. A focused fork of Mermaid for electrical device and cable semantics.

  image:
    light: /hero-chart.svg
    dark: /hero-chart-dark.svg
    alt: Diagram example
  actions:
    - theme: brand
      text: Get started
      link: /intro/
    - theme: alt
      text: Syntax reference
      link: /intro/syntax-reference

features:
  - icon:
      src: /1-Callout-Easy.svg
    title: Single-line diagrams (SLD)
    details: Primary diagram type with ATS, GEN, UTIL, CDP nodes and cable semantics.
    link: /intro/
  - icon:
      src: /2-Callout-Integrations.svg
    title: Flowchart & graph
    details: Optional compatibility with flowchart and graph syntax from Mermaid.
    link: /syntax/flowchart
  - icon:
      src: /3-Callout-Awards.svg
    title: Layout engines
    details: Dagre (default) and optional ELK for automatic graph layout.
    link: /config/layouts
---

## Example: Single-line diagram (SLD)

A comprehensive building power example: utility and generator through an ATS, switchgear, conduit/cable run, and panel distribution to loads.

```mermaid-example
sld LR
%% Sources
UTL1[Utility]{v="480V"}
GEN1[Generator]{v="480V"}

%% ATS assembly (basic + output breaker)
ATS1[Main ATS]{profile="basic", out_breaker=true}
SWG1[Switchgear]{v="480V"}

%% Utility path
UTL1 --> ATS1:norm
GEN1 --> ATS1:emer
ATS1:load ==> SWG1

%% Feeder with label and metadata
SWG1 -->|Feeder F-12| CND1{type="EMT", size="2in", len="12m"}
    --> CAB1{cond="4C", size="3/0", len="12m"}
    --> PNL1[Panel L1]{v="480V"}

%% Panel branches
PNL1 --> CBR_PNL1_1 --> CAB2 --> LGT1[Lighting]
PNL1 --> CBR_PNL1_2 --> CAB3 --> RCP1[Receptacles]
PNL1 --> CBR_PNL1_3 --> CAB4 --> AHU1[AHU]
```
