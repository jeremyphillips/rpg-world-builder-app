# Dialog panel presentation

Shared chrome tokens for centered and edge dialogs in `@rpg/ui`. This is **panel
presentation**, not a unified Overlay root — “overlay” in this codebase means the
scrim (`modalOverlayVariants` / `bg-overlay`).

## Ownership layers

```text
dialog-parts.client.tsx     Header, Close, dismiss handlers (header padding SSOT;
                            shared dialogTitle headline default for Modal + Sheet)
dialog-panel.variants.ts    Section inset, body, footer chrome, action row helper
modal.variants.ts           ModalSize + centered panel shell (background only)
sheet.variants.ts           SheetSize, SheetSurface, dock placement only
Modal.*                     Centered behavior (thin Header — inherits dialogTitle)
Sheet.*                     Edge behavior (thin Header — inherits dialogTitle)
ConfirmDialog               AlertDialog; confirmDialogTitle (19px); reuses modal panel tokens
dashboard DrawerShell       Sheet composition + bodyMode (scroll ownership)
Sheet.MediaScroll           Optional media + sticky identity header in one scrollport
```

## Sheet media scroll

When a sheet includes optional full-bleed media (artwork, hero image), use
`Sheet.MediaScroll` instead of pinning `Sheet.Header` above `Sheet.Body`.

```text
Sheet.Content hasMedia
  Sheet.MediaScroll          clip root + one overflow scrollport
    media                    full bleed, in flow
    sentinel                   observed sticky boundary
    header                     sticky top-0; opaque fill only when stuck
    header boundary shadow     bottom edge when stuck && scrollTop > 0
    children                   section inset (px-6 / pt-5 / pb-6)
    bottom boundary shadow     viewport foot when content continues below
  Sheet.Footer               optional, still docked outside the scrollport
  Close                      fixed on Sheet.Content; z-30 + surface chip when hasMedia
```

Set `hasMedia` on `Sheet.Content` so the close button gets a `--surface-current`
chip via `data-has-media` (no React context — close is a sibling of scroll content).

**Stuck state** is named explicitly: the header has crossed the sticky boundary
(`!isIntersecting && sentinelTop < rootTop`), not “artwork is visible.” Scroll
boundary shadows reuse `ScrollBoundaryRegion` measurement, but the top affordance
attaches to the **sticky header bottom** (`stuck && showTopShadow`) — not the
viewport top edge (which would paint over scrolling artwork). Sheets without
media keep the pinned header + scrolling body anatomy unchanged.

## Shared tokens (`dialog-panel.variants.ts`)

| Token                                          | Role                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `dialogPanelSectionPaddingClasses`             | Canonical `p-6` section inset                                                                                             |
| `dialogPanelSectionInsetXClasses`              | Horizontal slice (`px-6`) for managed Form content                                                                        |
| `dialogPanelBodyVariants`                      | Clip shell — inner `DialogPanelScrollRegion` owns scroll                                                                  |
| `dialogPanelStableBodyVariants`                | Stable shell (`px-6`, clip) — child uses `inset="inner"` or `inset="innerLeading"`                                        |
| `dialogPanelStableBodyClipVariants`            | Stable clip shell without `px-6` — section inset on child scrollports or pinned chrome wrappers (`CreateModalShell`)      |
| `dialogPanelSectionScrollViewportClasses`      | Section scrollport preset (`px-6` + `pt-5` + `pb-6`) — default Body / `externalFooter`                                    |
| `dialogPanelInnerScrollViewportClasses`        | Inner scrollport preset (`ps-1` + `pe-2.5` + `pb-6`) — below pinned chrome in section-inset shell                         |
| `dialogPanelInnerLeadingScrollViewportClasses` | Leading inner preset — inner scroll chrome + `pt-5` as first content below header border                                  |
| `dialogPanelScrollRegionClasses`               | Deprecated alias for inner scroll region layout + inner preset                                                            |
| `dialogPanelSectionSeparatorBorderClasses`     | Shared faint separator color for header/footer section borders (`border-border-faint`)                                    |
| `dialogPanelHeaderClasses`                     | Overlay header section chrome (`border-b` + separator token + `px-6 pt-6 pb-4`; title typography on `DialogPanelHeader`)  |
| `dialogPanelHeaderLeadRowClasses`              | Leading icon + copy row when `DialogPanelHeader.leadIcon` is set (`gap-4` / 16px)                                         |
| `dialogPanelHeaderCopyStackClasses`            | Title/description stack beside a header lead icon                                                                         |
| `dialogPanelHeaderHeadlineStackClasses`        | Headline row → supporting description (`gap-0.5` / 2px)                                                                   |
| `dialogPanelFooterClasses`                     | Overlay footer section chrome (`border-t` + separator token + `px-6` + `py-4`; no fill)                                   |
| `dialogPanelActionRowClasses`                  | Action row flex helper — prefer `Modal.FooterActions` under Modal.Footer; `DialogPanelActionRow` for Sheet / form publish |

