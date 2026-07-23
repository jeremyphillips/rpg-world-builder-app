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

## Component entry files

Every form container or renderer component has **one semantically named entry file** that
matches the exported component name in kebab-case:

| Component               | Entry file                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `ArrayFieldRenderer`    | [`array-field-renderer.client.tsx`](../src/form/renderers/array/array-field-renderer.client.tsx)       |
| `ArrayFormItemSection`  | [`array-form-item-section.client.tsx`](../src/form/renderers/array/array-form-item-section.client.tsx) |
| `ConditionalArrayField` | [`conditional-array-field.client.tsx`](../src/form/renderers/array/conditional-array-field.client.tsx) |
| `SlotFieldRenderer`     | [`slot-field-renderer.client.tsx`](../src/form/renderers/fields/slot-field-renderer.client.tsx)        |
| `FieldRenderer`         | [`field-renderer.client.tsx`](../src/form/renderers/field-renderer.client.tsx)                         |

Convention: `NewComponent` → `new-component.client.tsx`. Supporting hooks, variants, and
presentational sub-parts live alongside the entry file in the same folder; they are not
re-exported from the entry unless they are part of the component's public surface.

`form-item-node.client.tsx` dispatches `kind` values to the matching entry wrapper; the
wrapper resolves section context and RHF name prefixes, then renders the entry renderer.

## Groups

Semantic `<fieldset>` + `<legend>`. Top-level: section scale (`text-field-group-legend`).
Nested groups inside another group default to `legendSize: 'subsection'` (override when
needed). Nested groups omit `mb-8` — parent group rhythm (`gap-6` / `gap-2`) owns sibling
spacing, matching nested array sections. Top-level groups and arrays inside `<Form>` omit
`mb-8` as well — the form's `FormRhythmStack` (`gap-6` / `gap-2`) owns sibling spacing.
Standalone `FormItems` outside `<Form>` get the same contract when wrapped in
`FormSectionProvider` with `inRhythmStack` (e.g. header-embedded sections whose parent
shell already spaces siblings).

```ts
{
  kind: 'group',
  legend: 'Weapon',
  fields: [
    { /* … */ },
    { kind: 'group', legend: 'Damage', fields: [/* … */] },
  ],
}
```

`FieldGroup` (standalone) accepts the same `legendSize`, `size`, `chrome`, and `disclosure`.
Groups may declare `visibility` — hidden groups unmount and clear nested values.

`rhythm` overrides inherited form rhythm.

### Group `chrome`

Optional visual treatment for the legend + field stack. Variants are **mutually
exclusive** — omit for plain fieldset behavior.

| `variant` | Use                                                                                                                                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inset`   | Left rail + indent on the **field stack** only — legend stays outside. Padding follows group `rhythm` (`compact`: 16px / 20px; `comfortable`: 16px / 32px; mobile / `sm+`). Tones: `border` (default), `primary`.                                                                                    |
| `panel`   | Rounded border box around the **field stack** only. Tones: surface (`subtle` default, `medium`, `strong`, `base`, `raised`), status (`info`, `success`, `warning`, `destructive`), or compact-label tones (`neutral`, `info`, …). Surface tiers use centralized `field-surface.variants.ts` recipes. |
| `outline` | Border-only box around the **field stack** — no background wash. Ladder tones: `faint`, `subtle` (default), `default`, `strong`. Semantic tones: `primary`, `info`, `success`, `warning`, `destructive`.                                                                                             |
| `divider` | Section separator on the fieldset. `edge`: `top` (default) or `bottom`; adds `pt-7` / `pb-7` (28px) with `border-t` / `border-b`.                                                                                                                                                                    |
| `callout` | Alert-shaped surface on the **field stack** only. Tones: alert variants (`default`, `info`, `success`, `warning`, `destructive`) or compact-label `neutral` for semantic soft wash.                                                                                                                  |
| `accent`  | Light emphasis — `edge: 'top'` (`border-t-2 pt-4`) or `edge: 'legendRail'` (primary/semantic rail on legend only).                                                                                                                                                                                   |

`chrome` composes with `disclosure` — e.g. `outline` surface on the field stack inside a
summary-disclosure group.

### Group `disclosure`

Optional open/collapse and summary behavior. Composes with `chrome`.

| `variant` | Use                                                                                                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legend`  | Legend becomes a disclosure trigger; fields stay registered when collapsed. `defaultOpen` (default `true`); optional `collapseKey` for `uiStateKey` persistence.                                                                                                                       |
| `summary` | Compact collapsed summary + **Change** / expanded **Done** for settings sections. `resolveSummary`, optional `summaryDependsOn`, `showDirtySuffix`, `panelDivider` (default `true`), `openLabel` / `closeLabel`. Fields stay mounted (hidden) when collapsed. Requires `FormProvider`. |

