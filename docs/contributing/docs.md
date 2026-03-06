# Documentation Rules

The docs are meant to be maintainable under growth. These rules exist to keep that true.

## Source of truth

- Grammar and semantics are defined by the code, then explained in narrative docs.
- Symbol, alias, lane, media, wire, and strata inventories are generated from source definitions.
- Generated pages are not hand-edited.

## Required updates

Update docs in the same change whenever you modify:

- Parser rules
- Statement behavior
- Reserved params
- Public exports
- Renderer defaults or heuristics
- Symbol libraries
- Alias maps
- Lane definitions
- Media or wire types

## Documentation standards

- Prefer exact statements over marketing language.
- Document defaults, fallbacks, and invalid-but-accepted behavior.
- Use copy-pasteable code samples.
- Keep examples small but realistic.
- Use stable headings so deep links remain durable.
- Explain renderer-specific behavior in the relevant system page and link to generated reference pages for inventories.

## Generated reference rules

- Do not manually edit files under `docs/reference/generated`.
- Run `npm run docs:generate` after touching source-backed inventories.
- Review the generated diff; a changed inventory table is documentation, not noise.

## Style rules

- Use lowercase canonical ids when naming symbols, aliases, lanes, media, and params.
- Quote multi-word DSL values in examples.
- Prefer tables for inventories and comparisons.
- Call out non-obvious behavior explicitly, especially silent fallbacks.

## Verification

Before pushing documentation changes, run:

```sh
npm run typecheck
npm run build
npm run test
npm run docs:build
```

Documentation changes are not complete if the docs do not build.