**Do not** extract header padding into dialog-panel — `DialogPanelHeader` already owns it.
**Do not** add Form-specific horizontal padding SSOTs; managed Form inset derives from
`dialogPanelSectionInsetXClasses`.

### Footer composition

```text
dialogPanelHeaderClasses     border-b + dialogPanelSectionSeparatorBorderClasses + px-6 pt-6 pb-4; DialogPanelHeader root
dialogPanelFooterClasses     border-t + dialogPanelSectionSeparatorBorderClasses + px-6 + py-4 column root; inherits panel surface
dialogPanelActionRowClasses  child helper for button groups (implementation detail)
Modal.FooterActions          preferred action row under Modal.Footer
DialogPanelActionRow         shared action row for Sheet.Footer and form publish paths

Modal.Footer  = dialogPanelFooterClasses (+ modalFooterDockClasses)
Sheet.Footer  = dialogPanelFooterClasses + sheetFooterDockClasses
```

**Invariant:** overlay footer chrome is owned by `Modal.Footer` (vertical dock, validation
summary, spacing). Footer **action geometry** is owned by `Modal.FooterActions` (or
`DialogPanelActionRow` for Sheet / `FormShellFooterContent` publish paths). Do not place
action `Button`s directly in the footer action area — they will stack full width in the
column layout.

Overlay footer chrome does **not** set `bg-*`. The panel Content already established
surface fill and `--surface-current`. Backdrop blur stays on page sticky
`FormActionsBar` only — not on flex-docked overlay footers.

Body / footer boundary:

```text
Header: p-6
Body:   p-6 pt-0
Footer: separator + px-6 + py-4 (independently complete; no pt-0)
```

Form drawer flows use `<Form externalFooter>` with overlay-owned `DrawerShell.Footer` /
`Sheet.Footer` wrapping `<FormShellFooterSlot />`. Semantic footer content (errors,
validation summary, actions) is owned by `FormShellFooterContent`; shell primitives own
section chrome only. Manual action rows under `Modal.Footer` use `Modal.FooterActions`; Sheet and form
publish paths use `DialogPanelActionRow` / `FormShellFooterContent`.

## Initial focus

Modal, Sheet, and ConfirmDialog share one open-focus policy via
`dialog-focus.lib.ts`:

- On open, focus moves to the **dialog panel** (`role="dialog"` /
  `role="alertdialog"`), not an interactive descendant.
- The panel Content uses `tabIndex={-1}` plus
  `dialogContentFocusShellClasses` so programmatic panel focus does not show a
  visible outline.
- Opt in to a different first target with `data-dialog-initial-focus` only when
  immediate typing is clearly intended. Export: `DIALOG_INITIAL_FOCUS_SELECTOR`.
- Rename/email modals (invite, duplicate, …) use **panel-first** by default — do
  not auto-mark their fields.
- Keep explicit targets rare — Form primitives must not auto-mark fields.
- Close/return-focus is Radix-owned via `onCloseAutoFocus` unless a feature
  documents a custom exception (equipment package switch modal restores the
  package trigger via `onCloseAutoFocus`).

Consumer override: pass `onOpenAutoFocus` and call `preventDefault()` to skip
the default panel policy.

## Stable modal geometry

| Concern                       | Owner                                                            |
| ----------------------------- | ---------------------------------------------------------------- |
| Content-sized vs stable shell | `layout` (`content` \| `stable`)                                 |
| Modal width                   | `size` (`sm` \| `md` \| `lg`) — inline `max-w-*`                 |
| Stable shell block height     | `stableSize` (`default` \| `tall`) — only when `layout="stable"` |
| Height token classes          | `@rpg/ui` `modal.variants.ts` only (not app-importable)          |
| Workflow chooses tall         | application shell (e.g. dashboard `CreateModalShell`)            |
| Scroll / flex body behavior   | `Modal.Body stableBody` (independent of `stableSize`)            |

`size` and `stableSize` are **orthogonal** — width vs stable block height. Both
can be set together (e.g. `size="lg" layout="stable" stableSize="tall"`).

When `layout="content"`, `stableSize` has no effect. Do not add raw Tailwind
height classes as extension points:

```tsx
<Modal.Content layout="stable" />
<Modal.Content layout="stable" stableSize="tall" />
<Modal.Content size="lg" layout="stable" stableSize="tall" />
```

## Size and surface (capability alignment)

`Modal` and `Sheet` both expose a prop named `size` (and may share the value `"md"`).
That is shared **terminology**, not a shared physical map:

| API         | Values               | Physical                              |
| ----------- | -------------------- | ------------------------------------- |
| `ModalSize` | `sm` \| `md` \| `lg` | `max-w-sm` / `max-w-lg` / `max-w-2xl` |
| `SheetSize` | `md` \| `lg`         | `max-w-md` / `max-w-[550px]`          |

