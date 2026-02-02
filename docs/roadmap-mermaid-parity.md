# Mermaid-inspired SLD-Graph parity roadmap

This document captures a Mermaid-inspired roadmap for expanding SLD-Graph functionality while preserving the electrical semantics layer. It is written as epics/tasks with deliverables and acceptance criteria so the work can be split into PR-sized issues.

## Epic 0: Legal, attribution, and upstream strategy

### Task 0.1: License and attribution compliance

**Goal:** Ensure the repo can legally reuse/adapt pieces from Mermaid.

**Steps**

- Add `THIRD_PARTY_NOTICES.md` listing Mermaid and any reused dependencies (dagre/elk if used).
- Add a short note in README: “Syntax inspired by Mermaid; some code adapted from Mermaid where noted.”
- Require file-level headers in any file containing copied/adapted Mermaid code with:
  - original source path/commit reference
  - copyright
  - MIT license notice

**Acceptance**

- Repo includes MIT license compatibility, third-party notices, and traceable provenance for adapted code.

## Epic 1: Replace the parser with Mermaid-grade parsing

Mermaid has a dedicated parser package (`@mermaid-js/parser`) to evaluate, or you can implement an SLD-only grammar with a similar approach. Mermaid has migrated away from older Jison-based diagram grammars and recommends Langium for new work, which matters if you plan to contribute back or mirror structure.

### Task 1.1: Parser decision spike

**Goal:** Decide whether to embed Mermaid parsing or implement an SLD-specific grammar.

**Options**

- **Option A (embed):** Use `@mermaid-js/parser` to parse flowchart syntax, then translate the resulting AST into the internal electrical graph model.
- **Option B (reimplement):** Implement a clean SLD-focused parser that is syntactically compatible with Mermaid flowcharts (at least for the subset you need), but with your own AST.

**Deliverables**

- A short `docs/parser-decision.md` covering:
  - size/performance considerations
  - compatibility goals (which Mermaid constructs you will support)
  - long-term maintainability

**Acceptance**

- One option chosen and justified.
- A minimal working proof of the chosen parse path.

### Task 1.2: Full Mermaid-style flowchart token support (subset + extensions)

**Goal:** Support these constructs in the DSL (in priority order):

1. Graph header: `graph LR|RL|TD|BU`
2. Node declarations:
   - `A[Label]`
   - `A((Circle))` / `A{Decision}` style shapes (map to electrical symbol families)
3. Edge forms:
   - `A --> B`
   - `A -.-> B`
   - `A ==> B` (main feeder)
4. Edge labels: `A -->|Feeder F-12| B`
5. Comments: `%% comment`
6. Subgraphs: `subgraph X [Title] ... end`

**Electrical extensions to support**

- Metadata blocks: `A[Label]{ v="480V", floor=2 }`
- Ports: `ATS1:emer --> MDP1:in`

**Acceptance**

- Parser outputs a stable AST for all above constructs.
- Round-trip tests: parse then re-emit a canonical format without losing meaning (except whitespace).

### Task 1.3: Parser error reporting (developer-grade)

**Goal:** Make editor-friendly errors.

**Requirements**

- Include line/column
- Provide expected token set
- Provide “did you mean” hints for:
  - unknown edge operator
  - unknown port
  - unknown device code
- Provide recoverable parsing where possible, so the editor can still render partial diagrams

**Acceptance**

- A `tests/parser-errors.spec.ts` suite with at least 20 targeted failures.

## Epic 2: Mermaid-like layout engine, but electrically aware

Mermaid’s flowcharts assign nodes to ranks/levels; users even “stretch” links by adding extra dashes in some contexts. You want layout to remain automatic, but with building-power conventions.

### Task 2.1: Introduce layout backends (Dagre first, ELK optional)

**Goal:** Match Mermaid’s “it just works” for medium-size graphs.

**Steps**

- Add an internal interface:
  - `layout(graph, config) -> positions`
