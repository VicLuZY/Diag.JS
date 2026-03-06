# HVAC

The HVAC renderer is a lane-based mechanical schematic renderer. It handles airside sequences, hydronic loops, condenser systems, terminal devices, and controls on the same sheet.

## API Surface

```ts
import { compileHvacDiagram, renderHvacSvg, HvacJS } from 'diagjs';
```

## Layout model

HVAC uses dedicated lane bands and stable column placement.

Common lane ids:

- `condenser`
- `chilled`
- `air`
- `exhaust`
- `heating`
- `controls`
- `terminal`

Use `column` and `slot` to keep large schematics stable and reviewable.

## Important params

| Param | Why it matters |
| --- | --- |
| `lane` | Overrides the default lane |
| `column` | Places the node horizontally |
| `slot` | Orders the node vertically in a column |
| Any custom metadata such as `flow`, `capacity`, `type`, `airflow`, `reheat` | Displays beneath the node and can reinforce system intent |

## Media inference

HVAC edges infer media from labels and lane context. Common classes include:

- Outside air
- Mixed air
- Supply air
- Return air
- Exhaust air
- Relief air
- Chilled water supply/return
- Heating water supply/return
- Condenser water supply/return
- Condensate
- Controls

Use explicit edge labels when you need a specific legend entry and line treatment.

## Example

```txt
title "Office Tower HVAC Mechanical Schematic"
node OA1 "Outside Air Intake Louver" symbol outside-air
param OA1 lane air
param OA1 column 0
node AHU1 "AHU-1" symbol ahu
param AHU1 lane air
param AHU1 column 2
node VAV1 "VAV-1 East Open Office" symbol vav
param VAV1 lane air
param VAV1 column 4
param VAV1 reheat hot-water
node ZN1 "Open Office East" symbol zone
param ZN1 lane terminal
param ZN1 column 6
edge OA1 AHU1 "outside air"
edge AHU1 VAV1 "supply air"
edge VAV1 ZN1 "supply air"
```

## Reference links

- [HVAC generated reference](/reference/generated/hvac)
- [Language parameters](/language/parameters)
- [Rendering model](/language/rendering-model)
