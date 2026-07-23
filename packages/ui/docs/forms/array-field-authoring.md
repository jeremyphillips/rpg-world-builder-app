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

| Goal                                              | `itemVariant`       | `item.surface` / `item.tone`                                    | `itemCollapsible`     |
| ------------------------------------------------- | ------------------- | --------------------------------------------------------------- | --------------------- |
| Single inline control per row (tags, simple refs) | `auto` or `compact` | `{ elevation: 'raised' }` (default) or `{ emphasis: 'subtle' }` | omit / `false`        |
| Multi-field block with header toolbar             | `detailed`          | raised, subtle, or semantic `tone`                              | `true` for long forms |
| Nested array inside another item                  | `auto` → compact    | match parent or subtle wash                                     | usually `false`       |
| Grant-style picker rows                           | `detailed`          | `{ elevation: 'raised' }`                                       | `true`                |

`itemCollapsible` applies to **detailed** items only — ignored for compact/nested
auto-compact rows.

`item.surface` uses `SurfaceConfig` (`emphasis`, `elevation`). Optional `item.tone`
applies a semantic wash (`info` | `success` | `warning` | `destructive`). Default surface:
`{ elevation: 'raised' }`.

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

`dependsOn` / `visibleWhen` on **item** fields use item-relative names.

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
3. **`itemCollapsible` on compact rows** — has no effect; switch to `itemVariant: 'detailed'`.
4. **Zod mismatch** — hidden item fields need `z.optional()`; `min`/`max` should mirror schema.
5. **Empty `legend` without parent label** — omit legend only when a parent stack/group
   already labels the block (see [containers.md](./containers.md#array-fields)).
6. **Resolver `.omit` in nested items** — works on top-level keys only, not inside array items.

## Related

- [containers.md — Array fields](./containers.md#array-fields)
- [forms.md — Authoring helpers](../forms.md#authoring-helpers)
- `buildItemDefaultValues` — seed new rows from `fields` config
