# Sizing & spacing

Reference for field `size`, `width`, `digits`, rhythm tokens, and row layout. Decision
rules (array/slot defaults, form-level rhythm) live in the
[forms hub](../forms.md#form-rhythm).

Source of truth: [`field.variants.ts`](../../src/components/ui/field.variants.ts),
[`field-stack.variants.ts`](../../src/components/ui/field-stack.variants.ts),
[`field-sizing.variants.ts`](../../src/components/ui/field-sizing.variants.ts),
[`field-digit-metrics.ts`](../../src/components/ui/field-digit-metrics.ts).

Do not sprinkle ad-hoc `space-y-*` on field wrappers in apps — adjust shared tokens in
`@rpg/ui`. Prefer `gap-*` flex stacks over `space-y-*` when stacking sibling fieldsets.

## Spacing tokens

| Token                                | Class                          | Use                                                                                                         |
| ------------------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `fieldAnatomyStackClasses`           | `space-y-2`                    | Label, control, hint/error inside one field                                                                 |
| `fieldLabelHintStackClasses`         | `gap-1`                        | Label + hint when `hintPosition="below-label"`                                                              |
| `fieldGroupStackClasses`             | `flex flex-col gap-6`          | Alias for `comfortable` — prefer `fieldStackRhythmVariants` in new code                                     |
| `fieldStackRhythmVariants`           | `gap-2` / `gap-6`              | Form columns, groups, stacks, array item **bodies** — `compact` or `comfortable`                            |
| `fieldArrayItemListClasses`          | `gap-2` / `gap-3` / `gap-6`    | Gap between sibling **array items** — combines rhythm + section `size`                                      |
| `fieldGroupBottomMarginClasses`      | `mb-8`                         | Space below a top-level group or array fieldset (nested arrays omit — parent rhythm)                        |
| `fieldGroupFlexStackClasses`         | `flex flex-col gap-8`          | Stacking fieldsets or collapse-prone siblings                                                               |
| `formSectionStackClasses`            | `flex flex-col gap-7`          | Top-level accordion sections on `<Form>`                                                                    |
| `fieldRowGapClasses`                 | `gap-6`                        | Gap between fields in a `FieldRow`                                                                          |
| `fieldRowLayoutVariants`             | —                              | `FieldRow` / `RowConfig.layout` (`flex`, `responsive-2`, …)                                                 |
| `fieldInlineSentenceClasses`         | `gap-x-2 gap-y-2`              | Inline sentence rows (`ChooseFromChipsField`, …)                                                            |
| `inlineSentenceConnectorVariants`    | —                              | Connector type scale (`tone: prose \| mono`) via `fieldSizeTypographyClasses`                               |
| `fieldInlineControlRowClasses`       | `gap-3`                        | Inline label + control rows (e.g. `DiceFormulaField`)                                                       |
| `fieldSettingsRowClasses`            | —                              | Dense settings — label + hint left, control right                                                           |
| `fieldChipWrapGapClasses`            | `gap-2 pt-1`                   | Chip pill row inside `ChipsField`                                                                           |
| `fieldGroupDescriptionClasses`       | `mb-3`                         | Below group / accordion description                                                                         |
| `fieldGroupLegendSpacingClasses`     | `mb-4`                         | Below group legend                                                                                          |
| `fieldArrayItemClasses`              | `p-4 border`                   | Chrome around one array item                                                                                |
| `fieldArrayItemActionsClasses`       | `mt-3`                         | Above array item move/remove controls                                                                       |
| `fieldSetResetClasses`               | `m-0 border-0 p-0`             | Strip UA fieldset chrome                                                                                    |
| `fieldSurfaceToneVariants`           | border + bg wash               | Shared tone for stack dependents wrapper and array item shells (`main` \| `subtle` \| `warning` \| `error`) |
| `fieldStackDependentsChromeVariants` | `rounded-md border p-3` + tone | Wrapper chrome for toggle-dependent stack dependents (`dependentsChromeScope: 'wrapper'`)                   |

## Sizing maps

Control height, padding, and type scale come from `field-sizing.variants.ts` (`sm | md | lg`).

| Map                                | Use                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `fieldSizeTypographyClasses`       | Label + control type scale                                                                  |
| `fieldControlSizeClasses`          | Single-line controls (`Input`, `Select`, …)                                                 |
| `fieldGroupedControlSizeClasses`   | One segment in grouped shells (`InputSelectField`, `InputUnitField`, `DiceFormulaField`, …) |
| `fieldTextareaSizeClasses`         | Multi-line controls                                                                         |
| `fieldDigitSizeClasses`            | Digit-width control padding                                                                 |
| `fieldDigitTrailingPaddingClasses` | Right reserve for stepper/caret columns                                                     |
| `fieldDigitTrailingColumnClasses`  | Trailing column width                                                                       |
| `fieldDigitTrailingIconClasses`    | Trailing icon sizing                                                                        |

### `size` — control height + type scale

Labels and controls share `fieldSizeTypographyClasses`. At 16px root:

| `size` | Type scale  | px  | Control height | Use                                 |
| ------ | ----------- | --- | -------------- | ----------------------------------- |
| `sm`   | `text-xs`   | 12  | `h-8` (32px)   | Dense toolbars, array/slot defaults |
| `md`   | `text-md`   | 15  | `h-9` (36px)   | Default — most forms                |
| `lg`   | `text-base` | 16  | `h-11` (44px)  | Prominent single-field forms        |

### `width` — sizing within a container

- **Intrinsic** (`xs`, `sm`, `md`, `lg`, `xl`, `auto`): capped `max-width` + `flex-none`.
  `xs` (~64px) for die counts; `sm` for level pickers. In a `FieldRow`, intrinsic tokens
  also set matching `w-*` widths.
- **Proportional** (`full`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`): flex within a `FieldRow`
  by grow weight (base-12). Meaningful only inside a row; elsewhere behave like `full`.

A plain `FieldRow` with two inputs and no `width` splits 50/50 and wraps on narrow viewports.

### `digits` — ch-based control width

`number` and `select` fields accept optional `digits` on the control via `fieldDigitWidthVariants`.

- Standalone fields: keep `width: 'full'` so label/hint span the column; control stays narrow.
- Row fields: use `width: 'auto'` or fractions when sharing a row.
- `number` may use `inputWidth` for a non-digit cap on the input element.

**Select + `digits`:** trigger shows the option **label**. Use short labels (`"1"`, `"d8"`).
Verbose labels need wider triggers — omit `digits` or use compact labels.

Dashboard: [`getLevelFieldOptions`](../../../../apps/dashboard/src/features/content/lib/level-field-options.ts)

- `levelSelectDigits(ctx)`; hit die uses `HIT_DIE_SELECT_DIGITS` (`3`).

```ts
{ type: 'select', name: 'spellcasting.level', label: 'Spellcasting level', digits: 2, ... }
{ type: 'select', name: 'hitDie', label: 'Hit die', digits: 3, width: 'auto', ... }
{ type: 'number', name: 'quantity', label: 'Quantity', digits: 2, width: 'auto', ... }
```

Do **not** combine `digits` with mixed-length enum labels — use full-width sizing instead.

## Dense settings rows

`labelPosition: 'settings'` on `number`, `select`, and `switch` — label + hint left,
compact control right; stacks on narrow viewports.

```ts
{
  type: 'number',
  name: 'primaryAbilityMinimumScore',
  label: 'Minimum ability score',
  labelPosition: 'settings',
  digits: 2,
  required: true,
  min: 1,
  max: 30,
}
```

Not for multi-field side-by-side layout — that is `FieldRow` / fractional `width`.

## Row layout

`FieldRow` and `RowConfig` share `layout` via `fieldRowLayoutVariants` — flex **or** grid, never both.

| `layout`         | Use                                                             |
| ---------------- | --------------------------------------------------------------- |
| `flex` (default) | Side-by-side by `width` — XdY count + die select, class + level |
| `responsive-2`   | Two equal columns from `md` up                                  |
| `responsive-3`   | Three columns from `md` up                                      |
| `responsive-4`   | Four columns from `md` up — vehicle stats                       |

Prefer flex + `width` fractions when one field should stay narrow beside a wide neighbor.
Use responsive grids when every child gets an equal cell.

**XdY recipe:** `width: 'xs'` count + `width: 'full'` select in a row — see Storybook
`Recipes/DiceNotation`.

Reserve row `className` for one-offs; prefer tokens when a width recurs.
