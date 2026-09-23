# Cross-Content Relationships

Contracts-first convention for relating catalog content across type boundaries
without reciprocal storage or a generic graph.

## Core rule

**Relationship persistence belongs to the semantic subject; projection direction
is independent of persistence direction; Location is a projection target, not a
persistence owner; bidirectional-looking editing does not imply bidirectional
storage.**

Each relationship has **one authoritative owner** where the edge is stored.
Other surfaces show **projections** derived at read time. Mutations always
target the authoritative document — never a mirrored field on the inverse type.

Bidirectional **display** does not imply bidirectional **editing**. Inverse
write affordances must gate on declared registry capability
(`capabilities.inverse === 'write'`).

## Three concepts

| Concept                   | Role                                                       | Example                                                                                       |
| ------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Authoritative storage** | Persisted edge on the owning type or relationship service  | Character location edges in `character_relationships`; organization `connections.locations[]` |
| **Projection**            | Inverse or cross-type read derived from authoritative data | Location detail lists characters and orgs via connected-parties resolver                      |
| **Mutation**              | Write path that updates authoritative storage only         | Campaign `character-relationships` routes; organization nested `location-connections`         |

## Projection registry

`@rpg/contracts` exposes a **descriptive-only** registry in
[`cross-content-relationship-projection.ts`](../packages/contracts/src/rpg/content/lib/relationship/cross-content-relationship-projection.ts).

**Invariants:**

1. The registry describes how an existing domain relationship is exposed; it
   does **not** define, persist, query, or validate the relationship itself.
2. `ownerField` is a drift/documentation key only. It must **never** evolve
   into dynamic field traversal or a generic query engine.
3. Domain schemas, extractors, resolvers, and validators remain
   domain-specific. Do not maintain a central map of relationship id →
   implementation filenames.

Connection kind eligibility is enforced server-side via
[`location-connection-eligibility.ts`](../packages/contracts/src/rpg/content/lib/relationship/location-connection-eligibility.ts)
— the dashboard capability layer derives from it; API validators consult the
same resolver.

### Declared capabilities

| Relationship id                    | Owner           | Target                | Forward | Inverse |
| ---------------------------------- | --------------- | --------------------- | ------- | ------- |
| `class_skill_proficiency_choice`   | `classes`       | `skill-proficiencies` | write   | read    |
| `character_location_connection`    | `characters`    | `locations`           | write   | write   |
| `organization_location_connection` | `organizations` | `locations`           | write   | write   |

UI inverse write controls must not ship while the registry declares
`inverse: 'read'`.

## Inverse result shape

Shared base (`CrossContentProjectionReference`):

```ts
type CrossContentProjectionReference = {
  sourceId: string
  sourceName: string
  relationshipId?: string // when edges have persisted ids
}
```

Domain projections extend with kind, family, priority, and other metadata only
when meaningful.

## Mutation ownership

Character relationship edges — organization membership, person kinds (parent,
partner, mentor, rival, …), and location kinds (`resides_at`, hometown,
birthplace, property associations) — are stored in the campaign
`character_relationships` collection and mutated through the character
relationship service. Organization location edges remain on organization
documents and use nested `location-connections` routes. Location inverse editing
delegates to the authoritative command for each family; Location `PATCH` never
persists relationship arrays.

Edges carry campaign scope, revision, visibility (`dm_only` | `all_players` |
selected characters), and lifecycle details where the kind supports it. List
reads project endpoint-relative rows for the viewer character and filter hidden
edges before returning items. Narrative generation uses authorized draft edges or
resolved projections only — hidden edges never appear in generated prose or
user-visible diagnostics.

```text
GET    /api/campaigns/:campaignId/characters/:characterId/relationships
POST   /api/campaigns/:campaignId/character-relationships
PATCH  /api/campaigns/:campaignId/character-relationships/:relationshipId
DELETE /api/campaigns/:campaignId/character-relationships/:relationshipId
```

Organization nested routes follow the same pattern under
`/api/campaigns/:campaignId/content/organizations/:organizationId/location-connections`.
Full subject `PATCH` must delegate array changes to the same mutation primitive
the nested routes use — not parallel validation paths.

### Authorization

Permission is evaluated against mutation of the **authoritative** edge or
organization document, regardless of which UI originated the request. Character
relationship mutations require campaign owner/co-owner.

### Stale projection concurrency (v1)

`connectionId` / `relationshipId` identifies the edge. v1 policy:

- Mutate by id against **current** authoritative state.
- Never treat a last-viewed projection payload as authoritative write input.
- Stale or missing ids → clear failure (404/validation), not silent recreate.

### v1 dedupe policy

Character location edges are unique per campaign, character, location, and kind
in `character_relationships`. Organization location arrays enforce unique
`{locationId, kind}` pairs per organization. Mutations address edges by
persisted `id`, never by composite keys alone.

## Proving examples

### Class → Skill proficiency choices

| Concern                 | Detail                                                      |
| ----------------------- | ----------------------------------------------------------- |
| **Authoritative owner** | Class at `characterCreation.proficiencies.skills.choices[]` |
| **Inverse**             | Client-side `classesOfferingSkillChoice()` over class list  |
| **Not content-usage**   | Usage indexes character skill refs, not class choice pools  |

### Character / Organization → Location

| Concern                 | Detail                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Authoritative owner** | Character location edges in `character_relationships`; organization `connections.locations[]` |
| **Inverse**             | Location connected-parties resolver (merged, server-side sort + pagination)                   |
| **Usage**               | Character relationship refs registered via the edge usage source                              |

Location-owned `partyAssociations` and `territorialAuthority` fields have been
removed. Character edges no longer live on character documents.

## What to reuse vs invent

```text
reference discovery (content-usage)  →  blockers / “Used by”
domain inverse resolvers             →  rich projection rows (connected-parties)
contracts helpers                    →  Class/Skill inverse (client)
relationship projection registry     →  ownership + capability declaration (descriptive)
location-connection-eligibility      →  kind validity SSOT (server + dashboard)
```

Do **not** force Class/Skill through content-usage (scopes differ). Do **not**
maintain parallel lookup/write paths per connection family.

## Non-goals

No generic graph, no reciprocal storage, no registry-driven field traversal or
query engine.

## Further inverse editing (evaluation)

Document-only decisions — not automatic enablement:

Character relationship expansion (people, places, property, narrative facts) is
documented in [Character relationships and narrative context](roadmap/character-relationships-plan.md).
Organization membership and all character location kinds now live in
`character_relationships`; builder Connections, sheet Connections, and narrative
facts consume that service without alternate embedded arrays.

1. **Skill → Class** — recommend **read-only**: choice-set context makes
   inverse edits unsafe without hiding Class semantics.