Do **not** unify these into one TypeScript union. Align terminology where the
capability exists; do not invent props solely for API parity (e.g. no Modal
`surface` prop — Modal is locked to `background`).

Sheet exposes `surface: 'card' | 'background'` (default `card`). App drawers
(`DrawerShell`, `CatalogPickerSheet`) force `background`.

## Body scroll ownership

Default `Modal.Body` / `Sheet.Body` auto-wire [`DialogPanelScrollRegion`](../src/components/ui/dialog-panel-scroll-region.client.tsx) with `inset="section"`: a clip shell plus a single scroll viewport with boundary shadows and explicit `px-6` / `pt-5` / `pb-6` inset (never `p-6` + `pt-5` override; never `px-6` + `ps-1` / `pe-2.5` on the same node).

**Body public contract (default scroll mode):** consumer `className`, `ref`, `style`, `id`, `data-*`, `aria-*`, events, and test ids land on the **scroll viewport** — not the clip shell or fade overlays. `stableBody` / `Sheet managed` keep a single clip `div` with all attributes on it.

### Two-layer inset invariant

Section horizontal inset (`px-6`) has **exactly one owner** per scroll column. Scroll chrome (`ps-1`, `pe-2.5`) lives on **inner** scrollports only.

| Pattern                                 | Shell                 | `DialogPanelScrollRegion`                                                          | Fade width                         |
| --------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| **A — default Body / `externalFooter`** | Clip only (no `px-6`) | `inset="section"` — viewport owns `px-6`                                           | Panel content width                |
| **B — `stableBody` + pinned chrome**    | `px-6` on shell       | `inset="inner"` — viewport owns scroll chrome only                                 | Inset column (acceptable tradeoff) |
| **C — `stableBody` leading scroll**     | `px-6` on shell       | `inset="innerLeading"` — scroll chrome + `pt-5`                                    | Inset column (acceptable tradeoff) |
| **D — `stableBodyClip` mixed scroll**   | Clip only (no `px-6`) | `inset="section"` on setup / `externalFooter`; `inset="inner"` below pinned chrome | Panel content width                |

**Pattern A (canonical `externalFooter`):** managed/unpadded `Sheet.Body` + `<DialogPanelScrollRegion inset="section">`. Never pass `px-6` via Form `contentClassName` — layout / vertical overrides only (`pt-0`, `space-y-*`).

**Pattern B:** `Modal.Body stableBody` shell owns `px-6`; inner region uses `inset="inner"` when pinned chrome sits above the scroller (CreateModalShell tab panels). Pinned siblings inherit shell inset — do not duplicate `px-6` on wrappers.

**Pattern C:** `stableBody` shell owns `px-6`; use `inset="innerLeading"` when the scroller is the first content below the header border (table builder).

**Pattern D:** `Modal.Body stableBody stableBodyClip` — clip shell without horizontal inset. Pinned chrome (summary card, tabs list) wraps with `dialogPanelSectionInsetXClasses`; child scrollports use `inset="section"` (setup, default scroll) or `inset="inner"` (tab panels below tabs). Prevents double `px-6` when managed Form `externalFooter` also uses section inset (`CreateModalShell`).

**Header-adjacent chrome** (`CatalogPickerSheet` `headerBelowDescription`, etc.) lives outside `Sheet.Body` — apply `dialogPanelScrollRegionTopInsetClasses` on that wrapper; it does not inherit Body viewport inset.

`viewportClassName` may adjust layout and vertical inset, but must not supply horizontal padding or scroll-chrome classes owned by the selected `inset` preset.

DrawerShell `bodyMode`:

- `scrolling` (default) — `Sheet.Body` auto scrollport (Pattern A)
- `managed` — `Sheet.Body managed` clip shell; caller supplies `DialogPanelScrollRegion inset="section"` (Form `externalFooter`)
- `composed` — no auto `Sheet.Body`; Form/feature supplies Body + Footer via wrappers

**Overlay-only:** do not use `DialogPanelScrollRegion` for page `FormStickyScrollBody`, PreviewRail, or nested `max-h-*` lists. Page forms keep `pt-8` via `FormScrollBodyTopInset`.

This is scroll ownership, not a second spacing axis. Modal does not need `bodyMode`
today (no form-in-modal sticky sheet pattern).

## Escape hatches

Prefer documented tokens / variants over local Tailwind chrome overrides.

- **No** `*ClassName` chrome escapes on DrawerShell or CatalogPickerSheet
- Allowlisted special jobs (e.g. `BuilderOptionDetailsSheet` default `card`/`md`)
  stay documented exceptions
- Remaining duplicate padding/action-row strings must be **explicitly justified**
  in a code comment or docs

## Related

- Dashboard drawers: [`apps/dashboard/docs/drawer-shell.md`](../../../apps/dashboard/docs/drawer-shell.md)
- Surface planes: [design-tokens.md](./design-tokens.md)
