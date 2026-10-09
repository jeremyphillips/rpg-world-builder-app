# Filters in `@rpg/ui`

Shared filter runtime for content overviews (Milestone 1) and later catalog pickers
(Milestone 2). The engine is framework-agnostic; React hooks and renderers sit on top.

```text
FilterSchema  →  filter-engine.ts (pure)  →  apply / constraining / modified
              →  filter-persistence.ts    →  URL codecs (filters only)
              →  useFilterState           →  FilterBar / FilterAdvancedPanel
```

**Boundary rules**

- Engine: no React, no hooks, no renderers, no pagination/sort knowledge.
- Field defs carry `placement` (`primary` | `advanced`) only — not catalog layout.
- Column definitions stay in table column schema; filter predicates stay in filter schema.
- Result-query state and presentation preferences are **separate hydration tracks**.
- `@rpg/ui` owns filter URL metadata + codecs; dashboard overview layer composes
  filters with sort and page.
- DataTable owns tabular rendering, sorting, pagination, selection, columns — **not**
  filter orchestration. Overview shells compose `DataTableFilterRegion` (or `FilterBar`
  alone when there are no additional fields) outside the table and pass **filtered rows**
  into DataTable.
- Share option vocab with form field builders where practical; filter authoring is
  `FilterSchema`, not `FormItem[]`.

Implementation lives under [`src/filters/`](../src/filters/). Import from `@rpg/ui/filters`.

---

## State shape

```ts
type FilterState = {
  source?: SourceId
  status?: ContentStatus
  campaignAvailability?: CampaignAvailabilityFilter
}
```

**Rules**

- Absent key and `undefined` are equivalent (inactive in engine terms).
- Renderers may use internal sentinel strings (`__all__`, `__any__`); sentinels never
  leave the renderer.
- `defaultValue` on a field is not necessarily “inactive” — a default can still
  constrain rows.
- Milestone 1 values are primitives (`string` | `boolean`). `isValueEqual` exists so
  Milestone 2 arrays/chips do not force an API break.

There is **no** `initialState` on the schema. Defaults come from field `defaultValue`s.
Consumers override via hydration:

```ts
useFilterState(schema, { initialValues: filtersFromUrl })
```

### Schema stability

Filter schemas **must** be module-stable or memoized — not recreated inline each render.
Sanitization hooks key on schema reference; unstable per-render identity causes redundant
sanitization passes.

### Sanitization lifecycle

| API                                                         | Use case                                    |
| ----------------------------------------------------------- | ------------------------------------------- |
| `useFilterState(schema, { sanitizeOnSchemaChange: true })`  | Uncontrolled local state                    |
| `useSanitizedFilterState({ schema, state, onStateChange })` | Controlled consumers (pickers, detail tabs) |

Rules:

1. `sanitizeFilterState` returns the **same state object reference** when nothing changed.
2. Hooks compare sanitized vs current state before dispatching.
3. Schema-change sanitization must **not** call `onStateChange` repeatedly for equivalent state.
4. Trigger on schema **revision** (stable memo / module constant), not unstable per-render identity.

Do not add per-consumer `useEffect` sanitization — use the hooks above.

---

## Constraining vs modified vs effective

Three distinct concepts — do not collapse them into a single “active” flag:

| Function                                     | Meaning                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `getEffectiveFilterValue(schema, state, id)` | Value used for filtering (falls back to `defaultValue`)                                          |
| `isFilterConstraining(schema, state, id)`    | Field currently narrows the dataset — via `isValueConstraining` (default: `value !== undefined`) |
| `isFilterModified(schema, state, id)`        | Effective value differs from schema default via `isValueEqual` (default: `Object.is`)            |

**Example:** `campaignAvailability` with `defaultValue: 'available'` and
`isValueConstraining: (v) => v !== 'all'` is **constraining** for `available` /
`unavailable` but **not modified** until the user leaves the default.

