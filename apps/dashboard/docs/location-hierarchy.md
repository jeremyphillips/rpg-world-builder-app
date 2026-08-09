# Location hierarchy

Parent/child placement for locations is defined once in `@rpg/contracts`
[`LOCATION_KIND_DEFINITIONS`](../../../packages/contracts/src/rpg/content/location/hierarchy.ts).
All create, move, bulk, and parent-picker surfaces derive eligibility from that SSOT.

## Shape

```text
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

## City structure authoring

When a detail section partitions children into structural groups, creation actions belong to
the group that owns the destination — not a generic panel-level action.

```text
City structure
├─ Districts
│  ├─ + Add district          → create District under this Settlement
│  └─ District row +          → Add location inside that District
└─ Direct locations
   └─ + Add location          → non-District child under this Settlement
```

Both subgroup actions derive from one `childAuthoringTypesForParentKind(settlement)` result,
projected by `resolveSettlementStructureChildAuthoringOptions`:

- **District** → Add district (when eligible)
- **everything else eligible** → Direct locations Add location menu

Direct-location choices are that projection with District removed — not a separate hierarchy
taxonomy. District is the only structural subdivision type requiring special UI treatment.

The panel heading/helper stay informational. Flat **Contained locations** (non-settlement
parents) still use a panel `headerEndSlot` Add location menu.

## Parent mutation ownership

Changing a location’s parent updates **only** that child’s `parentLocationId`. Hierarchy
mutations never write to the destination parent document or denormalized children arrays.

Canonical write:

```http
PATCH /api/campaigns/:campaignId/content/locations/:subjectId
{ "kind": "<subjectKind>", "parentLocationId": "<destinationParentId>" }
```

City structure **Move** binds the row’s child `item.id` as `:subjectId`.

## Validation

Non-draft writes merge the existing record with PATCH input, then revalidate the merged
parent assignment. A published district whose parent is another district becomes
**uneditable** until reparented to a settlement (`invalid_parent_kind`).

Draft writes skip hierarchy validation — incomplete/rootless draft districts remain
allowed until publish.

## Cache convergence

All successful hierarchy mutations (single move, parent replacement, bulk change parent)
invalidate the shared campaign locations list query after apply. Bulk actions may
optimistically patch the list for responsiveness, but always revalidate afterward.
