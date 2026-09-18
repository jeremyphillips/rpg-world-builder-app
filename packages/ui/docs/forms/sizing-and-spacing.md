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

| Token                                 | Class                              | Use                                                                                                                                                                                                                    |
| ------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldAnatomyStackVariants`           | `gap-y-1` / `gap-y-1.5`            | **SSOT** for label/heading cluster → control and control → validation / bottom hint (`sm` → 4px, `md`/`lg` → 6px). Gap-based so fieldset `m-0` cannot collapse the error sibling. Leaf heading → body uses this token. |
| `fieldAnatomyAlignVariants`           | `gap-y-1` / `gap-y-1.5`            | Same size map as anatomy, `gap-y` for stacked FieldLayout alignment anchors                                                                                                                                            |
| `fieldAnatomyStackClasses`            | `flex flex-col gap-y-1.5`          | Comfortable default alias for `fieldAnatomyStackVariants({ size: 'md' })`                                                                                                                                              |
| `fieldLabelContentClusterClasses`     | `inline-flex items-center gap-1.5` | Label + required marker + info on one line                                                                                                                                                                             |
| `fieldLabelHintStackClasses`          | `gap-0.5`                          | Label cluster + hint when `hintPosition="below-label"` (fields and leaf headings) — 2px                                                                                                                                |
| `fieldGroupStackClasses`              | `flex flex-col gap-6`              | Alias for `comfortable` — prefer `fieldStackRhythmVariants` in new code                                                                                                                                                |
| `fieldStackRhythmVariants`            | `gap-3` / `gap-6`                  | Form columns, groups, stacks, array item **bodies** — `compact` or `comfortable`                                                                                                                                       |
| `dependentNestMarginClasses`          | `ml-11` (44px)                     | Horizontal offset of the default dependent nest from the controller                                                                                                                                                    |
| `dependentNestPaddingClasses`         | `pt-3 pr-3 pb-3 pl-4`              | Inner padding of the default dependent nest                                                                                                                                                                            |
| `dependentSectionStackClasses`        | `flex flex-col gap-4`              | Vertical gap between controller and dependent nest — 16px                                                                                                                                                              |
| `resolveDependentNestRailClasses`     | `before:left-0`                    | Weaker flush-left rail on the default dependent nest                                                                                                                                                                   |
| `fieldRailOffsetClasses`              | `left-2` (8px)                     | Group-field decorative rail position (`resolveFieldRailClasses`) — not used on dependent nests                                                                                                                         |
| `resolveFieldRailClasses`             | pseudo-element rail                | Group field stacks only — does not shift content                                                                                                                                                                       |
| `resolveDependentInsetClasses`        | `pl-8` / `pl-9`                    | **Deprecated** — legacy content inset; group rails only                                                                                                                                                                |
| `fieldGroupInsetPaddingVariants`      | alias of dependent inset           | Deprecated — use `fieldDependentInsetVariants`                                                                                                                                                                         |
| `fieldArrayItemListClasses`           | `gap-2` / `gap-3` / `gap-6`        | Gap between sibling **array items** — disclosure (`gap-3` comfortable, `gap-2` compact), rhythm, or tight/merged flat stacks                                                                                           |
| `fieldGroupBottomMarginClasses`       | `mb-8`                             | Space below standalone `FieldGroup` fieldsets; omitted inside rhythm stacks (form root, nested groups/arrays)                                                                                                          |
| `fieldGroupFlexStackClasses`          | `flex flex-col gap-8`              | Stacking fieldsets or collapse-prone siblings                                                                                                                                                                          |
| `formSectionStackClasses`             | `flex flex-col gap-7`              | Top-level accordion sections on `<Form>`                                                                                                                                                                               |
| `fieldRowGapClasses`                  | `gap-6`                            | Gap between fields in a `FieldRow`                                                                                                                                                                                     |
| `resolveFieldRowClasses`              | `flex flex-wrap items-end gap-6`   | Preferred row layout — control-edge alignment (`field-row-presentation.lib.ts`)                                                                                                                                        |
| `fieldRowLayoutClasses`               | alias of above                     | Deprecated — prefer `resolveFieldRowClasses`                                                                                                                                                                           |
| `fieldControlBandVariants`            | `min-h-8/9/11`                     | Shared control band height by `FieldSizeToken`                                                                                                                                                                         |
| `fieldInlineSentenceClasses`          | `gap-x-2 gap-y-2`                  | Inline sentence rows (`ChooseFromChipsField`, …)                                                                                                                                                                       |
| `inlineSentenceConnectorVariants`     | —                                  | Connector type scale (`tone: prose \| mono`) via `fieldSizeTypographyClasses`                                                                                                                                          |
| `fieldInlineControlRowClasses`        | `gap-3`                            | Inline label + control rows (e.g. `DiceFormulaField`)                                                                                                                                                                  |
| `fieldSettingsRowClasses`             | —                                  | Dense settings — label + hint left, control right                                                                                                                                                                      |
| `fieldChipWrapGapClasses`             | `gap-2`                            | Chip pill row inside `ChipsField` — horizontal/wrap only; vertical spacing is the anatomy token                                                                                                                        |
| `fieldGroupDescriptionClasses`        | muted hint typography              | Group / accordion description (spacing on legend header)                                                                                                                                                               |
| `fieldGroupLegendHeaderStackClasses`  | `gap-2` (8px)                      | Between group legend and hint inside the legend header                                                                                                                                                                 |
| `fieldGroupLegendSpacingClasses`      | `mb-5` (20px)                      | Below section legend header (legend alone on `<legend>`, or legend + hint stack container)                                                                                                                             |
| `fieldSubgroupLegendSpacingClasses`   | `mb-4` (16px)                      | Below subgroup legend header (legend alone on `<legend>`, or legend + hint stack container)                                                                                                                            |
| `fieldArrayItemClasses`               | `p-4 border`                       | Chrome around one array item                                                                                                                                                                                           |
| `fieldArrayItemActionsClasses`        | `mt-3`                             | Above array item move/remove controls                                                                                                                                                                                  |
| `fieldSetResetClasses`                | `m-0 border-0 p-0`                 | Strip UA fieldset chrome                                                                                                                                                                                               |
| `fieldSetChromeContainClasses`        | `flex flex-col`                    | Column stack for a reset leaf fieldset (chrome lives on the wrapping shell)                                                                                                                                            |
| `fieldSetInFlowLegendClasses`         | `contents min-w-0 p-0`             | Leaf fieldset legends — `display: contents` so label/hint clusters participate in fieldset flex gap                                                                                                                    |
| `fieldSurfaceToneVariants`            | border + bg wash                   | Shared tone for stack dependents wrapper and array item shells (`SurfaceConfig` + `tone`)                                                                                                                              |
| `fieldGroupBodyShellLayoutClasses`    | `rounded-md border p-4`            | Panel and outline group `chrome` body shell (16px padding)                                                                                                                                                             |
| `resolveFieldDependentsChromeClasses` | `rounded-md border p-3` + wash     | Wrapper chrome for toggle-dependent dependents (`dependents.scope: 'wrapper'`)                                                                                                                                         |

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

> **Digit invariant:** `digits` describes the minimum usable inline size of the control.

**NumberInput** uses `resolveDigitInlineSizeClasses` / `fieldDigitWidthVariants` (stepper
reserve via `pr-6` + absolute stepper column).

**Select** uses a shared trigger anatomy in
[`select-compact-trigger.variants.ts`](../../src/components/ui/select-compact-trigger.variants.ts):

```text
SelectTrigger          // border, radius, bg, focus; px-0 (no horizontal padding)
├── ValueSlot          // ps/pe padding + compact or prose sizing
│   └── value
└── CaretSlot          // fixed w-8/w-9 column + chevron
```

Compact sizing modes on `SelectTrigger` (mutually exclusive):

| Prop           | Use                                  | Value slot width                                 |
| -------------- | ------------------------------------ | ------------------------------------------------ |
| `digits`       | Numeric labels (`"30"`, `"d8"`)      | `min-w-[calc(N*1ch)]` + `tabular-nums`           |
| `sizingLabel`  | Single known reserve label           | Grid ghost span + overlaid `SelectValue`         |
| `sizingLabels` | Option set with varying glyph widths | Overlapping hidden ghosts for every option label |
| neither        | Prose / enum selects                 | `flex-1 min-w-0` + truncate                      |

Prefer `sizingLabels={options.map(o => o.label)}` when the option set is known (currency
units, InputSelect units, etc.). Do **not** use `digits` for alpha labels — `N×ch` is
digit-width only.

- Standalone fields: keep `width: 'full'` so label/hint span the column; compact triggers use
  intrinsic `w-auto`.
- Row fields: use `width: 'auto'` or fractions when sharing a row.
- Overflow: truncate on the value slot overlay, not the whole trigger.
- Grouped **start** selects add `pe-1` on the caret slot (inset before the divider). **End**
  segments omit that inset.

### Grouped segment anatomy

Positional SSOT lives in [`grouped-segment.variants.ts`](../../src/components/ui/grouped-segment.variants.ts):

| Primitive             | Variants                                                             | Role                                                                                  |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GroupedSegmentShell` | `position: start \| middle \| end`, `surface: default \| faint`      | Geometry only (height, corners) + explicit wash — **position does not imply surface** |
| `GroupedValueSlot`    | `position`; `trailing: content \| slot`; `inset: default \| compact` | md start: `ps-3` / compact `ps-2`; end+content: `ps-2 pe-2.5`; end+slot: `ps-2 pe-1`  |
| `GroupedDivider`      | `strength: primary \| subtle`                                        | Control boundary strength — independent of surface role                               |

