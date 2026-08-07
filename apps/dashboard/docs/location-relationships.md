# Location relationships

Location documents do **not** store cross-content relationship edges. People and
organizations link to locations through subject-owned
`connections.locations` on characters and organizations.

## Where to look

| Topic                                                     | Doc                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Storage model, projection registry, mutation ownership    | [`docs/cross-content-relationships.md`](../../../docs/cross-content-relationships.md) |
| Dashboard UI patterns (forward vs inverse, drawers, copy) | [`cross-content-relationship-ui.md`](./cross-content-relationship-ui.md)              |
| Organization forward + inverse location connections       | [`organization-location-connections.md`](./organization-location-connections.md)      |

## Dashboard authoring (v1)

- **Location detail** shows connected parties via the server-side connected-parties
  projection and inverse write drawers (territorial authority, people &
  organizations).
- **Organization detail** adds/changes location connections on the org forward
  surface.
- **Character surfaces are inverse-first for v1** — edit character↔location
  edges from location connected-parties or nested character location-connection
  routes; there is no character-detail forward location editor in this cutover.

Kind eligibility is enforced by `@rpg/contracts`
[`location-connection-eligibility`](../../../packages/contracts/src/rpg/content/lib/location-connection-eligibility.ts)
on the API; the dashboard derives picker options from the same resolver.
