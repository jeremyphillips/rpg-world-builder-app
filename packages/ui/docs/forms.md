# Forms in `@rpg/ui`

The form system is two layers, and which one you reach for depends on the form:

1. **Field primitives** (`@rpg/ui`) — the compound `Field.*` plus prop-based
   wrappers (`TextField`, `SelectField`, …) and layout primitives (`FieldGroup`,
   `FieldRow`). These own all visual + accessibility behavior and know **nothing**
   about any form library. Import them from the package root.
2. **The schema-driven renderer** (`@rpg/ui/form`) — a single `<Form>` component
   that is the **only** `react-hook-form`-aware surface. You hand it a Zod schema
   and a `fields` config array; it wires up `Controller`/validation/conditionals
   for you. Import it from the `@rpg/ui/form` subpath.

```text
@rpg/ui            → Field.* , TextField … , FieldGroup , FieldRow , Tabs , ChipsField        (RHF-agnostic)
@rpg/ui/form       → <Form> , <TabbedForm> , <WizardStepForm> , <FormSaveFooter> , FieldConfig (RHF-aware)
```

## When to use which layer

| Use…                                | When…                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Form>` (`@rpg/ui/form`)           | A standard, config-shaped form: a list of labelled fields, optional groups/rows, conditional visibility, Zod validation. This is the default — prefer it. |
| `<TabbedForm>` (`@rpg/ui/form`)     | A settings-style form where fields are grouped into tabs and a single global Save button validates all tabs together. All tab panels stay mounted.        |
| `<WizardStepForm>` (`@rpg/ui/form`) | A schema-driven step inside a `<Wizard>`. Wires `mode="onChange"`, `completeStep`, a `WizardFooter`, and Back-restore from accumulated values.            |
| Field wrappers + your own `useForm` | The form is mostly standard but needs a hand-placed custom control, bespoke submit logic, or a layout the config can't express.                           |
| Compound `Field.*`                  | A truly one-off layout (a control embedded in prose, a non-standard arrangement) where you want the a11y wiring but not the prop/config shape.            |

Rule of thumb: start with `<Form>`. Use `<TabbedForm>` when the form has a
naturally tabbed structure (e.g. settings pages). Drop a layer only when you hit
something it can't express — and consider whether the missing capability belongs
in the renderer instead.

### `<TabbedForm>` validation behavior

All tab panels stay mounted (`forceMount` on each `TabsContent`) so every field
registers with react-hook-form and the global Save button validates the **merged**
schema across tabs in one pass.

**Known gap (first pass):** field-level errors on an **inactive** tab are not
surfaced on the tab trigger. A failed submit can look like a no-op until the
author switches to the tab that holds the invalid field.

**Workaround:** if Save does nothing and no error is visible, check other tabs.

**Future improvement (out of scope today):** tab error badges and/or auto-switch
to the first tab with a validation error on failed submit.

Optional non-field UI (intro copy, links, placeholders) belongs on
`TabbedFormTab.header` — rendered above that tab's fields, outside the Zod
schema. Omit `fields` for a panel that is entirely non-input content.

### `<TabbedForm>` sticky chrome

By default (`stickyChrome`, default `true`), `<TabbedForm>` keeps two regions
fixed while the page scrolls:

- **Tab list** — `sticky top-0` with a solid background so section tabs stay visible.
- **Actions bar** — `FormActionsBar` wraps the `footer` (and any `formError`) in a
  `sticky bottom-0` toolbar so Save/Cancel stay reachable on long panels.

Tab panels get extra bottom padding so the last field is not hidden under the
actions bar. Pass `stickyChrome={false}` to restore the flat layout.

Single-page `<Form>` layouts can opt into the same sticky footer with
`stickyFooter`.

## Field anatomy & the a11y contract

Every field — whether composed by hand or emitted by `<Form>` — resolves to the
same structure, owned by the compound `Field` ([field.client.tsx](../src/components/ui/field.client.tsx)):

```tsx
import { Field } from '@rpg/ui'
;<Field.Root id="email" error={error} hint="We never share it." required>
  <Field.Label>Email</Field.Label>
  <Field.Control>
    <Input type="email" />
  </Field.Control>
  <Field.Hint />
  <Field.Error />