`resolveSummary` returns a `FieldGroupSummary`:

| Field       | Use                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary`   | Plain-text fallback when `status` is omitted — existing `primary` + `secondary` layout                                                                    |
| `secondary` | Muted explanatory line below the status row                                                                                                               |
| `status`    | Structured status row — `label`, optional `tone` (`neutral` \| `success` \| `warning`), optional `indicator` (`dot` \| `inactive`)                        |
| `detail`    | Supporting detail on the status line (e.g. player access mode) — muted, middle-dot separated from `status.label`                                          |
| `chrome`    | Collapsed container treatment — e.g. `{ variant: 'accent', tone: 'warning', emphasis: 'faint' }` (`data-summary-chrome`); expanded state ignores `chrome` |

```ts
{
  kind: 'group',
  legend: 'Campaign availability',
  legendSize: 'array',
  disclosure: {
    variant: 'summary',
    defaultOpen: false,
    summaryDependsOn: ['available', 'visibilityMode'],
    showDirtySuffix: true,
    resolveSummary: (values) =>
      values.available
        ? {
            status: { label: 'Available', tone: 'success', indicator: 'dot' },
            detail: 'All players',
          }
        : {
            status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
            detail: 'DM only',
            secondary: 'Hidden from discovery and selection in this campaign.',
            chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
          },
  },
  fields: [/* settings rows */],
}
```

Legend header margin (`mb-5` / `mb-4`) lives on the legend header block; `<legend>` is `w-full`
and sits **outside** panel, outline, inset, and callout boxes. Divider and accent-top chrome
apply to the `<fieldset>`. Token source: `field-group-chrome.variants.ts`.

## Rows

Side-by-side leaf fields and slots in a wrapping flex row. Row-level `visibility`, `separator`,
and `className`. Layout detail: [sizing-and-spacing.md](./sizing-and-spacing.md).

## Stacks

Layout-only — one slot in outer rhythm, no fieldset. Use `layout: 'dependent'` when a
controller field gates indented dependents:

- Field `[0]` (controller) — switch, select, etc. — always visible.
- Fields `[1..]` (dependents) indent (`pl-11`) to align with the controller label column.
- Dependents hidden when the gate predicate is false — no empty inset.
- `dependentsVisibility` gates fields `[1..]`. When omitted and `[0]` is a switch, defaults
  to "switch is true". For select/other controllers, pass an explicit predicate for hide
  behavior; omit for indent/chrome only (dependents always shown).
- Optional `dependentsChrome`: `main` | `elevated` | `subtle` | `medium` | `warning` | `error`.
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
      addActionLabel: 'Add class limit',
      fields: [/* … */],
    },
  ],
}
```

## Field separators

`separator` on a leaf, row, or slot → trailing `border-b` before the next sibling.
Tones follow the border ladder: `faint` (`border-border-faint`), `subtle` (`border-border-subtle`,
default), `default` (`border-border`), `strong` (`border-border-strong`). Padding follows inherited
stack rhythm: `pb-2` (8px) when `rhythm: 'compact'`, `pb-7` (28px) when `rhythm: 'comfortable'`.
On a `stack` → trailing divider after the whole stack (controller + dependents region).
Prefer stack-level `separator` for `layout: 'dependent'` blocks instead of putting it on the
controller field.
Token: `fieldSeparatorVariants`. Do not use row `className` for recurring dividers.

## Array fields

Repeatable section via `useFieldArray`. Item field names are **relative** (renderer prefixes
`arrayName.index`). Item shells default to the **elevated** surface (`bg-card` + raised shadow);
use `itemChrome` or stack `dependentsChrome` + `dependentsChromeScope: 'arrayItems'` to override.

