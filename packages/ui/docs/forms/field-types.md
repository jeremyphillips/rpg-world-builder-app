# Field types

Reference for specialized `<Form>` field configs beyond basic text/number/select. Config
shapes: [`field-config.ts`](../../src/form/field-config.ts). Runnable examples: Storybook
`Forms/*` and `FieldRow/*`.

## Standard leaf types (brief)

| `type`      | Value     | Notes                                                                      |
| ----------- | --------- | -------------------------------------------------------------------------- |
| `text`      | `string`  | Optional `inputType`, `autoComplete`                                       |
| `number`    | `number`  | `min`/`max` for Zod only; `digits`, `inputWidth`                           |
| `textarea`  | `string`  | `rows`, optional `optionalDisclosure`                                      |
| `select`    | `string`  | `options`, optional `optionalDisclosure`                                   |
| `select`    | `string`  | Flat or grouped options; `optionAvailability`; `presentation.readOnlyWhen` |
| `radio`     | `string`  | `orientation`, `labelHidden`                                               |
| `radioCard` | `string`  | Card-style options with `meta` / `badge`                                   |
| `checkbox`  | `boolean` |                                                                            |
| `switch`    | `boolean` | `labelPosition`: `inline`, `above`, `settings`                             |
| `select`    | `string`  | `labelPosition`: `inline`, `above`, `settings`                             |
| `file`      | `File[]`  | `accept`, `multiple`, `maxFiles`, `maxSize`                                |

`select` and `combobox` fields default to `Select {label}…` when `placeholder` is omitted.

### Select read-only presentation

When filtered options collapse to a single choice, swap the trigger for `FieldReadOnlyValue`
instead of a one-option dropdown. Value stays registered in RHF and still validates.

```ts
{
  type: 'select',
  name: 'amount',
  label: 'Amount',
  options: amountOptions,
  presentation: {
    readOnlyWhen: ({ options }) => options.length === 1,
  },
}
```

Works with `filterSelectOptions` on parent `array` configs — `readOnlyWhen` receives the
resolved flat option list after array filtering and `optionAvailability`.

## Derived metadata (`derivedMeta`)

Information resolved from the current selected value — distinct from **hint** (author
guidance) and **validation** (errors). Rendered below the control via `FieldLayout`.

**Invariant:** derived metadata is informational only. It must never participate in form
values, dirty state, validation, or serialization.

```ts
{
  type: 'combobox',
  name: 'classification.archetype',
  label: 'Archetype',
  options: archetypeOptions,
  derivedMeta: {
    reserveSpace: true,
    dependsOn: ['classification.archetype'],
    metaWhen: (values) => {
      const archetype = values['classification.archetype']
      if (typeof archetype !== 'string') return undefined
      return {
        rows: [{ label: 'Typical uses', value: formatArchetypeFunctions(archetype) }],
      }
    },
  },
}
```

- **`rows`** — label/value pairs; v1 uses the same single-line row chrome for every row.
- **`reserveSpace: true`** — reserves **one metadata line** so empty → populated does not
  shift layout. Does not reserve multi-line or multi-row height.
- **`optionsResolve`** — dynamic select options from watched values; returned options replace
  a static `options` list (use to exclude values that would be semantic no-ops).
- **Row alignment** — when any sibling in a `kind: 'row'` uses `reserveSpace`, the row
  defaults to `align: 'start'` (`items-start`) so sibling controls stay top-aligned while
  metadata extends below one field. Override with `RowConfig.align` when needed.
- **Accessibility** — when no error is present, `aria-describedby` may reference both hint
  and derived-metadata ids. Errors still take exclusive precedence.

## Optional disclosure (`optionalDisclosure`)

Collapses empty optional fields behind a compact **+ Add …** control. When expanded
(or when populated and `expandWhenPopulated` is true), the field label and control render
with a **Remove** action that clears the value and collapses back to the add control.

**Implemented for:** `textarea`, `select`. `OPTIONAL_DISCLOSURE_FIELD_KINDS` also lists
`text` and `richtext` for future enablement; dev guards log when
`optionalDisclosure` is used on unimplemented kinds.

