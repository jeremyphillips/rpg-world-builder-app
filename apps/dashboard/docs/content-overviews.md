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

## Table utility strip

`ContentOverviewTable` passes a `utilityStrip` render prop to `DataTable`. The tinted strip sits directly above column headers.

| Region | Content                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Left   | Result count via `formatOverviewResultCount` (`filteredCount`, `availabilityScopedCount`, `totalCount`)                        |
| Right  | **Select** (managers; enabled in selection-mode build) and icon-only column visibility (`aria-label="Choose visible columns"`) |

- `filteredCount` — rows after all filters (including campaign availability).
- `availabilityScopedCount` — rows after filters except campaign availability (denominator for `8 of 24 results`).
- `totalCount` — rows after discovery policy (`filter-catalog-rows-for-viewer.ts`).

Module: `content-table-utility-strip.client.tsx`.

## Components

| Module                                        | Role                                                  |
| --------------------------------------------- | ----------------------------------------------------- |
| `content-table-utility-strip.client.tsx`      | Browsing-mode utility strip (result count + controls) |
| `format-overview-result-count.lib.ts`         | Result count copy helper                              |
| `content-overview-name-cell.client.tsx`       | Composes both lines                                   |
| `content-overview-utility-actions.client.tsx` | Manager `Edit · Duplicate` actions                    |
| `content-access-metadata.client.tsx`          | Manager and player campaign-access metadata           |
| `filter-catalog-rows-for-viewer.ts`           | Discovery filter helper (defense-in-depth)            |
| `use-content-viewer.ts`                       | Membership → `ContentViewer` hook                     |
| `content-table-config.tsx`                    | Shared `buildContentColumns` name column              |
| `content-overview-columns.client.ts`          | Injects `canManage` + `getEditHref` into name column  |

## Row actions

The ellipsis overflow menu keeps campaign availability toggle only — **Edit** lives on the name-cell utility row (line 2).

## Related

- Campaign access enforcement ADR: `apps/api/docs/campaign-access-enforcement.md`
- Campaign access form UX: `lib/campaign-access/README.md`
