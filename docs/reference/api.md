# API

Diag.JS exports a compact API surface from `src/index.ts`.

## Electrical exports

```ts
parseDiagram(source: string): DiagramProgram
compileDiagram(ast: DiagramProgram): CompiledDiagram
renderSvg(input: string | CompiledDiagram, options?: LayoutOptions): string

class DiagJS {
  static parse(source: string): DiagramProgram
  static compile(sourceOrAst: string | DiagramProgram): CompiledDiagram
  static render(sourceOrCompiled: string | CompiledDiagram, options?: LayoutOptions): string
}
```

## Lane-based renderer exports

```ts
compileHvacDiagram(input, options?): LaneDiagramLayout
renderHvacSvg(input, options?): string
class HvacJS { parse; compile; render }

compileNetworkDiagram(input): LaneDiagramLayout
renderNetworkSvg(input): string
class NetworkJS { parse; compile; render }

compileFireAlarmDiagram(input): LaneDiagramLayout
renderFireAlarmSvg(input): string
class FireAlarmJS { parse; compile; render }

compileLightingControlDiagram(input): LaneDiagramLayout
renderLightingControlSvg(input): string
class LightingControlJS { parse; compile; render }
```

## One-shot rendering

If you already have source text and only need SVG, the simplest form is:

```ts
import { renderSvg } from 'diagjs';

const svg = renderSvg(source);
```

The same pattern exists for each lane-based system:

```ts
import { renderNetworkSvg } from 'diagjs';

const svg = renderNetworkSvg(source);
```

## Staged rendering

Use staged parsing and compilation when you need to:

- Inspect the AST
- Validate authoring before rendering
- Reuse the compiled form
- Generate SVG and non-SVG outputs from the same intermediate data later

```ts
import { parseDiagram, compileDiagram, renderSvg } from 'diagjs';

const ast = parseDiagram(source);
const compiled = compileDiagram(ast);
const svg = renderSvg(compiled);
```

## Accepted input shapes

The lane-based compilers and renderers are flexible:

- Raw source text
- Parsed program
- Base compiled diagram
- Lane layout, for render functions

That makes it possible to build higher-level tooling without rewriting the parser for every system.

## Choosing functions vs classes

Prefer functions for straightforward module use.

Use the `*JS` classes if your host environment or integration style prefers static method facades.

The classes do not expose extra capabilities; they mirror the function API.
