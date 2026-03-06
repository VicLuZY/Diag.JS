# Parameters

Parameters are the extensibility mechanism of the DSL. They attach string metadata to nodes, drive renderer behavior, and surface directly in the SVG when not reserved for layout.

## Core Behavior

`param` values are stored exactly as strings in the compiled node object.

That has a few consequences:

- Numeric-looking values such as `3000A` or `1450gpm` are not type-checked.
- Renderers may parse specific params heuristically for layout or classification.
- Unknown params are preserved rather than rejected.

This is intentionally permissive. The docs define conventions; the parser does not enforce a strict schema.

## Reserved Layout Params

These keys have structural meaning in lane-based renderers:

| Param | Meaning | Notes |
| --- | --- | --- |
| `lane` | Overrides the default lane band for a node | Invalid lane ids are ignored and the renderer falls back to inferred/default lane selection |
| `column` | Horizontal placement group | Parsed with `Number(...)`; invalid values fall back to `0` |
| `slot` | Vertical order within a column | Parsed with `Number(...)`; invalid values fall back to `0` |

Lane-based renderers hide `lane`, `column`, and `slot` from the visible parameter text block because they are layout controls, not content metadata.

## Electrical-Specific Semantic Params

The electrical renderer pays attention to these keys:

| Param | Effect |
| --- | --- |
| `voltage` | Primary voltage text and voltage-strata inference |
| `system` | Voltage/system text and voltage-strata inference |
| `secondary` | Transformer/panel voltage text and voltage-strata inference |
| `primary` | Additional voltage context for display/inference |
| `main` | Shapes assembly main-device presentation |
| `input` | Alternate way to shape assembly main-device presentation |

Assembly main-device behavior is inferred from `main` or `input` values:

- Values containing `lug` or `mlo` render as `mlo`
- Values containing `fuse` render as `fuse`
- Values containing `switch` render as `disconnect`
- Panels default to `mlo` when nothing is specified
- Other assemblies default to `breaker`

## Metadata Params

Everything else is renderer-defined or project-defined metadata.

Examples:

- `ampacity`
- `rating`
- `flow`
- `capacity`
- `power`
- `type`
- `duty`
- `airflow`
- `reheat`

These values typically render as `key: value` lines beneath the node unless the renderer supplies custom parameter filtering.

## Quoting Rules

Use quotes whenever the value contains spaces:

```txt
param msb type "normal source"
param cluster role "leaf-spine compute"
```

Without quotes, only the first token is captured.

## Overwrite Semantics

If the same parameter key appears multiple times for a node, the last value wins:

```txt
param MSB system 480V
param MSB system 480Y/277V
```

The final compiled value is `480Y/277V`.

## Authoring Guidance

- Keep reserved params lowercase.
- Keep custom keys stable across projects.
- Prefer short, domain-native values such as `208Y/120V`, `100G`, or `hot-water`.
- Use quotes for any value that a human would naturally read as a phrase.
- Treat params as part of the authored drawing, not as a hidden data bag; if a value matters, name it clearly.
