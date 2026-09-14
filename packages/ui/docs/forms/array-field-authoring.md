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
| Multi-field block with header toolbar             | `detailed` or omit  | override only — default is subtle header + canvas body | `true` for long forms |
| Nested array inside another item                  | `auto` → compact    | match parent or omit                                   | `true` → detailed     |
| Grant-style entity rows                           | `detailed`          | use `item.renderShell` — not `item.surface` alone      | `true`                |

**Detailed collapsible items compose `CollapsibleListItem`** — the same header / summary /
body / actions slots as catalog picker rows. The header plane defaults to
`bg-surface-subtle`; the disclosure body bleeds to the shell edge on `bg-background` with
field content aligned via `--content-inline-start`.

**CollapsibleListItem rhythm contract** (form arrays, DEC, catalog — not `DetailEntityRow`):

- **Shared geometry:** header vertical padding (`density`: compact `py-2`, comfortable
  `py-3`), title→summary `gap-0.5`, body divider + `py-3` via `collapsibleListItemBodyFrameClasses`
- **Not shared:** typography metrics, horizontal inset systems, body surface tone
- **Invariant:** text anatomy never owns external vertical spacing (`pb-*` on summary/issue
  lines is forbidden); header rhythm does not change between collapsed and expanded state

`itemCollapsible: true` implies `itemVariant: 'detailed'` unless the author **explicitly**
sets `itemVariant: 'compact'` (collapsible is ignored on compact rows). Nested arrays with
`itemCollapsible: true` therefore keep disclosure chrome instead of silently auto-compacting.

`item.surface` is an **override** — default subtle header + canvas body need no `item.surface`.
Uses `SurfaceConfig` (`emphasis`, `elevation`). Optional `item.tone` applies a semantic wash
(`info` | `success` | `warning` | `destructive`).

When spreading an array builder, **merge** `item` — `item: { surface: … }` replaces the
whole config and drops `collapsible`, `variant`, `header`, and `reorder`.

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

| Prop                                | Behavior                                         |
| ----------------------------------- | ------------------------------------------------ |
| `min`                               | Hides remove at floor; Zod `.min()` should match |
| `max`                               | Hides add when at ceiling                        |
| `hideAddAction`                     | Omit default add — use external slot             |
| `hideItemRemove` + `itemRemoveSlot` | Custom remove in header rail                     |

Pair `min`/`max` with matching Zod array constraints so submit validation and chrome
stay aligned.

## `addActionMenu`

Replace the plain add button with a searchable template dropdown. Each item supplies
`appendDefaults` (object or factory) and optional `duplicatePolicy` (`allow` | `warn` |
`block`).

Use for grant type pickers, preset rows, or any typed append where authors should not
start from an empty object.

## Nested arrays

`fields` may contain nested `kind: 'array'` items. Names cascade:
`root.0.sub.1.field`. Prefer at most two levels for UX; nested arrays default to
compact unless `itemVariant: 'detailed'` is set on the inner array.

## `filterSelectOptions`

Cross-row deduplication inside an array (e.g. "each skill picked once"):

```ts
filterSelectDependsOn: ['rulesetId'],
filterSelectOptions: ({ arrayItems, rowIndex, fieldName, options, watchedValues }) =>
  options.filter(/* remove values selected in other rows */),
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

## Common mistakes

1. **Absolute names in item `fields`** — use `name: 'label'`, not `traits.0.label`.
2. **Missing `fallback`** — required on every `itemHeader`.
3. **`itemCollapsible` on compact rows** — has no effect when `itemVariant: 'compact'` is explicit.
4. **Replacing `item` when spreading builders** — merge (`item: { ...built.item, … }`) instead of
   overwriting; a bare `item: { surface: … }` drops collapsible/header config.
5. **Zod mismatch** — hidden item fields need `z.optional()`; `min`/`max` should mirror schema.
6. **Empty `legend` without parent label** — omit legend only when a parent stack/group
   already labels the block (see [containers.md](./containers.md#array-fields)).
7. **Resolver `.omit` in nested items** — works on top-level keys only, not inside array items.

## Related

- [containers.md — Array fields](./containers.md#array-fields)
- [forms.md — Authoring helpers](../forms.md#authoring-helpers)
- `buildItemDefaultValues` — seed new rows from `fields` config
