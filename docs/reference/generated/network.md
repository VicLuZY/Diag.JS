# Network Generated Reference

> Generated from `src/network.ts` by `npm run docs:generate`. Edit the source library definitions, not this page.

Lane-based network renderer for campus, core, fabric, storage, and edge infrastructure diagrams.

## Coverage

- Symbol families: 20
- Symbol aliases: 42
- Lane bands: 8
- Link media: 11

## Symbol Families

| Symbol | Type Label | Glyph | Size | Default Lane |
| --- | --- | --- | --- | --- |
| `access_stack` | `ACC` | `access_stack` | 178 x 106 | `edge` |
| `backup_appliance` | `BKP` | `backup_appliance` | 184 x 110 | `storage` |
| `building_gateway` | `BLDG` | `building_gateway` | 180 x 112 | `building` |
| `carrier_cloud` | `WAN` | `carrier_cloud` | 188 x 108 | `external` |
| `core_switch` | `CORE` | `core_switch` | 182 x 108 | `core` |
| `device` | `NET` | `device` | 160 x 98 | `edge` |
| `firewall` | `FW` | `firewall` | 176 x 108 | `services` |
| `gpu_cluster` | `GPU` | `gpu_cluster` | 204 x 118 | `fabric` |
| `idf_switch` | `IDF` | `idf_switch` | 166 x 100 | `building` |
| `leaf_switch` | `LEAF` | `leaf_switch` | 170 x 102 | `fabric` |
| `load_balancer` | `ADC` | `load_balancer` | 176 x 108 | `services` |
| `mgmt_switch` | `OOB` | `mgmt_switch` | 168 x 100 | `services` |
| `san_switch` | `SAN` | `san_switch` | 170 x 102 | `storage` |
| `security_cluster` | `SEC` | `security_cluster` | 190 x 112 | `services` |
| `service_cluster` | `SVC` | `service_cluster` | 188 x 112 | `services` |
| `spine_switch` | `SPINE` | `spine_switch` | 170 x 102 | `fabric` |
| `storage_array` | `STOR` | `storage_array` | 194 x 114 | `storage` |
| `virtualization_cluster` | `VM` | `virtualization_cluster` | 204 x 118 | `fabric` |
| `wan_router` | `RTR` | `wan_router` | 168 x 104 | `core` |
| `wireless_controller` | `WLC` | `wireless_controller` | 176 x 106 | `building` |

## Symbol Aliases

Aliases are normalized before symbol lookup. For deterministic output, prefer explicit canonical symbol names in authored diagrams.

| Alias | Resolves To |
| --- | --- |
| `access_layer` | `access_stack` |
| `access_switch` | `access_stack` |
| `adc` | `load_balancer` |
| `agg_switch` | `core_switch` |
| `aggregation_switch` | `core_switch` |
| `ai_cluster` | `gpu_cluster` |
| `auth` | `service_cluster` |
| `backup` | `backup_appliance` |
| `border_router` | `wan_router` |
| `building_edge` | `building_gateway` |
| `carrier` | `carrier_cloud` |
| `carrier_cloud` | `carrier_cloud` |
| `cloud` | `carrier_cloud` |
| `compute_cluster` | `virtualization_cluster` |
| `core` | `core_switch` |
| `core_router` | `core_switch` |
| `dhcp` | `service_cluster` |
| `dns` | `service_cluster` |
| `edge_router` | `wan_router` |
| `fibre_channel` | `san_switch` |
| `firewall_cluster` | `firewall` |
| `fw` | `firewall` |
| `gateway` | `building_gateway` |
| `gpu` | `gpu_cluster` |
| `hypervisor_cluster` | `virtualization_cluster` |
| `idf` | `idf_switch` |
| `internet` | `carrier_cloud` |
| `isp` | `carrier_cloud` |
| `lb` | `load_balancer` |
| `leaf` | `leaf_switch` |
| `management_switch` | `mgmt_switch` |
| `ntp` | `service_cluster` |
| `oob` | `mgmt_switch` |
| `router` | `wan_router` |
| `san` | `san_switch` |
| `security` | `security_cluster` |
| `spine` | `spine_switch` |
| `storage` | `storage_array` |
| `virtualization` | `virtualization_cluster` |
| `vmware` | `virtualization_cluster` |
| `wan` | `wan_router` |
| `wlc` | `wireless_controller` |

## Lanes

Lane renderers use these bands as their stable vertical layout model. Explicit `param <nodeId> lane <laneId>` overrides the default lane assigned by the symbol library or inference rules.

| Lane Id | Label | Order |
| --- | --- | --- |
| `external` | External / Carrier | 0 |
| `campus` | Campus Backbone | 1 |
| `core` | Core / Border | 2 |
| `services` | Shared Services | 3 |
| `fabric` | Compute Fabric | 4 |
| `storage` | Storage / Backup | 5 |
| `building` | Building / Tenant Edge | 6 |
| `edge` | User / OT Edge | 7 |

## Link media

Media classes are assigned from edge labels and lane context. Use explicit edge labels for predictable routing legends and line styling.

| Key | Label | Style | Stroke Width | Dash Pattern |
| --- | --- | --- | --- | --- |
| `access` | 10/25G | `line` | 3.6 | Solid |
| `backbone_400g` | 400G | `band` | 5.6 | Solid |
| `core_100g` | 100G | `band` | 4.8 | Solid |
| `fabric_100g` | 100G FABRIC | `band` | 4.6 | Solid |
| `generic` | LINK | `line` | 3.2 | Solid |
| `internet` | INTERNET | `band` | 5.4 | `16 8` |
| `mgmt` | MGMT | `signal` | 2.8 | `10 5 2 5` |
| `security` | SEC | `line` | 3 | Solid |
| `storage_eth` | 25G | `line` | 3.8 | Solid |
| `storage_fc` | 32G FC | `line` | 4.2 | `8 5` |
| `wifi` | WIFI | `signal` | 3 | `6 5` |

