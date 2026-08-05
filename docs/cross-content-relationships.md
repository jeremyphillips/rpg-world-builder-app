# Cross-Content Relationships

Contracts-first convention for relating catalog content across type boundaries
without reciprocal storage or a generic graph.

## Core rule

Each relationship has **one authoritative owner** where the edge is stored.
Other surfaces show **projections** derived at read time. Mutations always
target the authoritative document — never a mirrored field on the inverse type.

Bidirectional **display** does not imply bidirectional **editing**. Inverse
write affordances must gate on declared registry capability
(`capabilities.inverse === 'write'`).

## Three concepts

| Concept                   | Role                                                       | Example                                                       |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **Authoritative storage** | Persisted edge on the owning type                          | Class `characterCreation.proficiencies.skills.choices[]`      |
| **Projection**            | Inverse or cross-type read derived from authoritative data | Skill detail lists classes via `classesOfferingSkillChoice()` |
| **Mutation**              | Write path that updates authoritative storage only         | Region `territorialAuthority[]` via nested location routes    |

## Projection registry

`@rpg/contracts` exposes a **descriptive-only** registry in
[`cross-content-relationship-projection.ts`](../packages/contracts/src/rpg/content/lib/cross-content-relationship-projection.ts).

**Invariants:**

1. The registry describes how an existing domain relationship is exposed; it
   does **not** define, persist, query, or validate the relationship itself.
2. `ownerField` is a drift/documentation key only. It must **never** evolve
   into dynamic field traversal or a generic query engine.
3. Domain schemas, extractors, resolvers, and validators remain
   domain-specific. Do not maintain a central map of relationship id →
   implementation filenames.

### Declared capabilities

| Relationship id                  | Owner                | Target                | Forward | Inverse |
| -------------------------------- | -------------------- | --------------------- | ------- | ------- |
| `class_skill_proficiency_choice` | `classes`            | `skill-proficiencies` | write   | read    |
| `location_party_association`     | `locations`          | `organizations`       | write   | read    |
| `region_territorial_authority`   | `locations` (region) | `organizations`       | write   | write   |

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

Domain projections extend with kind and other metadata only when meaningful:

- **Class ↔ Skill** — no runtime kind; inverse returns class records via
  `classesOfferingSkillChoice`.
- **Organization connected-regions** — adds `relationshipFamily`,
  `relationshipKind`, `relationshipLabel`, `region`, and (when shipped)
  `relationshipId`.

## Mutation ownership

Regions are `locations` with `kind: 'region'`. Nested location routes are the
**canonical** surface for targeted territorial-authority mutation:

```text
POST   /api/campaigns/:campaignId/content/locations/:locationId/territorial-authorities
PATCH  /api/campaigns/:campaignId/content/locations/:locationId/territorial-authorities/:relationshipId
DELETE /api/campaigns/:campaignId/content/locations/:locationId/territorial-authorities/:relationshipId
```

Full location `PATCH` and nested commands delegate to the **same** domain mutator
and validator — not parallel validation paths.

Organization UI calls nested location endpoints; it never `PATCH`es organization
with reciprocal arrays.

### Authorization

Permission is evaluated against mutation of the **authoritative** location or
region, regardless of which UI originated the request.

### Stale projection concurrency (v1)

`relationshipId` identifies the edge. v1 policy:

- Mutate by id against **current** authoritative state.
- Never treat a last-viewed projection payload as authoritative write input.
- Stale or missing ids → clear failure (404/validation), not silent recreate.

## Proving examples

### Class → Skill proficiency choices

| Concern                 | Detail                                                      |
| ----------------------- | ----------------------------------------------------------- |
| **Authoritative owner** | Class at `characterCreation.proficiencies.skills.choices[]` |
| **Inverse**             | Client-side `classesOfferingSkillChoice()` over class list  |
| **Not content-usage**   | Usage indexes character skill refs, not class choice pools  |

### Location → Organization (party + territorial)

| Concern                 | Detail                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Authoritative owner** | Location `partyAssociations[]`; region `territorialAuthority[]`                                 |
| **Inverse**             | `resolve-organization-connected-regions` + connected-regions DTO (`relationshipId` on each row) |
| **Party inverse UI**    | Organization detail lists **regions only**; usage blockers still span all location kinds        |

## What to reuse vs invent

```text
reference discovery (content-usage)  →  blockers / “Used by”
domain inverse resolvers             →  rich projection rows (connected-regions)
contracts helpers                    →  Class/Skill inverse (client)
relationship projection registry     →  ownership + capability declaration (descriptive)
```

Do **not** force Class/Skill through content-usage (scopes differ). Do **not**
force connected-regions through usage blockers (family-labeled multi-edge rows
need domain expansion).

## Non-goals

No generic graph, no reciprocal storage, no registry-driven field traversal or
query engine, no Skill→Class writes in the proving phase.

## Further inverse editing (evaluation)

Document-only decisions — not automatic enablement:

1. **Party associations from Organization** — possible (ids exist) but broader
   location-kind UX; defer unless product wants non-region HQ surfaces.
2. **Skill → Class** — recommend **read-only**: choice-set context (`choose`,
   package id, multi-package), first-choice-only form, and Class-owned
   constraints make inverse edits unsafe without hiding Class semantics.