Use constraining for “is this filter affecting results?” (badges that mean narrowed
dataset). Use modified for “differs from product default?” (advanced-panel badge,
clear-filters affordances).

---

## Engine `matches` rules

- The engine **skips** `matches` when the effective value is `undefined`.
- Predicates only receive active effective values (`NonNullable<TState[TId]>`).
- Predicates stay simple: `(row, value) => row.status === value`.

Milestone 1 field types: `text` | `select` | `boolean` only.

**Placement defaults:** `text` / `select` → `primary`; `boolean` → `advanced`.

Every field owns `matches` — there is no `columnKey` bridge to table columns.

---

## Clear filters vs reset view

| Action            | Restores                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Clear filters** | Result filters → schema defaults. Does **not** touch columns, page size, density, or advanced-panel open state. |
| **Reset view**    | Presentation preferences too: columns, column order, page size, density, advanced-panel state.                  |

Do not make “Clear filters” unexpectedly reset the user’s columns.

Engine API for clear: `resetFilterState(schema)` → schema defaults.

---

## Dual hydration tracks

Result filters and presentation preferences do **not** compete for the same keys:

```text
Result-query state:     URL → schema defaults
Presentation state:     local storage → presentation defaults
```

Then compose:

```ts
type ContentOverviewModel<TFilters> = {
  query: ContentOverviewQueryState<TFilters>
  preferences: ContentOverviewPreferences
}
```

**Rule of thumb:** URLs preserve intent. Local storage preserves workspace
preferences. Defaults preserve product behavior.

A local-storage column preference must never fill a missing filter value.

### Overview query model (filters ≠ sort ≠ page)

Keep sort/page outside the filter schema and outside `filter-persistence.ts`:

```ts
type ContentOverviewQueryState<TFilters> = {
  filters: TFilters
  sort?: ContentSort
  page: number
}
```

| Concern                                                | Owner                                         |
| ------------------------------------------------------ | --------------------------------------------- |
| Filter field URL metadata + codecs                     | `@rpg/ui` → `filter-persistence.ts`           |
| Compose filters + sort + page; router sync; page reset | dashboard → `content-overview-query-state.ts` |

Page reset lives in the overview query orchestrator, **not** the filter hook:

```ts
const setFilterValue = (id, value) => {
  filters.setValue(id, value)
  setPage(1)
}
```

Reset page on result-changing changes: search, source, status, availability,
content-specific filters, sort. Do **not** reset page for column visibility or
advanced-panel open state. Omit `page=1` from the URL.

---

## Persistence policy

### URL (result-query)

- search text, status, source, campaign availability, content-specific filters
- sort, page (composed by the dashboard overview layer)

**Omit defaults** from the URL. Prefer `/classes` over `/classes?availability=available`.

### Local storage (presentation)

One versioned object per overview type:

```ts
type ContentOverviewPreferences = {
  version: 2
  columnVisibility?: VisibilityState
  columnOrder?: string[]
  pageSize?: number
  density?: DataTableDensity
  advancedOpen?: boolean
}
```

Key shape: `rpg:overview:v2:classes`, `rpg:overview:v2:spells`, …

**Advanced panel openness is per overview type.** Remember the user’s explicit
open/closed preference. Do **not** force the panel open when advanced filters are
modified or when the URL activates advanced fields — show a modified-filter count
while collapsed.

### Never automatically persisted

- search history, hidden unavailable count, row selection, open popovers,
  temporary bulk-action state
- result filters in local storage (including campaign availability)

### Campaign availability

URL only. Always return to `Available` unless the URL explicitly says otherwise.
Never local storage.

### Search

- Debounce into URL (250–400 ms); not local storage.
- Clear when navigating to a different content type unless explicitly carried over.
- Trim before writing; whitespace-only → unset.
- Debounce URL writing, **not** local filtering (immediate local filter feels better).

### History strategy

