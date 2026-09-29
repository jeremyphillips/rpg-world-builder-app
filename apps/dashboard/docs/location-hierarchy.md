# Location hierarchy

Parent/child placement for locations is defined once in `@rpg/contracts`
[`LOCATION_KIND_DEFINITIONS`](../../../packages/contracts/src/rpg/content/location/hierarchy.ts).
Add-child menus and the create-form parent combobox derive allowed parent/child kinds from
that SSOT (`childAuthoringTypesForParentKind`, `getAllowedParentKinds`). Create type pickers
also omit **`LOCATION_AUTHORING_TYPES_DEFERRED`** (currently Interior). Move, bulk, and other
parent-picker surfaces use the same hierarchy rules.

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
- **Site may not parent Site** — nested sites are invalid on publish-complete writes.
- **Interior authoring is deferred** — `kind: 'interior'` remains in contracts for existing
  records; new create menus omit it until hierarchy and classification widen. Contracts currently
  allow only an interior parent for interior kinds.
- **Parent field visibility** — the create-form parent combobox unmounts when
  `getParentRequirement` is `forbidden` (e.g. Plane) so stale `parentLocationId` values clear
  under `shouldUnregister`.

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

Overview and detail entry points use `LocationCreateModal` for setup. When the intent omits
`authoringType`, the modal prepends a **Location type** step, then type-specific choice sets
(building, settlement, site, region). Eligible types are discovered dynamically via
`resolveLocationCreateSetupAuthoringTypes()` (empty setup values must yield at least one choice set).

**Handoff mode** (`setupCompletion: 'handoff'`) navigates to the full create page with URL prefill
(including `buildingForm` / `facilityGroup` when applicable). **Details mode** keeps the name/details
step in the modal. The create page always renders the editable location type field; `?type=…` prefills
without a setup gate.

Setup choice sets share `resolveLocationCreateModalSetupModel` /
`applyLocationCreateModalSetupValueChange` for ids, `dependsOn`, `visibleWhenComplete`, and summary
groups. URL prefill params (`type`, `settlementType`, `siteType`, region classification, building form,
facility group) round-trip through `parseLocationCreatePrefillFromSearchParams` /
`buildLocationCreatePrefillHref`.

Building → Organizations relationship drafting stays on the Add/Pending composer
(not `CreateSetupPanel`) with a **resting vs composing** workspace: completed
decisions via `CreateCompositionSummary`, active controls for in-progress choices,
and a modal child footer while composing. The `branch` stage is the active
create-org control — not a placeholder completed organization row. Copy the
create-flow composition primitives for a second create-modal draft relationship
tab; see [create-flow.md](./create-flow.md#nested-composition-presentation).

Relationship-target nested create (organization forward → Building) suppresses the
Organizations composition surface via `ContentCreateContext` and
`resolveLocationCreateAuthoringCapabilities` — see
[`cross-content-relationship-ui.md`](./cross-content-relationship-ui.md).

Orchestration lives in `@/lib/create-setup`; see `apps/dashboard/src/lib/create-setup/README.md`.

Both subgroup actions derive from one `childAuthoringTypesForParentKind` result, projected
by `resolveStructureChildAuthoringOptions`.

Add-child menu rows use **`EntityActionChoiceMenu`** via `LocationAddChildMenu`. Helper copy
resolves as **parent+child override → child-type default** in
`location-authoring-option-description.lib.ts`. Tests exhaust every add-child type from
`childAuthoringTypesForParentKind` (contracts hierarchy minus deferred authoring types).

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
