# Architecture and Extensibility

Diag.JS is small enough that the major extension points can be documented directly.

## Core files

| File | Role |
| --- | --- |
| `src/diagjs.ts` | Base DSL parser, electrical compiler, and electrical SVG renderer |
| `src/lane-renderer.ts` | Reusable lane-based renderer factory |
| `src/hvac.ts` | HVAC system library, heuristics, and SVG glyphs |
| `src/network.ts` | Network system library, heuristics, and SVG glyphs |
| `src/fire-alarm.ts` | Fire alarm system library, heuristics, and SVG glyphs |
| `src/lighting-control.ts` | Lighting control system library, heuristics, and SVG glyphs |
| `scripts/generate-docs.mjs` | Source-backed documentation generator for reference inventories |

## Lane renderer contract

`createLaneRenderer(...)` is the extension point for new lane-based systems.

Its configuration supplies:

| Config field | Purpose |
| --- | --- |
| `laneSpecs` | Declares the lane bands |
| `symbolAliases` | Normalizes authored symbol names |
| `symbolLibrary` | Defines canonical symbol families |
| `mediaLibrary` | Defines connection/media legend classes |
| `defaultMedium` | Fallback connection type |
| `legendTitle` | Optional legend heading |
| `subtitle` | Optional renderer subtitle |
| `inferSymbol` | Heuristic symbol selection |
| `inferLane` | Optional lane override heuristic |
| `getMedium` | Edge media selection |
| `renderGlyph` | System-specific SVG glyph drawing |
| `getParamLines` | Optional param formatting/filtering |
| `getDeviceWidth` / `getDeviceHeight` / `getPortGap` | Optional geometry tuning |

## Adding a new device family

1. Add a canonical symbol entry to the relevant symbol library.
2. Add aliases only if they are common and unambiguous.
3. Update glyph rendering if the device needs a dedicated shape.
4. Add or update inference rules if omission-based authoring should discover the new family.
5. Add or update tests.
6. Run `npm run docs:generate`.
7. Update narrative docs if the new device changes authoring guidance.

## Adding a new system

1. Create a new renderer module.
2. Define lanes, symbols, aliases, and media.
3. Implement `inferSymbol`, `inferLane` if needed, `getMedium`, and `renderGlyph`.
4. Export compile/render/class facades from `src/index.ts`.
5. Add showcase/demo coverage if the site should present it.
6. Extend `scripts/generate-docs.mjs` with the new system entry.
7. Add a system guide page under `docs/systems/`.
8. Run docs build, app build, and tests.

## Documentation architecture

The docs deliberately split into two layers:

- Narrative docs: grammar, semantics, architecture, contribution rules
- Generated docs: symbol, alias, lane, media, wire, and strata inventories

That split is what keeps the docs scalable:

- Narrative pages change when the model changes
- Generated pages change when inventories change

Do not collapse those into a single hand-maintained reference page. It does not scale.
