# Fire Alarm Generated Reference

> Generated from `src/fire-alarm.ts` by `npm run docs:generate`. Edit the source library definitions, not this page.

Lane-based fire alarm renderer covering command, network, panel, loop, notification, and field layers.

## Coverage

- Symbol families: 24
- Symbol aliases: 47
- Lane bands: 8
- Circuit media: 8

## Symbol Families

| Symbol | Type Label | Glyph | Size | Default Lane |
| --- | --- | --- | --- | --- |
| `annunciator` | `ANN` | `annunciator` | 172 x 104 | `annunciation` |
| `aspirating_detector` | `ASD` | `aspirating_detector` | 168 x 102 | `specialty` |
| `beam_detector` | `BEAM` | `beam_detector` | 162 x 98 | `field` |
| `control_module` | `CTL` | `control_module` | 156 x 98 | `specialty` |
| `device` | `FA` | `device` | 150 x 96 | `field` |
| `distributed_node` | `NODE` | `distributed_node` | 184 x 108 | `network` |
| `duct_detector` | `DUCT` | `duct_detector` | 166 x 100 | `slc` |
| `elevator_interface` | `ELEV` | `elevator_interface` | 176 x 106 | `specialty` |
| `fire_panel` | `FACP` | `fire_panel` | 196 x 116 | `panels` |
| `flow_switch` | `FLOW` | `flow_switch` | 154 x 96 | `field` |
| `headend` | `FCC` | `headend` | 210 x 120 | `command` |
| `heat_detector` | `HEAT` | `heat_detector` | 148 x 94 | `field` |
| `horn_strobe` | `H/S` | `horn_strobe` | 150 x 98 | `notification` |
| `monitor_module` | `MON` | `monitor_module` | 156 x 98 | `slc` |
| `nac_extender` | `NAC` | `nac_extender` | 176 x 106 | `notification` |
| `power_supply` | `PSU` | `power_supply` | 176 x 106 | `panels` |
| `pull_station` | `PULL` | `pull_station` | 150 x 98 | `field` |
| `releasing_panel` | `REL` | `releasing_panel` | 182 x 108 | `specialty` |
| `repeater` | `RPT` | `repeater` | 172 x 104 | `annunciation` |
| `smoke_control` | `SMK` | `smoke_control` | 184 x 108 | `specialty` |
| `smoke_detector` | `SMK` | `smoke_detector` | 148 x 94 | `field` |
| `speaker_strobe` | `SPKR` | `speaker_strobe` | 156 x 98 | `notification` |
| `tamper_switch` | `TMP` | `tamper_switch` | 154 x 96 | `field` |
| `telephone_master` | `TEL` | `telephone_master` | 168 x 102 | `annunciation` |

## Symbol Aliases

Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.

| Alias | Resolves To |
| --- | --- |
| `air_sampling` | `aspirating_detector` |
| `ann` | `annunciator` |
| `aspirating_detector` | `aspirating_detector` |
| `beam` | `beam_detector` |
| `beam_detector` | `beam_detector` |
| `booster` | `nac_extender` |
| `command_center` | `headend` |
| `control` | `control_module` |
| `control_module` | `control_module` |
| `duct_detector` | `duct_detector` |
| `elevator_interface` | `elevator_interface` |
| `facp` | `fire_panel` |
| `fire_node` | `distributed_node` |
| `fire_panel` | `fire_panel` |
| `firefighter_telephone` | `telephone_master` |
| `flow` | `flow_switch` |
| `flow_switch` | `flow_switch` |
| `graphics_workstation` | `headend` |
| `head_end` | `headend` |
| `head_node` | `headend` |
| `heat` | `heat_detector` |
| `heat_detector` | `heat_detector` |
| `horn` | `horn_strobe` |
| `horn_strobe` | `horn_strobe` |
| `monitor` | `monitor_module` |
| `monitor_module` | `monitor_module` |
| `nac_extender` | `nac_extender` |
| `network_node` | `distributed_node` |
| `node` | `distributed_node` |
| `panel` | `fire_panel` |
| `phone_master` | `telephone_master` |
| `power_supply` | `power_supply` |
| `pull` | `pull_station` |
| `pull_station` | `pull_station` |
| `releasing` | `releasing_panel` |
| `releasing_panel` | `releasing_panel` |
| `remote_annunciator` | `annunciator` |
| `repeater` | `repeater` |
| `repeater_panel` | `repeater` |
| `smoke` | `smoke_detector` |
| `smoke_control` | `smoke_control` |
| `smoke_detector` | `smoke_detector` |
| `speaker` | `speaker_strobe` |
| `speaker_strobe` | `speaker_strobe` |
| `tamper` | `tamper_switch` |
| `tamper_switch` | `tamper_switch` |
| `vesda` | `aspirating_detector` |

## Lanes

Lane renderers use these bands as their stable vertical layout model. Explicit `param <nodeId> lane <laneId>` overrides the default lane assigned by the symbol library or inference rules.

| Lane Id | Label | Order |
| --- | --- | --- |
| `command` | Head-End / Command | 0 |
| `network` | Campus Fire Network | 1 |
| `panels` | Distributed Panels | 2 |
| `annunciation` | Annunciation / Repeater | 3 |
| `slc` | SLC Device Loops | 4 |
| `notification` | Notification / Audio | 5 |
| `specialty` | Interfaces / Releasing | 6 |
| `field` | Field Devices / Inputs | 7 |

## Circuit media

Media classes are assigned from edge labels and lane context. Use explicit edge labels for predictable routing legends and line styling.

| Key | Label | Style | Stroke Width | Dash Pattern |
| --- | --- | --- | --- | --- |
| `generic` | LINK | `line` | 2.8 | Solid |
| `monitor` | MON | `signal` | 2.6 | `8 4` |
| `nac` | NAC | `line` | 3.4 | Solid |
| `network` | NETWORK | `line` | 4.2 | Solid |
| `peer_ring` | NODE RING | `band` | 4.8 | `12 6` |
| `releasing` | REL | `signal` | 2.8 | `10 4 2 4` |
| `slc` | SLC | `line` | 3.2 | Solid |
| `speaker` | AUDIO | `line` | 3 | `8 5` |