- Implement **Dagre** backend for layered layout (fast and common in Mermaid flowcharts).
- Optional: add **ELK** backend later for large diagrams and better edge routing.

**Acceptance**

- Layout backend can place 200+ nodes in <1s on a typical laptop.
- Deterministic layout given same input.

### Task 2.2: Electrical ranking rules (domain constraints over pure graph)

**Goal:** Keep the diagram “electrical” without requiring users to micro-manage.

**Rules**

- Sources (`UTL`, `GEN`, `UPS` when acting as source) rank upstream.
- Transformers (`TRF`) enforce a voltage boundary: primary upstream of secondary.
- `ATS` has two sources and one load: sources upstream of load.
- Panels (`MDP`, `PNL`, `CDP`, `MCC`) rank by distance from source.
- Loads rank downstream and cluster under their feeding panel.

**Acceptance**

- Provide a `layout/electricalRanking.ts` that pre-processes the graph into rank constraints before Dagre.
- Unit tests on common building topologies.

### Task 2.3: Riser layout mode (floor banding)

**Goal:** Make risers look like risers.

**Requirements**

- If `floor` metadata present:
  - Y-position snapped to floor bands
  - floor order respected
- If subgraphs are used for floors:
  - treat subgraph title as floor label
- Floor helper lines:
  - on/off
  - label format
  - pitch

**Acceptance**

- Riser example renders with clear bands and helper lines.
- Changing `graph TD` to `graph LR` switches to SLD layout without rewriting nodes.

## Epic 3: Mermaid-grade styling features mapped to electrical semantics

### Task 3.1: Node “shape grammar” mapped to symbol families

**Goal:** Support Mermaid node shapes but map them to electrical glyph styles.

**Mapping proposal**

- `A[rect]` default: panels, generic devices
- `A((circle))`: sources (utility, generator)
- `A{diamond}`: switching logic or protective device (or reserve for future)
- `A[[subroutine]]`: transformers or packaged equipment
- Custom alias: `ATS1((ATS))` could become a standardized ATS symbol in the renderer

**Acceptance**

- Parser captures shape type.
- Renderer draws different SVG shapes or standardized icons per shape.

### Task 3.2: Mermaid-like classes and styles for voltage/system

**Goal:** Let users style by system without manual SVG hacking.

Support:

- `classDef emergency ...`
- `class ATS1,PNL_E emergency`

Then add an electrical convenience layer:

- if metadata includes `system="emergency"`, auto-assign class `emergency`.

**Acceptance**

- Classes affect node stroke/fill and edge style in SVG export.
- Styles persist in exported SVG.

## Epic 4: Edge routing upgrades (orthogonal, ports, and attachments)

### Task 4.1: Port-aware edge attachment

**Goal:** `ATS1:emer` connects to the correct side of the ATS symbol.

**Requirements**

- Define per-device port anchor points in renderer:
  - `ATS.norm` left-top, `ATS.emer` left-bottom, `ATS.load` right
  - `TRF.pri` left, `TRF.sec` right
  - `PNL.in` left, `PNL.out*` right
- If port omitted, infer best port based on edge direction and device definition.

**Acceptance**

- Visual attachments are stable and don’t overlap node labels in typical cases.

### Task 4.2: Orthogonal routing with collision avoidance (MVP level)

**Goal:** Edges should avoid going through nodes and keep a clean “one-line” feel.

**Steps**

- Implement Manhattan routing with:
  - node bounding box avoidance
  - simple channel routing by rank rows/columns
- Keep fallback to straight lines if routing fails.

**Acceptance**

- 90 percent of edges in example sets are orthogonal and do not pass through node boxes.

## Epic 5: Electrical validation layer (semantic checks)

This is the “SLD is not just a flowchart” part.

### Task 5.1: Device library with ports and rules

**Goal:** A single source of truth: device code → ports → allowed connections.

**Deliverables**

