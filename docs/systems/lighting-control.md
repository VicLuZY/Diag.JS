# Lighting Control

The lighting control renderer is a lane-based schematic renderer for enterprise head-end, panel cabinets, room controls, sensors, fixtures, site lighting, and emergency integration.

## API Surface

```ts
import { compileLightingControlDiagram, renderLightingControlSvg, LightingControlJS } from 'diagjs';
```

## Layout model

Lighting control diagrams are organized into these lane bands:

- `headend`
- `backbone`
- `panel`
- `room`
- `sensor`
- `fixture`
- `exterior`
- `emergency`

This matches how real systems are reviewed: enterprise software and gateways at the top, field control and load groups at the bottom.

## Important params

| Param | Why it matters |
| --- | --- |
| `lane` | Overrides the default band |
| `column` | Controls left-to-right grouping |
| `slot` | Controls order within a column |
| Custom metadata such as `zone`, `scene`, or `program` | Shows device-specific context without language changes |

## Media inference

Typical inferred media classes include:

- IP / Ethernet
- DALI
- `0-10V`
- Relay
- Sensor bus
- Site/exterior
- Emergency sense

Use explicit edge labels such as `ethernet`, `dali`, `0-10v`, `relay`, `sensor`, `site`, or `emergency` when the exact control path matters.

## Example

```txt
title "Lighting Control"
node head "Lighting Head-End" symbol server
param head lane headend
param head column 0
node gw "Lighting Gateway" symbol gateway
param gw lane backbone
param gw column 1
node panel "Ballroom Dimming Panel" symbol dimming_panel
param panel lane panel
param panel column 2
node scene "Ballroom Scene Station" symbol scene_station
param scene lane sensor
param scene column 4
node load "Ballroom Fixture Group" symbol fixture_group
param load lane fixture
param load column 5
edge head gw "ethernet"
edge gw panel "ethernet"
edge panel scene "DALI"
edge panel load "0-10V"
```

## Reference links

- [Lighting control generated reference](/reference/generated/lighting-control)
- [Language parameters](/language/parameters)
- [Rendering model](/language/rendering-model)
