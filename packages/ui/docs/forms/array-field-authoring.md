# Array field authoring

Canonical guide for `kind: 'array'` in schema-driven forms. Container semantics and
renderer entry points live in [containers.md](./containers.md#array-fields); this doc
focuses on **authoring choices** — headers, chrome, add menus, and common mistakes.

Use `defineArrayField()` for editor completion; plain object literals remain valid.

## Minimal example

Ticket code references — compact rows, `primaryField` title, no collapse:

```ts
defineArrayField({
  kind: 'array',
  name: 'codeRefs',
  legend: 'Code references',
  addActionLabel: 'Add code reference',
  itemHeader: {
    fallback: (index) => `Ref ${index + 1}`,
    primaryField: 'path',
  },
  fields: [
    { type: 'text', name: 'path', label: 'Path', required: true },
    { type: 'text', name: 'symbol', label: 'Symbol' },
    {
      kind: 'row',
      fields: [
        { type: 'number', name: 'lineStart', label: 'Line start', width: '1/2' },
        { type: 'number', name: 'lineEnd', label: 'Line end', width: '1/2' },
      ],
    },
    { type: 'text', name: 'note', label: 'Note' },
  ],
})
```

## Complete example — collapsible grants

Species/class grant rows — detailed items, template add menu, domain header formatters:

```ts
defineArrayField({
  kind: 'array',
  name: 'grants',
  legend: 'Grants',
  addActionLabel: 'Add grant',
  itemCollapsible: true,
  itemHeader: {
    fallback: (index) => `Grant ${index + 1}`,
    primary: (values, index) => formatGrantRowPrimary(values, index, ctx),
    summary: (values) => formatGrantRowSummary(values, ctx),
  },
  addActionMenu: buildGrantArrayAddMenu(grantTypes),
  fields: grantItemFields(grantTypes, labels, ctx),
})
```

Wealth tiers — fixed order, no reorder, collapse with summary:

```ts
defineArrayField({
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
  fields: [
    /* tier fields */
  ],
})
```

## `itemVariant` / `item.surface` / `itemCollapsible`

| Goal                                              | `itemVariant`       | `item.surface` / `item.tone`                           | `itemCollapsible`     |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------ | --------------------- |
| Single inline control per row (tags, simple refs) | `auto` or `compact` | default subtle header (omit `item.surface`)            | omit / `false`        |
| Flat inline rows on page canvas (no beige wash)   | `compact`           | `CANVAS_SURFACE` from `@rpg/ui/form`                   | omit / `false`        |
| Multi-field block with header toolbar             | `detailed` or omit  | override only — default is subtle header + canvas body | `true` for long forms |
| Nested array inside another item                  | `auto` → compact    | match parent or omit                                   | `true` → detailed     |
| Grant-style entity rows                           | `detailed`          | use `item.renderShell` — not `item.surface` alone      | `true`                |

**Detailed collapsible items compose `CollapsibleListItem`** — the same header / summary /
body / actions slots as catalog picker rows. The header plane defaults to
`bg-surface-subtle`; the disclosure body bleeds to the shell edge on `bg-background` with
field content aligned via `--content-inline-start`.

Do not override neutral `item.surface` / `item.tone` per row unless a semantic callout is
required — defaults avoid stacked-beige-card noise.

**CollapsibleListItem rhythm contract** (form arrays, DEC, catalog — not `DetailEntityRow`):

- **Shared geometry:** header vertical padding (`density`: compact `py-2`, comfortable
  `py-3`), title→summary `gap-0.5`, body divider + `py-3` via `collapsibleListItemBodyFrameClasses`
- **Not shared:** typography metrics, horizontal inset systems, body surface tone
- **Invariant:** text anatomy never owns external vertical spacing (`pb-*` on summary/issue
  lines is forbidden); header rhythm does not change between collapsed and expanded state

`itemCollapsible: true` always renders disclosure anatomy. Omit `itemVariant: 'compact'` on
collapsible arrays — the dev validator warns when both are set. Nested arrays with
`itemCollapsible: true` keep disclosure chrome instead of silently auto-compacting.

`item.surface` is an **override** — default subtle header + canvas body need no `item.surface`.
Uses `SurfaceConfig` (`emphasis`, `elevation`). For flat non-collapsible rows that should sit
on the page canvas instead of the default subtle wash, set `surface: CANVAS_SURFACE`
(`{ elevation: 'canvas' }`). Optional `item.tone` applies a semantic wash
(`info` | `success` | `warning` | `destructive`).

When spreading an array builder, **merge** `item` — `item: { surface: … }` replaces the
whole config and drops `collapsible`, `variant`, `header`, and `reorder`.

## `item.headerVisibility`

Controls whether **item-level header chrome** renders for non-collapsible rows. Field
layout (inline vs stacked) never implies a header by itself.

| Value              | Meaning                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `'auto'` (default) | Show a visible item header when semantic identity requires one (`primaryField`, `primary`, or detailed variant title). |
| `'hidden'`         | Suppress item-level header chrome — use for anonymous stacked rows (e.g. movement speeds).                             |

`item.header` remains the identity config (`fallback`, `primaryField`, `summary`, …) and
still drives aria labels and remove-button copy when the header row is hidden.

`header.srOnly` hides title **text** while header anatomy may still exist; `headerVisibility:
'hidden'` removes the item header row entirely (non-collapsible only). Collapsible items
ignore `'hidden'` — disclosure requires header anatomy.

```ts
item: {
  headerVisibility: 'hidden',
  header: { fallback: (i) => `Movement ${i + 1}`, primaryField: 'mode' },
},
```

## `itemHeader` patterns

| Pattern                 | When                              | Config                              |
| ----------------------- | --------------------------------- | ----------------------------------- |
| Single column title     | One text field names the row      | `primaryField: 'name'` + `fallback` |
| Formatted column        | Enum/id needs a label map         | `primaryField` + `formatPrimary`    |
| Derived title           | Multiple fields or domain copy    | `primary: (values, index) => …`     |
| Secondary context       | Tier stats, grant summary         | `summary` on detailed items         |
| Root context in summary | Summary reads campaign vocabulary | `summaryDependsOn: ['rulesetId']`   |

**Required:** `fallback(index)` — drives empty-primary titles and aria labels even when
`primaryField` or `primary` is set.

`showFallbackInHeader: true` appends ` · {fallback}` after the primary in the visible
title (off by default).

## `item.renderShell` — entity presentation

When an array item represents a catalog entity (grants, starting-equipment items),
replace default ArrayItem chrome with a custom shell via `item.renderShell`. The
form layer still owns registration, validation, remove/reorder, and the trailing
action rail; the shell owns card anatomy (dashboard: `DisclosureEntityCard`).

**Form-owned ≠ form-styled.** The form layer must not add card padding, leading
indentation, or disclosure body inset — `DisclosureEntityCard` owns complete header/body
geometry when `CollapsibleListItem` uses `rowLayout="entity-card"`. See
[dashboard entity presentation contract](../../../../apps/dashboard/docs/content-entity-card.md#disclosureentitycard).

```ts
item: {
  collapsible: true,
  header: { fallback: (i) => `Grant ${i + 1}`, primary: formatPrimary, summary },
  renderShell: (props) => createElement(EntityDisclosureArrayItemShell, props),
},
```

Anonymous configuration arrays omit `renderShell` and keep the default ArrayItem
shell. Do not invent fake entity summaries for those rows.

## `min` / `max` and add/remove

| Prop                                | Behavior                                                                |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `min`                               | Legend required marker when `min >= 1`; Zod `.min()` enforces on submit |
| `max`                               | Hides add when at ceiling                                               |
| `hideAddAction`                     | Omit default add — use external slot                                    |
| `hideItemRemove` + `itemRemoveSlot` | Custom remove in header rail                                            |

Pair `min`/`max` with matching Zod array constraints so submit validation and chrome
stay aligned. When the list is empty, the renderer shows a neutral panel:
`No {itemLabel} added.` Container min violations surface through the normal field-error
path (e.g. `Add at least one {itemLabel}.`) below the panel on failed submit — not
inside the empty-state panel.

## `addAction.relationship` — picker-driven collections

Grant-style relationship authoring uses `kind: 'array'` with `addAction.relationship`
instead of a separate `type: 'relationship'` field or dashboard-only intercept slots.
`SchemaFormShell` scans the field tree, mounts `RelationshipArrayPickerHost`, and wires
add clicks to the vocabulary adapter registered on `RelationshipFieldProvider`.

```ts
defineArrayField({
  kind: 'array',
  name: 'organizations',
  legend: 'Organizations',
  addAction: {
    label: 'Add organization',
    layout: 'inline',
    relationship: {
      vocabulary: 'character_organization_membership',
      cardinality: 'many',
    },
  },
  item: {
    collapsible: true,
    reorder: false,
    renderShell: (props) => createElement(EntityDisclosureArrayItemShell, props),
  },
  fields: [],
})
```

| Prop                              | Notes                                                                  |
| --------------------------------- | ---------------------------------------------------------------------- |
| `relationship.vocabulary`         | Registry key on `RelationshipFieldProvider`                            |
| `relationship.cardinality: 'one'` | Replaces the array on add instead of appending (e.g. single residence) |
| `addAction.intercept`             | Legacy override for non-relationship custom add flows                  |

Wrap the form in `RelationshipFieldProvider` with adapters that implement
`createEdge` and `renderPicker`. Row presentation stays on `item.renderShell`; the host
only owns picker lifecycle and RHF `append` / `replace`.

## `addActionMenu`

Replace the plain add button with a searchable template dropdown. Each item supplies
`appendDefaults` (object or factory) and optional `duplicatePolicy` (`allow` | `warn` |
`block`).

Use for grant type pickers, preset rows, or any typed append where authors should not
start from an empty object. Prefer explicit `appendDefaults` over per-field
`defaultValue` when only the first row should be pre-filled — see
**`appendDefaults` vs form `defaultValues`** above.

## Nested arrays

`fields` may contain nested `kind: 'array'` items. Names cascade:
`root.0.sub.1.field`. Prefer at most two levels for UX; nested arrays default to
compact unless `itemVariant: 'detailed'` is set on the inner array.

## `filterSelect` — cross-row select options

Disable (or transform) options based on sibling row values. Wired through
`ArrayFieldContext` into select renderers inside array items.

```ts
import { disableOptionsUsedInSiblingRows } from '@rpg/ui/form'

filterSelect: {
  dependsOn: ['rulesetId'], // optional — when filter reads watched form values
  filter: disableOptionsUsedInSiblingRows({ fieldName: 'mode' }),
},
```

`disableOptionsUsedInSiblingRows` composes with upstream `option.disabled` /
`disabledReason` — it never re-enables an option disabled for another reason.
Disabled options show a panel reason (default: `Already used`). The current row's
selected value stays enabled even when duplicated elsewhere (schema validation
is still the backstop).

For custom logic, pass a raw `ArrayFilterSelectFn` instead of the helper.

## `resolveCanAppend` vs `max`

| Knob               | Role                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `max`              | Hard safety cap on row count (dirty/legacy duplicate rows can hit max before every enum value is used). |
| `resolveCanAppend` | Domain saturation — e.g. every movement mode already has a row with a selected value.                   |

When append is blocked, the add control stays **visible and disabled** with an
accessible reason (`title` + sr-only description) — it is not hidden.

```ts
resolveCanAppend: (items) => {
  const used = new Set(items.map((row) => row.mode).filter(Boolean))
  return used.size >= ALL_MODES.length
    ? { enabled: false, reason: 'All movement modes have been added.' }
    : { enabled: true }
},
```

## `appendDefaults` vs form `defaultValues`

| Source               | When it applies                                   |
| -------------------- | ------------------------------------------------- |
| Form `defaultValues` | Initial row(s) on create/edit load only.          |
| `appendDefaults`     | Every **Add** action — typically empty sentinels. |

Unset select state follows `fieldDefaultValue` / `TYPE_DEFAULTS` (required
select → `''`; optional single-select → `undefined`). Do not hand-author
feature-specific empty strings when the form layer already defines the sentinel.

Example — first create row Walk 30 via form defaults; appended rows start empty:

```ts
defaultValues: { movement: [{ mode: 'walk', feet: 30 }] },
appendDefaults: () => ({ mode: '', feet: undefined }),
// omit defaultValue on array item field configs
```

`dependsOn` / `visibleWhen` on **item** fields use item-relative names. Prefix with `../`
to watch a parent path segment; use multiple hops for grandparent-row siblings — e.g. grant
rows under `features.0.grants.0` can use `dependsOn: ['../../level']` to react to
`features.0.level`.

## `arrayPattern`

Domain hooks for tier tables and custom focus navigation:

```ts
arrayPattern: {
  kind: 'levelRange',
  levelKeys: { min: 'minLevel', max: 'maxLevel' },
  getErrorFocusTarget: ({ issue, levelKeys }) =>
    issue.message.includes('cover levels') ? levelKeys?.max : levelKeys?.min,
},
```

## Presentation model

Array items resolve to **three structural anatomies**:

| Anatomy          | Meaning                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `flatNoHeader`   | No item header. Outer geometry is `grip \| content \| actions`.  |
| `flatWithHeader` | Visible item header, non-collapsible.                            |
| `disclosure`     | Collapsible disclosure. `collapsible: true` always selects this. |

`contentLayout: 'inline' \| 'stacked'` is a **body-layout** detail inside the content column,
derived from normalized field groups — not from whether authors wrapped a leaf in `kind: 'row'`.

| Normalized shape                                | `contentLayout` |
| ----------------------------------------------- | --------------- |
| Single leaf field (`text`, `inlineSentence`, …) | `inline`        |
| Single `kind: 'row'` of leaf fields             | `inline`        |
| Multiple top-level fields                       | `stacked`       |

**Compact inline chrome:** when `contentLayout` resolves to `inline`, field participants and
grip/actions share one `ArrayItemAnatomyGrid` — label and validation may grow in their tracks
without moving drag/remove chrome off the control track. No author alignment knob is required.

**Field label vs item label:** per-field `label` on `text`, `inlineSentence`, etc. controls field
chrome only. Item headers come from `item.header`, `headerVisibility`, and disclosure — not from
field declaration shape.

## Invalid combinations (dev-validated)

The form library logs dev warnings for:

| Config                                                              | Why                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| `collapsible: true` + `variant: 'compact'`                          | Collapsible items render as disclosure — omit compact. |
| `headerVisibility: 'hidden'` + `collapsible: true`                  | Disclosure requires header anatomy (auto-normalized).  |
| `header.primaryField` + `headerVisibility: 'hidden'` on inline rows | primaryField does not show a header on inline items.   |

Do **not** wrap fields in `kind: 'row'` solely to get inline item chrome — normalization already
treats bare leaves and row wraps equivalently.

## Observed misconfigurations (dashboard audit)

| Location                          | Issue                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `species-movement-form-fields.ts` | `primaryField` with `headerVisibility: 'hidden'` — primaryField is inert for inline rows; keep for aria/remove copy only. |

## Common mistakes

1. **Absolute names in item `fields`** — use `name: 'label'`, not `traits.0.label`.
2. **Missing `fallback`** — required on every `itemHeader`.
3. **`itemCollapsible` + explicit `itemVariant: 'compact'`** — dev warning; collapsible wins as disclosure.
4. **Replacing `item` when spreading builders** — merge (`item: { ...built.item, … }`) instead of
   overwriting; a bare `item: { surface: … }` drops collapsible/header config.
5. **Zod mismatch** — hidden item fields need `z.optional()`; `min`/`max` should mirror schema.
6. **Empty `legend` without parent label** — omit legend only when a parent stack/group
   already labels the block (see [containers.md](./containers.md#array-fields)).
7. **Resolver `.omit` in nested items** — works on top-level keys only, not inside array items.
8. **Row wrapper for chrome** — use `kind: 'row'` only when fields should share a horizontal row,
   not to pass inline-eligibility gates.

## Related

- [containers.md — Array fields](./containers.md#array-fields)
- [forms.md — Authoring helpers](../forms.md#authoring-helpers)
- `buildItemDefaultValues` — seed new rows from `fields` config
