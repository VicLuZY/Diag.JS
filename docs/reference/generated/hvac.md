# HVAC Generated Reference

> Generated from `src/hvac.ts` by `npm run docs:generate`. Edit the source library definitions, not this page.

Lane-based HVAC renderer with dedicated air, water, and control media for mechanical schematics.

## Coverage

- Symbol families: 45
- Symbol aliases: 103
- Lane bands: 7
- Media classes: 15

## Symbol Families

| Symbol | Type Label | Glyph | Size | Default Lane |
| --- | --- | --- | --- | --- |
| `ahu` | `AHU` | `ahu` | 238 x 132 | `air` |
| `air_separator` | `SEP` | `air_separator` | 166 x 112 | `heating` |
| `balancing_valve` | `BV` | `balancing_valve` | 150 x 98 | `heating` |
| `bms` | `BMS` | `bms` | 176 x 104 | `controls` |
| `boiler` | `BLR` | `boiler` | 188 x 124 | `heating` |
| `check_valve` | `CHK` | `check_valve` | 148 x 94 | `chilled` |
| `chiller` | `CHLR` | `chiller` | 214 x 128 | `chilled` |
| `control_valve` | `CV` | `control_valve` | 150 x 98 | `chilled` |
| `cooling_coil` | `CC` | `cooling_coil` | 162 x 108 | `air` |
| `cooling_tower` | `CT` | `cooling_tower` | 190 x 128 | `condenser` |
| `damper` | `DMP` | `damper` | 156 x 102 | `air` |
| `device` | `HVAC` | `device` | 156 x 100 | `air` |
| `diffuser` | `SUP` | `diffuser` | 150 x 96 | `terminal` |
| `dirt_separator` | `DIRT` | `dirt_separator` | 166 x 112 | `chilled` |
| `doas` | `DOAS` | `doas` | 242 x 136 | `air` |
| `duct` | `DUCT` | `duct` | 208 x 86 | `air` |
| `energy_recovery` | `ERV` | `energy_recovery` | 180 x 112 | `air` |
| `exhaust_fan` | `EF` | `exhaust_fan` | 156 x 104 | `exhaust` |
| `expansion_tank` | `XT` | `expansion_tank` | 160 x 116 | `heating` |
| `fan` | `SF` | `fan` | 156 x 104 | `air` |
| `fan_coil` | `FCU` | `fan_coil` | 182 x 112 | `terminal` |
| `filter` | `FLT` | `filter` | 156 x 102 | `air` |
| `fire_smoke_damper` | `FSD` | `fire_smoke_damper` | 156 x 104 | `air` |
| `header` | `HDR` | `header` | 228 x 88 | `chilled` |
| `heat_exchanger` | `HX` | `heat_exchanger` | 174 x 112 | `chilled` |
| `heat_pump` | `HP` | `heat_pump` | 188 x 120 | `air` |
| `heating_coil` | `HC` | `heating_coil` | 162 x 108 | `air` |
| `humidifier` | `HUM` | `humidifier` | 170 x 108 | `air` |
| `isolation_valve` | `IV` | `isolation_valve` | 148 x 94 | `heating` |
| `mixing_box` | `MIX` | `mixing_box` | 188 x 118 | `air` |
| `outside_air` | `OA` | `outside_air` | 176 x 112 | `air` |
| `pump` | `PUMP` | `pump` | 166 x 108 | `chilled` |
| `reheat_coil` | `RH` | `reheat_coil` | 162 x 104 | `heating` |
| `relief_fan` | `REL` | `relief_fan` | 156 x 104 | `exhaust` |
| `relief_louver` | `EA` | `relief_louver` | 176 x 112 | `exhaust` |
| `return_fan` | `RF` | `return_fan` | 156 x 104 | `air` |
| `return_grille` | `RET` | `return_grille` | 150 x 96 | `terminal` |
| `rtu` | `RTU` | `rtu` | 218 x 128 | `air` |
| `sensor` | `SNS` | `sensor` | 140 x 90 | `controls` |
| `sound_attenuator` | `SIL` | `sound_attenuator` | 170 x 102 | `air` |
| `strainer` | `STR` | `strainer` | 160 x 102 | `chilled` |
| `thermostat` | `TSTAT` | `thermostat` | 144 x 94 | `controls` |
| `unit_heater` | `UH` | `unit_heater` | 176 x 108 | `terminal` |
| `vav` | `VAV` | `vav` | 170 x 108 | `air` |
| `zone` | `ZONE` | `zone` | 176 x 104 | `terminal` |

## Symbol Aliases

Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.

