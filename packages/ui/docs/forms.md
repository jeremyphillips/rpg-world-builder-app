# Forms in `@rpg/ui`

The form system is two layers:

1. **Field primitives** (`@rpg/ui`) — compound `Field.*`, prop-based wrappers (`TextField`,
   `SelectField`, …), layout (`FieldGroup`, `FieldRow`). Visual + a11y only; **no**
   form-library coupling.
2. **Schema-driven renderer** (`@rpg/ui/form`) — `<Form>` is the **only**
   `react-hook-form`-aware surface. Pass a Zod schema + `fields` config; it wires
   `Controller`, validation, and conditionals.

```text
@rpg/ui      → Field.* , TextField … , FieldGroup , FieldRow , ChipsField     (RHF-agnostic)
@rpg/ui/form → <Form> , <TabbedForm> , <WizardStepForm> , FieldConfig         (RHF-aware)
```

Rule of thumb: start with `<Form>`. Drop a layer only when the config can't express what
you need — and consider whether the gap belongs in the renderer.

## When to use which layer

| Use…                                | When…                                                                |
| ----------------------------------- | -------------------------------------------------------------------- |
| `<Form>`                            | Standard config-shaped form — default choice.                        |
| `<TabbedForm>`                      | Settings-style tabs; one Save validates all panels together.         |
| `<WizardStepForm>`                  | Schema-driven step inside `<Wizard>` with Back-restore.              |
| Field wrappers + your own `useForm` | Hand-placed control, bespoke submit, or layout config can't express. |
| Compound `Field.*`                  | One-off layout needing a11y wiring without the config shape.         |

## TabbedForm

All tab panels stay mounted so every field registers and Save validates the **merged** schema.

After the first failed submit, invalid tabs show **count badges** on their triggers, the form
**auto-switches** to the first invalid tab and focuses its control, and a **footer summary**
(`role="status"`) lists affected tabs with **Review {tab}** actions. Badges and the summary
live-update as errors are fixed and disappear when validation passes. Inactive panels still
suppress inline error text until their tab is active.

