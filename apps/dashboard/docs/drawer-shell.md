# DrawerShell

Canonical dashboard scaffold for application drawers (create/edit forms and
informational side panels). Picker workflows use `@rpg/ui`
[`CatalogPickerSheet`](../../../packages/ui/src/components/ui/catalog-picker-sheet.client.tsx);
read-only builder dossiers use allowlisted
[`BuilderOptionDetailsSheet`](../../../packages/ui/src/components/ui/builder-option-details-sheet.client.tsx).

## Ownership layers

```text
@rpg/ui dialog-panel.variants  → shared section inset / body / footer chrome / action row
@rpg/ui Sheet                  → primitive (side, close, overlay)
@rpg/ui Sheet variants         → modality-owned (surface, size, dock placement)
@rpg/ui Form externalFooter   → publishes footer semantics to FormShellFooterSlot
dashboard DrawerShell          → only allowed app composition of Sheet for non-picker drawers
ContentFormDrawer              → DrawerShell + ContentFormHost (form workflow)
LocationCreateModal            → Modal + ContentFormHost (create setup ↔ details)
CatalogPickerSheet             → picker workflow; same surface/size tokens
feature drawers                → content/workflow only
```

Full dialog-panel ownership (Modal vs Sheet vs ConfirmDialog, size/surface
capability alignment, escape-hatch policy):
[`packages/ui/docs/dialog-panel.md`](../../../packages/ui/docs/dialog-panel.md).

Implementation: [`src/components/drawer/`](../src/components/drawer/).

## API

| Prop                 | Role                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| `title`              | Required header headline                                                   |
| `description?`       | Optional header helper line (e.g. vocabulary create)                       |
| `bodyMode?`          | `scrolling` (default), `managed`, or `composed` — see Body modes           |
| `footer?`            | Optional shell-owned `Sheet.Footer` actions (`scrolling` / `managed` only) |
| `DrawerShell.Close`  | Re-export of `Sheet.Close` for cancel buttons                              |
| `DrawerShell.Body`   | Re-export of `Sheet.Body` for composed Form `contentWrapper` flows         |
| `DrawerShell.Footer` | Re-export of `Sheet.Footer` for composed external-footer flows             |

**No `size` prop in v1.** Application width is fixed at 550px via `Sheet.Content`
`size="lg"`. Add a DrawerShell size variant only when a second legitimate
application width is product-justified. `SheetSize` and `ModalSize` stay
modality-owned — shared prop _name_ is not shared physical width.

**No `*ClassName` escape hatches.** New chrome needs a documented product use
case and a shared token or DrawerShell variant — not local Tailwind overrides.

## Body modes

- **`scrolling`** — default. `Sheet.Body` owns vertical overflow for informational
  or custom content (dialog-panel body padding).
- **`managed`** — body is a non-scrolling flex column (`p-0`). Pair with a child that
  owns its own scroll region inside the body.
- **`composed`** — children render directly under `Sheet.Content` (no auto Body).
  Use with `<Form contentWrapper externalFooter>` and overlay-owned
  `<DrawerShell.Footer><FormShellFooterSlot /></DrawerShell.Footer>` (see
  [`ContentFormDrawer`](../src/features/content/lib/forms/shells/content-form-drawer.client.tsx)).
  Form re-applies horizontal inset from `dialogPanelSectionInsetXClasses`.

## Surface, width, and footer SSOT

Application drawers normalize on:

- `surface="background"` — raised card remains the Sheet primitive default for
  allowlisted special sheets (`BuilderOptionDetailsSheet`, raw Sheet stories).
- `size="lg"` — `max-w-[550px]` application width.

Footer composition:

- Shared chrome: `dialogPanelFooterClasses` via `Sheet.Footer` / `DrawerShell.Footer`
- Dock placement: `sheetFooterDockClasses` (Sheet-owned)
- Action row: `DialogPanelActionRow` for manual footers; `FormShellFooterContent` for form flows
- Form drawer content: `<Form externalFooter>` publishes semantics; overlay owner renders
  `<FormShellFooterSlot />` inside `DrawerShell.Footer` — no parallel FormActionsBar sheet chrome

`CatalogPickerSheet` hardcodes the same `surface` / `size` on `Sheet.Content`.

### CatalogPickerSheet slot policy

| Slot              | Role                                                                | Examples                                             |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `auxiliaryAction` | Quiet **alternate acquisition** when the desired item may not exist | Create new NPC, Create location, Create organization |
| `footer`          | **Concluding drawer action** for the current workflow               | Submit link, Done, Confirm selection                 |

Rules:

- Use `auxiliaryAction` for create/import entry between search and results — not `footer`.
- Use `footer` for workflow completion — not alternate acquisition.
- Search and `auxiliaryAction` stay fixed above the scrollable result list.

## ESLint boundary

Production feature and `src/lib` code **must not** import `Sheet` from
`@rpg/ui`. The rule is enforced in [`eslint.config.js`](../eslint.config.js).

Permitted:

- `src/components/drawer/**` — DrawerShell is the sole production Sheet composer
- tests and stories (ignored by the rule)
- named composites: `CatalogPickerSheet`, `BuilderOptionDetailsSheet`, …

Cancel buttons in form drawers use `DrawerShell.Close`, not `Sheet.Close`.

