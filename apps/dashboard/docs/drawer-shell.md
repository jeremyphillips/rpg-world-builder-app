# DrawerShell

Canonical dashboard scaffold for application drawers (create/edit forms and
informational side panels). Picker workflows use `@rpg/ui`
[`CatalogPickerSheet`](../../../packages/ui/src/components/ui/catalog-picker-sheet.client.tsx);
read-only builder dossiers use allowlisted
[`BuilderOptionDetailsSheet`](../../../packages/ui/src/components/ui/builder-option-details-sheet.client.tsx).

## Ownership layers

```text
@rpg/ui Sheet                 → primitive (side, close, overlay)
@rpg/ui Sheet variants        → primitive-semantic only (surface, size)
@rpg/ui shared footer chrome  → single token consumed by Sheet.Footer + FormActionsBar sheet
dashboard DrawerShell         → only allowed app composition of Sheet for non-picker drawers
ContentFormDrawer             → form workflow on DrawerShell
CatalogPickerSheet            → picker workflow; same surface/size/footer tokens
feature drawers               → content/workflow only
```

Implementation: [`src/components/drawer/`](../src/components/drawer/).

## API

| Prop                | Role                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `title`             | Required header headline                                                                  |
| `description?`      | Optional header helper line (e.g. vocabulary create)                                      |
| `bodyMode?`         | `scrolling` (default) — shell body scrolls; `managed` — child owns scroll + docked footer |
| `footer?`           | Optional shell-owned `Sheet.Footer` actions                                               |
| `DrawerShell.Close` | Re-export of `Sheet.Close` for cancel buttons                                             |

**No `size` prop in v1.** Application width is fixed at 550px via `Sheet.Content`
`size="lg"`. Add a DrawerShell size variant only when a second legitimate
application width is product-justified.

**No `*ClassName` escape hatches.** New chrome needs a documented product use
case and a shared token or DrawerShell variant — not local Tailwind overrides.

## Body modes

- **`scrolling`** — default. `Sheet.Body` owns vertical overflow for informational
  or custom content.
- **`managed`** — body is a non-scrolling flex column. Pair with `<Form
stickyFooter footerVariant="sheet">` (see [`ContentFormDrawer`](../src/features/content/lib/forms/shells/content-form-drawer.client.tsx)).

## Surface, width, and footer SSOT

Application drawers normalize on:

- `surface="background"` — raised card remains the Sheet primitive default for
  allowlisted special sheets (`BuilderOptionDetailsSheet`, raw Sheet stories).
- `size="lg"` — `max-w-[550px]` application width.

Footer chrome (border, background, shrink, z-index) lives in
[`sheet.variants.ts`](../../../packages/ui/src/components/ui/sheet.variants.ts)
as `sheetFooterChromeClasses`, consumed by:

- `Sheet.Footer` (+ layout/actions row classes)
- `FormActionsBar` `variant="sheet"` (+ form horizontal inset)

`CatalogPickerSheet` hardcodes the same `surface` / `size` on `Sheet.Content`.

## ESLint boundary

Production feature and `src/lib` code **must not** import `Sheet` from
`@rpg/ui`. The rule is enforced in [`eslint.config.js`](../eslint.config.js).

Permitted:

- `src/components/drawer/**` — DrawerShell is the sole production Sheet composer
- tests and stories (ignored by the rule)
- named composites: `CatalogPickerSheet`, `BuilderOptionDetailsSheet`, …

Cancel buttons in form drawers use `DrawerShell.Close`, not `Sheet.Close`.

## Related surfaces

| Surface                                   | Scaffold                                           |
| ----------------------------------------- | -------------------------------------------------- |
| Contained location create                 | `ContentFormDrawer` → `DrawerShell`                |
| Vocabulary add/edit                       | `ContentFormDrawer` → `DrawerShell`                |
| Parent replacement / relationship pickers | `CatalogPickerSheet` (aligned tokens)              |
| Character builder catalog pickers         | `CatalogPickerSheet` + `catalogPickerShellProps()` |
| Species/class option dossier              | `BuilderOptionDetailsSheet` (allowlisted)          |

Cross-content relationship UI: [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).
