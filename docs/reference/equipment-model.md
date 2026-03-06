# Equipment Model

Diag.JS keeps device, lane, and connection definitions in plain source-level data structures. This is the foundation that makes the generated reference section possible.

## Electrical symbol definition

Electrical symbols use this conceptual shape:

| Field | Meaning |
| --- | --- |
| `typeLabel` | Short chip text shown on the symbol |
| `width` | Default symbol body width |
| `height` | Default symbol body height |
| `fill` | Outer fill color |
| `innerFill` | Inner face color used by glyph rendering |
| `stroke` | Main outline color |
| `accent` | Secondary line/text color |
| `labelChars` | Soft wrapping threshold for the node label |
| `glyph` | Optional glyph override; defaults to the canonical symbol id |

## Lane symbol definition

Lane-based symbols add one more required field:

| Field | Meaning |
| --- | --- |
| `lane` | Default lane id for the symbol family |

This is how a symbol library can express a stable default placement model before any authored `lane` override is applied.

## Lane definition

Every lane-based renderer defines lane bands with:

| Field | Meaning |
| --- | --- |
| `id` | Canonical lane token used by `param <nodeId> lane ...` |
| `label` | Human-readable lane title in the SVG |
| `order` | Vertical ordering priority |
| `tint` | Background band tint |
| `stroke` | Lane label and guide color |

## Connection definition

Electrical wire types and lane-based media classes are both source-backed definition tables.

Shared fields:

| Field | Meaning |
| --- | --- |
| `key` | Canonical internal id |
| `label` | Legend text |
| `stroke` | Main line color |
| `width` | Stroke width |
| `dasharray` | Optional dashed style |

Lane media classes also use:

| Field | Meaning |
| --- | --- |
| `accent` | Secondary highlight color |
| `style` | Visual category such as `band`, `line`, or `signal` |

## Alias maps

Alias maps normalize authored symbol text before lookup. They are how these inputs can resolve to the same symbol family:

```txt
symbol xfmr
symbol transformer
symbol tx
```

Contribution rule:

- Add aliases only when they represent common, domain-native vocabulary.
- Keep canonical symbol ids stable and lowercase.
- Do not use aliases to hide ambiguous terminology.

## Fallback symbols

Every renderer should keep a generic fallback symbol family:

- Electrical uses a fallback equipment/device shape
- Lane-based renderers use a fallback `device` family

That keeps parsing and rendering resilient, but it should not replace explicit modeling in production diagrams.

## Why this model scales

Because the inventories are plain data:

- Docs can be generated directly from source
- New systems can follow the same pattern
- New devices do not require hand-maintained reference tables
- Tests can assert library presence and fallback behavior independently of the docs
