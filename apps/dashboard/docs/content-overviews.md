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
  appears for specifically granted content after Track A A4 enables
  `CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED`.
- `filter-catalog-rows-for-viewer.ts` applies discovery policy defense-in-depth before
  overview filters render.

## Components

| Module                                        | Role                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `content-overview-name-cell.client.tsx`       | Composes both lines                                  |
| `content-overview-utility-actions.client.tsx` | Manager `Edit · Duplicate` actions                   |
| `content-access-metadata.client.tsx`          | Manager and player campaign-access metadata          |
| `filter-catalog-rows-for-viewer.ts`           | Discovery filter helper (defense-in-depth)           |
| `use-content-viewer.ts`                       | Membership → `ContentViewer` hook                    |
| `content-table-config.tsx`                    | Shared `buildContentColumns` name column             |
| `content-overview-columns.client.ts`          | Injects `canManage` + `getEditHref` into name column |

## Row actions transition

The ellipsis overflow menu keeps **Edit** as a fallback during the utility-row rollout.
Availability toggle, publish/demote, and delete remain in overflow.

## Related

- Campaign access enforcement ADR: `apps/api/docs/campaign-access-enforcement.md`
- Campaign access form UX: `lib/campaign-access/README.md`
