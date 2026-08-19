# Location hierarchy

Parent/child placement for locations is defined once in `@rpg/contracts`
[`LOCATION_KIND_DEFINITIONS`](../../../packages/contracts/src/rpg/content/location/hierarchy.ts).
All create, move, bulk, and parent-picker surfaces derive eligibility from that SSOT.

## Shape

```text
World
├─ Region
│  ├─ Region (Subregion — derived UI role only)
│  └─ Settlement / Site / …
├─ Settlement / Site / … (direct)
Settlement
├─ District
│  └─ place locations (structure, site, …)
└─ Direct locations (structure, site, …)
```

- **Settlement may parent District** — districts are direct children of settlements.
- **District may not parent District** — nested districts are invalid on publish-complete
  writes.
- **District may parent eligible place kinds** — structures, sites, and other kinds whose
  `allowedParents` include `district`.
- **Settlement may also parent place kinds directly** — “Direct locations” in City structure.
- **Region may parent Region** — nested regions remain `kind: 'region'`. UI copy uses
  **Subregion** when the parent is a Region (derived relationship label only).

## Location structure authoring

Detail children render through one **Location → Structure** panel
(`LocationChildrenSection` + `buildLocationChildrenViewModel`). Grouping is owned by
structure profiles in `location-structure.lib.ts`:

```text
World structure
├─ Regions (+ Add region)
│  └─ expandable region rows (maxInlineDepth: 2)
└─ Direct locations (+ Add location)

Region structure
├─ Subregions (+ Add subregion)
│  └─ expandable region rows (maxInlineDepth: 2)
└─ Direct locations (+ Add location)

City structure
├─ Districts (+ Add district)
│  └─ expandable district rows (maxInlineDepth: 1)
└─ Direct locations (+ Add location)
```

`maxInlineDepth: 2` means two nested row levels below the current detail surface may show
a disclosure chevron. At the cap, rows still show immediate-child counts but no chevron —
navigate to that location’s Structure panel for deeper hierarchy.

### Counts

Immediate children only. Expandable region rows split counts:

- `N subregion(s)` — immediate children with `kind === 'region'` (noun depends on parent
  context: Subregion under Region, Region under World)
- `N location(s)` — immediate non-region children

`2 subregions · 3 locations` means five immediate children (2 + 3).

### Create setup

Settlement, Region, and Site use the shared setup gate
(`LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP`) before the full create form. Building uses the same
setup model inside `LocationCreateModal` (sequential Form → Facility with explicit skip on optional
Form). Detail Add location runs setup inside `LocationCreateModal` with **auto-advance** on the final
selection (no setup Continue on first pass). Overview/page create uses
`LocationCreateSetupHost` → `LocationCreateSetupSession` with the same choice sets but an **explicit
Continue** navigation boundary (radio selection alone does not navigate). Both consume
`resolveLocationCreateModalSetupModel` / `applyLocationCreateModalSetupValueChange` for
choice-set ids, `dependsOn`, `visibleWhenComplete`, `summaryGroup`, and complete. URL resume params
(`settlementType`, `siteType`, `regionClassificationKind` + `regionType`) share the
same shortcut contract.

Building → Organizations relationship drafting stays on the Add/Pending composer (not
`CreateSetupPanel`) but uses the same create-modal grammar: active controls for in-progress
decisions, `SelectionSummaryCard` rows for completed ones. The `branch` stage is the active
create-org control — not a placeholder completed organization row. Copy these primitives for
a second create-modal draft relationship tab; do not extract a generic composer until a second
identical consumer exists.

Orchestration lives in `@/lib/create-setup`; see `apps/dashboard/src/lib/create-setup/README.md`.

Both subgroup actions derive from one `childAuthoringTypesForParentKind` result, projected
by `resolveStructureChildAuthoringOptions`.

The panel heading uses `` `${resolveLocationStructureHeadingNoun(location)} structure` ``
from contracts display projection.

## Parent mutation ownership

Changing a location’s parent updates **only** that child’s `parentLocationId`. Hierarchy
mutations never write to the destination parent document or denormalized children arrays.

Canonical write:

```http
PATCH /api/campaigns/:campaignId/content/locations/:subjectId
{ "kind": "<subjectKind>", "parentLocationId": "<destinationParentId>" }
```

Structure **Move** binds the row’s child `item.id` as `:subjectId`.

## Validation

Non-draft writes merge the existing record with PATCH input, then revalidate the merged
parent assignment. A published district whose parent is another district fails hierarchy
validation (`invalid_parent_kind`) until reparented to a settlement — use Structure **Move**
or Change parent. Detail edit chrome may still open; publish-complete hierarchy writes are
what the API rejects.

Draft writes skip hierarchy validation — incomplete/rootless draft districts remain
allowed until publish.

## Cache convergence

All successful hierarchy mutations (single move, parent replacement, bulk change parent)
invalidate the shared campaign locations list query after apply. Bulk actions may
optimistically patch the list for responsiveness, but always revalidate afterward.
