# Field types

Reference for specialized `<Form>` field configs beyond basic text/number/select. Config
shapes: [`field-config.ts`](../../src/form/field-config.ts). Runnable examples: Storybook
`Forms/*` and `FieldRow/*`.

## Standard leaf types (brief)

| `type`      | Value     | Notes                                            |
| ----------- | --------- | ------------------------------------------------ |
| `text`      | `string`  | Optional `inputType`, `autoComplete`             |
| `number`    | `number`  | `min`/`max` for Zod only; `digits`, `inputWidth` |
| `textarea`  | `string`  | `rows`                                           |
| `select`    | `string`  | Flat or grouped options; `optionAvailability`    |
| `radio`     | `string`  | `orientation`, `labelHidden`                     |
| `radioCard` | `string`  | Card-style options with `meta` / `badge`         |
| `checkbox`  | `boolean` |                                                  |
| `switch`    | `boolean` | `labelPosition`: `inline`, `above`, `settings`   |
| `file`      | `File[]`  | `accept`, `multiple`, `maxFiles`, `maxSize`      |

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

## Choose from chips (`chooseFromChips`)

Inline “Choose [N] skills from:” + chips. `name` = selection (`string[]`); `chooseName` = count.

```ts
{
  type: 'chooseFromChips',
  name: 'proficiencies.skills.from',
  chooseName: 'proficiencies.skills.choose',
  label: 'Skill proficiencies',
  options: skillOptions,
  chooseMin: 0,
  chooseMax: 18,
}
```

`prefix` / `suffix` default to `Choose` / `skills from:`.

## Inline choose count (`inlineChooseCount`)

Sentence with count input only — no chips below.

```ts
{
  type: 'inlineChooseCount',
  name: 'startingEquipment.packages.choose',
  label: 'Starting packages',
  prefix: 'Choose',
  suffix: 'packages',
  chooseMin: 0,
  chooseMax: 4,
}
```

For fixed-unit distances prefer `inputUnit`.

## Input unit (`inputUnit`)

Scalar number + fixed unit label; single number path.

```ts
{
  type: 'inputUnit',
  name: 'speed.walk',
  label: 'Walk speed',
  unit: 'ft.',
  min: 0,
  valueDigits: 2,
  defaultValue: 30,
}
```

Dashboard helper: `feetInputUnitField` in content-form-field-helpers.

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
