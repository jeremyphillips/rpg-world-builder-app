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
| [`DialogPanelScrollRegion`](../src/components/ui/dialog-panel-scroll-region.client.tsx)          | Overlay Modal/Sheet/Drawer column scrollport — SBR + `px-6` / `pt-5` / `pb-6` viewport inset          |
| [`dialogPanelScrollRegionClasses`](../src/components/ui/dialog-panel.variants.ts)                | Deprecated class alias — prefer `DialogPanelScrollRegion`                                             |
| [`previewRailScrollRegionShellClasses`](../src/components/preview-rail/preview-rail.variants.ts) | `min-h-0 flex-1` via [`ScrollBoundaryRegion`](../src/components/ui/scroll-boundary-region.client.tsx) |
| [`FormStickyScrollBody`](../src/form/chrome/form-sticky-scroll-body.client.tsx)                  | clip slot (`form-scroll-body-container`, `overflow-hidden`) + inner scroller                          |
| [`formStickyScrollBodyScrollerClasses`](../src/form/chrome/form-chrome.variants.ts)              | inner scroller — `overflow-y-auto`, end-of-scroll padding                                             |

## Environmental bottom inset

Sticky-chrome forms with a docked footer use `formStickyScrollShellWithDockedFooterClasses` to
publish `--rpg-content-bottom-inset` and augment `--rpg-content-top-inset` (derived from the
standard docked actions bar block-size contract and conservative scroll-chrome contracts).
Bounded inner panels may subtract these from viewport-relative fallback `max-height` caps.
It communicates standard viewport space reserved by surrounding chrome — not remaining
content height, and not dynamic footer growth (validation summaries may exceed the reserved
footprint). The form scroll body is also a size container (`form-scroll-body-container`) so
descendants can cap against the flex column instead of raw `dvh`.

Dashboard master-detail list shells publish a single resolved fallback cap
(`--master-detail-shell-max-block-size` via `master-detail-list-shell-viewport-cap`) consumed
by min-height floors and as the always-valid `max-height` baseline — the fallback custom
property is never redefined inside `@container form-scroll-body`. Outside the container, the
fallback is `min(content-cap, 100dvh - top-inset - bottom-inset)`. Inside the container,
`max-height` tightens with `min(fallback, 100cqh - docked-scroll-top-chrome - floor-gap)` only
— never raw `100cqh` alone and never a second `min()` that can invalidate the fallback when
`cqh` is unreliable. Docked forms split the scroll slot: `FormStickyScrollBody` clip
(`overflow-hidden` size container) + inner scroller so sticky rails cannot paint into the footer
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

[`DialogPanelScrollRegion`](../src/components/ui/dialog-panel-scroll-region.client.tsx) is **overlay-only** — do not use it for page `FormStickyScrollBody` (`pt-8` spacer), PreviewRail, master-detail list rails, or nested `max-h-*` lists inside overlay bodies. Overlay top inset is `pt-5` on the scroll viewport; page shell inset stays `pt-8`.

## Follow-up adopters

Sidebar nav, messages workspace panes, and character-builder columns still use ad
hoc `scrollbar-slim` — migrate to the primitive when touching those surfaces.