```ts
{
  type: 'textarea',
  name: 'note',
  label: 'Additional behavior',
  placeholder: 'Describe behavior not modeled above...',
  optionalDisclosure: {
    addLabel: 'Add additional behavior',
    removeLabel: 'Remove',
    expandWhenPopulated: true,
  },
}
```

- **Incompatible with `required: true`** — optional disclosure is for schema-optional
  fields only; dev builds log when both are set.
- **Collapsed fields unmount** — empty values take no vertical space; populated values stay
  expanded by default.
- Primitive: `OptionalFieldDisclosure` in `@rpg/ui` for bespoke composition outside
  `<Form>`.

## Rich text (`richtext`)

- Value: **sanitized HTML string** (Tiptap).
- Default marks: bold, italic, lists, hard breaks.
- **Opt-in:** `linkable` (internal/external link picker), `codeBlocks` (inline + fenced code).
- Internal links: pass `internalLinkOptions`, optional `contentTypeOptions` from the app.
- Storage: `href` + `data-content-type`, `data-content-id`, `data-content-title`, optional
  `data-link-kind` (`detail` | `overview` | `external`).
- **Render rule:** always `RichTextContent` or `sanitizeHtml` — never raw editor HTML.

```tsx
import { RichTextContent } from '@rpg/ui'
;<RichTextContent html={trait.description} size="md" tone="muted" />
```

Prefer `richtext` for WYSIWYG + catalog links. Prefer `markdown` when storing plain markdown.

## Markdown (`markdown`)

- Plain markdown string, no HTML at save. Write tab + GFM preview.
- Config: `rows`, `placeholder`.

## JSON (`json`)

- Monospace string; `JSON.parse` on blur. Optional `example` → "Insert example" button.

## Chips (`chips`)

Pill toggles from a fixed option set.

```ts
{ type: 'chips', name: 'playStyle', label: 'Play Style', multiple: true, options: [...] }
{ type: 'chips', name: 'difficulty', label: 'Difficulty', multiple: false, options: [...] }
```

- `multiple: true` (default) → `string[]`, `role="checkbox"`.
- `multiple: false` → `string`, `role="radio"`.
- `chipSize` defaults to field `size`.

## Inline sentence (`inlineSentence`)

Composable inline prose + bound controls. Each bound segment declares its own RHF path via
`name`. Use `digits` on number/select segments for short fixed-width values; use segment
`width` (intrinsic tokens) for prose-length select labels. Field-level `width` controls
column layout in the form stack.

```ts
// Select-only: "Granted at [When feature is gained ▾]" / "Granted at [at level 4 ▾]"
{
  type: 'inlineSentence',
  name: 'unlockLevel',
  label: 'Granted at',
  hideLabel: true,
  segments: [
    { kind: 'text', value: 'Granted at', tone: 'label' },
    {
      kind: 'select',
      name: 'unlockLevel',
      options: unlockLevelOptions,
      width: 'lg',
      defaultValue: GRANT_DEFAULT_UNLOCK_LEVEL,
    },
  ],
}

// Number + trailing select
{
  type: 'inlineSentence',
  name: 'choose',
  label: 'Equipment choice',
  hideLabel: true,
  segments: [
    { kind: 'text', value: 'Character chooses', tone: 'label' },
    { kind: 'number', name: 'choose', min: 1, digits: 1, defaultValue: 1 },
    { kind: 'text', value: 'item(s) from', tone: 'label' },
    {
      kind: 'select',
      name: 'poolSource',
      options: poolSourceOptions,
      width: 'xl',
      defaultValue: 'filtered',
      ariaLabel: 'Pool source',
    },
  ],
}

// Inline count + chips below (class skill proficiencies)
{
  type: 'inlineSentence',
  name: 'proficiencies.skills.from',
  label: 'Skill proficiencies',
  segments: [
    { kind: 'text', value: 'Character chooses', tone: 'label' },
    { kind: 'number', name: 'proficiencies.skills.choose', min: 0, max: 18 },
    { kind: 'text', value: 'Skill Proficiencies from:', tone: 'label' },
  ],
  below: {
    kind: 'chips',
    name: 'proficiencies.skills.from',
    options: skillOptions,
  },
}

// Number + fixed unit label (walk speed, weapon range, …)
feetInputUnitField('speed.walk', 'Walk speed')
```