**Authoring guide:** [array-field-authoring.md](./array-field-authoring.md) — headers, chrome
decision table, add menus, nested arrays, and common mistakes.

**Implementation:** `form-item-node` dispatches `kind: 'array'` to
[`array-form-item-section.client.tsx`](../src/form/renderers/array/array-form-item-section.client.tsx)
(or [`conditional-array-field.client.tsx`](../src/form/renderers/array/conditional-array-field.client.tsx)
when `visibility` is set). Both render
[`array-field-renderer.client.tsx`](../src/form/renderers/array/array-field-renderer.client.tsx)
— the array entry component. Per-row chrome lives in
[`array-field-item-content.client.tsx`](../src/form/renderers/array/array-field-item-content.client.tsx).
See [Component entry files](#component-entry-files).

```ts
{
  kind: 'array',
  name: 'traits',
  legend: 'Traits',
  fields: [
    { type: 'text', name: 'name', label: 'Trait name', required: true },
    { type: 'textarea', name: 'description', label: 'Description' },
  ],
  addActionLabel: 'Add trait',
  min: 0,
  max: 10,
  addActionVariant: 'outline',
  itemHeader: {
    fallback: (i) => `Trait ${i + 1}`,
    primaryField: 'name',
  },
  // rhythm: 'comfortable', size: 'md', itemVariant: 'detailed', itemCollapsible: true,
}
```

**Legend:** Omit or pass `''` when a parent switch/stack already labels the block (e.g.
`dependent` stack dependents). Empty legends are not rendered — no phantom spacing.

**Section margin:** Standalone `FieldGroup` fieldsets use `mb-8`. Arrays and groups inside
`<Form>` omit it — `FormRhythmStack` gap controls sibling spacing. Nested arrays (inside
stacks, groups, or array items) also omit it so parent `fieldStackRhythmVariants` gap
controls spacing.

**Item chrome:** Each row renders a header toolbar (optional drag handle, optional collapse
caret, title, remove). `itemVariant: 'auto'` picks `compact` when item fields are a single
leaf `row`; otherwise `detailed`. Nested arrays inside another item default to compact;
pass `itemVariant: 'detailed'` to keep grant-style collapsible headers inside nested groups.

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

| Property             | Purpose                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `itemVariant`        | `'auto'` \| `'compact'` \| `'detailed'` — row layout (default `auto`).                                   |
| `compactInlineAlign` | `'start'` \| `'center'` — compact inline rows only; center grip/actions with label-less single controls. |

**Compact inline rows** (`itemVariant: 'auto'` \| `'compact'` with a single leaf `row`) render that row
inside a `FieldRow` within the grip/actions grid — leaf `width` tokens (`full`, `auto`, fractions,
`digits`, …) compose the same way as schema `kind: 'row'` fields.

| `itemChrome` | Item shell surface tone — defaults to `elevated` (`bg-card`); override with `subtle`, `medium`, etc. |
| `itemHeader` | Primary/fallback labels; optional `summary` on a second row below the title (detailed). |
| `itemHeader.showFallbackInHeader` | When true, appends ` · {fallback}` after the primary title (default `false`). |
| `itemCollapsible` | Detailed items only — collapse body into header row. |
| `itemCollapseKey` | Stable row field for persisted collapse overrides (default `'id'`; else `index:${index}`). |
| `reorder` | `'dragHandle'` (default) or `false` for fixed order. |
| `appendDefaults` | `(items) => defaults` replaces static defaults on append. |
| `addActionVariant` | Button visual style for the add control — mirrors `Button` `variant`; defaults to `outline`. |
| `addActionLayout` | `stacked` (default) — add control below items; `inline` — add control right-aligned in the legend row (`shrink-0`). |
| `showAddIcon` | When true (default), prefixes the add action with a `+` icon. Set `false` for non-add triggers (e.g. "Choose preset"). |
| `addActionSize` | Optional `Button` size override for the add control (`sm`, `default`, `lg`); inherits from section rhythm when omitted. |
| `hideAddAction` | Omits the default add button (use an external slot instead). |
| `hideItemRemove` | Omits the default per-item remove button (not merely disabled). Use with `itemRemoveSlot`. |
| `itemRemoveSlot` | Custom remove control in the header actions rail; receives `ArrayFieldContext`. Pair with `hideItemRemove`. |
| `addActionMenu` | Searchable template dropdown for the add control; items carry `appendDefaults` and optional duplicate policy. |

```ts
{
  kind: 'array',
  name: 'grants',
  legend: 'Grants',
  addActionLabel: 'Add grant',
  addActionMenu: {
    groups: [{ id: 'combat-traits', label: 'Combat & traits' }],
    items: [
      {
        id: 'movement-bonus',
        label: 'Movement bonus',
        description: 'Increase a movement mode speed.',
        groupId: 'combat-traits',
        searchTerms: [{ text: 'speed', role: 'alias', weight: 1 }],
        appendDefaults: () => ({
          grantType: 'movement',
          movementMode: 'walk',
          movementOperation: 'bonus',
          movementValue: '5',
        }),
      },
    ],
  },
  fields: [/* item fields */],
}
```

When `addActionMenu` is set, `ArrayFieldRenderer` renders `ButtonDropdown` instead of a plain add
button. Selecting an item appends `appendDefaults`, expands the new row, and best-effort focuses
the first eligible control inside it.
| `filterSelectDependsOn` | Root field names passed to `filterSelectOptions` as `watchedValues`. |
| `filterSelectOptions` | Cross-row select filtering inside array items. |
| `arrayPattern` | Domain hooks for array validation severity and focus navigation. |

### Composing custom array rows

When schema `kind: 'array'` layout is insufficient, feature code may compose rows from exported
primitives (`ArrayItemRowShell`, `ArrayItemInlineRow`, `ArrayItemLeadingChromeColumn`,
`ArrayItemActionsRail`, `useArrayItemRowState`) while keeping RHF `useFieldArray` and
`registerArrayFieldMutators`.

Custom rows must preserve navigation parity with schema-rendered arrays:

- Register the same leaf `FieldConfig` entries in resolver/`fields` trees so
  `collectArraySections` field order matches rendered controls (`effectId` before `amount`, etc.).
- Render controls with `FieldNode` + `buildFieldRendererIds` (`idPrefix`, `namePrefix`) — do not
  invent alternate DOM ids.
- Set `data-array-item-prefix` on the row shell to the item RHF prefix
  (e.g. `resolution.outcomes.0.applications.1`).
- Provide `ArrayFieldContext` when array-level `filterSelectOptions` applies.

### Array validation presentation

Array item validation chrome is generic in `@rpg/ui/form` and is driven by RHF/Zod errors:

- Before the first failed submit, progressive presentation shows row issue chrome only for
  touched rows.
- After the first failed submit, all invalid rows in the form are flagged live.
- Detailed rows show an issue badge in the actions rail. Collapsed rows also show the first
  issue message in the header. Expanded rows show row/cross-row messages in the header; field
  messages stay with their controls.
- Compact nested rows get badge-only rollup in v1. Descendant errors still count toward the
  nearest detailed ancestor row.
- The array legend shows an invalid-row link after a failed submit. Clicking it jumps to the
  first invalid row in that array.

Submit failure expands the first invalid row and scrolls/focuses the best matching control when
one can be resolved. This expansion is session-only; it does not write a manual collapse override
to `localStorage`.

`validationPresentation` on `<Form>` / `<TabbedForm>` defaults to `'progressive'`. Use
`'always'` for demos or flows that should expose array row issue chrome as soon as errors exist.

`arrayPattern` can customize issue behavior:

```ts
{
  kind: 'array',
  name: 'tiers',
  legend: 'Wealth tiers',
  arrayPattern: {
    kind: 'levelRange',
    levelKeys: { min: 'minLevel', max: 'maxLevel' },
    getErrorFocusTarget: ({ issue, levelKeys }) =>
      issue.message.includes('cover levels') ? levelKeys?.max : levelKeys?.min,
  },
  fields: [/* … */],
}
```

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

Optional `label` + `hint` wrap content in `FieldGroup`. `separator` adds a trailing
divider after the slot (same as leaf fields and rows).
