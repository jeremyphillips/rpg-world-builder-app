# Dialog panel presentation

Shared chrome tokens for centered and edge dialogs in `@rpg/ui`. This is **panel
presentation**, not a unified Overlay root — “overlay” in this codebase means the
scrim (`modalOverlayVariants` / `bg-overlay`).

## Ownership layers

```text
dialog-parts.client.tsx     Header, Close, dismiss handlers (header padding SSOT)
dialog-panel.variants.ts    Section inset, body, action row
modal.variants.ts           ModalSize + centered panel shell (background only)
sheet.variants.ts           SheetSize, SheetSurface, dock chrome only
Modal.*                     Centered behavior
Sheet.*                     Edge behavior
ConfirmDialog               AlertDialog; reuses modal panel + dialog-panel tokens
dashboard DrawerShell       Sheet composition + bodyMode (scroll ownership)
```

## Shared tokens (`dialog-panel.variants.ts`)

| Token                              | Role                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `dialogPanelSectionPaddingClasses` | Canonical `p-6` section inset                                           |
| `dialogPanelSectionInsetXClasses`  | Horizontal slice (`px-6`) for managed Form content / sheet form footers |
| `dialogPanelBodyVariants`          | Scrollable body (`overflow-y-auto` + section padding with `pt-0`)       |
| `dialogPanelActionRowClasses`      | Action row flex only — no modality chrome                               |

**Do not** extract header padding into dialog-panel — `DialogPanelHeader` already owns it.
**Do not** add Form-specific horizontal padding SSOTs; managed Form inset derives from
`dialogPanelSectionInsetXClasses`.

### Footer composition

```text
Modal.Footer  = action row + section padding + pt-0
Sheet.Footer  = sheetFooterChromeClasses + action row + section padding
Form sheet bar = sheetFooterChromeClasses + section inset X + dock vertical rhythm
```

Dock chrome (`sheetFooterChromeClasses`) and dock vertical rhythm
(`sheetFooterDockVerticalRhythmClasses`) stay Sheet-owned.

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
- `managed` — body becomes `p-0 overflow-hidden`; child (Form) owns scroll + docked
  footer and re-applies horizontal inset from `dialogPanelSectionInsetXClasses`

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
