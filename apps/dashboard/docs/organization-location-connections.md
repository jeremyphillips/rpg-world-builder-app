# Organization location connections

Organization detail and location inverse drawers link organizations to locations through **`connections.locations`** on the organization document. Rules live in `@rpg/contracts` and are mirrored in dashboard picker/drawer eligibility.

## Connection families

Each connection kind belongs to one of three families. Every family takes an explicit
exclusivity stance in `ORGANIZATION_LOCATION_CONNECTION_FAMILY_POLICY` (`@rpg/contracts`):

| Family                  | Exclusivity policy | Meaning                                      | Example                                                                                              |
| ----------------------- | ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `site`                  | `one_per_kind`     | one per kind per organization + location     | `owns` + `headquarters` on the same building                                                         |
| `geographic_presence`   | `one_per_family`   | one per family per organization + location   | `operates_in` at most once per org                                                                   |
| `territorial_authority` | `per_kind_slots`   | no family rule — per-kind max-subject limits | `governs` and `controls` are singleton slots per location across orgs; `claims` allows multiple orgs |

Cross-family combinations remain allowed (for example `operates_in` + `governs` on the same region).

Cross-kind territorial combinations for the **same organization** are allowed (for example `governs` + `controls` + `claims` on the same region).

## Territorial authority slots

| Kind                              | Rule                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `governs`                         | At most **one organization per location** (campaign-wide) |
| `controls`                        | At most **one organization per location** (campaign-wide) |
| `claims`                          | Unlimited organizations per location                      |
| Duplicate `(org, location, kind)` | Always invalid                                            |

## Edit behavior

Edit mode excludes the current connection row from blocking checks so authors can change kind within eligible targets (for example Claims → Controls) when slots allow.

## SSOT

- Family exclusivity: `ORGANIZATION_LOCATION_CONNECTION_FAMILY_POLICY` (exhaustive `Record` over families)
- Kind metadata: `maxSubjectsPerLocation` on `ORGANIZATION_LOCATION_CONNECTION_ENTRIES`
- Per-org blocking: `organizationLocationConnectionKindBlockedForOrganizationAtLocation`
- Cross-org occupancy: `organizationLocationConnectionLocationSubjectBlocked`
- Schema enforcement: `organizationLocationConnectionsSchema` on organization save and nested API mutations (cross-org validated in API layer)

Dashboard drawers delegate to these helpers through `location-connection-duplicate-keys`, `location-connection-drawer-intent`, and `location-connection-kind-options`.

### Headquarters location policy

`headquarters` is eligible only on **structure-family locations**: building, fortification, or generic structure profiles. Settlements, regions, districts, interiors, and other profiles reject it via [`location-connection-eligibility.ts`](../../../packages/contracts/src/rpg/content/lib/location-connection-eligibility.ts).

Each organization may have at most **one** headquarters connection across all locations (`maxSubjectsPerOrganization` on the kind vocab entry). Family add drawers keep headquarters visible when that slot is occupied and show `Already set at {locationName}.` as the unavailable reason.

Picker copy for headquarters (field helper, search placeholder, change-location drawer title) lives in dashboard target presentation config — see [`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/location-connections/organization-location-connection-surface-copy.ts) and [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

Mutation candidate filtering (add, change location, replace organization) always evaluates the **persisted or selected relationship kind**, never the union of kinds represented by a drawer intent family.

## Forward display

Organization detail uses **family-level** empty states and one **Add {family}** action. Populated kind groups render only when they contain relationships. Forward kind eyebrows may differ grammatically from inverse vocab labels (see [cross-content-relationship-ui.md](./cross-content-relationship-ui.md)).

**Areas of operation** (`geographic_presence` / `operates_in`) uses the section heading **Areas of operation** with kind eyebrows omitted — the heading fully names the sole relationship kind. Sites & facilities and Territorial authority keep directional kind eyebrows.

Directional edge copy lives on connection kind entries in `@rpg/contracts`
(`label`, optional `forwardLabel`, optional `inverseLabel`). Organization forward eyebrows
read `getOrganizationLocationConnectionDisplayLabel(kind, 'forward')`.

## Location target display

Organization→location existing-edge rows, change-target **Current** snapshots, and link-drawer
candidates compose [`LocationEntitySummaryVm`](../src/features/content/locations/lib/location-display.ts)
in the organization feature, then map to neutral row / `EntityReplacementCurrentSnapshot` fields.
Generic relationship and drawer-replacement modules stay **entity-agnostic** — they must not import
location display helpers.

- **Unresolved targets:** `target: null` is the sole failure state; UI derives unavailable chrome from that.
- **Ancestry index:** the detail hook memoizes `locationsById` once and passes it into card builders, Current
  snapshots, and picker summaries — builders must not rebuild the map per row.
- **Density:** org→location relationship rows use a compact two-line projection (`name · classification` + optional `Located in {nearest parent}` via `headingSuffix`). Contained locations use a denser single-line inline suffix. Pickers and Current snapshots may show fuller ancestry for disambiguation.

Cross-org singleton occupancy for forward authoring uses `GET .../content/organization-location-connection-edges` (campaign-scoped edges grouped by `locationId`).

Mutation overflow availability for change-target operations uses [`RelationshipCandidateSet`](../src/features/content/lib/relationship/list/relationship-candidate-set.ts) — see [cross-content-relationship-ui.md](./cross-content-relationship-ui.md) for completeness invariants.
