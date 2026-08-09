# Location hierarchy

Parent/child placement for locations is defined once in `@rpg/contracts`
[`LOCATION_KIND_DEFINITIONS`](../../../packages/contracts/src/rpg/content/location/hierarchy.ts).
All create, move, bulk, and parent-picker surfaces derive eligibility from that SSOT.

## Shape

```text
Settlement
└─ District
   └─ place locations (structure, site, …)
```

- **Settlement may parent District** — districts are direct children of settlements.
- **District may not parent District** — nested districts are invalid on publish-complete
  writes.
- **District may parent eligible place kinds** — structures, sites, and other kinds whose
  `allowedParents` include `district`.

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