</Field.Root>
```

What that buys you, centralized in `Field.Root` context so no control re-derives it:

- **Labelling** — `Field.Label` sets `htmlFor` to the control id; `Field.Control`
  injects that same `id` into its single child.
- **`aria-describedby`** — points at the hint id when there's a hint, or the error
  id when there's an error (error wins; the hint hides while an error shows).
- **`aria-invalid`** — set on the control whenever `error` is present, which also
  triggers the destructive border/ring via the `aria-invalid:` variant (see
  [Sizing](#sizing-conventions)). Error styling is attribute-driven, never a prop.
- **Error region** — `Field.Error` renders with `role="alert"` + `aria-live="polite"`
  so screen readers announce validation messages.
- **Required marker** — `required` renders a `*` marked `aria-hidden` (the real
  constraint lives in the Zod schema, not the DOM).

The **label `[i]` info pattern**: pass `info` to any wrapper (or drop an
`InfoTooltip` inside `Field.Label`) to get a focusable info icon with a tooltip.
The trigger is a real `<button>` with an `aria-label`, opening on hover **and**
keyboard focus.

```tsx
<TextField id="slug" label="Slug" info="Lowercase, used in the URL." />
```

**Hint vs. error.** A hint is persistent guidance; an error is a transient
validation message. They share the describedby slot — the error replaces the hint
while present — so never encode required-ness or validation rules as a hint.

## Field spacing

Vertical rhythm is centralized in [`field.variants.ts`](../src/components/ui/field.variants.ts):

| Token                            | Class                 | Use                                                                             |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `fieldAnatomyStackClasses`       | `space-y-3`           | Label, control, and hint/error inside one field (`Field.Root`, `ChipsField`, …) |
| `fieldGroupStackClasses`         | `space-y-6`           | Sibling fields inside a group, form column, tab panel, or array item            |
| `fieldGroupFlexStackClasses`     | `flex flex-col gap-6` | Same 24px rhythm when stacking fieldsets or other collapse-prone siblings       |
| `formSectionStackClasses`        | `flex flex-col gap-7` | Top-level accordion sections on `<Form>`                                        |
| `fieldRowGapClasses`             | `gap-6`               | Horizontal and wrap gap between fields in a `FieldRow`                          |
| `fieldRowLayoutVariants`         | —                     | Display recipe for `FieldRow` / `RowConfig.layout` (`flex`, `responsive-2`, …)  |
| `fieldInlineSentenceClasses`     | `gap-x-2 gap-y-2`     | Inline “Choose [N] from:” sentence rows (`ChooseFromChipsField`, …)             |
| `fieldInlineControlRowClasses`   | `gap-3`               | Inline label + control rows (e.g. `DiceFormulaField`)                           |
| `fieldChipWrapGapClasses`        | `gap-2`               | Gap between chip pills inside `ChipsField`                                      |
| `fieldGroupDescriptionClasses`   | `mb-3`                | Space below a group or accordion section description                            |
| `fieldGroupLegendSpacingClasses` | `mb-4`                | Space below a group legend                                                      |
| `fieldArrayItemClasses`          | `p-4 border`          | Chrome around one repeatable array item                                         |
| `fieldArrayItemActionsClasses`   | `mt-3`                | Space above array item move/remove controls                                     |

Do not sprinkle ad-hoc `space-y-*` or margin utilities on field wrappers in apps — adjust the shared
tokens in `@rpg/ui` so chips, text inputs, and combobox fields stay aligned.

Dense chip fields (many options) should stack as full-width siblings, not share a `FieldRow` — rows
are for short combinations (e.g. a small chip set beside a select).

**Requirement:** every field must pass axe. All wrappers and the compound `Field`
already do; if you compose `Field.*` by hand, keep a `Field.Label` wired to the
control and don't suppress axe rules. See [AGENTS.md](../../../AGENTS.md) for the
WCAG 2.2 AA bar.

## Sizing conventions

Two independent token scales. Control height, padding, and type scale come from
[field-sizing.variants.ts](../src/components/ui/field-sizing.variants.ts) — the
single source of truth for `sm | md | lg` sizing. Primitives and composites
(`field-control.variants.ts`, `number-input.variants.ts`,
`input-select-field.variants.ts`, digit metrics, and so on) compose those maps
instead of repeating the tuples.

| Map                                | Use                                                        |
| ---------------------------------- | ---------------------------------------------------------- |
| `fieldControlSizeClasses`          | Single-line controls (`Input`, `Select`, …)                |
| `fieldGroupedControlSizeClasses`   | One segment inside a grouped shell (`InputSelectField`, …) |
| `fieldDigitSizeClasses`            | Left + right padding for digit-width controls              |
| `fieldDigitTrailingPaddingClasses` | Right reserve for stepper/caret columns on digit controls  |
| `fieldDigitTrailingColumnClasses`  | Width of the trailing stepper/caret column                 |
| `fieldDigitTrailingIconClasses`    | Icon sizing paired with the trailing column                |

### `size` — control height + type scale

| `size` | Use                                    |
| ------ | -------------------------------------- |
| `sm`   | Dense toolbars, compact tables         |
| `md`   | Default — most forms                   |
| `lg`   | Prominent/marketing single-field forms |

### `width` — how a field sizes within its container

One union, two intents:

- **Intrinsic** (`xs`, `sm`, `md`, `lg`, `xl`, `auto`): a capped `max-width` +
  `flex-none`, so the field keeps its own width and never grows. `xs` (~64px)
  suits 1–2 character inputs like a die count; `sm` suits compact inputs like
  level pickers.
- **Proportional** (`full`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`): these flex within
  a `FieldRow`. `full` (the default) fills remaining space; fractions distribute
  space by **grow weight** (a base-12 scale), so mixed denominators compose and
  stay gap-safe. Fractions only have meaning inside a `FieldRow`; elsewhere they
  behave like `full`.

