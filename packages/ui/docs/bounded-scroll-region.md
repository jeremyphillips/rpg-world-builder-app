# Bounded scroll region

Shared scrollbar behavior for inner panels where the thumb must not overlay card
or control edges.

## Primitive

[`boundedScrollRegionClasses`](../src/components/ui/bounded-scroll-region.variants.ts):

```text
overflow-y-auto scrollbar-slim pe-2.5
```

The primitive owns **scrollbar behavior only** — do not embed `min-h-0`, `flex-1`,
or unrelated padding. [`boundedScrollRegionEndInsetClasses`](../src/components/ui/bounded-scroll-region.variants.ts)
(`pe-2.5`, `calc(var(--spacing) * 2.5)`) reserves inline-end space so content ends
before the scrollbar thumb.

[`scrollbar-gutter-stable`](../src/styles/globals.css) remains available as an optional
utility but is not composed into the primitive — explicit end inset is more reliable
across overlay scrollbar platforms.

## Composition

| Consumer                                                                                         | Composition                                                                                           |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`dialogPanelScrollRegionClasses`](../src/components/ui/dialog-panel.variants.ts)                | `min-h-0 flex-1` + primitive + `ps-1` + bottom inset                                                  |
| [`previewRailScrollRegionShellClasses`](../src/components/preview-rail/preview-rail.variants.ts) | `min-h-0 flex-1` via [`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx) |
| [`formStickyScrollBodyClasses`](../src/form/chrome/form-chrome.variants.ts)                      | re-exports `dialogPanelScrollRegionClasses`                                                           |

## Scroll boundary shadows

[`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx)
composes the bounded scroll viewport with low-elevation, surface-relative gradient
shadows at the top and bottom edges:

- `scrollTop === 0` → no top shadow (adjacent header owns the divider)
- `scrollTop > 0` → subtle downward fade
- not at scroll end → subtle upward fade
- at scroll end → no bottom shadow (adjacent footer owns the divider)

Storybook: **Primitives/ScrollBoundaryRegion**.

## Follow-up adopters

Sidebar nav, messages workspace panes, and character-builder columns still use ad
hoc `scrollbar-slim` — migrate to the primitive when touching those surfaces.
