# Fire Alarm

The fire alarm renderer is a lane-based schematic renderer for campus-scale fire alarm and emergency voice systems.

## API Surface

```ts
import { compileFireAlarmDiagram, renderFireAlarmSvg, FireAlarmJS } from 'diagjs';
```

## Layout model

Fire alarm diagrams are organized around functional layers:

- `command`
- `network`
- `panels`
- `annunciation`
- `slc`
- `notification`
- `specialty`
- `field`

That lets one drawing show head-end equipment, peer nodes, FACPs, loops, NACs, releasing interfaces, and field devices without flattening everything into one generic graph.

## Important params

| Param | Why it matters |
| --- | --- |
| `lane` | Overrides the default lane for a device |
| `column` | Controls horizontal placement |
| `slot` | Orders devices vertically in a shared column |
| Custom metadata such as `tower`, `building`, or `loop` | Adds visible detail without changing the language |

## Media inference

Fire alarm edge labels and lane context drive these typical media classes:

- Node ring / peer ring
- Network
- SLC
- NAC
- Audio
- Monitor
- Releasing

If you want explicit control, label edges with terms such as `network`, `slc`, `nac`, `audio`, `monitor`, or `release`.

## Example

```txt
title "Campus Fire Alarm"
node fcc "Main Command Center" symbol command_center
param fcc lane command
param fcc column 0
node tower "Tower FACP Main" symbol facp
param tower lane panels
param tower column 2
node ann "Tower Annunciator" symbol annunciator
param ann lane annunciation
param ann column 3
node smoke1 "Tower Lobby Smoke Detector" symbol smoke_detector
param smoke1 lane field
param smoke1 column 5
edge fcc tower "network"
edge tower ann "network"
edge tower smoke1 "slc"
```

## Reference links

- [Fire alarm generated reference](/reference/generated/fire-alarm)
- [Language parameters](/language/parameters)
- [Rendering model](/language/rendering-model)
