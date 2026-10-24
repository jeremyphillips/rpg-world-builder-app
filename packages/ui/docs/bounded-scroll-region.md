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

| Consumer                                                                                  | Composition                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`DialogPanelScrollRegion`](../src/components/ui/dialog-panel-scroll-region.client.tsx)   | Overlay Modal/Sheet/Drawer column scrollport — SBR + `px-6` / `pt-5` / `pb-6` viewport inset                                                   |
| [`dialogPanelScrollRegionClasses`](../src/components/ui/dialog-panel.variants.ts)         | Deprecated class alias — prefer `DialogPanelScrollRegion`                                                                                      |
| [`PreviewRail` scroll region](../src/components/preview-rail/preview-rail.client.tsx)     | `min-h-0 flex-1` via [`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx)                                          |
| [`FormStickyScrollBody`](../src/form/chrome/form-sticky-scroll-body.client.tsx)           | clip slot (`form-scroll-body-container`, `overflow-hidden`) + [`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx) |
| [`formStickyScrollBodyScrollViewportClasses`](../src/form/chrome/form-chrome.variants.ts) | live scroller — classes on the `ScrollBoundaryRegion` viewport (`h-full min-h-0`, end-of-scroll padding)                                       |
| [`formStickyScrollBodyScrollerClasses`](../src/form/chrome/form-chrome.variants.ts)       | legacy alias of the old inner-scroller tokens. The runtime does not apply it                                                                   |
| Dashboard `SidebarNav` primary `<nav>`                                                    | `ps-3 pb-4` plus local `min-h-0 flex-1`; the primitive owns scroll and the end inset                                                           |

## Environmental bottom inset

Sticky-chrome forms with a docked footer use `formStickyScrollShellWithDockedFooterClasses` to
publish `--rpg-content-bottom-inset` and `--rpg-form-docked-scroll-top-chrome-inset` (the
reserved scroll padding, identity header, and sticky-tab lengths). App chrome stays
`--app-sticky-chrome-block-size`. The wide content-form body publishes
`--rpg-page-heading-inset`. None of those owners declare `--rpg-content-top-inset`.

`--rpg-content-top-inset` is the layout-viewport total. The master-detail list utility
resolves it once, as the sum of those three contributions (`0px` when a contribution is
absent). It is the amount a `100dvh` cap subtracts. It is not a position inside a nested
scrollport, and it is not the measured heading height. A nested docked shell sets the same
absolute form-chrome length, so the list counts that chrome once.

The lengths reserve standard viewport chrome — not remaining content height, and not
dynamic footer growth (validation summaries may exceed the reserved footprint). The form
scroll body is also a size container (`form-scroll-body-container`) so descendants can cap
against the flex column instead of raw `dvh`.

Dashboard master-detail list shells publish `--master-detail-shell-max-block-size` via
`master-detail-list-shell-viewport-cap`. Min-height floors read that variable. It is
`min(content-cap, max(0px, 100dvh - --rpg-content-top-inset - --rpg-content-bottom-inset))`.
The variable is not redefined inside `@container form-scroll-body`. Outside the container,
used `max-height` is that variable. Inside the container, used `max-height` is
`min(content-cap, max(0px, 100cqh - --rpg-form-docked-scroll-top-chrome-inset - --rpg-content-floor-gap))`.
The clip is already below app chrome and above the docked bar, so that formula does not
subtract the viewport total or the bottom inset. Docked forms split the scroll slot: `FormStickyScrollBody` clip
(`overflow-hidden` size container) + `ScrollBoundaryRegion` (viewport classes from
`formStickyScrollBodyScrollViewportClasses`) so sticky rails cannot paint into the footer
sibling even when caps underestimate. Slight **under-fill is preferable to overlap**;
`--rpg-content-bottom-inset` applies to the **dvh fallback only**. The list scroll body does
not compose `boundedScrollRegionEndInsetClasses` — no inline-end gutter reserve.

## Scroll boundary shadows

[`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx)
composes the bounded scroll viewport with low-elevation, surface-relative gradient
shadows at the top and bottom edges:

- `scrollTop === 0` → no top shadow (adjacent header owns the divider)
- `scrollTop > 0` → subtle downward fade
- not at scroll end → subtle upward fade
- at scroll end → no bottom shadow (adjacent footer owns the divider)

Storybook: **Primitives/ScrollBoundaryRegion**.

[`DialogPanelScrollRegion`](../src/components/ui/dialog-panel-scroll-region.client.tsx) is **overlay-only** — do not use it for page `FormStickyScrollBody` (`pt-8` spacer), PreviewRail, master-detail list rails, or nested `max-h-*` lists inside overlay bodies. Overlay top inset is `pt-5` on the scroll viewport. The page form scroll-body inset is `pt-8`. Dashboard page-shell top inset (`pageShellInsetTopClasses`) is `pt-6`.

## Follow-up adopters

Messages workspace panes and character-builder columns still use ad hoc `scrollbar-slim` —
migrate to the primitive when touching those surfaces.
