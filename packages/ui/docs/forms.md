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

**Known gap:** field errors on an **inactive** tab are not shown on the tab trigger — a failed
submit can look like a no-op until the author switches tabs.

Optional non-field UI: `TabbedFormTab.header`. Sticky chrome, sheets, and footers:
[patterns.md](./forms/patterns.md#tabbedform).

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
| `stack` | Layout column (toggle-dependent) | [containers.md](./forms/containers.md#stacks)       |
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

`<Form>` ([form.client.tsx](../src/form/form.client.tsx)) owns RHF: `<form>` + `FormProvider`,
synthesized `defaultValues`, per-field `FieldRenderer` (`useController`), and a
`type → wrapper` registry ([field-renderer.client.tsx](../src/form/field-renderer.client.tsx)).

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
| [containers.md](./forms/containers.md)                 | group, row, stack, array, slot, collapsible           |
| [sizing-and-spacing.md](./forms/sizing-and-spacing.md) | size, width, digits, rhythm tokens                    |
| [patterns.md](./forms/patterns.md)                     | TabbedForm chrome, FormCard, wizard, Storybook index  |
| [field-config.ts](../src/form/field-config.ts)         | Config types (source of truth)                        |
| [README.md](../README.md)                              | Package overview, wizard pattern                      |