## Related surfaces

| Surface                                   | Scaffold                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Location create (detail Add location)     | `LocationCreateModal` → `ContentFormHost`                                |
| Organization create (relationship picker) | `OrganizationCreateModal` → `ContentFormHost`                            |
| Quick NPC (org Add member)                | `OrganizationMemberPickerDrawer` + character-owned `QuickNpcCreateModal` |
| Quick NPC (standalone)                    | Location People drawer Character segment + `QuickNpcCreateModal`         |
| Vocabulary add/edit                       | `ContentFormDrawer` → `DrawerShell`                                      |
| Parent replacement / relationship pickers | `CatalogPickerSheet` (aligned tokens)                                    |
| Character builder catalog pickers         | `CatalogPickerSheet` + `catalogPickerShellProps()`                       |
| Species/class option dossier              | `BuilderOptionDetailsSheet` (allowlisted)                                |

Cross-content relationship UI: [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

## Overlay modality policy

**Drawer = relationship; Modal = entity create.** Pickers and membership workflows stay in
`DrawerShell` / `CatalogPickerSheet`. Continuous or multi-step **creation** flows use
`Modal` + `ContentFormHost` (locations) or a feature-owned modal shell (Quick NPC).

Do **not** embed entity creation inside a drawer body (`bodyReplacement`, stacked overlays).
The parent hook owns exclusive overlay modes and passes context between shells:

```text
add (picker drawer)  →  createNpc (modal)  →  cancel returns to add  →  success closes all
```

**Relationship picker nested create** (organization/location Add drawers): launch
`OrganizationCreateModal` or `LocationCreateModal` as a sibling while the picker stays
mounted. Cancel returns to the picker unchanged. Success calls `onCreated({ contentType, id })`,
closes the modal immediately, and returns to the picker — the drawer refetches catalogs,
revalidates eligibility (type, occupancy, duplicate edges), then selects the created entity.
Footer submit still persists the relationship. Do not copy org-member “success closes all.”

Quick NPC: the organizations hook toggles `add` | `createNpc`; the character feature owns
`QuickNpcCreateModal` (Setup, TabbedForm authoring, create). Location People nested create uses
the same modal in standalone context — success returns to the picker with the NPC selected; footer
Add persists the location connection. See
[character-acquisition.md](./character-acquisition.md#quick-npc-organization-member).

### Pending dismiss (`usePendingAwareOpenChange`)

Form overlays that must block user dismiss while submit is in flight wire
`usePendingAwareOpenChange` from `@rpg/ui`:

```ts
const { handleOpenChange, trustedClose } = usePendingAwareOpenChange({
  pending,
  allowDismissWhilePending, // optional opt-out
  onOpenChange,
})
```

- User dismiss (X, Escape, backdrop, Cancel → Root) is refused while `pending` (unless opt-out).
- `trustedClose()` bypasses the guard for success or intentional parent close.
- Dirty discard / leave-bridge stays shell-owned (`ContentFormHost`, `FormUnsavedChangesGuard`);
  the helper owns **pending** Root behavior only.

Wired today: `ContentFormDrawer`, `LocationCreateModal`, `QuickNpcCreateModal`.

## Unsaved-changes leave guard

Form shells (`ContentFormHost` / `ContentFormDrawer`, `ContentFormFooter`, page
create/edit flows) share one leave-guard contract. Implementation lives in
[`src/lib/form-unsaved-changes-guard.tsx`](../src/lib/form-unsaved-changes-guard.tsx)
and [`src/lib/use-unsaved-changes-confirm.tsx`](../src/lib/use-unsaved-changes-confirm.tsx).

**Ownership:** continuous **create** for locations uses `LocationCreateModal`
(`ContentFormHost` in the details phase). **Focused edits** use
`ContentFormDrawer` (`DrawerShell` + `ContentFormHost`).

### One controller per shell

Each form shell mounts **one** `useUnsavedChangesConfirm` hook and **one**
`ConfirmDialog`. Adapters (router blocker, sheet close bridge) call
`request(continuation)` — they never render their own dialog.

When a parent already owns the dialog, pass `discardGuard` into
`FormUnsavedChangesGuard` with `renderDialog={false}`.

### Dirty composition

Leave dirtiness is composed via `composeFormLeaveDirty` in
[`src/lib/form-leave-dirty.ts`](../src/lib/form-leave-dirty.ts):

- body `dirtyFields` (via `hasDirtyFields`)
- subclass unsaved edits (edit flows)
- `extraUnsavedEdits` — **additive only**; never suppresses body dirtiness
- campaign access draft state (drawer flows)

### Pending blocks exit without discard UI

When `pending` is true (submit in flight, save draft, etc.):

- sheet/drawer close attempts are refused at the shell level
- in-app route navigation is blocked but **does not** open the discard dialog

### Trusted close / navigation

After a successful create or save:

- **drawer close** uses `runTrusted(continuation, { bypassRouter: false })` so
  closing the sheet does not arm a router bypass
- **post-create page navigation** uses `runTrusted(() => navigate(...))` (default
  bypass) so the next route change proceeds even if the form is still dirty

`consumeTrustedBypass` is consumed by the router adapter for that one-shot
navigation only.
