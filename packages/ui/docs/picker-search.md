# Picker search policy

Composable pickers (Combobox, ButtonDropdown, array add menus) share one **search-field inclusion policy** in `packages/ui/src/lib/picker-search.lib.ts`. Apps pass the existing public option shapes — no normalized wire DTO.

## Supporting text

- **Concept:** supporting text (neutral name in docs and assembler).
- **Public props:** `FieldOption.description`, `ComboboxFieldOption.metadata`, `ButtonDropdownItem.metadata`, `ArrayAddMenuItemConfig.description` (mapped to dropdown `metadata` at render).
- Curated discovery uses `searchTerms` and `aliases` — not the supporting line.

## Search inclusion

`search?: { includeSupporting?: boolean }` on combobox/dropdown option types.

| Field                    | Indexed?                               |
| ------------------------ | -------------------------------------- |
| Label                    | always                                 |
| `searchTerms`, `aliases` | always (keyword tier)                  |
| Supporting text          | only when `includeSupporting === true` |
| Dropdown group label     | always when grouped                    |
| Combobox `value` slug    | always                                 |

**Transitional defaults (omitted `search`):**

- Combobox: include supporting when `metadata`/`description` is set.
- ButtonDropdown: include supporting (`includeSupporting` treated as true).

Vocab-backed preset rows should set `search: { includeSupporting: false }` and supply contracts `searchTerms`.

## Assembly

- Internal `buildPickerSearchFields` owns inclusion and roles.
- `assembleComboboxOptionSearchDocument` and `buildButtonDropdownSearchFields` are thin adapters.
- Dropdown ranking still uses `mapLegacySearchField` (0.35× keyword weight); combobox uses native `@rpg/search` documents.

See also [`packages/search/docs/matching-and-ranking.md`](../../../packages/search/docs/matching-and-ranking.md).
