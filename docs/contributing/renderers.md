# Renderer and Device Contributions

This project will continue to grow. These rules are here so new systems and devices do not erode consistency.

## Canonical naming rules

- Canonical symbol ids should be lowercase snake_case.
- Aliases should map many authored variants to one canonical id.
- Lane ids and media keys should also be lowercase snake_case.
- Renderer-reserved params should stay lowercase.

## Adding a device

When adding a new device family:

1. Add a canonical symbol entry.
2. Add only the aliases that users are likely to author.
3. Keep the fallback `device` or `equipment` entry intact.
4. Add dedicated glyph rendering only when the device meaningfully differs from the generic fallback.
5. Update inference rules only if the heuristic is clear and low-risk.

## Adding media or wire classes

When adding a connection class:

1. Give it a stable `key`.
2. Give it a short, legend-ready `label`.
3. Choose a stroke width and dash pattern that remains readable beside existing classes.
4. Update edge label guidance in the relevant system docs if authors need to know how to trigger it.

## Adding a lane

When adding a lane:

1. Choose a stable id.
2. Keep labels readable and domain-specific.
3. Insert the lane with a deliberate `order`.
4. Make sure the symbol library or lane inference can actually place devices onto it.

## Documentation obligations

Every renderer or device contribution should be accompanied by:

- Updated narrative docs if authoring behavior changed
- Regenerated reference pages
- Updated tests

## Scalability rule

If a change requires hand-editing the same inventory in multiple places, stop and move that inventory into the generated reference workflow instead.
