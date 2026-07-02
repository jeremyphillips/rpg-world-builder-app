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

`rhythm` overrides inherited form rhythm.

## Rows

Side-by-side leaf fields. `layout`: `flex` (default) or `responsive-2/3/4`. Row-level
`visibility` and `separator`. Layout detail: [sizing-and-spacing.md](./sizing-and-spacing.md).

## Stacks

Layout-only — one slot in outer rhythm, no fieldset. Use `layout: 'dependent'` when a
controller field gates indented dependents:

- Field `[0]` (controller) — switch, select, etc. — always visible.
- Fields `[1..]` (dependents) indent (`pl-11`) to align with the controller label column.
- Dependents hidden when the gate predicate is false — no empty inset.
- `dependentsVisibility` gates fields `[1..]`. When omitted and `[0]` is a switch, defaults
  to "switch is true". For select/other controllers, pass an explicit predicate for hide
  behavior; omit for indent/chrome only (dependents always shown).
- Optional `dependentsChrome`: `subtle` | `warning` | `error`.
- Optional `dependentsChromeScope`: `wrapper` (default) | `arrayItems`.
  - `wrapper` — tone on the dependents container; use for scalar dependents (selects, numbers).
  - `arrayItems` — tone on array item shells only; avoids double borders when dependents include arrays.
  - Mixed dependents: only array item shells receive tone; scalars render without wash.
- `rhythm`: `compact` (default) or `comfortable` for multi-field blocks.

Pair dependent scalars with `labelPosition: 'settings'`.

```ts
{
  kind: 'stack',
  layout: 'dependent',
  dependentsChrome: 'subtle',
  fields: [
    { type: 'switch', name: 'enabled', label: 'Primary ability minimum', hint: '…' },
    {
      type: 'number',
      name: 'score',
      label: 'Minimum ability score',
      labelPosition: 'settings',
    },
  ],
}
```

Select controller with explicit gate (species class-policy pattern):

```ts
{
  kind: 'stack',
  layout: 'dependent',
  separator: 'subtle',
  dependentsVisibility: visibleWhenClassPolicyNeedsIds(),
  dependentsChrome: 'subtle',
  fields: [
    {
      type: 'select',
      name: 'classPolicy.mode',
      label: 'Class restrictions',
      labelPosition: 'settings',
    },
    {
      type: 'combobox',
      name: 'classPolicy.classIds',
      label: 'Classes',
    },
  ],
}
```

Dependent stack with an array dependent — use `arrayItems` scope:

```ts
{
  kind: 'stack',
  layout: 'dependent',
  dependentsChrome: 'subtle',
  dependentsChromeScope: 'arrayItems',
  fields: [
    { type: 'switch', name: 'enabled', label: 'Class-specific limits', hint: '…' },
    {
      kind: 'array',
      name: 'caps',
      legend: '',
      addLabel: 'Add class limit',
      fields: [/* … */],
    },
  ],
}
```

## Field separators

`separator: 'subtle'` on a leaf or row → trailing `border-b` + `pb-4` before the next sibling.
On a `stack` → trailing divider after the whole stack (controller + dependents region).
Prefer stack-level `separator` for `layout: 'dependent'` blocks instead of putting it on the
controller field.
Token: `fieldSeparatorVariants`. Do not use row `className` for recurring dividers.

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
  itemHeader: {
    fallback: (i) => `Trait ${i + 1}`,
    primaryField: 'name',
  },
  // rhythm: 'comfortable', size: 'md', itemVariant: 'detailed', itemCollapsible: true,
}
```

**Legend:** Omit or pass `''` when a parent switch/stack already labels the block (e.g.
`dependent` stack dependents). Empty legends are not rendered — no phantom spacing.

**Section margin:** Top-level array fieldsets use `mb-8`. Nested arrays (inside stacks,
groups, or array items) omit it so parent `fieldStackRhythmVariants` gap controls spacing.

**Item chrome:** Each row renders a header toolbar (optional drag handle, optional collapse
caret, title, remove). `itemVariant: 'auto'` picks `compact` when item fields are a single
leaf `row`; otherwise `detailed`. Nested arrays inside another item are always compact.

```ts
{
  kind: 'array',
  name: 'tiers',
  legend: 'Wealth tiers',
  itemVariant: 'detailed',
  itemCollapsible: true,
  reorder: false,
  itemHeader: {
    primaryField: 'label',
    fallback: (i) => `Wealth tier #${i + 1}`,
    summary: (values) => formatTierSummary(values),
  },
  fields: [/* … */],
}
```

**Legend scale:** `legendSize` defaults to `array`. With default `size: 'sm'`, legend is
`text-sm`; pass `size: 'md'` for `text-field-array-legend` (18px).

### Collapse defaults and persistence

When `itemCollapsible: true` on detailed items:

- **One item** — expanded by default.
- **Two or more** — collapsed by default.
- **Manual toggles** — stored as per-item `open` / `closed` overrides and take precedence.

Pass `uiStateKey` on `<Form>` / `<TabbedForm>` (typically an entity or campaign id) to persist
overrides in `localStorage` keyed by `uiStateKey` + array path (`fullName`). Without
`uiStateKey`, overrides apply for the current mount only. Scope the key when one browser
session hosts multiple forms for the same campaign (e.g.
`${campaignId}:character-configuration`).

Use `itemCollapseKey` when rows expose a stable id field (default `'id'`). Rows without that
field fall back to `index:${index}` — suitable for fixed-order arrays such as wealth tiers.
Drag-reorder arrays should expose a stable id on each row.

### Zod

```ts
traits: z.array(z.object({ name: z.string().min(1), description: z.string() })),
```

### Defaults

`buildItemDefaultValues(config.fields)` seeds new items — exported from `@rpg/ui/form`.

Optional hooks:

| Property                          | Purpose                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `itemVariant`                     | `'auto'` \| `'compact'` \| `'detailed'` — row layout (default `auto`).                      |
| `itemHeader`                      | Primary/fallback labels; optional `summary` on a second row below the title (detailed).     |
| `itemHeader.showFallbackInHeader` | When true, appends ` · {fallback}` after the primary title (default `false`).               |
| `itemCollapsible`                 | Detailed items only — collapse body into header row.                                        |
| `itemCollapseKey`                 | Stable row field for persisted collapse overrides (default `'id'`; else `index:${index}`).  |
| `reorder`                         | `'dragHandle'` (default) or `false` for fixed order.                                        |
| `appendDefaults`                  | `(items) => defaults` replaces static defaults on append.                                   |
| `filterSelectDependsOn`           | Root field names passed to `filterSelectOptions` as `watchedValues`.                        |
| `filterSelectOptions`             | Cross-row select filtering inside array items.                                              |
| `arrayPattern`                    | Opaque metadata tag for dashboard patterns / drift tests — not interpreted by the renderer. |

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