Compose-time chromatic roles (`resolveGroupedSegmentSurface`): `value → default`, `unit | glue → faint`.
Static prefix glyphs (`×`) use `inset: 'compact'` at start; selectable operators may use a **subtle** divider before the amount field.

Grouped **NumberInput** remains the exception — editable cells keep their own padding via
`fieldGroupedControlSizeClasses`.

**InputSelect:** numeric value side = NumberInput steppers (number formula); unit side =
grouped select — use `sizingLabel` or prose sizing, not fake `digits`.

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

`Field.Error` and `hintPosition="below-control"` stay **outside** `data-field-align` and, when
field chrome is active, render **inside** `FieldChromeShell` as a sibling of the fieldset (legend
remains a direct fieldset child). Row `items-end` still targets label + control band, not messages.

**Toggle bands:** standalone hint-bearing `CheckboxField` / inline `SwitchField` keep
first-line control columns (`h-4` / `h-5`) inside a `content-sized` band. In anatomy rows
(schema `kind: 'row'` and compact array inline rows), inline toggles normalize to a
`single-line` control band; hints and errors render in the message region. Filter booleans
(no hint stack) use a full single-line band with checkbox + label inside.

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

## Array inline row spacing (chrome shells)

Compact array inline rows (`ArrayItemAnatomyGrid`) use **two-tier** horizontal spacing —
not the open-page `FieldRow` gap scale:

