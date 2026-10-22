# Interactive list rows vs menu items

Selection lists and action menus are separate interaction families. They may share surface tokens; they do not share row chrome.

| Family             | Owner                                                            | Use when                                                                                       |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Selection list row | `InteractiveList` + `InteractiveListRow` / `ComboboxOptionRow`   | Listbox, combobox, picker, and search result rows with `role="option"` or navigable list links |
| Action menu item   | `DropdownMenuItem` + `DropdownMenuItemContent` / `MenuChoiceRow` | Commands in overlay menus (`role="menuitem"`)                                                  |

`MenuChoiceRow` is not an `InteractiveList` host. Rich menus (split-button chevron, entity action choice menus) use `ui-menu-item` with optional icon, label, and description only.

## List row state precedence

States are orthogonal. Lower layers do not replace the accent rail; highlight adds rail + fill together via compound classes on `interactiveListRowChromeVariants`.

| State                           | Visual                        | Classes / tokens                                                                                                                                            |
| ------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rest                            | Transparent row on list shell | `--ui-row-bg: transparent`; shell publishes `--ui-surface-bg` (`--surface-lift` on `.ui-interactive-list`, `--background` on `.ui-interactive-list__panel`) |
| Pointer hover (unselected)      | Surface hover mix             | `--hover-list` → `--ui-row-bg-hover: var(--ui-surface-hover-bg)`                                                                                            |
| Pressed (unselected)            | Surface pressed mix           | `:active` on `.ui-interactive-row--hover-list` inside `.ui-interactive-list`                                                                                |
| Keyboard highlight (unselected) | Hover fill + left rail        | `--highlight-list` + `--rail`                                                                                                                               |
| Persistent selection            | Selected fill                 | `--fill-surface` → `--ui-row-bg: var(--ui-surface-selected-bg)`                                                                                             |
| Keyboard highlight (selected)   | Selected fill + rail          | `--highlight-list-selected` + `--rail`                                                                                                                      |
| Selected + pointer hover        | Selected hover token          | `--hover-selected` → `--ui-row-bg-hover: var(--ui-surface-selected-bg)`                                                                                     |
| Disabled                        | Muted, no pointer             | `--state-disabled`                                                                                                                                          |

**Highlight vs selection vs focus:** `highlighted` is the transient listbox/combobox cue (arrow keys, `mouseenter`). `selected` is the persisted value (`aria-selected` on options). Focus rings live on the interactive child (`button`, `a`) via `interactiveFocusVariants`, not on row fill.

Surface hover and pressed mixes come from [surface-interaction.css](../src/components/ui/surface-interaction.css) on `.ui-interactive-list` and `.ui-interactive-list__panel` — the same 94% / 88% recipe as interactive cards, without composing `ui-card` chrome.

## Menu item contract

`ui-menu-item` owns padding, type, and `data-highlighted` / focus wash (`--row-hover-bg`, foreground unchanged). Optional description uses `ui-menu-item__description` and stays `muted-foreground` when highlighted. Submenu triggers keep `data-state="open"` accent treatment. Checkbox and radio items are unchanged (`DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`).