- **`replace`** for search text and ordinary filter/sort/page edits from controls.
- **`push`** only for intentionally navigational quick views (e.g. notice links like
  “Draft (4)” or “Show unavailable”).
- Default: filter controls replace; navigation-style summary links push.

### Invalid URL values

Example: `/classes?availability=garbage`

1. Discard the invalid value.
2. Fall back to schema default (`available`).
3. Optionally `replace` the URL to strip the bad param.

Do **not** treat an invalid explicit parameter as “unset” if unset differs from the
default.

### Hydration vs change normalization

| Concept                    | Role                                                        |
| -------------------------- | ----------------------------------------------------------- |
| **Sanitization** (hydrate) | Reject unknown IDs / invalid values from URL input          |
| **Normalization** (change) | Resolve valid inter-field dependencies after a field update |

Milestone 1 only needs field-level parsing and option validation. Do **not** call a
change-oriented `normalize()` during URL parse with a fabricated `changedId`.

`sanitizeState` / `normalizeChange` are Milestone 2 APIs when picker migrations need them.

### Filter persistence (`filter-persistence.ts`)

Filters only — not sort/page:

```ts
parseFilterSearchParams(schema, searchParams): Partial<TState>
serializeFilterSearchParams(schema, state): URLSearchParams
hydrateFilterState(schema, searchParams): TState
```

Built-in codecs: `text` (trim; whitespace-only → unset), `select` (option validation),
`boolean` (`true` / `false`). Invalid explicit URL values fall back to schema
`defaultValue` — not to “unset” when unset differs from the default. Defaults are
omitted from serialized URLs unless `url.omitDefault: false`.

### Hydration and router sync timing

Avoid flicker / sync loops:

1. Initialize state **synchronously** from current search params where the router permits.
2. Do **not** serialize back to the URL during the initial hydration pass.
3. Begin URL syncing only after initial state is established.
4. On browser back/forward: replace local query state without immediately generating
   another navigation.

### Unknown column behavior (presentation layer)

On preference hydrate:

- discard unknown column IDs
- append newly introduced columns in schema order
- never let persisted state hide required action/name columns
- restore defaults if validation fails

Belongs in the presentation-preference layer, not the filter engine.

---

## Schema identity

- Schemas are **module-level constants** or memoized — not inline-created each render.
- Field IDs are stable persisted identifiers; changing an ID is a URL compatibility change.
- Query parameter names remain stable even if labels change.
- Prefer sharing option vocab with form field builders; do not redefine labels/options
  ad hoc when a shared source already exists.

---

## Helpers

`createTextFilter` owns text normalization so overviews do not reimplement trim/case:

- trim
- case folding (`toLocaleLowerCase`)
- empty-string → unset
- multi-field search via `getSearchText`

`createEqualsFilter` builds select-style equality filters from `getValue`.

Unicode normalization only if a concrete need appears.

---

## Performance bounds

- Suitable for current fully loaded overview datasets (client-side `applyFilterSchema`).
- Memoize by `data`, `schema`, and `state` at the composition boundary.
- Debounce URL writing, not local filtering, unless profiling requires it.
- Future server-paginated tables need query compilation rather than client predicates —
  out of scope for Milestone 1.

---

## Milestone 2 — catalog composition

Milestone 2 extends the same `FilterSchema` runtime for catalog pickers via separate
layout config — not extra `placement` values.

### Field types

- `chips` — `selectionMode: 'multiple' | 'single-required'`; optional `toChipValues` /
  `fromChipValues` for renderer/state mapping (e.g. level chips with `number[]` state).
- `popover` — one field id owns a record of group → `string[]`; composes `FilterPopover`.

Helpers: `createChipsFilter`, `createPopoverFilter`, `shallowArrayEqual`,
`popoverFiltersEqual`, `isPopoverFiltersConstraining`.

### Dependency hooks