| Token                 | Tailwind  | px   | Role                                                                |
| --------------------- | --------- | ---- | ------------------------------------------------------------------- |
| Chrome adjacency      | `gap-x-2` | 8px  | Grip/actions ↔ fields cluster (only when that chrome column exists) |
| `fieldGap: 'dense'`   | `gap-x-3` | 12px | **Default** inter-field gap inside the fields cluster               |
| `fieldGap: 'default'` | `gap-x-4` | 16px | Roomier cluster gap — opt in via row `spacing: 'compact'`           |

Open-page `AnatomyFieldRow` / `resolveRowFieldGap` (`gap-6` / `gap-4`) is unchanged.

### Grid track semantics (array anatomy)

| Width               | Track                              | Rule                                                          |
| ------------------- | ---------------------------------- | ------------------------------------------------------------- |
| Fixed (`sm`/`md`/…) | existing fixed tracks              | unchanged                                                     |
| `full` / fraction   | `minmax(0, Nfr)`                   | Responsive shrink — long text may compress with the container |
| `auto`              | `minmax(min-content, max-content)` | Intrinsic floor — grid does not encode digit knowledge        |
| Digit controls      | control-owned min via `digits`     | `resolveDigitInlineSizeClasses`                               |

Do **not** remap global `full` tracks to `minmax(min-content, 1fr)`.

### JoinedPair divider stability

Intrinsic grouped shells (`JoinedPair`, `InputSelectField`, …) use a hardened 1px divider
track (`grid-cols-[auto_minmax(1px,1px)_auto]`; divider `min-w-px`) and `min-w-max` so the
outer border stays wrapped around the full composite when a parent track constricts. Anatomy
row fields with `width: 'auto'` use `min-w-min` so grid columns honor child minimums. Below
the composite minimum usable width, the **row** collapses or reflows — controls are not
crushed below their declared minimum just to preserve multi-column layout. `max-w-full` on
the intrinsic shell is not the responsiveness mechanism for digit+label pairs.
