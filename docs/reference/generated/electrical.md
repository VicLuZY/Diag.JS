# Electrical Generated Reference

> Generated from `src/diagjs.ts` by `npm run docs:generate`. Edit the source library definitions, not this page.

Tree-oriented single-line renderer with voltage strata, assembly presentations, and wire-type inference.

## Coverage

- Symbol families: 34
- Symbol aliases: 40
- Voltage strata: 3
- Wire types: 4

## Symbol Families

| Symbol | Type Label | Glyph | Size | Presentation |
| --- | --- | --- | --- | --- |
| `ats` | `ATS` | `ats` | 178 x 104 | Device |
| `battery` | `BATT` | `battery` | 162 x 100 | Device |
| `boiler` | `BLR` | `boiler` | 156 x 100 | Device |
| `breaker` | `CB` | `breaker` | 150 x 98 | Device |
| `busway` | `BUS` | `busway` | 176 x 94 | Device |
| `capacitor` | `CAP` | `capacitor` | 150 x 96 | Device |
| `chiller` | `CHLR` | `chiller` | 170 x 102 | Device |
| `device` | `DEVICE` | `device` | 142 x 96 | Device |
| `disconnect` | `DISC` | `disconnect` | 150 x 98 | Device |
| `elevator` | `ELEV` | `elevator` | 150 x 100 | Device |
| `equipment` | `LOAD` | `equipment` | 140 x 96 | Device |
| `fan` | `FAN` | `fan` | 138 x 98 | Device |
| `fuse` | `FUSE` | `fuse` | 146 x 96 | Device |
| `generator` | `GEN` | `generator` | 184 x 104 | Device |
| `ground` | `GND` | `ground` | 138 x 92 | Device |
| `heat_exchanger` | `HX` | `heat_exchanger` | 148 x 98 | Device |
| `hvac` | `HVAC` | `hvac` | 168 x 102 | Device |
| `inverter` | `INV` | `inverter` | 164 x 100 | Device |
| `lighting` | `LOAD` | `lighting` | 132 x 96 | Device |
| `mcc` | `MCC` | `mcc` | 236 x 150 | Assembly |
| `meter` | `METER` | `meter` | 150 x 96 | Device |
| `motor` | `LOAD` | `motor` | 132 x 96 | Device |
| `panel` | `PANEL` | `panel` | 210 x 138 | Assembly |
| `pump` | `PUMP` | `pump` | 140 x 98 | Device |
| `receptacle` | `LOAD` | `receptacle` | 132 x 96 | Device |
| `relay` | `RELAY` | `relay` | 156 x 98 | Device |
| `rtu` | `RTU` | `rtu` | 170 x 102 | Device |
| `solar` | `PV` | `solar` | 172 x 102 | Device |
| `switchboard` | `SWBD` | `switchboard` | 242 x 148 | Assembly |
| `tank` | `TANK` | `tank` | 146 x 100 | Device |
| `transformer` | `XFMR` | `transformer` | 194 x 112 | Device |
| `ups` | `UPS` | `ups` | 170 x 102 | Device |
| `utility` | `UTILITY` | `utility` | 184 x 108 | Device |
| `valve` | `VALVE` | `valve` | 136 x 94 | Device |

## Symbol Aliases

Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.

| Alias | Resolves To |
| --- | --- |
| `air_handler` | `hvac` |
| `air_handling_unit` | `hvac` |
| `boiler_plant` | `boiler` |
| `breaker_switch` | `breaker` |
| `cap_bank` | `capacitor` |
| `capacitor_bank` | `capacitor` |
| `cb` | `breaker` |
| `chlr` | `chiller` |
| `converter` | `inverter` |
| `disco` | `disconnect` |
| `elev` | `elevator` |
| `elv` | `elevator` |
| `exhaust_fan` | `fan` |
| `gen` | `generator` |
| `genset` | `generator` |
| `hvac_unit` | `hvac` |
| `hx` | `heat_exchanger` |
| `isolator` | `disconnect` |
| `knife_switch` | `disconnect` |
| `lift` | `elevator` |
| `load` | `equipment` |
| `mcp` | `panel` |
| `metering` | `meter` |
| `ocpd` | `breaker` |
| `panelboard` | `panel` |
| `pcs` | `inverter` |
| `photovoltaic` | `solar` |
| `protection_relay` | `relay` |
| `pv` | `solar` |
| `relief_fan` | `fan` |
| `rooftop_unit` | `rtu` |
| `rtu` | `rtu` |
| `static_switch` | `ats` |
| `supply_fan` | `fan` |
| `swbd` | `switchboard` |
| `switchgear` | `switchboard` |
| `transfer_switch` | `ats` |
| `tx` | `transformer` |
| `utility_service` | `utility` |
| `xfmr` | `transformer` |

## Voltage Strata

Electrical diagrams group equipment into visual voltage bands based on explicit voltage-like params or symbol heuristics.

| Key | Label |
| --- | --- |
| `hv` | HV Distribution (25 kV class) |
| `lv600` | LV Distribution (600 V class) |
| `lv208` | LV Utilization (208Y/120 V) |

## Wire types

Wire types are assigned from edge labels and endpoint types. Use explicit edge labels such as `service`, `branch`, or `control` when you want to steer the visual treatment.

| Key | Label | Stroke Width | Dash Pattern |
| --- | --- | --- | --- |
| `service` | Utility service / feeder | 2.5 | Solid |
| `feeder` | Distribution feeder | 2.1 | Solid |
| `branch` | Branch circuit | 1.6 | `8 6` |
| `control` | Control / signal wiring | 1.4 | `3 5` |