A plain `FieldRow` with two inputs and no `width` splits 50/50, and wraps to full
width on narrow viewports.

### Row layout — flex vs responsive grid

`FieldRow` and schema `RowConfig` share a `layout` prop backed by
`fieldRowLayoutVariants` in [field.variants.ts](../src/components/ui/field.variants.ts).
Each layout applies **either** flex **or** grid display classes — never both.

| `layout`         | Use                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------- |
| `flex` (default) | Side-by-side fields that grow/wrap by `width` — the XdY recipe, class + level rows, … |
| `responsive-2`   | Two equal columns from `md` up (`grid-cols-1 md:grid-cols-2`)                         |
| `responsive-3`   | Three columns from `md` up (`grid-cols-2 md:grid-cols-3`)                             |

Prefer `width` fractions inside a flex row when fields should share remaining space
by grow weight (e.g. a narrow count beside a wide select). Reach for
`responsive-2` / `responsive-3` when every child should occupy an equal grid cell
regardless of intrinsic width — wealth coin rows, scalar unit rows, vehicle
crew/passenger rows, and similar dashboard recipes.

In `<Form>` config, set `layout` on a row item; reserve `className` for genuine
one-offs:

```ts
{
  kind: 'row',
  layout: 'responsive-3',
  fields: [
    { type: 'number', name: 'crew', label: 'Crew', width: 'full' },
    { type: 'number', name: 'passengers', label: 'Passengers', width: 'full' },
    { type: 'number', name: 'cargo', label: 'Cargo (tons)', width: 'full' },
  ],
}
```

#### Worked example: the XdY recipe

A narrow count next to a wide die-face select (see the
`Recipes/DiceNotation` Storybook story,
[dice-notation.stories.tsx](../src/stories/dice-notation.stories.tsx)):

```tsx
import { FieldRow, NumberField, SelectField } from '@rpg/ui'

<FieldRow>
  <NumberField id="dice-count" label="Count" width="xs" min={1} max={99} {...} />
  <SelectField id="dice-face" label="Die face" width="full" options={dieFaces} {...} />
</FieldRow>
```

The `xs` count keeps its intrinsic width; the `full` die-face absorbs the rest.

**When to reach for `className`:** the token scale covers the intended cases.
`className` is the escape hatch for genuine one-offs only — don't reintroduce raw
color/font-size literals (use design-token classes), and prefer adding a token if
a width keeps recurring.

## Validation — contracts-first

