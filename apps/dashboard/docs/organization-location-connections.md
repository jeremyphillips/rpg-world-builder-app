# Organization location connections

Organization detail and location inverse drawers link organizations to locations through **`connections.locations`** on the organization document. Rules live in `@rpg/contracts` and are mirrored in dashboard picker/drawer eligibility.

## Connection families

Each connection kind belongs to one of three families:

| Family                  | Cardinality                                   | Example                                               |
| ----------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `site`                  | **one per kind** — multiple kinds may coexist | `owns` + `headquarters` on the same settlement        |
| `geographic_presence`   | **one per family** per location               | `operates_in` at most once                            |
| `territorial_authority` | **one per family** per location               | `governs` **or** `controls` **or** `claims` — not two |

Cross-family combinations remain allowed (for example `operates_in` + `governs` on the same region).

Territorial authority is a **status slot**, not a multi-select. After one territorial kind is linked to a location, add drawers disable that location/org row until the connection is removed or edited.

## Edit behavior

Edit mode excludes the current connection row from blocking checks so authors can change kind within the same family (for example Governs → Controls) via PATCH on the same row.

## SSOT

- Family metadata and cardinality: `ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY` in `@rpg/contracts`
- Blocking helpers: `organizationLocationConnectionKindBlockedForLocation`, `organizationLocationConnectionHasAvailableKindInFamily`
- Schema enforcement: `organizationLocationConnectionsSchema` on organization save and nested API mutations

Dashboard drawers delegate to these helpers through `location-connection-duplicate-keys`, `location-connection-drawer-intent`, and `location-connection-kind-options`.
