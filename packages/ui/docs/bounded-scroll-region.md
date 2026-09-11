# Bounded scroll region

Shared scrollbar behavior for inner panels where the thumb must not overlay card
or control edges.

## Primitive

[`boundedScrollRegionClasses`](../src/components/ui/bounded-scroll-region.variants.ts):

```text
overflow-y-auto scrollbar-slim scrollbar-gutter-stable
```

The primitive owns **scrollbar behavior only** — do not embed `min-h-0`, `flex-1`,
or padding. Consumers compose layout sizing and insets separately.

[`scrollbar-gutter-stable`](../src/styles/globals.css) reserves gutter space via
`scrollbar-gutter: stable`.

## Composition

| Consumer                                                                                    | Composition                                        |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`dialogPanelScrollRegionClasses`](../src/components/ui/dialog-panel.variants.ts)           | `min-h-0 flex-1` + primitive + bottom/focus insets |
| [`previewRailScrollRegionClasses`](../src/components/preview-rail/preview-rail.variants.ts) | `min-h-0 flex-1` + primitive                       |
| [`formStickyScrollBodyClasses`](../src/form/chrome/form-chrome.variants.ts)                 | re-exports `dialogPanelScrollRegionClasses`        |

## Follow-up adopters

Sidebar nav, messages workspace panes, and character-builder columns still use ad
hoc `scrollbar-slim` — migrate to the primitive when touching those surfaces.
