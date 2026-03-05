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
    details: Primary diagram type with 4-character type definitions (for example ATSW, GENR, UTIL, CDPN) and cable semantics.
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
Rule: all SLD type definitions must be exactly 4 uppercase characters.

```mermaid-example
sld LR
%% Rule: all type definitions use exactly 4 uppercase characters.
%% Sources
UTIL1[Utility]{v="480V"}
GENR1[Generator]{v="480V"}

%% ATS assembly (basic + output breaker)
ATSW1[Main ATS]{profile="basic", out_breaker=true}
SWGR1[Switchgear]{v="480V"}

%% Utility path
UTIL1 --> ATSW1:norm
GENR1 --> ATSW1:emer
ATSW1:load ==> SWGR1

%% Feeder with label and metadata
SWGR1 -->|Feeder F-12| COND1{type="EMTC", size="2in", len="12m"}
    --> CABL1{cond="4C", size="3/0", len="12m"}
    --> PANL1[Panel L1]{v="480V"}

%% Panel branches
PANL1 --> BRKR_PANL1_1 --> CABL2 --> LGHT1[Lighting]
PANL1 --> BRKR_PANL1_2 --> CABL3 --> RCPT1[Receptacles]
PANL1 --> BRKR_PANL1_3 --> CABL4 --> AIRH1[AHU]
```
