# Contributing

Diag.JS now treats documentation as part of the product surface, not as an afterthought.

Every change that affects:

- Grammar
- Syntax
- Parameter semantics
- Symbol libraries
- Alias maps
- Lanes
- Media or wire classes
- Public API
- Renderer behavior

should be evaluated for documentation impact in the same change.

## Contribution workflow

1. Change the source code.
2. Update or generate the docs that describe the behavior.
3. Run verification:
   - `npm run typecheck`
   - `npm run build`
   - `npm run test`
   - `npm run docs:build`
4. Review both the narrative docs and generated reference output.

## What belongs where

- Narrative explanation belongs in `docs/guide`, `docs/language`, `docs/systems`, `docs/reference`, and `docs/contributing`.
- Source-backed inventories belong in `docs/reference/generated` and are produced by `npm run docs:generate`.

Start here:

- [Documentation Rules](/contributing/docs)
- [Renderer and Device Contributions](/contributing/renderers)
