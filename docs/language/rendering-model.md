# Rendering Model

Diag.JS has one language and two presentation families:

- The electrical single-line renderer
- The reusable lane-based renderer family used by HVAC, network, fire alarm, and lighting control

## Pipeline

All systems share the same top-level flow:

1. `parseDiagram(source)` converts text into an AST.
2. `compileDiagram(ast)` resolves nodes, params, and edges into a compiled graph.
3. A renderer-specific compile step may build richer layout metadata.
4. A renderer turns the layout into SVG.

The lane-based systems accept raw source, the parsed program, or the compiled base diagram and then apply their own lane/media layout phase on top.

## Symbol Resolution

Renderers resolve symbols in this order:

1. Explicit `symbol` on the node
2. Symbol normalization (`-` becomes `_`, text is lowercased)
3. Alias map lookup
4. Heuristic inference from ids, labels, and sometimes param text
5. Fallback generic symbol (`device` or `equipment`)

Implication:

- Omitted symbols are convenient.
- Explicit symbols are safer for long-lived diagrams, test fixtures, and documentation.

## Electrical Renderer Semantics

The electrical renderer is optimized for feeder-oriented single-line drawings.

### Voltage strata

Electrical nodes are grouped into visual background bands:

- High-voltage distribution
- Low-voltage distribution
- Low-voltage utilization

Strata are inferred from:

- `voltage`
- `system`
- `secondary`
- `primary`
- Symbol defaults for major equipment families

### Assemblies

Three electrical symbol families render as assemblies rather than simple devices:

- `switchboard`
- `panel`
- `mcc`

Assemblies expose structured internal graphics and choose a main-device presentation from `main`/`input` heuristics.

### Wire classes

Electrical edges are classified into four wire types:

- Service
- Feeder
- Branch
- Control

Edge labels and endpoint symbol types influence the selection.

## Lane-Based Renderer Semantics

The lane renderer is the scalable model for systems that need loops, reverse paths, and functional layers.

### Lanes

Each node is placed on a lane band.

Lane selection comes from:

1. Explicit `param <id> lane <laneId>`
2. Renderer-specific lane inference
3. The symbol library default lane

### Columns and slots

- `column` controls left-to-right grouping
- `slot` controls top-to-bottom order inside a column

Nodes in the same lane and column are stacked by `slot`, then by id.

### Connection routing

Forward edges route directly from left to right.

Reverse edges detour above the active lane bands. This is why lane-based renderers remain legible even when systems loop back or cross functional layers.

### Media classes

Lane-based renderers assign each edge a media class from:

- Explicitly informative labels such as `DALI`, `SLC`, `100G`, or `CHWS`
- Endpoint lane context when labels are absent

Only media actually used in the active diagram appear in the legend.

## Parameter Display

- Electrical renders all params as visible metadata.
- Lane renderers suppress `lane`, `column`, and `slot` in the visible param block.
- Other params are displayed as `key: value` lines unless a renderer customizes formatting.

## Determinism vs Convenience

For the most predictable output:

- Set `symbol` explicitly.
- Set `lane`, `column`, and `slot` explicitly on lane-based diagrams.
- Use informative edge labels to steer media/wire inference.
- Use lowercase reserved parameter keys.