```ts
sanitizeState?: (state: Partial<TState>, context?) => Partial<TState>
normalizeChange?: (next: TState, context: { changedId; previous }) => TState
```

**Lifecycle**

1. `setValue` → `normalizeChange` (once, non-recursive)
2. Mode/data hydrate → `sanitizeState` via `sanitizeFilterState`
3. Never `normalizeChange` on URL hydrate

### Catalog layout

```ts
type FilterCatalogLayoutConfig<TState> = {
  primaryFieldIds?: FilterFieldId<TState>[]
  filterRowFieldIds?: FilterFieldId<TState>[]
}
```

`CatalogFilterControls` composes onto `CatalogToolbar` slots (`primaryControls`, `filterRow`).
Sort, tabs, mode/workflow segmentation, and search scoring stay **outside** the schema.

### Catalog toolbar bands

Bands are placement. They do not change what counts as a content filter.

| Role            | What it is                                                                                                                                                       | Slot                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Content filters | Schema fields such as Equipment kind, Rarity, Affordable now, Levels, School, Casting & mechanics, character Type, Class, organization Domain, and location Type | `primaryControls` and `filterRow.controls` |
| View controls   | Sort and Reset                                                                                                                                                   | `filterRow.actions` and `actions`          |

School, Affordable now, Class, organization Domain, and location Type are content filters. They sit on the left of the utility band. Character Type is a primary content filter. Relationship drawers have no Sort, so Reset uses the no-sort accessible name and mounts only while it is visible.

```text
Search
Primary band     primaryControls — full width, fields wrap
Utility band     @container, flex-wrap, layout only
  content        filterRow.controls — omitted when empty
  view stack     column, end-aligned
    Sort         filterRow.actions
    Reset        actions
```

Content filters and the view stack share one line when they fit (`justify-between`, view stack at the end). When they do not, the view stack wraps as one unit, so Sort stays with Reset and does not sit between individual filters. The band follows its container width, not the viewport.

### Stable widths

A filter toolbar control may change width when its option set changes. It must not change width when its value changes.

`FilterToolbarLabelSizer` stacks the live value with invisible, `aria-hidden` copies of every reserved label in one grid cell. The control is as wide as its widest label.

- Selects reserve every option label plus the All label, through `SelectTrigger` `sizingLabels`.
- Sort reserves every `resolvePickerSortTriggerLabel` output.
- Popovers reserve `triggerLabel(0)` and `triggerLabel(totalOptionCount)`.

Width tokens stay caps (`max-w-*`). A label longer than the cap truncates, and the trigger `title` is the full label. Inline catalog selects with no token cap at `lg`. There is no per-control opt-out.

The reset row stays reserved whenever a utility band renders, including bands that have no Sort. `CatalogToolbarResetSlot` `reserve` defaults to `includesSort`.

Dependent fields render at the end of their content group and only while their parent value is selected. `sanitizeState` drops them when the parent changes. A boolean that leaves not-applicable rows visible is labeled "Hide X".

A picker has one Reset and no Clear filters. Every row-narrowing control belongs in the filter schema. Mode and workflow switches stay outside it. The reset row always shows the visible count as `N results` in a polite live region. `visible` is the count after tab, structured filters, and search. Sort does not change the count. Reset is separate toolbar chrome: it appears for narrowing criteria or a non-default sort, and a sort-only change still shows the full eligible count. `FilterToolbarLabelSizer` reserves every count from `0` through the eligible total so glyph width cannot change the row.

Overview `FilterBar` inside `DataTableFilterRegion` is a separate product: URL state, a More filters panel, and chip clear. Drawer reset restores search, filters, and sort. Shared pieces are the schema, `FilterFieldRenderer`, and filter density.

### Out of scope for catalog filters

- Sort modes (`CatalogSortControl`)
- Search / relevance scoring (`CatalogPickerSheet`)
- Recommendation tabs (`activeTabId`)
- Mode / workflow segmentation (`SegmentedControl`)
- URL persistence for pickers
- Per-mode browse buckets