Validation shapes come from Zod schemas in `@rpg/contracts`, the single source of
truth. The same schema drives the client (via `zodResolver`) and the server.
**Never redefine a domain shape inside an app** — import it from `@rpg/contracts`
and pass it to `<Form schema={...}>`.

```tsx
import { CreateCampaignInput } from '@rpg/contracts'
;<Form schema={CreateCampaignInput} fields={fields} onSubmit={onSubmit} />
```

The renderer mounts `<form noValidate>` and lets RHF + Zod own validation, so
messages stay consistent with the server. (Storybook templates use an inline
schema only because they have no real contract to import.)

For option lists (`select`/`radio`/`chips`) whose values are contract enums, use
`toOptions` with a label map keyed by the contract type, so a new enum member
without a label is a type error:

```ts
import { toOptions } from '@rpg/ui/form'
import { PLAY_STYLES, type PlayStyle } from '@rpg/contracts'

const PLAY_STYLE_LABELS: Record<PlayStyle, string> = { dungeon_crawl: 'Dungeon Crawl', ... }

{ type: 'chips', name: 'playStyle', label: 'Play Style',
  options: toOptions(PLAY_STYLES, PLAY_STYLE_LABELS) }
```

## Submit & server errors

`onSubmit` receives the validated values **and the form instance**:

- **Form-level errors** (network failure, generic API error): surface them
  through the `formError` prop — rendered as a `role="alert"` paragraph above the
  fields.
- **Field-level server errors** (e.g. "name already taken"): call
  `form.setError('name', { message: '…' })` from `onSubmit`'s second argument so
  the message lands on the field through the standard error/aria path.

```tsx
<Form
  schema={schema}
  fields={fields}
  formError={formError}
  onSubmit={async (values, form) => {
    try {
      await save(values)
    } catch (err) {
      if (isFieldError(err)) form.setError(err.field, { message: err.message })
      else throw err // let the caller's wrapper map it to formError
    }
  }}
/>
```

## `FormSaveFooter`

The standard actions row for save-style forms (settings, profile): an optional
success confirmation (`role="status"`) plus a pending-aware `SubmitButton`. Use
it in the `footer` render prop instead of hand-wiring the same row per form.
On long forms, `<TabbedForm>` (default) and `<Form stickyFooter>` wrap the footer
in `<FormActionsBar>` so actions stay visible while content scrolls:

```tsx
footer={(form) => (
  <FormSaveFooter
    pending={mutation.isPending || form.formState.isSubmitting}
    isSuccess={mutation.isSuccess}
    submitLabel="Save changes"
    successMessage="Changes saved."
  />
)}
```

## Wizard steps

Schema-driven wizard steps use `<WizardStepForm>` rather than composing `<Form>`
by hand. It owns the step skeleton (`mode="onChange"` so validity drives the
Next button, submit via `completeStep`, a `WizardFooter`) and seeds its
`defaultValues` from the wizard's accumulated values, so navigating Back
restores what was entered.

```tsx
<Wizard steps={STEPS} onComplete={onComplete}>
  <WizardStepForm schema={identitySchema} fields={identityFields} />
  <WizardStepForm schema={rulesSchema} fields={rulesFields} />
  <ReviewStep />
</Wizard>
```

