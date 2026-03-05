import type { DiagramMetadata } from '../types.js';

export default {
  id: 'sld',
  name: 'Single-line diagram (SLD)',
  description:
    'Electrical single-line diagrams with ATS, GEN, UTIL, bus, panel, cable/conduit, and edge metadata.',
  examples: [
    {
      title: 'Building power: ATS + switchgear + panel distribution',
      isDefault: true,
      code: `sld LR
%% Sources
UTL1[Utility]{v="480V"}
GEN1[Generator]{v="480V"}

%% ATS assembly (basic + output breaker)
ATS1[Main ATS]{profile="basic", out_breaker=true}
SWG1[Switchgear]{v="480V"}

%% Utility path
UTL1 --> ATS1:norm
GEN1 --> ATS1:emer
ATS1:load ==> SWG1

%% Feeder with label and metadata
SWG1 -->|Feeder F-12| CND1{type="EMT", size="2in", len="12m"}
    --> CAB1{cond="4C", size="3/0", len="12m"}
    --> PNL1[Panel L1]{v="480V"}

%% Panel branches
PNL1 --> CBR_PNL1_1 --> CAB2 --> LGT1[Lighting]
PNL1 --> CBR_PNL1_2 --> CAB3 --> RCP1[Receptacles]
PNL1 --> CBR_PNL1_3 --> CAB4 --> AHU1[AHU]`,
    },
    {
      title: 'Service transformer and panel',
      code: `sld LR
UTL1[Utility]{v="12.47kV"}
TRF1[Service XFMR]{kva=1500, v_in="12.47kV", v_out="480V"}
SWG1[Switchgear]{v="480V"}
PNL1[Panel]{v="480V"}

UTL1 --> TRF1
TRF1 ==> SWG1
SWG1 -->|F-01| PNL1`,
    },
    {
      title: 'Bus tie between switchgear sections',
      code: `sld LR
SWG_A[SWG A]{v="480V"} <--> CBR_TIE[Bus Tie]{state="NO"} <--> SWG_B[SWG B]{v="480V"}
SWG_A --> LOD1[Load A]
SWG_B --> LOD2[Load B]`,
    },
  ],
} satisfies DiagramMetadata;