### Array / sentinel semantics

| Pattern              | State                   | `isValueConstraining` |
| -------------------- | ----------------------- | --------------------- |
| Multi level chips    | `number[]`, `[]` = all  | `length > 0`          |
| Single-required chip | `'__all__' \| value`    | `v !== '__all__'`     |
| Popover mechanics    | `{ groupId: string[] }` | any group non-empty   |
| School select        | `'__all__' \| school`   | `v !== '__all__'`     |

---

## Renderers (Milestone 1)

Import from `@rpg/ui/filters`:

- `useFilterState` — local filter state with `setValue` and `reset` (clear filters)
- `FilterBar` — `placement: 'primary'` fields and optional **Clear filters** (advanced toggle owned by `DataTableFilterRegion`); `orientation: 'vertical'` stacks compact field rows without full-width controls by default
- `ActiveFilterChips` — data-only chip summaries with central `onClear(fieldId)` / optional `onClearAll` (shown when 2+ chips)
- `resolveActiveFilterChips(schema, state)` — derives chips from modified fields; boolean chips use natural copy (`Unread only`, not `Unread only: Yes`)
- `FilterAdvancedPanel` — configurable header for `placement: 'advanced'` fields; overview shells pass field content only — `DataTableFilterRegion` owns trigger, panel id, reset, and collapse
- `FilterInlineControl` — shared inline boolean shell (checkbox/switch) using outline row chrome to match adjacent selects and More filters
- `DataTableFilterRegion` — primary field row, full-height **More filters** trigger rail, and region-owned additional-filters panel

Select fields use an internal `__all__` sentinel for “show all”; it never leaves the renderer.

### Filter chrome

**Filter chrome** is inherited section-level presentation configuration (density, and
potentially rhythm/control treatment later). It does not include filter values, schema,
or behavior.

- `FilterChromeProvider` wraps filter sections. Omitted `density` inherits the parent
  provider; explicit `density` overrides.
- `useFilterChrome()` — strict hook for schema-owned components; defaults to compact
  outside a provider.
- `useOptionalFilterChrome()` — optional hook for general primitives (e.g.
  `CatalogFilterChips` chip size); returns `undefined` outside filter chrome.
- Field `layout` and `width` control per-field structure; section `density` controls
  control sizing via `resolveFilterFieldPresentation`.
- `FilterFieldRenderer` resolves control presentation on the schema-rendered path.
  Schemas pass `label` and layout intent. They do not pass caption classes.
- `resolveFilterFieldWidthClasses` is separate from density — width is layout
  allocation only.

**Filter captions are not form field labels.** Form labels identify an authored
input (`font-field-label`, foreground, required/help chrome). Filter captions
identify toolbar chrome: muted text, sized by filter density (`compact` →
`text-xs`, `comfortable` → `text-sm`). `FilterFieldCaption` is the only caption
renderer for select chrome, `CatalogFilterChips`, and catalog sort. It reads
`filterFieldLabelVariants` from filter chrome (or an explicit `density` prop).
`as="span"` is a group caption (`aria-labelledby` on chips; visible text inside
`role="group"` on inline selects and sort). `as="label"` with `htmlFor` is the
stacked-select association. Boolean checkbox text stays an inline control label
and still uses `presentation.labelClassName` plus interaction classes — that
path is not a caption. `presentation.labelClassName` is not a schema
customization point.

### Active chips in feature pages

Dashboard list surfaces compose `PrimaryFilterPanel` from
`apps/dashboard/src/lib/data-table/primary-filter-bar-region.tsx`:

```tsx
<PrimaryFilterPanel
  filterSchema={schema}
  filterState={filters}
  onValueChange={setFilterValue}
  clearFilterField={clearFilterField}
  resetFilters={resetFilters}
  orientation="vertical" // optional; default horizontal (inline) for notifications
/>
```