Segment kinds:

| Kind     | RHF value | Notes                                                  |
| -------- | --------- | ------------------------------------------------------ |
| `text`   | —         | Prose fragment; `tone`: `label` / `prose`              |
| `number` | `number`  | `min`, `max`, `digits`, `defaultValue`                 |
| `select` | `string`  | Flat or grouped `options`; `digits` or segment `width` |

Optional `below.kind: 'chips'` renders a chip row under the sentence (same fieldset).

### Deprecated inline composites

These still render (they delegate to `inlineSentence`) but prefer migrating configs:

| Legacy type         | Replacement                                                 |
| ------------------- | ----------------------------------------------------------- |
| `chooseFromChips`   | `inlineSentence` + `below: { kind: 'chips', … }`            |
| `inlineChooseCount` | `inlineSentence` with `number` / `select` segments          |
| `inputUnit`         | `inlineSentence` with `number` + trailing `text` (`ft.`, …) |

## Input select (`inputSelect`)

Nested `{ valueKey, unitKey }` for multi-unit enums. Single unit: `fixedUnit` + `unitValue`.

```ts
{
  type: 'inputSelect',
  name: 'weight',
  label: 'Weight',
  inputType: 'number',
  valueKey: 'value',
  unitKey: 'unit',
  fixedUnit: 'lb.',
  unitValue: 'lb',
  min: 0,
  formatGrouped: true,
}
```

`valueDigitsDependsOn` + `valueDigitsLookup` when width tracks another field.

## Combobox (`combobox`)

Searchable dropdown for large lists (catalog refs).

```ts
{ type: 'combobox', name: 'proficiencyWeapons', label: 'Weapon proficiencies',
  multiple: true, options: weapons, placeholder: 'Choose weapons…' }
```

- Filter matches `label`, `description`, `value`.
- Multi: removable badges; `renderSelectedItem` for custom previews.
- Stale selected values stay visible when missing from `options`.

## Level range (`levelRange`)

Inline min/max level selects joined by a connector (`1 through 20`). Uses sibling paths
`minName` / `maxName` (defaults `name` + `maxLevel`). Kept separate from `inlineSentence`
because array rows cascade adjacent tier boundaries.

## Dice formula (`diceFormula`)

XdY + optional tail operand (flat modifier or multiplier). Modes: `none` | `optional` | `required`.
Storybook: `Forms/DiceFormulaField`, `Recipes/DiceNotation`.

| Prop                  | Default      | Notes                                                                              |
| --------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `modifierOperators`   | `['+', '-']` | Single entry renders a static glyph (no operator select)                           |
| `modifierAmountLabel` | `"Modifier"` | sr-only label for the tail amount (e.g. `"Multiplier"`)                            |
| `currencyUnit`        | —            | Optional `{ name?, options, defaultValue }` — sibling select after the tail amount |

Examples:

```ts
{ type: 'diceFormula', modifierMode: 'optional', modifierOperators: ['+', '-'] }
{ type: 'diceFormula', modifierMode: 'required', modifierOperators: ['×'], modifierMin: 1, modifierAmountLabel: 'Multiplier' }
```

## Editable grid (`editableGrid`)

Fixed-row table; value `Record<columnKey, (number | null)[]>`.

```ts
{
  type: 'editableGrid',
  name: 'spellcasting.progressionTable',
  label: 'Spell progression',
  rowCount: 20,
  columns: [
    { key: 'cantrips', label: 'Cantrips', control: 'select', min: 1, max: 6 },
    {
      key: 'spellsAvailable',
      label: (values) => values['spellcasting.preparation'] === 'known' ? 'Spells known' : 'Spells prepared',
      control: 'number',
      labelDependsOn: ['spellcasting.preparation'],
      visibility: { dependsOn: ['spellcasting.preparation'], visibleWhen: (v) => ... },
    },
  ],
  templates: { cantrips: [{ name: 'Full caster', values: [4, 4] }] },
}
```

- Column `visibility` hides UI but **retains** values (unlike leaf field visibility).
- Optional per-column `templates` → Load template menu.
