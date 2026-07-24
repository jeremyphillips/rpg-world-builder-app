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
- Players render line 1 only until Track B B3 adds discovery filtering and limited-visibility
  metadata (specific grants after Track A A4).

## Components

| Module                                        | Role                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `content-overview-name-cell.client.tsx`       | Composes both lines                                  |
| `content-overview-utility-actions.client.tsx` | Manager `Edit · Duplicate` actions                   |
| `content-access-metadata.client.tsx`          | Manager campaign-access metadata                     |
| `content-table-config.tsx`                    | Shared `buildContentColumns` name column             |
| `content-overview-columns.client.ts`          | Injects `canManage` + `getEditHref` into name column |

## Row actions transition

The ellipsis overflow menu keeps **Edit** as a fallback during the utility-row rollout.
Availability toggle, publish/demote, and delete remain in overflow.

## Related

- Campaign access enforcement ADR: `apps/api/docs/campaign-access-enforcement.md`
- Campaign access form UX: `lib/campaign-access/README.md`
