# Floating-label fields

`FloatingLabelField` is one composite in `packages/ui/src/components/ui/`. Consumers pass a label, a size, a `populated` flag, and exactly one control. They do not coordinate label motion, masks, or offsets.

Catalog regions (`DataTableFilterRegion`, picker `CatalogFilterControls` / `CatalogToolbar`, relationship filter bands) set `selectPresentation: 'floating'`, so an omitted select `layout` renders as floating. Pass explicit `layout: 'floating'` only outside those regions, or when a field must stay floating even if the surrounding chrome is `per-field`. `layout: 'stacked'` or `layout: 'inline'` still overrides the region. `FilterFloatingField` only maps filter density to `size`. Forms, messages, and notifications stay on per-field chrome.

## What it is for

| Control                                                                                      | v1                                                                                                                                                   |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text input                                                                                   | Yes. The label is the accessible name. A placeholder is optional guidance shown only while the field is focused and empty.                           |
| Select                                                                                       | Yes. A resolved value, including `__all__` and `best_match`, counts as populated, so the label is floated from the first frame.                      |
| Single combobox                                                                              | Yes. Populated means a committed selection. The typed query and the open state do not. A loading trigger counts as populated and shows loading copy. |
| Search, textarea, multi-select, steppers, grouped shells, chips, checkboxes, popover filters | No. See the compatibility notes in the implementation plan.                                                                                          |

## State

`populated` is a required prop and is rendered as `data-populated`. The composite does not read the DOM to decide it.

The label floats when the field is populated, focused (`:focus-within`), or open (`aria-expanded="true"`). Open popups move focus into a portal, so focus alone would drop the label.

A field that already has a value on the first render must show the floated label with no resting frame. Do not enable transitions after mount unless a flash is actually observed.

Browser autofill is visual only. `:autofill` forces the floated treatment so text cannot sit on a resting label. It does not set `data-populated`. Floating text filters set `autoComplete="off"`.

## Geometry

- Compact (`sm`) is `h-8`. The resting label is `text-xs`. The floated label stays `text-xs` and moves to the caption colour.
- Comfortable (`md`) is `h-9`. The resting label is `text-md`. Floating scales it toward caption `text-sm` (`--text-sm / --text-md`). Font-size is not animated.
- The floated label hangs outside the shell. The shell height is the control height, so toolbar rows align the control with neighboring inline controls.
- The label is `pointer-events-none` and stops before the caret column.
- The mask is a `--surface-current` / `--field-control-bg` gradient on the label. Disabled, readonly, and invalid controls switch the lower half to the matching field fill. Forced colours use a solid `Canvas` background because they drop background images.
- Focus rings stay on the control (`fieldInputFocusClasses`). The mask is the only interruption. Half the floated label must cover the ring offset plus the ring width.

Reduced motion sets both the duration and the delay to 0. The global reduced-motion rule shortens durations and leaves delays, so it is not enough on its own.

## Hints and guards

Hints always render below the control. There is no `hintPosition` prop. An error replaces the hint.

TypeScript omits `hintPosition`, `labelPosition`, `labelVisibility`, `required`, `anatomy`, and `rowParticipation`. `children` is one element.

`Field.Label` throws inside the composite, because a full `TextField` or `SelectField` would add a second label. `SelectTrigger` throws for `digits` and `grouped`.

In development, the composite warns when the rendered control has an `aria-label`, an `aria-labelledby` that misses the floating label, or a placeholder the composite did not supply.

The composite resets anatomy-row participation so it does not join a parent three-region subgrid.

## Width

The composite does not measure width. Select and combobox width stays on `SelectLikeValueSlot` ghosts. `withFloatingLabelSizingLabel(label, sizingLabels)` appends the label as one more ghost at control typography. Changing the value does not change the width.

Floating selects use the same default `lg` cap as inline selects when no width token is set.

## Filter contract

`layout: 'floating'` is a separate schema member. `ariaLabel` and `triggerAriaLabel` are `never` on that member. The visible label is the accessible name.

Text filters in this layout have no `Filter ${label}…` placeholder and no `aria-label`. Pass `placeholder` only when it is an example, such as `Search by name…`.

When the all-value is selected, the trigger shows `All` (`FILTER_SELECT_ALL_TRIGGER_LABEL`). `allOptionLabel`, vocabulary resolvers, and menu items stay on the full label. Non-floating layouts are unchanged.

Picker and overview selects inside a floating catalog region use this layout without copying `layout: 'floating'` onto the schema. Explicit `layout` is the escape hatch. Catalog sort uses `SortMenu`, not floating labels. Search stays a search field. Messages and notifications keep per-field select chrome.
