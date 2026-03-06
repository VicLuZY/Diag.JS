# Systems Overview

Diag.JS currently ships five renderer families built on the same DSL.

| System | Compile Function | Render Function | Layout Model | Typical Use |
| --- | --- | --- | --- | --- |
| Electrical | `compileDiagram` | `renderSvg` | Hierarchical single-line with voltage strata | Utility-to-load distribution and feeder trees |
| HVAC | `compileHvacDiagram` | `renderHvacSvg` | Lane-based | Airside, hydronic, plant, and controls schematics |
| Network | `compileNetworkDiagram` | `renderNetworkSvg` | Lane-based | Campus, data-centre, storage, and edge infrastructure |
| Fire Alarm | `compileFireAlarmDiagram` | `renderFireAlarmSvg` | Lane-based | Command, network, panel, loop, notification, and field layers |
| Lighting Control | `compileLightingControlDiagram` | `renderLightingControlSvg` | Lane-based | Head-end, backbone, room, fixture, site, and emergency integration |

## How to choose

Use the electrical renderer when the diagram is fundamentally directional and feeder-based.

Use a lane-based renderer when:

- The system spans multiple functional layers
- Reverse or looped connections are expected
- Stable discipline bands matter more than pure topological depth

## Shared authoring model

All systems use:

- `title`
- `node`
- `edge`
- `param`

What changes per system is:

- Available symbol families
- Alias maps
- Lane definitions
- Media or wire classes
- Renderer-specific heuristics and defaults

The [generated reference section](/reference/generated/) is the canonical inventory of those system-specific definitions.
