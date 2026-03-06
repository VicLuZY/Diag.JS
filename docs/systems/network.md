# Network

The network renderer is a lane-based infrastructure schematic renderer for carrier ingress, campus backbone, core, services, compute fabric, storage, and building edge.

## API Surface

```ts
import { compileNetworkDiagram, renderNetworkSvg, NetworkJS } from 'diagjs';
```

## Layout model

The network renderer groups infrastructure into functional bands such as:

- `external`
- `campus`
- `core`
- `services`
- `fabric`
- `storage`
- `building`
- `edge`

This makes it possible to draw the whole stack on one sheet without collapsing all devices into a flat tier diagram.

## Important params

| Param | Why it matters |
| --- | --- |
| `lane` | Explicitly places the device on a functional band |
| `column` | Controls left-to-right flow |
| `slot` | Orders peer devices in one column |
| Custom metadata such as `role`, `cluster`, or `site` | Provides visible context without changing parser rules |

## Media inference

Network edges infer media from explicit labels and lane context. Typical classes include:

- `internet`
- `400G`
- `100G`
- `100G fabric`
- `32G FC`
- `MGMT`
- `WIFI`
- Security overlays
- Access links

Use labels such as `internet`, `400G`, `fabric`, `san`, `wifi`, or `security` when you need precise control.

## Example

```txt
title "Data Centre Fabric"
node wan "Carrier Internet" symbol cloud
param wan lane external
param wan column 0
node core "Core Switch Pair" symbol core
param core lane core
param core column 1
node spine "Spine Fabric A" symbol spine
param spine lane fabric
param spine column 2
node cluster "Virtualization Cluster A" symbol virtualization
param cluster lane fabric
param cluster column 3
edge wan core "internet"
edge core spine "100G fabric"
edge spine cluster "100G fabric"
```

## Reference links

- [Network generated reference](/reference/generated/network)
- [Language parameters](/language/parameters)
- [Rendering model](/language/rendering-model)
