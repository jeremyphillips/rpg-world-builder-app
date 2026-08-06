# Organization location connections

Organization detail and location inverse drawers link organizations to locations through **`connections.locations`** on the organization document. Rules live in `@rpg/contracts` and are mirrored in dashboard picker/drawer eligibility.

## Connection families

Each connection kind belongs to one of three families:

| Family                  | Cardinality                                    | Example                                                                                              |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `site`                  | **one per kind** per organization + location   | `owns` + `headquarters` on the same settlement                                                       |
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

## Forward display

Organization detail uses **family-level** empty states and one **Add {family}** action. Populated kind groups render only when they contain relationships. Forward kind eyebrows may differ grammatically from inverse vocab labels (see [cross-content-relationship-ui.md](./cross-content-relationship-ui.md)).

Cross-org singleton occupancy for forward authoring uses `GET .../content/organization-location-connection-edges` (campaign-scoped edges grouped by `locationId`).