The panel wraps `DataTableFilterRegion` + `FilterBar` and mounts
`ActiveFilterChips` below when filters are modified. Chip remove calls
`clearFilterField(fieldId)`; **Clear all** (shown when 2+ chips) calls
`resetFilters`. Omit `FilterBar` `onReset` when chips are shown — the chip row
owns clear semantics. Campaign scope fields may set `activeChip: { include: false }`
when the select already communicates scope (Messages workspace).

### Shared field-row SSOT

Filter bars share control-band + control-edge alignment with forms. Ownership lives in
`@rpg/ui` field-layout modules — not under `filters/`. See
[sizing-and-spacing.md](./forms/sizing-and-spacing.md#control-band--row-alignment-ssot).

| Default               | Value                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Density → size        | `compact` → `sm`, `comfortable` → `md` (`resolveFilterControlSize`)                                                 |
| Primary bar alignment | `items-end` (control-edge) on `FilterBar`, field group, catalog controls, trailing actions                          |
| Common primary labels | Hidden (text search, default select chrome)                                                                         |
| Stacked labels        | Advanced panel selects and primary selects with `layout: 'stacked'` (e.g. Hit Die)                                  |
| Floating labels       | Opt-in `layout: 'floating'` on selects and text fields. See [floating-label-fields.md](./floating-label-fields.md). |
| Booleans              | Checkbox + label inside a single-line control band — **not** switches                                               |

`resolveFilterFieldPresentation` delegates band/size to `resolveFieldPresentation` and
maps filter `layout` (`default` → hidden, `stacked` → stacked, `inline` → inline,
`floating` → hidden). The floating composite owns the visible label, so the bar does
not add a second caption. Stacked selects always wire `label htmlFor` ↔ control `id`,
including when `width` is set.

Floating text fields use the label as the accessible name. `placeholder` is optional
guidance shown only while the field is focused and empty. There is no `Filter ${label}…`
default and no `aria-label`. Floating selects cap at `lg` when no width token is set,
the same default as inline selects. The label is an extra sizing ghost
(`withFloatingLabelSizingLabel`); value changes do not change the width. A floating
select on its all-value shows `All` in the trigger. Menu items keep `allOptionLabel`.

---

## Composition (overview shells)

```tsx
<OverviewTableFrame
  filterRegion={
    <DataTableFilterRegion
      primaryFilters={<FilterBar ... />}
      additionalFilterFields={<FilterFieldList ... />}
      additionalFiltersOpen={advancedOpen}
      onAdditionalFiltersOpenChange={setAdvancedOpen}
      activeAdditionalFilterCount={advancedModifiedCount}
      onResetAdditionalFilters={resetAdvanced}
    />
  }
  resultSummary={<ResultSummary visibleCount={filteredRows.length} />}
  leadingActions={...}
  trailingActions={...}
>
  <DataTable data={filteredRows} columns={columns} ... />
</OverviewTableFrame>
```

- The result count is `ResultSummary`: always `N results` for the rows currently shown.
- A visibility supplement is optional and domain-owned. Content overviews pass `resolveAvailabilitySummarySupplement`, which reads the unavailable count from rows matching the current search and other structured filters before the availability gate. Callers do not branch on mode. The line is `14 results · 1 unavailable · Show` while those rows are hidden, `15 results · 1 unavailable · Hide` while they are included, and `N results` when the count is zero or the mode is unavailable.
- DataTable receives only filtered rows.
- Advanced panel badge = `countModifiedFilters` (optionally scoped by `placement`).

Import catalog renderers from `@rpg/ui/filters`:

- `CatalogFilterControls` — root and `.Primary` render primary layout fields; `.FilterRow` renders filter-row fields
- `FilterFieldRenderer` / `FilterFieldList` — unified schema field renderers
- `CatalogFilterFieldList` — layout-driven field list for catalog controls
