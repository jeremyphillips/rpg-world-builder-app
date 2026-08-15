# Sizing & spacing

Reference for `FormDensity`, field `width`, `digits`, rhythm tokens, and row layout.
Section shells (`Form`, `TabbedForm`, `FormFieldStack`, `group`, `array`) own `density`;
leaves inherit control scale from density. Rare leaf overrides use `controlSizeOverride`
only. Decision rules live in the [forms hub](../forms.md#form-density).

**Control size policy:** resolve scale only via `resolveFieldControlSize` (pure) or
`useFieldControlSize` (context adapter). Renderers must not combine `controlSizeOverride`
with `resolveFormDensity` directly.

Source of truth: [`form-density.ts`](../../src/form/form-density.ts),
[`field-stack.variants.ts`](../../src/components/ui/field-stack.variants.ts),
[`field-sizing.variants.ts`](../../src/components/ui/field-sizing.variants.ts),
[`field-control-band.variants.ts`](../../src/components/ui/field-control-band.variants.ts),
[`field-row-presentation.lib.ts`](../../src/components/ui/field-row-presentation.lib.ts),
[`field-digit-metrics.ts`](../../src/components/ui/field-digit-metrics.ts).

Do not sprinkle ad-hoc `space-y-*` on field wrappers in apps — adjust shared tokens in
`@rpg/ui`. Prefer `gap-*` flex stacks over `space-y-*` when stacking sibling fieldsets.

## Spacing tokens

| Token                                 | Class                            | Use                                                                                                           |
| ------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `fieldAnatomyStackClasses`            | `space-y-2`                      | Label, control, hint/error inside one field                                                                   |
| `fieldLabelHintStackClasses`          | `gap-1`                          | Label + hint when `hintPosition="below-label"`                                                                |
| `fieldGroupStackClasses`              | `flex flex-col gap-6`            | Alias for `comfortable` — prefer `fieldStackRhythmVariants` in new code                                       |
| `fieldStackRhythmVariants`            | `gap-2` / `gap-6`                | Form columns, groups, stacks, array item **bodies** — `compact` or `comfortable`                              |
| `formDependentInsetSpacing`           | `pl-8` / `pl-9`                  | Total dependent content inset (8px rail gutter + 24px/28px content offset)                                    |
| `formDependentContentOffsetSpacing`   | `pl-6` / `pl-7` (semantic)       | Content offset portion inside the inset gutter (excluding 8px rail leading space)                             |
| `fieldRailOffsetClasses`              | `left-2` (8px)                   | Decorative rail position — leading space before the rail within the inset gutter                              |
| `resolveFieldRailClasses`             | pseudo-element rail              | Decorative boundary only — does not shift content                                                             |
| `resolveDependentInsetClasses`        | `pl-8` / `pl-9`                  | Applies total content inset when `inset: true`                                                                |
| `fieldGroupInsetPaddingVariants`      | alias of dependent inset         | Deprecated — use `fieldDependentInsetVariants`                                                                |
| `fieldArrayItemListClasses`           | `gap-2` / `gap-3` / `gap-6`      | Gap between sibling **array items** — combines rhythm + section `size`                                        |
| `fieldGroupBottomMarginClasses`       | `mb-8`                           | Space below standalone `FieldGroup` fieldsets; omitted inside rhythm stacks (form root, nested groups/arrays) |
| `fieldGroupFlexStackClasses`          | `flex flex-col gap-8`            | Stacking fieldsets or collapse-prone siblings                                                                 |
| `formSectionStackClasses`             | `flex flex-col gap-7`            | Top-level accordion sections on `<Form>`                                                                      |
| `fieldRowGapClasses`                  | `gap-6`                          | Gap between fields in a `FieldRow`                                                                            |
| `resolveFieldRowClasses`              | `flex flex-wrap items-end gap-6` | Preferred row layout — control-edge alignment (`field-row-presentation.lib.ts`)                               |
| `fieldRowLayoutClasses`               | alias of above                   | Deprecated — prefer `resolveFieldRowClasses`                                                                  |
| `fieldControlBandVariants`            | `min-h-8/9/11`                   | Shared control band height by `FieldSizeToken`                                                                |
| `fieldInlineSentenceClasses`          | `gap-x-2 gap-y-2`                | Inline sentence rows (`ChooseFromChipsField`, …)                                                              |
| `inlineSentenceConnectorVariants`     | —                                | Connector type scale (`tone: prose \| mono`) via `fieldSizeTypographyClasses`                                 |
| `fieldInlineControlRowClasses`        | `gap-3`                          | Inline label + control rows (e.g. `DiceFormulaField`)                                                         |
| `fieldSettingsRowClasses`             | —                                | Dense settings — label + hint left, control right                                                             |
| `fieldChipWrapGapClasses`             | `gap-2 pt-1`                     | Chip pill row inside `ChipsField`                                                                             |
| `fieldGroupDescriptionClasses`        | muted hint typography            | Group / accordion description (spacing on legend header)                                                      |
| `fieldGroupLegendHeaderStackClasses`  | `gap-2` (8px)                    | Between group legend and hint inside the legend header                                                        |
| `fieldGroupLegendSpacingClasses`      | `mb-5` (20px)                    | Below section legend header (legend alone on `<legend>`, or legend + hint stack container)                    |
| `fieldSubgroupLegendSpacingClasses`   | `mb-4` (16px)                    | Below subgroup legend header (legend alone on `<legend>`, or legend + hint stack container)                   |
| `fieldArrayItemClasses`               | `p-4 border`                     | Chrome around one array item                                                                                  |
| `fieldArrayItemActionsClasses`        | `mt-3`                           | Above array item move/remove controls                                                                         |
| `fieldSetResetClasses`                | `m-0 border-0 p-0`               | Strip UA fieldset chrome                                                                                      |
| `fieldSurfaceToneVariants`            | border + bg wash                 | Shared tone for stack dependents wrapper and array item shells (`SurfaceConfig` + `tone`)                     |
| `fieldGroupBodyShellLayoutClasses`    | `rounded-md border p-4`          | Panel and outline group `chrome` body shell (16px padding)                                                    |
| `resolveFieldDependentsChromeClasses` | `rounded-md border p-3` + wash   | Wrapper chrome for toggle-dependent dependents (`dependents.scope: 'wrapper'`)                                |

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
| `fieldDigitTrailingIconClasses`    | Trailing icon sizing — uses `icon-glyph` SSOT (`xs`/`md`; sm≡xs for digit chrome)           |

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

### Number stepper (field-adjacent chrome)

Stepper side buttons align to **field control height**, not generic compact action hit targets:

| Stepper `size` | Button hit target | Glyph     |
| -------------- | ----------------- | --------- |
| `sm`           | `size-8` (32px)   | sm (12px) |
| `md`           | `size-8` (32px)   | md (14px) |

Width formulas in `numberStepperWidthVariants` account for two 32px button columns.
See [`number-stepper.variants.ts`](../../src/components/ui/number-stepper.variants.ts).

## Dense settings rows

`labelPosition: 'settings'` on `number`, `select`, and `switch` — label + hint left,
compact control right; stacks on narrow viewports.

`labelPosition: 'inline'` on `select` — label left, compact control right on one
centered row (toolbar / chrome). Use `info` for helper copy when horizontal space is tight.

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

## Control band & row alignment (SSOT)

**Invariant:** Fields in a row align by a shared control band. Labels render above or
within that band; helper/validation content renders below the alignment anchor
(`data-field-align`). Container layout may be flow or grid, but control sizing and
alignment semantics are shared across forms and filters.

| Concept            | Module                     | Notes                                                                                                                                                                         |
| ------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control band       | `fieldControlBandVariants` | `sm`/`md`/`lg` → `min-h-8`/`min-h-9`/`min-h-11`; `content-sized` opts out for multiline shells                                                                                |
| Field presentation | `resolveFieldPresentation` | `labelLayout`: `hidden` \| `stacked` \| `inline` \| `settings`                                                                                                                |
| Row classes        | `resolveFieldRowClasses`   | Default `align: 'control-edge'` → `items-end`; rows with `derivedMeta.reserveSpace` default to `align: 'start'` → `items-start`; form gap `gap-6`, toolbar/filter gap `gap-2` |

`Field.Error` and `hintPosition="below-control"` stay **outside** `data-field-align` so
row `items-end` targets label + control band, not messages.

**Toggle exception:** hint-bearing `CheckboxField` / inline `SwitchField` keep
first-line control columns (`h-4` / `h-5`) inside a `content-sized` band — do not force
them into a centered `min-h-*` single-line band. Filter booleans (no hint stack) use a
full single-line band with checkbox + label inside.

Product convention: **filters use checkboxes; switches are for persistent
settings/mutations** (no new filter field type).

## Row layout

`FieldRow` and `RowConfig` use a wrapping flex row via `resolveFieldRowClasses` (control-edge).
Compose sibling widths with leaf `width` tokens — intrinsic (`xs`–`xl`, `auto`), proportional
(`full`, fractions), or `digits` on numeric fields.

| Pattern                     | Config                                                            |
| --------------------------- | ----------------------------------------------------------------- |
| All intrinsic inline        | `width: 'auto'` (or `sm`, `digits`, …) on each field              |
| One wide + narrow neighbors | `width: 'full'` on the grow field, `width: 'auto'` on the rest    |
| Equal split                 | omit `width` on both fields, or use matching fractions (`1/2`, …) |

**XdY recipe:** `width: 'xs'` count + `width: 'full'` select in a row — see Storybook
`Recipes/DiceNotation`.

Reserve row `className` for one-offs; prefer `width` tokens when a layout recurs.