| Alias | Resolves To |
| --- | --- |
| `air_handler` | `ahu` |
| `air_handling_unit` | `ahu` |
| `air_separator` | `air_separator` |
| `balancing_valve` | `balancing_valve` |
| `ball_valve` | `isolation_valve` |
| `bas` | `bms` |
| `basket_strainer` | `strainer` |
| `bms` | `bms` |
| `boiler` | `boiler` |
| `boiler_plant` | `boiler` |
| `butterfly_valve` | `isolation_valve` |
| `bv` | `balancing_valve` |
| `cav_box` | `vav` |
| `ceiling_diffuser` | `diffuser` |
| `check_valve` | `check_valve` |
| `chilled_water_coil` | `cooling_coil` |
| `chlr` | `chiller` |
| `chw_coil` | `cooling_coil` |
| `circuit_setter` | `balancing_valve` |
| `condensing_unit` | `heat_pump` |
| `control_valve` | `control_valve` |
| `controls_panel` | `bms` |
| `cooling_coil` | `cooling_coil` |
| `cooling_tower` | `cooling_tower` |
| `cooling_tower_cell` | `cooling_tower` |
| `ct` | `cooling_tower` |
| `cv` | `control_valve` |
| `damper_section` | `damper` |
| `dedicated_outdoor_air_system` | `doas` |
| `diffuser` | `diffuser` |
| `dirt_separator` | `dirt_separator` |
| `doas` | `doas` |
| `duct` | `duct` |
| `duct_main` | `duct` |
| `dx_coil` | `cooling_coil` |
| `energy_recovery` | `energy_recovery` |
| `energy_recovery_wheel` | `energy_recovery` |
| `erv` | `energy_recovery` |
| `exhaust_fan` | `exhaust_fan` |
| `exhaust_louver` | `relief_louver` |
| `expansion_tank` | `expansion_tank` |
| `fan_array` | `fan` |
| `fan_coil_unit` | `fan_coil` |
| `fcu` | `fan_coil` |
| `filter_bank` | `filter` |
| `final_filter` | `filter` |
| `fire_smoke_damper` | `fire_smoke_damper` |
| `grille` | `return_grille` |
| `header` | `header` |
| `heat_exchanger` | `heat_exchanger` |
| `heat_pump` | `heat_pump` |
| `heater` | `unit_heater` |
| `heating_coil` | `heating_coil` |
| `hhw_coil` | `heating_coil` |
| `hot_water_coil` | `heating_coil` |
| `hrv` | `energy_recovery` |
| `humidifier_grid` | `humidifier` |
| `hx` | `heat_exchanger` |
| `intake_louver` | `outside_air` |
| `isolation_valve` | `isolation_valve` |
| `iv` | `isolation_valve` |
| `louver` | `outside_air` |
| `louvers` | `outside_air` |
| `make_up_air_unit` | `ahu` |
| `makeup_air_unit` | `ahu` |
| `manifold` | `header` |
| `mau` | `ahu` |
| `mixed_air_box` | `mixing_box` |
| `mixing_box` | `mixing_box` |
| `oa_louver` | `outside_air` |
| `oad` | `damper` |
| `outside_air_louver` | `outside_air` |
| `plate_heat_exchanger` | `heat_exchanger` |
| `plate_hx` | `heat_exchanger` |
| `prefilter` | `filter` |
| `rad` | `damper` |
| `reheat_coil` | `reheat_coil` |
| `relief_fan` | `relief_fan` |
| `relief_louver` | `relief_louver` |
| `return_fan` | `return_fan` |
| `return_grille` | `return_grille` |
| `rooftop_unit` | `rtu` |
| `room` | `zone` |
| `rtu` | `rtu` |
| `sensor` | `sensor` |
| `silencer` | `sound_attenuator` |
| `smoke_damper` | `fire_smoke_damper` |
| `sound_attenuator` | `sound_attenuator` |
| `space` | `zone` |
| `space_sensor` | `thermostat` |
| `steam_grid` | `humidifier` |
| `strainer` | `strainer` |
| `supply_fan` | `fan` |
| `terminal_unit` | `vav` |
| `thermostat` | `thermostat` |
| `transfer_grille` | `return_grille` |
| `two_way_valve` | `control_valve` |
| `unit_heater` | `unit_heater` |
| `vav_box` | `vav` |
| `vrf` | `heat_pump` |
| `xtank` | `expansion_tank` |
| `y_strainer` | `strainer` |
| `zone` | `zone` |

## Lanes

Lane renderers use these bands as their stable vertical layout model. Explicit `param <nodeId> lane <laneId>` overrides the default lane assigned by the symbol library or inference rules.

| Lane Id | Label | Order |
| --- | --- | --- |
| `condenser` | Condenser Water | 0 |
| `chilled` | Chilled Water | 1 |
| `air` | Airside Process | 2 |
| `exhaust` | Relief / Exhaust | 3 |
| `heating` | Heating Water | 4 |
| `controls` | Controls | 5 |
| `terminal` | Zones / Terminals | 6 |

## Media classes

Media classes are assigned from edge labels and lane context. Use explicit edge labels for predictable routing legends and line styling.

| Key | Label | Style | Stroke Width | Dash Pattern |
| --- | --- | --- | --- | --- |
| `chilled_water_return` | CHWR | `pipe` | 3.6 | `10 6` |
| `chilled_water_supply` | CHWS | `pipe` | 3.6 | Solid |
| `condensate` | COND | `pipe` | 2.6 | `4 4` |
| `condenser_water_return` | CWR | `pipe` | 3.5 | `10 6` |
| `condenser_water_supply` | CWS | `pipe` | 3.5 | Solid |
| `controls` | CTRL | `control` | 2.4 | `10 4 2 4` |
| `exhaust_air` | EA | `air` | 5.1 | `8 6` |
| `generic` | LINE | `pipe` | 3.2 | Solid |
| `heating_water_return` | HHWR | `pipe` | 3.6 | `10 6` |
| `heating_water_supply` | HHWS | `pipe` | 3.6 | Solid |
| `mixed_air` | MA | `air` | 5.4 | `10 6` |
| `outside_air` | OA | `air` | 5.2 | `14 7` |
| `relief_air` | REL | `air` | 5.1 | `6 6` |
| `return_air` | RA | `air` | 5.3 | `12 7` |
| `supply_air` | SA | `air` | 5.8 | Solid |