- `src/electrical/deviceCatalog.ts`:
  - codes: UTL, GEN, ATS, TRF, UPS, SWG, MDP, PNL, CDP, MCC, LOD, MTR, LGT, RCPT, HVAC, plus protection (CBR, FUS, MSW)
  - each includes:
    - ports
    - port direction (in/out)
    - allowed upstream types
    - allowed downstream types

**Acceptance**

- Catalog is used by validator and by renderer (port anchors).

### Task 5.2: Validator with actionable diagnostics

**Checks**

- ATS must have exactly two sources into `norm` and `emer` and one outgoing from `load`
- TRF must have one incoming to `pri` and outgoing from `sec`
- Panels must have max one upstream feed unless explicitly tied
- Voltage mismatch detection if `v` metadata present (warn if direct mismatch without TRF)
- Cycles (warn or error depending on configuration)
- Unknown device code or unknown port (error)

**Acceptance**

- `validate(diagram) -> diagnostics[]` used by UI
- Diagnostics include line/col ranges if parser provides them.

## Epic 6: Editor and developer experience, aligned with Mermaid workflows

### Task 6.1: Mermaid-compatible “front matter” config (optional)

**Goal:** Let users include a config header in the Mermaid style.

Example:

```text
%%{ init: { "flowchart": { "curve": "linear" } } }%%
graph TD
...
```

**Acceptance**

- Parser ignores or stores config blocks.
- Renderer uses recognized config fields (curve, spacing, etc.).

### Task 6.2: Golden examples suite

**Goal:** Ship examples that mirror common building scenarios.

Examples to include:

- Utility + generator + ATS + emergency panel
- Service transformer + main switchgear + multiple floors
- MCC branch motor loads
- UPS feeding critical distribution
- Tie between two panels (normally open dashed)
- Multi-transformer building (480V backbone, 208V floor panels)

**Acceptance**

- `examples/` folder plus screenshot/expected SVG snapshots.
- CI runs rendering snapshot tests.

## Epic 7: “Upstream tracking” tasks (stay aligned with Mermaid evolution)

Mermaid’s syntax reference changes over time and new diagrams are added.

### Task 7.1: Keep a compatibility matrix

**Goal:** Be explicit about what is supported vs Mermaid.

**Deliverable**

- `docs/compatibility.md`:
  - Supported: graph direction, subgraph, edge labels, shapes, classes
  - Not supported: unrelated Mermaid diagram types (sequence, gantt, etc.)

**Acceptance**

- Clear user expectations and fewer bug reports.

## References

- Mermaid MIT license: <https://github.com/mermaid-js/mermaid/blob/develop/LICENSE>
- Mermaid parser package: <https://www.npmjs.com/package/@mermaid-js/parser>
- Mermaid diagram grammar guidance: <https://mermaid.ai/open-source/community/new-diagram-jison.html>
- Mermaid syntax reference: <https://mermaid.js.org/intro/syntax-reference.html>
- Layout alignment discussion: <https://stackoverflow.com/questions/71095186/how-to-make-the-specified-nodes-horizontally-aligned-in-mermaid>

## How to hand these to Codex (issue format)

When you open issues or PR-sized tasks, use a consistent format so each item can be executed independently and verified quickly.

**Issue template**

- **Context:** Links to Mermaid docs or internal file references.
- **Goal:** What “done” looks like.
- **Scope boundaries:** What not to touch.
- **Acceptance tests:** Input strings and expected AST/diagnostics/SVG properties.

**Example (Task 1.2 subset)**

- **Context:** Mermaid flowchart syntax reference; existing parser entrypoint.
- **Goal:** Support `graph LR`, node shapes `A[Label]`, edge label `A -->|label| B`.
- **Scope boundaries:** Do not change rendering or layout yet.
- **Acceptance tests:**
  - Input: `graph LR\nA[Main] -->|Feed| B[Panel]`
  - Expected AST: `graph.direction = LR`, nodes `A`, `B` with labels, one edge with label `Feed`.
