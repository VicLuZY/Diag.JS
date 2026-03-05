import type { DiagramMetadata } from '../types.js';

// cspell:ignore GENS ATSS SWGR EMTC CABX PNLB BRKR LGHT AHUX TRFM

export default {
  id: 'sld',
  name: 'Single-line diagram (SLD)',
  description:
    'Electrical single-line diagrams with 4-character type codes (rule), ATS/GEN/UTIL semantics, bus/panel distribution, cable/conduit runs, and edge metadata.',
  examples: [
    {
      title: 'Building power: ATS + switchgear + panel distribution',
      isDefault: true,
      code: `sld LR
%% Rule: all type definitions use exactly 4 uppercase characters.
%% Sources
UTIL1[Utility]{v="480V"}
GENS1[Generator]{v="480V"}

%% ATS assembly (basic + output breaker)
ATSS1[Main ATS]{profile="basic", out_breaker=true}
SWGR1[Switchgear]{v="480V"}

%% Utility path
UTIL1 --> ATSS1:norm
GENS1 --> ATSS1:emer
ATSS1:load ==> SWGR1

%% Feeder with label and metadata
SWGR1 -->|Feeder F-12| COND1{type="EMTC", size="2in", len="12m"}
    --> CABX1{cond="4C", size="3/0", len="12m"}
    --> PNLB1[Panel L1]{v="480V"}

%% Panel branches
PNLB1 --> BRKR_PNLB1_1 --> CABX2 --> LGHT1[Lighting]
PNLB1 --> BRKR_PNLB1_2 --> CABX3 --> RCPT1[Receptacles]
PNLB1 --> BRKR_PNLB1_3 --> CABX4 --> AHUX1[AHU]`,
    },
    {
      title: 'Service transformer and panel',
      code: `sld LR
%% Rule: all type definitions use exactly 4 uppercase characters.
UTIL1[Utility]{v="12.47kV"}
TRFM1[Service XFMR]{kva=1500, v_in="12.47kV", v_out="480V"}
SWGR1[Switchgear]{v="480V"}
PNLB1[Panel]{v="480V"}

UTIL1 --> TRFM1
TRFM1 ==> SWGR1
SWGR1 -->|F-01| PNLB1`,
    },
    {
      title: 'Bus tie between switchgear sections',
      code: `sld LR
%% Rule: all type definitions use exactly 4 uppercase characters.
SWGR_A[SWG A]{v="480V"} <--> BRKR_TIE[Bus Tie]{state="NO"} <--> SWGR_B[SWG B]{v="480V"}
SWGR_A --> LOAD1[Load A]
SWGR_B --> LOAD2[Load B]`,
    },
  ],
} satisfies DiagramMetadata;