Optional non-field UI: `TabbedFormTab.header`. Sticky chrome, sheets, and footers:
[patterns.md](./forms/patterns.md#tabbedform).

### `errorPaths` for header-only tabs

Tab ownership is inferred from each tab's `fields` tree. Header-only tabs that render
editors via `FormEmbeddedMasterDetailEditor` (or similar) with `fields: []` must
declare the RHF root paths they own via `errorPaths` — otherwise validation issues on
those paths are orphaned and never appear on tab badges or the footer summary.

`errorPaths` **supplements** inferred prefixes; it does not replace them. Use it only
when fields live outside the tab's `fields` array.

```ts
{
  id: 'heritage',
  label: 'Heritage',
  fields: [],
  errorPaths: ['heritage'],
  header: createElement(SpeciesHeritageTab, { formCtx: ctx }),
}
```

Content catalog examples: `buildSpeciesTabs` and `buildClassTabs` in the dashboard
species/class `*-form-fields.ts` modules.

### `resolverFields` for validation message copy

The Zod resolver builds its field error map from `tab.fields` only. Header/master-detail
editors that render via `FormItems` + `namePrefix` must also supply matching
`resolverFields` on the tab — same `FormItem` shapes with **full** RHF paths
(`heritage.name`, `traits`, `characterCreation.levelLimits.classLevelCaps`, …).
These configs are **not rendered**; they exist solely so tier-1 validation copy uses
field labels instead of Zod defaults.

Pair `resolverFields` with `errorPaths` on header-only tabs: `errorPaths` drives tab
badges and the footer summary; `resolverFields` drives inline message copy.

Dashboard helpers: `prefixFormItems`, `embeddedArrayResolverField`, and
`embeddedMasterDetailTabValidation` in `tabbed-form-resolver-fields.ts` (dashboard).
Dev-only warnings fire when header-only tabs omit wiring; set
`skipHeaderOnlyValidationWiring` on non-form chrome tabs.

## Field anatomy & the a11y contract

Every field resolves to the same structure ([field.client.tsx](../src/components/ui/field.client.tsx)):

```tsx
import { Field, FieldLayout } from '@rpg/ui'
;<Field.Root id="email" error={error} hint="We never share it." required>
  <FieldLayout label={<Field.Label>Email</Field.Label>} control={<Input type="email" />} />
</Field.Root>
```

Centralized in `Field.Root` context:

- **Labelling** — `Field.Label` → `htmlFor`; `Field.Control` injects matching `id`.
- **`aria-describedby`** — hint id, or error id when present (error wins; hint hides).
- **`aria-invalid`** — on error; drives destructive styling via variant, not a prop.
- **Error** — `Field.Error` with `role="alert"` + `aria-live="polite"`.
- **Required** — visual `*` is `aria-hidden`; constraint lives in Zod.

**Info tooltip:** pass `info` to wrappers for a focusable `[i]` button with `aria-label`.

**Hint vs error.** Hints are guidance; errors are validation. Never encode required-ness as a hint.

**Hint placement.** `hintPosition`: `below-label` (default) or `below-control`.

**Requirement:** every field must pass axe. See [AGENTS.md](../../../AGENTS.md) (WCAG 2.2 AA).

## Form rhythm

`<Form>` / `<TabbedForm>` accept `rhythm?: 'compact' | 'comfortable'` (default `comfortable`).
Nested `kind: 'group'` inherits unless `GroupConfig.rhythm` overrides.

| Context                  | Default rhythm | Default size                         | Override                       |
| ------------------------ | -------------- | ------------------------------------ | ------------------------------ |
| Top-level form fields    | form rhythm    | `md` if comfortable, `sm` if compact | form `size` prop               |
| `kind: 'array'`          | `compact`      | `sm`                                 | `ArrayConfig.rhythm` / `.size` |
| `kind: 'slot'`           | `compact`      | `sm`                                 | `SlotConfig.rhythm` / `.size`  |
| Array item nested groups | `compact`      | `sm`                                 | same as parent array section   |

Slot `render()` components should call `useFormSectionContext()` from `@rpg/ui/form` and
thread `size` / `rhythm` into hand-built controls (e.g. `RequirementEditor`).

**Array legends:** default `legendSize: 'array'`. With `size: 'sm'`, legend is `text-sm`;
pass `size: 'md'` for `text-field-array-legend` (18px).

Dense chip fields stack full-width — don't cram many options into a `FieldRow`.

Spacing tokens, `width`, `digits`, row layouts: [sizing-and-spacing.md](./forms/sizing-and-spacing.md).

## Container kinds

| `kind`  | Purpose                          | Detail                                              |
| ------- | -------------------------------- | --------------------------------------------------- |
| `group` | Named fieldset subsection        | [containers.md](./forms/containers.md#groups)       |
| `row`   | Horizontal siblings              | [containers.md](./forms/containers.md#rows)         |
| `stack` | Layout column (dependent stacks) | [containers.md](./forms/containers.md#stacks)       |
| `array` | Repeatable `useFieldArray`       | [containers.md](./forms/containers.md#array-fields) |
| `slot`  | Custom `render()` region         | [containers.md](./forms/containers.md#slot-fields)  |

Collapsible sections, separators, nested groups: [containers.md](./forms/containers.md).

## Specialized field types

Rich text, combobox, editable grid, dice formula, chips, input unit/select, etc.:
[field-types.md](./forms/field-types.md).

Config union source of truth: [field-config.ts](../src/form/field-config.ts).

## Validation — contracts-first

Zod schemas live in `@rpg/contracts` — single source of truth for client and server.
**Never redefine domain shapes in apps.**

```tsx
import { CreateCampaignInput } from '@rpg/contracts'
;<Form schema={CreateCampaignInput} fields={fields} onSubmit={onSubmit} />
```

`<form noValidate>` — RHF + Zod own validation messages.

### Default error messages

Schemas stay message-free. `makeResolver` builds a field-aware error map
(`makeFieldErrorMap`) that formats raw Zod issues (`invalid_type`, `too_small`,
`invalid_format`, `invalid_value`, `invalid_union`, …) into shared boilerplate
copy from `@rpg/contracts` (`fieldValidationMessages`), interpolating the field's
configured `label` — e.g. `z.number().min(1)` on a field labeled `Level` renders
`Level must be at least 1.` Array containers use their `legend` (or `itemHeader`
for singular item copy: `Add at least one grant.`). Registered paths always
receive catalog copy; a last-resort `{label} is invalid.` catch-all covers
unhandled issue codes. Custom `.refine` / `superRefine` messages always win;
**unregistered** paths (unknown field names) still fall back to Zod defaults.
See `field-error-map-fixture.stories.tsx` for a synthetic form covering each
edge case. Tiers, naming, and copy style →
[packages/contracts/docs/validation-messages.md](../../contracts/docs/validation-messages.md).

### Verifying validation messages in tests

Co-located form tests import helpers from `@rpg/ui/form/test-utils`:

| Helper                                                          | Purpose                                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `assertFieldPathsRegistered(fields)`                            | Every `flattenFields` leaf path resolves in the error-map registry                            |
| `assertRegistryCoverage(schema, fields, opts?)`                 | Schema leaf paths are registered (use `exemptPaths` for slug, slot tabs, grant unions)        |
| `assertInvalidSubmitUsesRefinedMessages(schema, fields, opts?)` | Invalid payloads produce no Zod-default copy; optional `catchAllWhitelist` / `unionWhitelist` |
| `expectNoDefaultZodMessages(messages)`                          | Standalone detector for `Invalid input`, `Too small:`, etc.                                   |

Pass a targeted `invalidValue` when `{}` parses successfully or triggers unrelated
paths (tabbed forms, equipment kinds). Master-detail sub-forms (trait rows,
starting-equipment options, …) get their own `*-form-validation.test.ts` cases.

Contract enums → `toOptions` with a label map keyed by the enum type:

```ts
import { toOptions } from '@rpg/ui/form'
{ type: 'chips', name: 'playStyle', label: 'Play Style',
  options: toOptions(PLAY_STYLES, PLAY_STYLE_LABELS) }
```

## Conditional fields

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

- `dependsOn` — exact field names the predicate reads (`useWatch`, not whole-form re-render).
- Hidden → control unmounts, value clears (`shouldUnregister`).

**Hidden = not required.** Resolver strips hidden keys before validate/submit.

> Caveat: strip uses Zod `.omit` on plain objects. Refined/transformed schemas can't omit —
> hidden fields still validate. Keep schemas plain or gate rules yourself.

Array item conditionals use **relative** `dependsOn` names — see
[containers.md](./forms/containers.md#conditional-fields-in-items).

## Submit & server errors

`onSubmit(values, form)`:

- **Form-level:** `formError` prop → `role="alert"` above fields.
- **Field-level:** `form.setError('name', { message: '…' })` in `onSubmit`.

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
      else throw err
    }
  }}
/>
```

## The RHF boundary

**Primitives never import `react-hook-form`.** They take `error?: string` and standard
`value`/`onChange`.

`<Form>` ([form.client.tsx](../src/form/shells/form.client.tsx)) owns RHF: `<form>` + `FormProvider`,
synthesized `defaultValues`, per-field `FieldRenderer` (`useController`), and a
`type → wrapper` registry ([field-renderer.client.tsx](../src/form/renderers/field-renderer.client.tsx)).

**Custom controls:**

1. **Registry** (reusable): add `FieldType`, `*FieldConfig`, adapter entry in field-config +
   field-renderer.
2. **One-off:** your own `useForm` + `Controller`, pass `error={fieldState.error?.message}`.

> Radix controls thread `onBlur` but not ref — auto-focus-first-error limited to text/number.

## Wizard, footers, FormCard

- **Wizard:** `<WizardStepForm>` — flat step values; map to API in `onComplete`.
- **Footer:** `FormSaveFooter` / `FormFooterActions`; `<Form stickyFooter>` or `<TabbedForm>`.
- **FormCard:** card chrome + child `<Form>`; `contentClassName={formCardContentClass}`.

Detail and examples: [patterns.md](./forms/patterns.md).

## Storybook

Runnable recipes beat copying from docs. Start at `Forms/Form`, `Forms/TabbedForm`, and
`FieldRow/*` in UI Storybook (`:6006`).

## Further reading

| Doc                                                    | Contents                                              |
| ------------------------------------------------------ | ----------------------------------------------------- |
| [field-types.md](./forms/field-types.md)               | richtext, combobox, editableGrid, chips, inputUnit, … |
| [containers.md](./forms/containers.md)                 | group, row, stack, array, slot                        |
| [sizing-and-spacing.md](./forms/sizing-and-spacing.md) | size, width, digits, rhythm tokens                    |
| [patterns.md](./forms/patterns.md)                     | TabbedForm chrome, FormCard, wizard, Storybook index  |
| [field-config.ts](../src/form/field-config.ts)         | Config types (source of truth)                        |
| [README.md](../README.md)                              | Package overview, wizard pattern                      |
