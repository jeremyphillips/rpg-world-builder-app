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
@rpg/ui            → Field.* , TextField … , FieldGroup , FieldRow   (RHF-agnostic)
@rpg/ui/form       → <Form> , FieldConfig types                       (RHF-aware)
```

## When to use which layer

| Use…                                | When…                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Form>` (`@rpg/ui/form`)           | A standard, config-shaped form: a list of labelled fields, optional groups/rows, conditional visibility, Zod validation. This is the default — prefer it. |
| Field wrappers + your own `useForm` | The form is mostly standard but needs a hand-placed custom control, bespoke submit logic, or a layout the config can't express.                           |
| Compound `Field.*`                  | A truly one-off layout (a control embedded in prose, a non-standard arrangement) where you want the a11y wiring but not the prop/config shape.            |

Rule of thumb: start with `<Form>`. Drop a layer only when you hit something it
can't express — and consider whether the missing capability belongs in the
renderer instead.

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

**Requirement:** every field must pass axe. All wrappers and the compound `Field`
already do; if you compose `Field.*` by hand, keep a `Field.Label` wired to the
control and don't suppress axe rules. See [AGENTS.md](../../../AGENTS.md) for the
WCAG 2.2 AA bar.

## Sizing conventions

Two independent token scales, both defined once in
[field-control.variants.ts](../src/components/ui/field-control.variants.ts) and
shared by every control.

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
  suits 1–2 character inputs like a die count.
- **Proportional** (`full`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`): these flex within
  a `FieldRow`. `full` (the default) fills remaining space; fractions distribute
  space by **grow weight** (a base-12 scale), so mixed denominators compose and
  stay gap-safe. Fractions only have meaning inside a `FieldRow`; elsewhere they
  behave like `full`.

A plain `FieldRow` with two inputs and no `width` splits 50/50, and wraps to full
width on narrow viewports.

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
- Bold, italic, and hard breaks ship by default. Links are **opt-in** via the
  `linkable` prop (the `Link` extension + toolbar button are gated behind it).
- **Rendering stored content is a one-liner with a hard rule:** always pass it
  through `sanitizeHtml` ([sanitize-html.ts](../src/lib/sanitize-html.ts)). Never
  drop raw editor output into `dangerouslySetInnerHTML`.

```tsx
import { sanitizeHtml } from '@rpg/ui'
;<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(stored) }} />
```

### JSON (`json` / `JsonField`)

- A monospace editor holding a string while you type, validated with `JSON.parse`
  on blur; invalid JSON surfaces through the standard `error`/aria path.
- Pass an `example` (object or string) and the field shows an **"Insert example"**
  button that pretty-prints it into the field — an authoring aid, not a default.

## Conditional fields

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

- **XdY dice notation** — `Recipes/DiceNotation`
  ([dice-notation.stories.tsx](../src/stories/dice-notation.stories.tsx)): a
  `FieldRow` with a narrow `NumberField` (count) + `SelectField` (die face).
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