Keep step values **flat** — map them to nested API payload shapes in
`onComplete`, not in the steps — otherwise Back-restore can't seed them. A
read-only review step stays hand-rolled: a plain `<form>` whose submit calls
`useWizard().complete()`. See the [Wizard pattern](../README.md#wizard-pattern)
section of the package README for the full picture.

## The RHF boundary

The hard rule: **primitives never import `react-hook-form`.** They take a plain
`error?: string` and standard `value`/`onChange`. That keeps them dependency-free,
reusable in the public app, and trivial to axe-test.

`<Form>` ([form.client.tsx](../src/form/form.client.tsx)) is the one place that
knows RHF. It:

- owns the `<form>` element + `FormProvider`,
- synthesizes `defaultValues` per field type (so no uncontrolled→controlled warnings),
- renders each field through an isolated `FieldRenderer` (`useController`), so
  editing one field doesn't re-render the whole form,
- maps `type → wrapper` through an adapter registry
  ([field-renderer.client.tsx](../src/form/field-renderer.client.tsx)) — adding a
  control = adding one entry there.

### Wiring a custom control

If you need a control `<Form>` doesn't support, you have two options:

1. **Add it to the registry** (preferred when it'll be reused): add a `FieldType`,
   a `*FieldConfig` to the discriminated union in
   [field-config.ts](../src/form/field-config.ts), and an adapter entry. The
   adapter bridges RHF's `field` (`{ value, onChange, onBlur, ref }`) to the
   wrapper's props.
2. **Drop out to your own `useForm`** for a one-off: render the field wrapper
   inside a `Controller`, passing `error={fieldState.error?.message}` and wiring
   `value`/`onChange` (and `onValueChange`/`onCheckedChange` for Radix-based
   controls). The wrappers thread `onBlur` to the underlying control for touched
   state.

> Note: ref-forwarding (and thus auto-focus-first-error) reaches `text`/`number`
> controls; the Radix-based controls (`select`/`radio`/`checkbox`/`switch`) thread
> `onBlur` but not a ref — a known limitation.

## Rich text & JSON

### Rich text (`richtext` / `RichTextField`)

- Backed by Tiptap; value is a **sanitized HTML string**, so it fits the universal
  `value: string` field contract and drops straight into RHF.
- Bold, italic, bullet/ordered lists, and hard breaks ship by default. Links are
  **opt-in** via the `linkable` prop (the `Link` extension + toolbar button are
  gated behind it).
- When `linkable` is enabled, the toolbar opens a **link picker popover** instead
  of a browser prompt:
  - **Internal tab** (default): searchable spell/feat targets plus overview pages.
    Requires display text; new-window is off by default. Pass
    `internalLinkOptions` and optional `contentTypeOptions` from the app layer
    (dashboard builds these from catalog routes).
  - **External tab**: URL + display text; new-window defaults to on.
  - Hovering or focusing an existing link exposes an **Edit link** bubble menu with
    **Remove link** when the caret is inside the link mark. The toolbar link button
    also opens the picker for the active link.
- **Storage model:** links persist a canonical relative or absolute `href` plus
  metadata attributes for picker round-trip:
  - `data-content-type`, `data-content-id`, `data-content-title`, optional
    `data-link-kind` (`detail` | `overview` | `external`)
  - External links opened in a new window also store `target="_blank"` and
    `rel="noopener noreferrer"`.
- **Rendering stored content is a one-liner with a hard rule:** always pass it
  through `sanitizeHtml` ([sanitize-html.ts](../src/lib/sanitize-html.ts)). The
  sanitizer allowlists the link metadata attrs above while stripping other
  `data-*` values. Never drop raw editor output into `dangerouslySetInnerHTML`.
  Prefer `RichTextContent`, which sanitizes automatically.

```tsx
import { RichTextContent, sanitizeHtml } from '@rpg/ui'

<RichTextContent html={trait.description} size="sm" tone="muted" />

// Only when you truly need raw HTML output:
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(stored) }} />
```

Form config (`FieldType: 'richtext'`) forwards `linkable`, `internalLinkOptions`,
and `contentTypeOptions` to `RichTextField` / `RichTextEditor` when internal
linking is required.

### JSON (`json` / `JsonField`)

- A monospace editor holding a string while you type, validated with `JSON.parse`
  on blur; invalid JSON surfaces through the standard `error`/aria path.
- Pass an `example` (object or string) and the field shows an **"Insert example"**
  button that pretty-prints it into the field — an authoring aid, not a default.

### Chips (`chips` / `ChipsField`)

A group of pill-shaped toggle buttons for selecting one or more string values
from a fixed set — suitable for tags, moods, play styles, etc.

```ts
// Multi-select (default): value is string[]
{ type: 'chips', name: 'playStyle', label: 'Play Style', multiple: true,
  options: [{ value: 'dungeon_crawl', label: 'Dungeon Crawl' }, ...] }

// Single-select: value is string (mutually exclusive, like a styled radio)
{ type: 'chips', name: 'difficulty', label: 'Difficulty', multiple: false,
  options: [{ value: 'casual', label: 'Casual' }, ...] }
```

- Renders as a `<fieldset>` / `<legend>` (a11y group labelling).
- `size` — field label type scale (`md` default, same as other fields).
- `chipSize` — pill padding/type scale (`sm` default).
- `multiple: true` (default) → each option is `role="checkbox"`; value is `string[]`.
- `multiple: false` → each option is `role="radio"`; value is a single `string`.

### Choose from chips (`chooseFromChips` / `ChooseFromChipsField`)

Inline “Choose [N] skills from:” sentence with chip options below — for class-style
skill proficiency authoring.

```ts
{
  type: 'chooseFromChips',
  name: 'proficiencies.skills.from',
  chooseName: 'proficiencies.skills.choose',
  label: 'Skill proficiencies',
  info: 'Shared with skill suggested classes.',
  options: skillOptions,
  chooseMin: 0,
  chooseMax: 18,
}
```

- `name` — chip selection path (`string[]`); `chooseName` — numeric count path.
- `prefix` / `suffix` default to `Choose` and `skills from:`.
- Sentence layout uses `fieldInlineSentenceClasses` from
  [field.variants.ts](../src/components/ui/field.variants.ts).

### Inline choose count (`inlineChooseCount` / `InlineChooseCountField`)

Inline “Choose [N] packages” (or similar) sentence — a compact count input between
prefix/suffix text, without chip options below. Same sentence-row token as
`chooseFromChips`.

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

- Binds a single numeric count path; pair with a separate field or array for the
  actual choices.
- `prefix` / `suffix` default to `Choose` and `from:`.
- Sentence layout uses `fieldInlineSentenceClasses`.

### Combobox (`combobox` / `ComboboxField`)

A searchable popover dropdown for picking one or many values from a large option
list — suitable for campaign-scoped catalog references (weapons, spells, tools)
where a plain `select` or `chips` field would not scale.

```ts
// Multi-select (default): value is string[]
{ type: 'combobox', name: 'proficiencyWeapons', label: 'Weapon proficiencies',
  multiple: true, options: ctx.options?.weapons ?? [], placeholder: 'Choose weapons…' }

// Single-select: value is string; picking closes the panel
{ type: 'combobox', name: 'primaryWeapon', label: 'Primary weapon', multiple: false,
  options: weaponOptions }
```

- Client-side filter matches `label`, optional `description`, and `value`.
- Multi mode renders selected values as removable chips below the trigger.
- Already-selected values stay visible even when they are missing from the current
  `options` list (stale slug handling).
- Default value: `[]` when `multiple` is true (default), `''` when `multiple: false`.

### Editable grid (`editableGrid` / `EditableGrid`)

A fixed-row, multi-column table for dense per-level authoring (e.g. cantrips known
and spells prepared at character levels 1–20). Values are a **composite object**
keyed by column (`Record<columnKey, (number | null)[]>`); `null` means blank/unset.

```ts
{
  type: 'editableGrid',
  name: 'spellcasting.progressionTable',
  label: 'Spell progression', // rendered as the grid legend
  rowCount: 20,
  columns: [
    { key: 'cantrips', label: 'Cantrips', control: 'select', min: 1, max: 6 },
    {
      key: 'spellsAvailable',
      label: (values) => (values['spellcasting.preparation'] === 'known' ? 'Spells known' : 'Spells prepared'),
      control: 'number',
      min: 0,
      labelDependsOn: ['spellcasting.preparation'],
      visibility: {
        dependsOn: ['spellcasting.preparation'],
        visibleWhen: (values) =>
          values['spellcasting.preparation'] === 'prepared' ||
          values['spellcasting.preparation'] === 'known',
      },
    },
  ],
  templates: {
    cantrips: [{ name: 'Full caster', values: [4, 4, /* … */] }],
  },
}
```

- Renders the RHF-agnostic `EditableGrid` primitive; the adapter watches column
  `dependsOn` paths via `useWatch` and filters/resolves columns before render.
- Per-column `visibility` hides a column in the UI but **retains** its values in
  the composite object (unlike field-level `visibility`, which unregisters the whole
  field when hidden).
- Optional `templates` per column key surface a **Load template** menu with
  confirm-replace.
- Default value: a null-filled grid for every configured column (`fieldDefaultValue`).
  Override with an explicit `defaultValue` when seeding from existing data.

## Collapsible sections

By default, top-level `kind: 'group'` and `kind: 'array'` sections render inside
accordions that **start open** (`collapsibleSections` defaults to `true` on
`<Form>` and `<TabbedForm>`). Pass `collapsibleSections={false}` for a flat
fieldset layout.

Per-section opt-out: set `collapsible: false` on a `GroupConfig` or
`ArrayConfig`. Section legends use the shared `fieldGroupLegendVariants` styling
(`font-display`, `text-lg`, `mb-4`).

Fields stay mounted while a section is collapsed, so react-hook-form values are
preserved (`shouldUnregister` only applies to conditional visibility, not
accordion state).

Open accordion panels use `overflow-visible` plus inner horizontal inset so
control focus rings (`ring-2` + `ring-offset-2`) are not clipped during expand.

## Array fields

Use `ArrayConfig` (`kind: 'array'`) in the `fields` array to create a
repeatable section backed by RHF's `useFieldArray`. Each item renders as an
inlined `<fieldset>` with the item's fields plus Add / Remove / Move (↑↓)
controls.

```ts
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'traits', // top-level RHF name
    legend: 'Traits', // rendered as the outer <legend>
    fields: [
      // item fields — names are relative to each item
      { type: 'text', name: 'name', label: 'Trait name', required: true },
      { type: 'textarea', name: 'description', label: 'Description' },
    ],
    addLabel: 'Add trait', // label on the Add button
    min: 0, // floor — Remove is disabled below this count
    max: 10, // ceiling — Add button disappears at this count
    itemTitle: (_v, i) => `Trait ${i + 1}`, // optional per-item heading
  },
]
```

### Zod schema

The Zod schema should wrap item fields in `z.array(z.object({...}))`:

```ts
const schema = z.object({
  traits: z.array(z.object({ name: z.string().min(1), description: z.string() })),
})
```

### `buildItemDefaultValues`

When `useFieldArray.append()` is called, the renderer uses
`buildItemDefaultValues(config.fields)` to seed a blank item. The function
is also exported so callers can compose their own defaults:

```ts
import { buildItemDefaultValues } from '@rpg/ui/form'
const blank = buildItemDefaultValues(traitFields) // { name: '', description: '' }
```

### Conditional fields inside array items

Item-level `visibility` predicates work the same way as top-level ones but
are **item-scoped**: `dependsOn` names are relative to the item, and the
renderer resolves them to the full dotted path (e.g. `traits.0.type`) before
calling `useWatch`. The `visibleWhen` predicate therefore uses simple relative
names:

```ts
{
  type: 'number',
  name: 'range',
  label: 'Range (ft)',
  visibility: {
    dependsOn: ['type'],                    // relative — means `traits.N.type`
    visibleWhen: (v) => v.type === 'sense', // v uses the relative key
  },
}
```

> **Caveat**: the resolver's `.omit` hidden-field strip works on top-level Zod
> object keys only. Hidden item fields are instead cleared by RHF's
> `shouldUnregister: true` — the value is removed from the RHF store when the
> control unmounts, so the submitted payload naturally omits it. Mark
> conditionally-visible item fields as `z.optional()` in the item schema.

Nested `ArrayConfig` items (e.g. `innateSpellEntries` inside a grant row) may
also declare `visibility` with the same item-scoped `dependsOn` contract. When
hidden, the whole nested array unmounts and its values are cleared via
`shouldUnregister`.

### Nesting

`ArrayConfig.fields` can itself contain a nested `ArrayConfig`, producing
arrays-of-arrays. Name scoping cascades correctly at each level
(`root.0.subarray.1.name`). Deeply-nested arrays (three or more levels) should
be avoided for UX reasons.

## Conditional fields

A field becomes conditional via a `visibility` object:

A field becomes conditional via a `visibility` object:

```ts
{
  type: 'text',
  name: 'familiarName',
  label: 'Familiar name',
  required: true,
  visibility: {
    dependsOn: ['hasFamiliar'],
    visibleWhen: (values) => values.hasFamiliar === true,
  },
}
```

- `dependsOn` lists exactly the field names the predicate reads, so the renderer
  subscribes to **only** those values (`useWatch`) — no whole-form re-render.
- While hidden, the control unmounts and its value clears (`shouldUnregister`).

**Hidden = not required.** `<Form>`'s resolver strips hidden-field keys before
validating and drops their errors, and the submitted payload omits them — so a
`required` field is only enforced while visible.

> Caveat: the strip works on plain object schemas (it uses Zod's `.omit`). A
> refined/transformed schema (e.g. `z.object({...}).refine(...)`) can't be omitted
> from, so its hidden fields **still validate**. If you need conditional fields,
> keep the schema a plain object, or gate the cross-field rule yourself.

## Recipes

The runnable versions live in Storybook; copy from there.

- **XdY dice notation** — `Recipes/DiceNotation` and `Forms/DiceFormulaField`
  ([dice-notation.stories.tsx](../src/stories/dice-notation.stories.tsx),
  [dice-formula-field.stories.tsx](../src/components/ui/dice-formula-field.stories.tsx)):
  the `DiceFormulaField` composite (`type: 'diceFormula'` in `<Form>`) with
  `none` / `optional` / `required` modifier modes.
- **Value + unit composite** — `Forms/InputSelectField`
  ([input-select-field.stories.tsx](../src/components/ui/input-select-field.stories.tsx)):
  `type: 'inputSelect'` binds a nested object via `valueKey` / `unitKey` (e.g.
  `{ amount, currency }` for cost). Set `valueDigits` for intrinsic number width,
  or `valueDigitsDependsOn` + `valueDigitsLookup` when width should track another
  field (e.g. equipment `kind` on the hub create route).
- **Multi-group schema form** — `Forms/Form`
  ([form.stories.tsx](../src/form/form.stories.tsx)): a `<Form>` combining a group,
  a row, a conditional field, and a rich-text field. The shape of a real form:

```tsx
import { Form } from '@rpg/ui/form'
import { CardFooter, SubmitButton } from '@rpg/ui'

const fields = [
  {
    kind: 'group',
    legend: 'Character',
    fields: [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        kind: 'row',
        fields: [
          { type: 'select', name: 'className', label: 'Class', options, required: true },
          { type: 'number', name: 'level', label: 'Level', min: 1, max: 20, defaultValue: 1 },
        ],
      },
    ],
  },
  { type: 'switch', name: 'hasFamiliar', label: 'Has a familiar' },
  {
    type: 'text', name: 'familiarName', label: 'Familiar name', required: true,
    visibility: { dependsOn: ['hasFamiliar'], visibleWhen: (v) => v.hasFamiliar === true },
  },
  { type: 'richtext', name: 'bio', label: 'Biography' },
]

<Form
  schema={schema}
  fields={fields}
  onSubmit={onSubmit}
  footer={<CardFooter className="justify-end px-0"><SubmitButton>Save</SubmitButton></CardFooter>}
/>
```

## `FormCard` + `<Form>`

`FormCard` is **pure card chrome**: a header (title + description) above a body
slot, with no `<form>` of its own. Render a `<Form>` as its child so there is
exactly one form element (the `<Form>`'s) and one RHF-aware surface.

```tsx
import { CardFooter, FormCard, SubmitButton, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'
;<FormCard title="Log in" description="Welcome back." className="w-full max-w-sm">
  <Form
    schema={loginInputSchema}
    fields={fields}
    onSubmit={onSubmit}
    formError={formError}
    contentClassName={formCardContentClass}
    footer={(form) => (
      <CardFooter className="flex-col items-stretch gap-3">
        <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </CardFooter>
    )}
  />
</FormCard>
```

Two details make this work:

- **Body inset.** `<Form>` renders its fields padding-free; pass
  `contentClassName={formCardContentClass}` (which equals `CardContent`'s
  `p-6 pt-0`) so they inset from the card edge. The `footer` keeps its own
  `CardFooter` padding.
- **Pending state.** Since `<Form>` owns `useForm`, the consumer can't read
  `isSubmitting` directly. Pass `footer` a **function** receiving the form and
  wire `pending={form.formState.isSubmitting}` — `handleSubmit` awaits an async
  `onSubmit`, so `isSubmitting` is true for the whole submit. (If your pending
  state comes from elsewhere — e.g. a TanStack `mutation.isPending` — use a plain
  `footer` node and read that value directly instead.)
