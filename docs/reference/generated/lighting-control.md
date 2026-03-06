# Lighting Control Generated Reference

> Generated from `src/lighting-control.ts` by `npm run docs:generate`. Edit the source library definitions, not this page.

Lane-based lighting control renderer for enterprise head-end, room control, fixture, site, and emergency integrations.

## Coverage

- Symbol families: 16
- Symbol aliases: 32
- Lane bands: 8
- Control media: 8

## Symbol Families

| Symbol | Type Label | Glyph | Size | Default Lane |
| --- | --- | --- | --- | --- |
| `area_controller` | `AREA` | `area_controller` | 184 x 108 | `room` |
| `backbone_switch` | `LAN` | `backbone_switch` | 176 x 104 | `backbone` |
| `daylight_sensor` | `DAY` | `daylight_sensor` | 150 x 96 | `sensor` |
| `device` | `CTRL` | `device` | 150 x 96 | `fixture` |
| `dimming_panel` | `DIM` | `dimming_panel` | 190 x 112 | `panel` |
| `emergency_interface` | `EM` | `emergency_interface` | 176 x 106 | `emergency` |
| `fixture_group` | `LGT` | `fixture_group` | 178 x 104 | `fixture` |
| `headend_server` | `HEAD` | `headend_server` | 196 x 114 | `headend` |
| `lighting_gateway` | `GW` | `lighting_gateway` | 180 x 106 | `backbone` |
| `occupancy_sensor` | `OCC` | `occupancy_sensor` | 150 x 96 | `sensor` |
| `photocell` | `PHOTO` | `photocell` | 154 x 98 | `exterior` |
| `relay_panel` | `RELAY` | `relay_panel` | 188 x 112 | `panel` |
| `room_controller` | `ROOM` | `room_controller` | 176 x 104 | `room` |
| `scene_station` | `SCN` | `scene_station` | 154 x 98 | `sensor` |
| `shade_controller` | `SHADE` | `shade_controller` | 176 x 104 | `room` |
| `wallstation` | `WS` | `wallstation` | 150 x 96 | `sensor` |

## Symbol Aliases

Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.

| Alias | Resolves To |
| --- | --- |
| `area_controller` | `area_controller` |
| `ats_sense` | `emergency_interface` |
| `bacnet_gateway` | `lighting_gateway` |
| `blind_controller` | `shade_controller` |
| `daylight` | `daylight_sensor` |
| `daylight_sensor` | `daylight_sensor` |
| `dimmer` | `dimming_panel` |
| `dimming_panel` | `dimming_panel` |
| `emergency_interface` | `emergency_interface` |
| `ethernet_switch` | `backbone_switch` |
| `fixture` | `fixture_group` |
| `fixture_group` | `fixture_group` |
| `floor_controller` | `area_controller` |
| `gateway` | `lighting_gateway` |
| `graphics` | `headend_server` |
| `keypad` | `wallstation` |
| `light_sensor` | `photocell` |
| `lighting_panel` | `relay_panel` |
| `local_controller` | `room_controller` |
| `luminaire_group` | `fixture_group` |
| `occupancy` | `occupancy_sensor` |
| `occupancy_sensor` | `occupancy_sensor` |
| `photocell` | `photocell` |
| `relay_cabinet` | `relay_panel` |
| `relay_panel` | `relay_panel` |
| `room_controller` | `room_controller` |
| `scene_station` | `scene_station` |
| `server` | `headend_server` |
| `shade_controller` | `shade_controller` |
| `switch` | `backbone_switch` |
| `wallstation` | `wallstation` |
| `workstation` | `headend_server` |

## Lanes

Lane renderers use these bands as their stable vertical layout model. Explicit `param <nodeId> lane <laneId>` overrides the default lane assigned by the symbol library or inference rules.

| Lane Id | Label | Order |
| --- | --- | --- |
| `headend` | Head-End / Enterprise | 0 |
| `backbone` | Building Backbone | 1 |
| `panel` | Relay / Dimming Cabinets | 2 |
| `room` | Room / Area Controllers | 3 |
| `sensor` | Stations / Sensors | 4 |
| `fixture` | Fixture Groups | 5 |
| `exterior` | Exterior / Site Lighting | 6 |
| `emergency` | Emergency Integration | 7 |

## Control media

Media classes are assigned from edge labels and lane context. Use explicit edge labels for predictable routing legends and line styling.

| Key | Label | Style | Stroke Width | Dash Pattern |
| --- | --- | --- | --- | --- |
| `analog_010v` | 0-10V | `line` | 2.8 | `8 5` |
| `dali` | DALI | `line` | 3.3 | Solid |
| `emergency` | EM SENSE | `signal` | 2.6 | `10 4 2 4` |
| `ethernet` | IP | `band` | 4.2 | Solid |
| `exterior` | SITE | `line` | 3 | `10 5` |
| `generic` | CTRL | `line` | 2.8 | Solid |
| `relay` | RELAY | `line` | 2.8 | Solid |
| `sensor_bus` | SENSOR | `signal` | 2.4 | `8 4` |

