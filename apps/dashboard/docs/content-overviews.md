# Content overviews

Campaign content overview tables share a two-line name cell, filter framework,
and manager utility row.

## Name cell layout

```text
Line 1: Content Name [draft badge]
Line 2: Edit · Duplicate (managers)     [manager access metadata]
```

- Line 1 links to the **detail/read** route (`nameHref`), not edit.
- Managers always reserve line 2 height (`min-h-4`, `text-xs leading-4`) even when
  access metadata is empty (`all_players` + available).
- Players render line 1 only for ordinary visibility. Limited-visibility metadata on line 2
  appears for specifically granted content when `specific_players` is enabled (Track A A4).
- `filter-catalog-rows-for-viewer.ts` applies discovery policy defense-in-depth before
  overview filters render.

**Accepted member, no controlled PC yet:** `buildContentViewerFromCampaignContext`
resolves such members to `{ kind: 'none' }`. They see `all_players` content but
not `dm_only` or `specific_players` grants until onboarding completes and a
character id enters `participantIds`. See
`apps/api/docs/campaign-access-enforcement.md`.

## Table utility bar

`ContentOverviewTable` composes `OverviewTableFrame` with `DataTableUtilityBar` inside the
table card — row 1 for result context, row 2 for selection and column controls.

| Row | Content                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------- |
| 1   | Plain `N results` via `OverviewResultSummary`; optional hidden-unavailable supplement (`5 hidden · Show`) |
| 2   | **Select** / selection cluster (managers) and compact column visibility (`Choose visible columns`)        |

- Result count reflects rows after all filters (including campaign availability).
- Hidden-unavailable supplement uses filter-scoped counts from `deriveCampaignAvailabilityScope`
  against rows matching primary + additional filters — not the global catalog total.
- Supplement copy: `5 hidden · Show` when availability is **Available**; `5 unavailable shown · Hide`
  when **All**; omitted when **Unavailable** is selected.

Shared modules: `overview-result-summary.client.tsx`, `overview-selection-cluster.client.tsx`.

## Selection mode (managers)

Managers opt into selection mode via **Select** in the utility bar row 2.

| State                    | Bar behavior                               |
| ------------------------ | ------------------------------------------ |
| Browsing                 | Result summary row + **Select** + columns  |
| Selection, none selected | `0 selected` + **Select page** + **Done**  |
| Selection, rows selected | `N selected` + **Bulk actions** + **Done** |

- Selection persists across pagination; header checkbox and **Select page** share the same page-scoped operation.
- Cap: `CONTENT_OVERVIEW_BULK_SELECTION_LIMIT` (50) — relabels to **Select N** when the page exceeds remaining capacity.
- **Done** clears selection, exits mode, and returns focus to **Select**.
- Bulk actions menu: **Edit campaign availability** on all content types; **Change parent
  location** on locations only. Each action opens its own dialog via `bulkExtensions[]`.
- Selection state is shared across bulk dialogs via `useContentOverviewBulkSelection` — dialog
  open/close and apply callbacks stay per extension.

Modules: `use-content-overview-selection.ts`, `use-content-overview-bulk-selection.ts`,
`content-bulk-actions-menu.client.tsx`, `content-overview-table.client.tsx` (`bulkExtensions`).

### Bulk actions

| Action                     | Content types                                                   | Dialog module                    |
| -------------------------- | --------------------------------------------------------------- | -------------------------------- |
| Edit campaign availability | Supported content types (`supportsContentBulkCampaignAccess()`) | `BulkCampaignAccessDialog`       |
| Change parent location     | Locations                                                       | `BulkChangeParentLocationDialog` |

Both follow the unified action lifecycle documented in [actions.md](./actions.md). After apply,
only **updated** targets leave selection; blocked targets remain selected for retry.

**Locations hierarchy graph:** parent-assignment validation builds a graph from the overview
`data` prop (full manager-visible campaign list from `useLocations`). Do not use table-filtered
`visibleRows` — see `build-location-hierarchy-graph.ts`.

## Components

| Module                                        | Role                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `overview-result-summary.client.tsx`          | Shared result count + supplemental disclosure        |
| `overview-selection-cluster.client.tsx`       | Browse Select trigger and selection-mode actions     |
| `content-bulk-actions-menu.client.tsx`        | Bulk actions dropdown (availability + extensions)    |
| `use-content-overview-selection.ts`           | Selection mode state, cap, filter pruning            |
| `use-content-overview-bulk-selection.ts`      | Shared selection for multiple bulk dialogs           |
| `content-overview-table.client.tsx`           | `bulkExtensions[]` wiring and apply-complete handler |
| `content-overview-availability-ui.lib.tsx`    | Hidden-unavailable supplement and empty-state CTA    |
| `content-overview-name-cell.client.tsx`       | Composes both lines                                  |
| `content-overview-utility-actions.client.tsx` | Manager `Edit · Duplicate` actions                   |
| `content-access-metadata.client.tsx`          | Manager and player campaign-access metadata          |
| `filter-catalog-rows-for-viewer.ts`           | Discovery filter helper (defense-in-depth)           |
| `use-content-viewer.ts`                       | Membership → `ContentViewer` hook                    |
| `content-table-config.tsx`                    | Shared `buildContentColumns` name column             |
| `content-overview-columns.client.ts`          | Injects `canManage` + `getEditHref` into name column |

## Row actions

The ellipsis overflow menu keeps campaign availability toggle only — **Edit** lives on the name-cell utility row (line 2).

## Related

- Non-content catalog lists (`CatalogOverviewTable`, collection summary cells):
  [catalog-overview-tables.md](./catalog-overview-tables.md)
- Campaign access enforcement ADR: `apps/api/docs/campaign-access-enforcement.md`
- Campaign access form UX: `lib/campaign-access/README.md`
