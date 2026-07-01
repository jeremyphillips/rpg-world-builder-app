# Form containers

Structural items in a `fields` config: groups, rows, stacks, arrays, and slots. Rhythm
and size defaults: [forms hub — Form rhythm](../forms.md#form-rhythm).

## Overview

| `kind`  | Semantics            | Rhythm default | Size default | Fieldset legend |
| ------- | -------------------- | -------------- | ------------ | --------------- |
| `group` | Named subsection     | inherits form  | inherits     | yes             |
| `row`   | Horizontal siblings  | —              | per field    | no              |
| `stack` | Layout-only column   | `compact`      | inherits     | no              |
| `array` | `useFieldArray` list | `compact`      | `sm`         | yes (`array`)   |
| `slot`  | Custom `render()` UI | `compact`      | `sm`         | optional label  |

## Groups

Semantic `<fieldset>` + `<legend>`. Top-level: section scale (`text-field-group-legend`).
Nested: `legendSize: 'subsection'`.

```ts
{
  kind: 'group',
  legend: 'Weapon',
  fields: [
    { /* … */ },
    { kind: 'group', legend: 'Damage', legendSize: 'subsection', fields: [/* … */] },
  ],
}
```

`FieldGroup` (standalone) accepts the same `legendSize` and `size`. Groups may declare
`visibility` — hidden groups unmount and clear nested values.

`rhythm` overrides inherited form rhythm. `collapsible: true` → accordion section (see below).

## Rows

Side-by-side leaf fields. `layout`: `flex` (default) or `responsive-2/3/4`. Row-level
`visibility` and `separator`. Layout detail: [sizing-and-spacing.md](./sizing-and-spacing.md).

## Stacks

Layout-only — one slot in outer rhythm, no fieldset. Use `layout: 'toggleDependent'` when a
switch gates dependents:

- Field `[0]` (switch) renders outside chrome.
- Dependents indent (`pl-11`) to align with switch label column.
- Dependents hidden when switch off — no empty inset.
- Optional `dependentsChrome`: `subtle` | `warning` | `error`.
- `rhythm`: `compact` (default) or `comfortable` for multi-field blocks.

Pair dependent scalars with `labelPosition: 'settings'`.

```ts
{
  kind: 'stack',
  layout: 'toggleDependent',
  dependentsChrome: 'subtle',
  fields: [
    { type: 'switch', name: 'enabled', label: 'Primary ability minimum', hint: '…' },
    {
      type: 'number',
      name: 'score',
      label: 'Minimum ability score',
      labelPosition: 'settings',
      visibility: visibleWhenEnabled(),
    },
  ],
}
```

## Field separators

`separator: 'subtle'` on a leaf or row → trailing `border-b` + `pb-4` before next sibling.
Token: `fieldSeparatorVariants`. Do not use row `className` for recurring dividers.

## Collapsible sections

`collapsible: true` on `group` or `array` wraps an accordion (`collapsibleSections` on
`<Form>` defaults `true`; pass `false` to force flat fieldsets).

- Sections **start open**; values preserved while collapsed (not `shouldUnregister`).
- Accordion triggers share group legend typography; array collapsibles hide fieldset legend
  (trigger labels the section).
- Panels use `overflow-visible` so focus rings are not clipped.

## Array fields

Repeatable section via `useFieldArray`. Item field names are **relative** (renderer prefixes
`arrayName.index`).

```ts
{
  kind: 'array',
  name: 'traits',
  legend: 'Traits',
  fields: [
    { type: 'text', name: 'name', label: 'Trait name', required: true },
    { type: 'textarea', name: 'description', label: 'Description' },
  ],
  addLabel: 'Add trait',
  min: 0,
  max: 10,
  itemTitle: (_v, i) => `Trait ${i + 1}`,
  // rhythm: 'comfortable', size: 'md',
}
```

**Legend scale:** `legendSize` defaults to `array`. With default `size: 'sm'`, legend is
`text-sm`; pass `size: 'md'` for `text-field-array-legend` (18px).

### Zod

```ts
traits: z.array(z.object({ name: z.string().min(1), description: z.string() })),
```

### Defaults

`buildItemDefaultValues(config.fields)` seeds new items — exported from `@rpg/ui/form`.

Optional hooks:

| Property                | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `allowReorder`          | When `false`, hides ↑/↓ move buttons (default `true`).                                      |
| `hideMoveControls`      | Hides move buttons even when reorder is allowed.                                            |
| `appendDefaults`        | `(items) => defaults` replaces static defaults on append.                                   |
| `filterSelectDependsOn` | Root field names passed to `filterSelectOptions` as `watchedValues`.                        |
| `filterSelectOptions`   | Cross-row select filtering inside array items.                                              |
| `arrayPattern`          | Opaque metadata tag for dashboard patterns / drift tests — not interpreted by the renderer. |

### Conditional fields in items

`dependsOn` names are **item-relative**; `visibleWhen` uses relative keys (`v.type`).
Hidden item fields clear via `shouldUnregister` — mark them `z.optional()` in the item schema.

> Resolver `.omit` for hidden fields works on top-level keys only, not nested array items.

### Nesting

`ArrayConfig.fields` may contain nested arrays. Name scoping cascades (`root.0.sub.1.name`).
Avoid three+ levels for UX.

## Slot fields

Custom UI inside `FormProvider`. `name` aligns with a form value; defaults from form
`defaultValues`.

```ts
{
  kind: 'slot',
  name: 'prerequisiteEditor',
  render: () => <RequirementEditor name="prerequisiteEditor" />,
}
```

`rhythm` and `size` mirror arrays (compact + `sm` at boundary). Slot components should
call `useFormSectionContext()` and thread `size` / `rhythm` into hand-built controls.

Optional `label` + `hint` wrap content in `FieldGroup`.
