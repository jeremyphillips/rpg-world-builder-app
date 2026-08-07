# Organization location connections

Organization detail and location inverse drawers link organizations to locations through **`connections.locations`** on the organization document. Rules live in `@rpg/contracts` and are mirrored in dashboard picker/drawer eligibility.

## Connection families

Each connection kind belongs to one of three families:

| Family                  | Cardinality                                    | Example                                                                                              |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `site`                  | **one per kind** per organization + location   | `owns` + `headquarters` on the same building                                                         |
| `geographic_presence`   | **one per family** per organization + location | `operates_in` at most once per org                                                                   |
| `territorial_authority` | **kind-scoped** (see below)                    | `governs` and `controls` are singleton slots per location across orgs; `claims` allows multiple orgs |

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

- Kind metadata: `maxSubjectsPerLocation` on `ORGANIZATION_LOCATION_CONNECTION_ENTRIES`
- Per-org blocking: `organizationLocationConnectionKindBlockedForOrganizationAtLocation`
- Cross-org occupancy: `organizationLocationConnectionLocationSubjectBlocked`
- Schema enforcement: `organizationLocationConnectionsSchema` on organization save and nested API mutations (cross-org validated in API layer)

Dashboard drawers delegate to these helpers through `location-connection-duplicate-keys`, `location-connection-drawer-intent`, and `location-connection-kind-options`.

### Headquarters location policy

`headquarters` is eligible only on **structure-family locations**: building, fortification, or generic structure profiles. Settlements, regions, districts, interiors, and other profiles reject it via [`location-connection-eligibility.ts`](../../../packages/contracts/src/rpg/content/lib/location-connection-eligibility.ts).

Each organization may have at most **one** headquarters connection across all locations (`maxSubjectsPerOrganization` on the kind vocab entry). Family add drawers keep headquarters visible when that slot is occupied and show `Already set at {locationName}.` as the unavailable reason.

Picker copy for headquarters (field helper, search placeholder, change-location drawer title) lives in dashboard target presentation config — see [`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/organization-location-connection-surface-copy.ts) and [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

Mutation candidate filtering (add, change location, replace organization) always evaluates the **persisted or selected relationship kind**, never the union of kinds represented by a drawer intent family.

## Forward display

Organization detail uses **family-level** empty states and one **Add {family}** action. Populated kind groups render only when they contain relationships. Forward kind eyebrows may differ grammatically from inverse vocab labels (see [cross-content-relationship-ui.md](./cross-content-relationship-ui.md)).

Directional edge copy lives on connection kind entries in `@rpg/contracts`
(`label`, optional `forwardLabel`, optional `inverseLabel`). Organization forward eyebrows
still consume `ORGANIZATION_FORWARD_KIND_HEADINGS` as a temporary exception; follow-up
work deletes that map and reads `getOrganizationLocationConnectionDisplayLabel(kind, 'forward')`.

Cross-org singleton occupancy for forward authoring uses `GET .../content/organization-location-connection-edges` (campaign-scoped edges grouped by `locationId`).

Mutation overflow availability for change-target operations uses [`RelationshipCandidateSet`](../src/features/content/lib/relationship/relationship-candidate-set.ts) — see [cross-content-relationship-ui.md](./cross-content-relationship-ui.md) for completeness invariants.
