# Character builder picker chrome

Audit of equipment, spell, proficiency, and organization catalog pickers in the
character builder. Domain item resolution lives in `@rpg/contracts`; this doc
covers dashboard presentation chrome, ownership boundaries, and what is shared
vs domain-specific.

Resolver catalog: [character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).

## Architectural rule

Evaluate every new picker against this stack:

```text
consumer / workflow hook     → persistence and application mutation
domain controller (optional) → browse / filter / quantity / derived presentation state
domain drawer                → sheet composition + domain interaction model
shared picker chrome         → stateless or same-lifecycle UI used by ≥2 character domains
CatalogEntityPickerSheet     → catalog row host (content)
```

Three commit layers — do not collapse them:

- **UI commit mechanics** — quantity field value, reset-after-add, pending/success flash
- **Domain rules** — affordability, stackable max, eligibility (contracts / domain libs)
- **Application mutation** — purchase intent vs magic-item grant, draft patches, REST membership create

Domain drawers **may** understand their domain interaction model. They **must not**
understand the persistence mechanism of the consuming surface (builder draft patch vs
sheet API).

Use the catalog entity picker sheet (or its successor) — do not fork a parallel shell.
There is no import-string guard; the contract is documented here.

## Drawer entry points

| Domain        | Drawer                                                                  | Controller / lib                                           |
| ------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Equipment     | `components/equipment/picker/drawer/equipment-picker-drawer.client.tsx` | `useEquipmentPickerController` + drawer lib                |
| Spells        | `components/spells/picker/spell-picker-drawer.client.tsx`               | `useSpellPickerController` + drawer lib + browse-mode lib  |
| Proficiencies | `components/proficiencies/picker/proficiency-picker-drawer.client.tsx`  | drawer lib only (no controller)                            |
| Organizations | `components/connections/picker/organization-picker-drawer.client.tsx`   | drawer lib only — builder **and** sheet reuse control case |

All four are domain composition shells over `@rpg/content` **`CatalogEntityPickerSheet`**
(`surface="background"`, `size="lg"`). Equipment and spell browse state live in domain
controllers; mutation stays in step/acquisition hooks.

## Layering

```text
consumer / acquisition hook       → persistence (onCommitAdd, manage callbacks, onSelect)
useEquipmentPickerController      → equipment browse / filter / quantity / derived presentation
useSpellPickerController          → spell mode buckets / filter persist / derived lists
domain drawer                       → sheet composition + domain presentation
shared picker chrome (components/picker/) → sort, selection actions, reset, empty states
CatalogEntityPickerSheet            → catalog row host
CatalogMetadataRenderer (content)   → metadata line rendering (canonical)
```

## Per-drawer contracts

### EquipmentPickerDrawer

**May know:** equipment domain; browse workflow mode for **presentation** (filters/sorts/budget/callouts); row/detail composition; quantity UI; grant manage **callbacks**; documented pass-through of grant/acquisition context to details until acquisition VM is weaned off draft.

**Must not know:** how a purchase is persisted; how a magic-item grant is applied; character-step mutation implementation; purchase-vs-grant routing on the add path (consumer maps `onCommitAdd`).

### SpellPickerDrawer

**May know:** cantrip vs prepared as a **choice-set browse mode**; per-mode filter/sort buckets; spell metadata/markers; selection-full empty states; spell-only selection summary chrome.

**Must not know:** `draft.choiceSelections` shape; how the builder patches draft; campaign/sheet persistence.

### ProficiencyPickerDrawer

**May know:** one active `ChoiceSet`; skill vs other choice types for details; sort/search; `catalogIndex` for **skill catalog presentation**.

**Must not know:** how selections are stored on the draft; step-hook internals.

### OrganizationPickerDrawer

**May know:** organization domain filter; membership title field; selected vs available; pending/error/close-on-success as add-flow interaction.

**Must not know:** builder `draft.connections` vs sheet API vs org-roster consumers; character record shape.

## Commonality matrix

| Dimension                   | Equipment                         | Spells                   | Proficiencies         | Shared chrome                                                    |
| --------------------------- | --------------------------------- | ------------------------ | --------------------- | ---------------------------------------------------------------- |
| Sheet shell                 | ✓                                 | ✓                        | ✓                     | `CatalogEntityPickerSheet` (`surface="background"`, `size="lg"`) |
| Search                      | Built-in sheet search             | Same                     | Same                  | `@rpg/ui`                                                        |
| Structured filters          | Kind + affordable toggles         | School, level, mechanics | —                     | Equipment ↔ Spells pattern only                                  |
| Sort                        | `CatalogSortControl`              | Wrapped sort control     | `CatalogSortControl`  | `CatalogSortControl` + sort mode constants                       |
| Reset view / clear          | Dual-mode (clear vs reset)        | Reset slot               | Reset slot            | `catalog-picker-filter-state.lib.ts`, `CatalogToolbarResetSlot`  |
| Empty state panel           | Sheet defaults                    | Custom message           | Custom message        | **`CatalogPickerResultsState`**                                  |
| Row add/remove              | Commerce / acquisition rail       | Selection actions        | Selection actions     | Spells ↔ Proficiencies: **`CatalogPickerSelectionActions`**      |
| Row dimming / disabled note | Domain-specific (affordability)   | Shared resolver state    | Shared resolver state | **`picker/row/catalog-picker-row-state.lib.ts`**                 |
| Empty-state kind/message    | —                                 | Choice-set driven        | Choice-set driven     | **`picker/results/catalog-picker-empty-state.lib.ts`**           |
| Recommendation tabs         | No                                | Yes                      | No                    | Spells only                                                      |
| Workflow mode tabs          | Purchase / magic items            | Cantrips / prepared      | No                    | Equipment only                                                   |
| Budget / price UI           | Yes                               | No                       | No                    | Equipment only                                                   |
| Metadata renderer           | Content `CatalogMetadataRenderer` | Same                     | Same                  | Domain mappers under each `*/picker/`                            |

