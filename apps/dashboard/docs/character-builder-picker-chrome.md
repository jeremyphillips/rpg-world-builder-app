# Character builder picker chrome

Phase D audit of equipment, spell, and proficiency catalog pickers in the
character builder. Domain item resolution lives in `@rpg/contracts`; this doc
covers dashboard presentation chrome and what is shared vs domain-specific.

Resolver catalog: [character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).

## Drawer entry points

| Domain        | Drawer                                                                  | Lib                                                      |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Equipment     | `components/equipment/picker/drawer/equipment-picker-drawer.client.tsx` | `equipment/picker/drawer/equipment-picker-drawer.lib.ts` |
| Spells        | `components/spells/picker/spell-picker-drawer.client.tsx`               | `spells/picker/spell-picker-drawer.lib.ts`               |
| Proficiencies | `components/proficiencies/picker/proficiency-picker-drawer.client.tsx`  | `proficiencies/picker/proficiency-picker-drawer.lib.ts`  |

All three are domain composition shells over `@rpg/content` **`CatalogEntityPickerSheet`**
(spread sheet props inline — `surface="background"`, `size="lg"`). Equipment browse
state lives in `useEquipmentPickerController`; mutation stays in step/acquisition hooks.

## Layering

```text
consumer / acquisition hook     → persistence (onCommitAdd, manage callbacks)
useEquipmentPickerController    → browse / filter / quantity / derived presentation
domain drawer                   → sheet composition + domain presentation
CatalogEntityPickerSheet        → catalog row host
```

## Commonality matrix

| Dimension                   | Equipment                       | Spells                   | Proficiencies         | Shared chrome                                                    |
| --------------------------- | ------------------------------- | ------------------------ | --------------------- | ---------------------------------------------------------------- |
| Sheet shell                 | ✓                               | ✓                        | ✓                     | `CatalogEntityPickerSheet` (`surface="background"`, `size="lg"`) |
| Search                      | Built-in sheet search           | Same                     | Same                  | `@rpg/ui`                                                        |
| Structured filters          | Kind + affordable toggles       | School, level, mechanics | —                     | Equipment ↔ Spells pattern only                                  |
| Sort                        | `CatalogSortControl`            | Wrapped sort control     | `CatalogSortControl`  | `CatalogSortControl` + sort mode constants                       |
| Reset view / clear          | Dual-mode (clear vs reset)      | Reset slot               | Reset slot            | `catalog-picker-filter-state.lib.ts`, `CatalogToolbarResetSlot`  |
| Empty state panel           | Sheet defaults                  | Custom message           | Custom message        | **`CatalogPickerResultsState`**                                  |
| Row add/remove              | Commerce / acquisition rail     | Selection actions        | Selection actions     | Spells ↔ Proficiencies: **`CatalogPickerSelectionActions`**      |
| Row dimming / disabled note | Domain-specific (affordability) | Shared resolver state    | Shared resolver state | **`picker/row/catalog-picker-row-state.lib.ts`**                 |
| Empty-state kind/message    | —                               | Choice-set driven        | Choice-set driven     | **`picker/results/catalog-picker-empty-state.lib.ts`**           |
| Recommendation tabs         | No                              | Yes                      | No                    | Spells only                                                      |
| Workflow mode tabs          | Purchase / magic items          | Cantrips / prepared      | No                    | Equipment only                                                   |
| Budget / price UI           | Yes                             | No                       | No                    | Equipment only                                                   |
| Loading in drawer           | —                               | —                        | —                     | Unused (items resolved before open)                              |
| Error in drawer             | —                               | —                        | —                     | Upstream step readiness gating                                   |

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
- Drawer-only browse state (spell mode tabs, equipment workflow mode)
- Row chrome beyond selection actions (equipment acquisition panels, spell markers)
- Metadata line mapping (`picker/metadata/`)
- Draft mutations (step hooks)

**Rule:** Do not re-implement domain eligibility, blockers, or affordability in
dashboard libs. When browse logic encodes domain policy, promote it to contracts
only if a non-dashboard consumer appears.

## Shared picker modules (`components/picker/`)

Subfolders: `metadata/` (+ `mappers/`), `sort/`, `selection/`, `row/`, `results/`.
Commit confirmation hook and filter toolbar seams stay at picker root.

Extracted in Phase D where proven across **two or more** pickers:

| Module                                                  | Role                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `results/catalog-picker-results-state.client.tsx`       | Dashed empty-state `InsetPanel` (spells + proficiencies)   |
| `results/catalog-picker-empty-state.lib.ts`             | `no-options` / `selection-full` kind + message mapping     |
| `row/catalog-picker-row-state.lib.ts`                   | Dimmed row + first disabled-reason note                    |
| `catalog-picker-filter-state.lib.ts` (root)             | Clearable / reset-view criteria (equipment delegates here) |
| `catalog-toolbar-reset-action.client.tsx` (root)        | Reset button + layout-stable slot                          |
| `sort/catalog-sort-control.client.tsx`                  | Sort `<Select>`                                            |
| `selection/catalog-picker-selection-actions.client.tsx` | Add / Remove row actions                                   |

Domain drawer libs keep thin wrappers (e.g. `resolveSpellPickerEmptyStateMessage`)
so step-specific copy stays co-located with types.

## Explicit non-goals (Phase D)

- One generalized browse/sort/filter controller across all three pickers
- Merging `equipment-picker-drawer.lib.ts`, `spell-picker-drawer.lib.ts`, and
  `proficiency-picker-drawer.lib.ts`
- Extracting equipment acquisition / commerce row chrome (single consumer)
- Promoting client-side filter labels into contracts (presentation-only)

## Follow-up (Phase E+)

- Align equipment empty-state messaging with `CatalogPickerResultsState` when product copy is defined
- Evaluate shared filter-controls hook if a third structured-filter picker appears
- Spell casting-time filter labels → wire to `CASTING_TIME_UNIT_ENTRIES` vocab (UX hygiene)
