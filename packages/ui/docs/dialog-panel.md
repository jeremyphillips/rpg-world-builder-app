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
```

## Shared tokens (`dialog-panel.variants.ts`)

| Token                              | Role                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `dialogPanelSectionPaddingClasses` | Canonical `p-6` section inset                                                             |
| `dialogPanelSectionInsetXClasses`  | Horizontal slice (`px-6`) for managed Form content                                        |
| `dialogPanelBodyVariants`          | Scrollable body (`overflow-y-auto` + section padding with `pt-0`)                         |
| `dialogPanelFooterClasses`         | Overlay footer section chrome (`border-t border-border-faint` + `px-6` + `py-4`; no fill) |
| `dialogPanelActionRowClasses`      | Action row flex helper — child only, not on footer root                                   |

**Do not** extract header padding into dialog-panel — `DialogPanelHeader` already owns it.
**Do not** add Form-specific horizontal padding SSOTs; managed Form inset derives from
`dialogPanelSectionInsetXClasses`.

### Footer composition

```text
dialogPanelFooterClasses     border-t border-border-faint + px-6 + py-4 column root; inherits panel surface
dialogPanelActionRowClasses  child helper for button groups
sheetFooterDockClasses       Sheet-only shrink-0 z-20 placement

Modal.Footer  = dialogPanelFooterClasses
Sheet.Footer  = dialogPanelFooterClasses + sheetFooterDockClasses
```

Overlay footer chrome does **not** set `bg-*`. The panel Content already established
surface fill and `--surface-current`. Backdrop blur stays on page sticky
`FormActionsBar` only — not on flex-docked overlay footers.

Body / footer boundary:

```text
Header: p-6
Body:   p-6 pt-0
Footer: separator + px-6 + py-4 (independently complete; no pt-0)
```

Form drawer flows use `<Form footerWrapper>` → `DrawerShell.Footer` (or `Sheet.Footer`)
so Form owns error + actions content while Sheet owns footer chrome + dock placement.

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

DrawerShell `bodyMode`:

- `scrolling` (default) — `Sheet.Body` scrolls with dialog-panel body padding
- `managed` — body becomes `p-0 overflow-hidden`; child owns scroll inside the body
- `composed` — no auto `Sheet.Body`; Form/feature supplies Body + Footer via wrappers

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
