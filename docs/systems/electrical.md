# Electrical

The electrical renderer is the single-line specialist in Diag.JS. It is best suited to feeder-oriented diagrams where voltage levels, assemblies, and load hierarchy matter more than looped routing.

## API Surface

```ts
import { parseDiagram, compileDiagram, renderSvg, DiagJS } from 'diagjs';
```

## What makes it different

- No `lane`, `column`, or `slot` placement model
- Automatic voltage strata backgrounds
- Assembly rendering for switchboards, panels, and MCCs
- Wire inference tuned for service, feeder, branch, and control wiring
- Terminal suppression on physically invalid sides for source/load roles

## Important params

| Param | Why it matters |
| --- | --- |
| `voltage` | Drives displayed voltage text and strata inference |
| `system` | Drives displayed system text and strata inference |
| `secondary` | Common transformer/panel voltage cue |
| `primary` | Additional voltage cue |
| `main` | Shapes assembly main-device graphics |
| `input` | Alternate key for assembly main-device graphics |

## Authoring patterns

- Use explicit `symbol` values for major distribution equipment.
- Label edges with `service`, `feeder`, `branch`, or `control` when line styling matters.
- Use realistic voltage strings such as `25kV`, `480Y/277V`, or `208Y/120V`.
- Treat panels, switchboards, and MCCs as assemblies that feed downstream equipment instead of as generic nodes.

## Example

```txt
title "Building Electrical Distribution"
node UTIL "Utility Service" symbol utility
param UTIL voltage 25kV
node XFMR1 "Main Transformer" symbol transformer
param XFMR1 secondary 480Y/277V
node MSB "MSB-1" symbol switchboard
param MSB system 480Y/277V
param MSB main breaker
node LP1 "LP-1" symbol panel
param LP1 system 208Y/120V
node LGT "General Lighting" symbol lighting
edge UTIL XFMR1 "service"
edge XFMR1 MSB "main secondary"
edge MSB LP1 "feeder"
edge LP1 LGT "branch"
```

## Reference links

- [Electrical generated reference](/reference/generated/electrical)
- [Language parameters](/language/parameters)
- [Rendering model](/language/rendering-model)