## Contracts vs dashboard ownership

### `@rpg/contracts` (domain affordances)

| Domain        | Resolver                                                  | Provides                                                                                                                |
| ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Equipment     | `resolveEquipmentPickerItems` + dashboard search assembly | Rows, affordability, recommendations, `searchDocument`; purchase action via `resolveEquipmentPickerPurchaseActionState` |
| Spells        | `resolveSpellPickerItems`                                 | Rows, selection state, `compactSummary`, `searchText`                                                                   |
| Proficiencies | `resolveProficiencyPickerItems`                           | Rows, grants overlap, selection state, optional `compactSummary`                                                        |

Row state for spells and proficiencies extends `PickerItemStateBase`
(`resolvers/picker/picker-item-state.ts`): `canSelect`, `isAlreadySelected`,
`disabledReasons`.

### Dashboard (presentation + browse UX)

- Filter schemas and filter control wiring (`*-picker-filter-schema.ts`, toolbar clients)
- Client-side search scoring and sort orchestration (`*-picker-drawer.lib.ts`, `picker/sort/catalog-picker-sort.lib.ts`)
- Domain controllers for equipment and spell browse lifecycle
- Row chrome beyond selection actions (equipment acquisition panels, spell markers)
- Metadata line mapping (domain `*/picker/map-*-to-metadata-lines.ts` → `CatalogMetadataLine`)
- Draft mutations (step hooks)

**Rule:** Do not re-implement domain eligibility, blockers, or affordability in
dashboard libs. When browse logic encodes domain policy, promote it to contracts
only if a non-dashboard consumer appears.

## Shared picker modules (`components/picker/`)

`components/picker/` is a **shared character picker chrome/composition layer**, not a
bucket for anything two files import. A module belongs here only when **all** of:

1. at least two character domains use it
2. semantics are the same
3. lifecycle is the same or the module is stateless
4. it has no equipment / spell / proficiency vocabulary or assumptions

Subfolders: `sort/`, `selection/`, `row/`, `results/`. Filter toolbar seams stay at
picker root.

| Module                                                  | Role                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `results/catalog-picker-results-state.client.tsx`       | Dashed empty-state `InsetPanel` (spells + proficiencies)   |
| `results/catalog-picker-empty-state.lib.ts`             | `no-options` / `selection-full` kind + message mapping     |
| `row/catalog-picker-row-state.lib.ts`                   | Dimmed row + first disabled-reason note                    |
| `catalog-picker-filter-state.lib.ts` (root)             | Clearable / reset-view criteria (equipment delegates here) |
| `catalog-toolbar-reset-action.client.tsx` (root)        | Reset button + layout-stable slot                          |
| `sort/catalog-sort-control.client.tsx`                  | Sort `<Select>`                                            |
| `selection/catalog-picker-selection-actions.client.tsx` | Add / Remove row actions                                   |

**Not in `picker/` (domain-owned):**

| Module                                                   | Owner                          |
| -------------------------------------------------------- | ------------------------------ |
| `spell-picker-browse-mode.lib.ts`                        | `spells/picker/`               |
| `useSpellPickerController`                               | `spells/picker/`               |
| `spell-picker-selection-summary.client.tsx`              | `spells/picker/` (spells only) |
| `useEquipmentAcquisitionCommitConfirmation`              | `equipment/acquisition/`       |
| `map-*-compact-summary-to-metadata-lines.ts`             | respective domain `*/picker/`  |
| `CatalogMetadataRenderer` / `formatCatalogMetadataLines` | `@/features/content`           |

Domain drawer libs keep thin wrappers (e.g. `resolveSpellPickerEmptyStateMessage`)
so step-specific copy stays co-located with types.

## Browse state lifecycle

Search for equipment/proficiency/org is **sheet-owned** (`CatalogPickerSheet` `useState`).
Equipment does not pass `initialSearchQuery`. Spells copy search into the active mode
bucket and restore via `initialSearchQuery` + `toolbarStateKey`.

| State       | Equipment                            | Spells                                          | Proficiencies          |
| ----------- | ------------------------------------ | ----------------------------------------------- | ---------------------- |
| search      | sheet-owned; not persisted by drawer | per-mode bucket; restored on reopen/mode switch | sheet-owned            |
| sort        | persists across close/reopen         | per-mode bucket                                 | persists while mounted |
| filters     | persist across close/reopen          | per-mode bucket                                 | none                   |
| quantity    | reset on close                       | n/a                                             | n/a                    |
| mode bucket | n/a                                  | persist across close                            | n/a                    |

Controller tests encode these rules directly.

## Explicit non-goals

- One generalized browse/sort/filter controller across all pickers
- Merging domain drawer libs into a shared module
- Extracting equipment acquisition / commerce row chrome (single consumer)
- Import-string guards requiring `CatalogEntityPickerSheet` in every drawer file

## Follow-up

- Align equipment empty-state messaging with `CatalogPickerResultsState` when product copy is defined
- Wean equipment acquisition panel VM off `CharacterBuilderDraft` (shared with inventory manage)
- Wire spell `recommendationsEnabled` when resolver/product work lands
