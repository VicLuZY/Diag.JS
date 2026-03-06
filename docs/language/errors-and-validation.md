# Errors and Validation

Diag.JS intentionally keeps validation close to the parser and compiler. The error surface is small enough that every current failure mode can be documented directly.

## Parser Errors

| Condition | Error |
| --- | --- |
| Source is empty or not a string | `TypeError: Diagram source must be a non-empty string.` |
| A line does not match any valid statement form | `SyntaxError: Invalid statement at line <n>: <line>` |
| More than one title is declared | `SyntaxError: Only one title is allowed. Duplicate at line <n>.` |
| The file contains no usable statements | `SyntaxError: Diagram source must include at least one node or edge statement.` |

## Compiler Errors

| Condition | Error |
| --- | --- |
| `compileDiagram` receives something other than parser output | `TypeError: compileDiagram expects the output of parseDiagram.` |
| A node id is repeated | `SyntaxError: Duplicate node id "<id>" at line <n>.` |
| A `param` references a missing node | `SyntaxError: Unknown node "<id>" for param at line <n>.` |
| An `edge` source references a missing node | `SyntaxError: Unknown source node "<id>" for edge at line <n>.` |
| An `edge` target references a missing node | `SyntaxError: Unknown target node "<id>" for edge at line <n>.` |

## Non-Errors That Still Matter

Some inputs do not throw but still change behavior:

| Condition | Behavior |
| --- | --- |
| Unknown symbol | Falls back to the renderer's generic device family |
| Invalid lane id | Ignored; lane renderer falls back to inferred/default lane |
| Non-numeric `column` or `slot` | Coerces to fallback `0` |
| Duplicate param key | Last assignment wins |
| Missing edge label | Wire/media inference falls back to endpoint heuristics |

## Troubleshooting Checklist

If a diagram renders differently than expected, check these first:

1. Did you declare the target node before its params and edges?
2. Did you quote every multi-word label or param value?
3. Did you use lowercase reserved param keys such as `lane` and `voltage`?
4. Did you set an explicit `symbol` for uncommon equipment?
5. Did you add an informative edge label where wire/media selection matters?
6. Did you set `column` and `slot` explicitly for lane-based sheets that need stable placement?

## Authoring Recommendation

Treat warnings in review as if they were compile errors, even when the engine allows them:

- Avoid relying on fallback generic devices in production diagrams.
- Avoid ambiguous labels when the renderer is expected to infer a symbol.
- Avoid invalid lane ids and non-numeric column/slot values.

The engine is permissive so the DSL stays lightweight. The documentation and tests are what keep authored diagrams disciplined.
