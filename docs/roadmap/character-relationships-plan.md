# Character relationships and narrative context

Status: Phases 1–4 implemented (contracts, API, dashboard reconciliation prep,
existing-feature cutover). Phases 5–7 (new builder kinds, detail sections,
narrative enrichment) pending.

## Recommendation

Establish a typed character relationship subsystem: one shared edge envelope,
contracts-owned kind definitions, and discriminated details schemas. Store one
canonical edge and derive reverse views. Keep specialized pickers and editors.

For the proposed family/social relationships and eventual history, recommend a
dedicated `character_relationships` collection as the target storage model. This
provides stable identity and indexed reads from either endpoint without deciding
arbitrarily which spouse's character document owns a shared fact. It also avoids
unbounded histories on character documents and whole-array write contention.

This is a bounded character domain graph, not a universal content graph. Class
proficiency choices and organization-to-location connections retain their current
domain ownership. There is no graph database requirement, arbitrary traversal API,
or untyped `{ type, targetId }` persistence contract.

The lower-cost alternative is retaining embedded typed arrays and adding a people
array. That is reasonable for names-only references, but it makes symmetric edges,
cross-character authorization, temporal instances, and reverse pagination harder.
Given the requested breadth, central edge storage is the recommended destination.

## Current implementation: what exists and what changes

| Area                    | Observed implementation                                                                                            | Implication                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Character organizations | **Cut over (Phase 4):** `organizationMembership` edges in `character_relationships` with optional title in details | Add lifecycle and richer membership metadata in later phases                                            |
| Character locations     | **Cut over (Phase 4):** location kinds (`resides_at`, `owns`, etc.) as edges in `character_relationships`          | Add `hometown`/`birthplace` and property UI in Phase 5; temporal-instance policy in later phases        |
| Location kinds          | owns, tenant, resides_at, operator, works_at                                                                       | Ownership already exists at the data layer; do not introduce a competing buildingOwnership relationship |
| Buildings               | Locations classified as structures/buildings                                                                       | Property selection returns locationId, not buildingId; reuse location eligibility                       |
| Persistence             | **Done (Phases 2–4):** `character_relationships` collection with revision checks and campaign-scoped commands      | Extend with additional kinds and visibility rules in later phases                                       |
| Inverse views           | **Done (Phase 4):** connected-parties reads character edges from `character_relationships`                         | Organization source unchanged on `connections.locations[]`                                              |
| Usage/deletion          | **Done (Phase 4):** edge collection registered as usage source; character documents no longer embed connections    | Extend deletion/unlink workflows as new kinds ship                                                      |
| Forms                   | Shared RelationshipFieldProvider and character adapter registry, with draft/API modes                              | Extend this foundation; a new generic picker framework is unnecessary                                   |
| Reconciliation          | **Done (Phases 3–4):** edge ID + revision reconciliation via `useRelationshipEdgeApiSync`                          | Extend for new kinds and metadata-only edits in Phase 5+                                                |
| Detail surface          | Identity connections supplement composes membership and residence containers                                       | Add People, Places, Property sections; keep domain containers behind those sections                     |
| Narrative input         | **Done (Phase 4):** builder reads `draft.relationshipEdges` for org/residence context                              | Introduce typed narrative facts, role binding, lifecycle and visibility filtering (Phase 7)             |
| Narrative binding       | One selected organization and one residence per composition                                                        | Extend to a small role budget, not unrestricted graph traversal                                         |

Relevant sources:

- [Connection contracts](../../packages/contracts/src/rpg/runtime/character/connections/connections.ts)
- [Location edge contracts](../../packages/contracts/src/rpg/runtime/character/connections/location-connection.ts)
- [Location eligibility](../../packages/contracts/src/rpg/content/lib/relationship/location-connection-eligibility.ts)
- [Projection policy](../cross-content-relationships.md)
- [Form adapter registry](../../apps/dashboard/src/features/character/lib/relationship/character-relationship-field-registry.tsx)
- [API semantic reconciliation](../../apps/dashboard/src/features/character/lib/relationship/relationship-api-semantic-sync.lib.ts)
- [Character relationship routes](../../apps/api/src/features/character-relationships/character-relationship.routes.ts)
- [Create relationships from draft](../../apps/api/src/features/character-relationships/lib/create-character-relationships-from-draft.ts)
- [Connected-parties resolver](../../apps/api/src/features/content/locations/resolve-location-connected-parties.ts)
- [Usage extractor](../../apps/api/src/features/content/lib/content-usage/reference-sources/characters-extract.ts)
- [Narrative context adapter](../../packages/character-narrative-integrations/src/build-narrative-context.ts)
- [Narrative reference binding](../../packages/character-narrative-core/src/bind-references.ts)

## Explicit architecture-policy change

The existing cross-content policy says relationships belong on semantic subject
documents and explicitly excludes a generic graph. This proposal changes physical
storage only for character relationships. Preserve its stronger invariants:

- Exactly one authoritative edge and one canonical mutation service.
- Location inverse editing never writes mirrored arrays on Location.
- Projection metadata never becomes dynamic field traversal or arbitrary queries.
- Authorization is independent of which surface initiated an edit.
- Inverse edit capability must be declared explicitly.

At implementation cutover, update that policy to identify the character relationship
service as authority. Keep the current descriptive projection registry separate from
the new kind-definition registry and the existing React adapter registry. They have
different consumers and responsibilities; do not combine them into a mega-registry.

## Contracts and package ownership

Add contracts under `packages/contracts/src/rpg/runtime/character-relationships/`:

- `relationship.ts`: strict discriminated union and shared persisted envelope.
- `details/`: membership, residence, ownership, and person relationship details.
- `definitions.ts`: canonical kinds, inverse roles, symmetry, section, cardinality.
- `commands.ts`: create/update/delete inputs and revision conflict responses.
- `projection.ts`: endpoint-relative row DTOs and resolved reference statuses.
- `draft.ts`: builder inputs; no persisted character ID required before creation.

Use the existing `rpg/vocab` conventions for labels and set concepts, including
`*_TERM` and `*_ENTRIES`. Define Zod first and infer TypeScript types. Derive schema
components from existing contracts; do not duplicate DTO shapes in dashboard/API.

API ownership: `apps/api/src/features/character-relationships/` owns the model,
commands, scoped resolution, projections, and usage integration. Export a small
public feature barrel. Dashboard relationship adapters remain in the character
feature. Narrative integration depends on relationship contracts/read projections;
the generator core never imports API, React, or storage code.

## Scope before schema

Character identity and campaign participation are distinct today. Campaign-local
facts must not become globally true for a PC participating in multiple campaigns.

Confirmed first release: persisted edges carry a required campaignId. Endpoints
must belong to, participate in, or be referenceable within that campaign. A PC-PC,
PC-NPC, or NPC-NPC relationship uses the same character target type. The stored
ordering of a symmetric edge confers no ownership or editing rights.

Standalone builders continue to generate narratives without campaign references.
Before removing embedded connections, audit standalone seeds/imports for assumptions
about connection persistence. Campaign-independent relationships are deferred; do not
add an alternate scope variant in the first release. Do not infer scope from a target
ID or silently copy facts between campaigns.

## Shared envelope and typed payloads

Persisted envelope:

```ts
// Illustrative; implement with Zod schemas and inferred types.
type RelationshipEnvelope = {
  id: string
  campaignId: string
  revision: number
  createdAt: string // audit wall-clock time, not an in-world date
  updatedAt: string
  createdByUserId: string
  visibility: RelationshipVisibility
}

type CharacterRelationship = RelationshipEnvelope &
  (
    | {
        kind: 'organizationMembership'
        characterId: string
        organizationId: string
        details: MembershipDetails
      }
    | { kind: 'resides_at'; characterId: string; locationId: string; details: ResidenceDetails }
    | { kind: 'owns'; characterId: string; locationId: string; details: OwnershipDetails }
    | { kind: 'parentOf'; characterId: string; relatedCharacterId: string; details: ParentDetails }
    | {
        kind: 'partnerOf'
        characterId: string
        relatedCharacterId: string
        details: PartnershipDetails
      }
  )
// Additional kinds are explicit union branches, never arbitrary strings.
```

Each kind permits only its own details. Reject mismatched payloads rather than
silently dropping fields. API patches keep kind/endpoints immutable; changing the
meaning of an edge is an explicit replace operation. Clear optional values with a
documented null operation, distinct from omission.

Do not add every optional detail now. Keep a single membership title initially,
preserving existing title validation; evolve to structured role assignments when
simultaneous titles or title history are required. A `titles: string[]` would lose
role identity and history. Preserve current priority solely for display ordering.

## Kind registry and canonical directions

| Stored kind                     | Canonical direction                | Reverse view                       | Semantics/details                                                         |
| ------------------------------- | ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| organizationMembership          | character → organization           | Member                             | active/former membership, title, display priority                         |
| organizationAffiliation         | character → organization           | Affiliate                          | Distinct from actual membership; add after membership proves the pipeline |
| resides_at                      | character → location               | Resident                           | current/former, optional primary                                          |
| hometown                        | character → location               | Hometown of                        | Subjective origin association; not birthplace                             |
| birthplace                      | character → location               | Birthplace of                      | Historical fact; unknown remains absent                                   |
| owns                            | character → location               | Owner                              | current/former, optional fractional interest                              |
| tenant/operator/works_at        | character → location               | Existing inverse labels            | Preserve existing kinds and eligibility during cutover                    |
| parentOf                        | parent → child                     | Child / Parent, relative to viewer | Optional biological/adoptive/unspecified type later                       |
| partnerOf                       | canonically ordered character pair | Partner                            | Symmetric; union type may distinguish spouse/partner                      |
| siblingOf                       | canonically ordered character pair | Sibling                            | Symmetric; explicitly authored, not inferred from shared parents          |
| mentorOf                        | mentor → student                   | Student / Mentor                   | Directed role relationship                                                |
| friendOf/allyOf/rivalOf/enemyOf | character → related character      | “Considers you a …”                | Directed perception initially, not an assumption of mutual sentiment      |

UI role labels are relative: if A parentOf B, A's People list shows B as Child;
B's list shows A as Parent. Do not use an inverse label without considering which
endpoint the current character occupies. Do not infer Father/Mother from gender;
use neutral Parent unless a relationship-specific display label is explicitly set.

Definitions contain source/target types, forward/reverse labels, symmetric flag,
category, allowed detail schema association, multiplicity policy, and declared edit
capabilities. Their labels drive UI grouping, not database field names. Server
domain validators enforce endpoint existence, scope, eligibility, and authorization.

Normalize symmetric endpoints by a stable ID ordering before insert. Store parentOf
and mentorOf only in their canonical direction, normalizing child/student commands
at the boundary. For social perceptions, never turn reverse discovery into mutual
friendship or enmity. A later shared alliance or mutual friendship is a distinct
contract or explicitly confirmed relationship.

## Validation and concurrency

- Reject self relationships for family/social roles.
- Deduplicate by campaign, canonical kind, canonical endpoints, and active instance
  policy. Back this with a database unique key, not a read-then-insert check alone.
- Preserve multiple parents, partners, and homes where the data model permits them;
  do not impose an unrequested two-parent or monogamy rule.
- Biological/adoptive subtype constraints must remain explicit. A future ancestry
  cycle check applies to defined ancestry kinds, not all social/family edges.
- If primary residence is enabled, enforce at most one current primary per character
  and campaign with a unique partial index. Switching primary is a transaction.
- Update/delete requires expectedRevision; use atomic id + campaignId + revision
  matching and return 409 on stale writes. Missing edge is 404; never recreate it.
- Serialize conflicting operations per edge in the client. The server returns the
  canonical saved edge and revision, which the form adopts without reverting newer
  local edits.
- Use a create idempotency key or client request ID to make network retries safe.

Recommended indexes: campaign + characterId + kind + id; campaign +
relatedCharacterId + kind + id; campaign + locationId + kind + id; campaign +
organizationId + kind + id; and a canonical unique key for active duplicates.
Paginate forward and inverse queries with stable cursors. Resolve target summaries
in batches. Keep initial reads one hop and bounded; do not load the campaign roster
or graph in full to populate a character detail page.

## Time and future granularity

Separate audit timestamps from in-world chronology. Do not use JavaScript Date for
fantasy-calendar events. Initially support current/former where meaningful, with
optional authored period labels. Unknown dates remain unknown; no invented dates.

When calendar-aware history is needed, introduce a shared CampaignDate/interval
contract with calendar identity, precision, ordering, and unknown endpoints. A
residence can end while hometown/birthplace facts remain true. Avoid one universal
status enum applied blindly to all relationship kinds.

Repeated episodes (leaving/rejoining an organization, multiple tenancies) become
separate edge instances with stable IDs. Relax active duplicate policy intentionally;
overlap validation must use the campaign's calendar. Preserve title assignments as
dated child records when that granularity is required.

Ownership share means a declared fractional interest, not independently verified
legal title. Define bounds if supported, but defer total-share enforcement until
ownership across character and organization owners has one transactionally enforced
policy. Do not infer wealth, authority, or occupancy from an ownership edge.

Later extensions: emotional attitude on a directed edge, explicit importance to
the focal character, authored events, relationship roles, provenance, and assertions
or rumors. Keep asserted facts distinct from beliefs. Derivations such as grandparent
must carry provenance and never create persisted inferred edges automatically.

## Visibility, authorization, and lifecycle

Start shared campaign relationship writes with campaign owner/co-owner authority,
consistent with current connection write surfaces. If player-authored social beliefs
are needed, implement a separate permission policy; source-ID ordering is never an
authorization mechanism. Reuse participation/access services for both endpoints.

An edge has its own disclosure policy: visible characters can have a secret family
relationship. Reads and narrative input require both edge visibility and permitted
target visibility. Inverse projection must not expose hidden target names, IDs,
relationship counts, or diagnostic details to unauthorized viewers. Manager-facing
unresolved references may remain visible for repair. Distinguish unavailable,
deleted, and inaccessible internally without leaking those distinctions externally.

Deleting a target should block while live edges reference it, with an explicit
unlink workflow through content usage. Ending participation or marking a character
deceased does not delete history. Scope and visibility rules determine what remains
readable; rejoining a campaign does not silently create duplicate edges.

## APIs, creation, and builder drafts

Suggested canonical routes:

```text
GET    /api/campaigns/:campaignId/characters/:characterId/relationships
POST   /api/campaigns/:campaignId/character-relationships
PATCH  /api/campaigns/:campaignId/character-relationships/:relationshipId
DELETE /api/campaigns/:campaignId/character-relationships/:relationshipId
```

The GET response is a resolved, endpoint-relative projection with kind, category,
details, edit capability, reference status, and revision. Reverse surfaces use the
same commands. Existing specialized membership/location handlers may delegate to
these services during implementation, but remove replaced routes at final cutover;
do not retain two independent validation/write paths.

Builder drafts use local edge IDs and an implicit new-character endpoint. Resolve
the real characterId at creation. Validate all endpoints again on submission and
create character, participation, and edges atomically. Verify Mongo transaction
support in dev/test before choosing the command boundary; do not introduce partial
character creation followed by a sequence of best-effort relationship posts.

The saved character sheet no longer owns connection arrays. A detail read model
joins scoped relationship projections. Builder drafts still own their unsaved
relationships; draft state is not a second persisted source of truth. Update
finalization, imports, clones, previews, and tests together. Clone commands should
require an explicit relationship-copy policy rather than copying incoming edges.

## UI evolution

Build on the existing form adapter registry and draft/API modes:

```text
Connections
  People
    Family
    Social
  Organizations
  Places
  Property
```

Category is presentation metadata. A property is still a location target. Keep the
organization membership picker and its title editor; extend the place picker with
kind eligibility; add a character picker for people. Share search/pagination,
resolved rows, pending state, and error treatment. Metadata editing is per edge.

Replace semantic-set reconciliation with edge-aware reconciliation before adding
details: identify by id, acknowledge by revision/request, and track add/update/remove.
One target may have multiple kinds or historical episodes. An update cannot be
acknowledged merely because the same target ID remains in a server snapshot.

## Narrative integration: facts, not the graph

Provide a bounded `NarrativeRelationshipFacts` projection from the integration
package, built from authorized resolved edges or the equivalent builder draft.
Examples: current membership with title; former membership; current residence;
hometown; known birthplace; mentor; child; partner; directed rivalry; owned property.

Each fact carries typed endpoint references, relationship ID/revision, role relative
to the focal character, lifecycle, and narrative-safe details. Do not pass raw graph
documents, visibility rules, private notes, or inferred entity histories into core.

Pipeline:

```text
Authorized edge read / unsaved draft
  → resolve typed, visible facts
  → choose at most three narrative roles
  → bind those roles once for the composition
  → select compatible fragments and render
```

Start with at most one person, one place, and one organization. Prefer explicit
importance and fragment relevance; presentation priority is not narrative importance.
Property can supply the place role when relevant. Carry hometown, residence, and
birthplace as distinct capabilities so fragments cannot confuse them.

Extend fragment requirements beyond token existence: current membership, former
membership, known parent role, current partner, or residence. A former organization
must not satisfy a current-membership template. Person roles remain explicit; do
not collapse mentor, spouse, and rival into an interchangeable `person.name`.

Alignment stays the strongest moral compatibility constraint, not a filter that
erases inconvenient relationships. A good character may belong to a criminal
organization or have an evil relative. Generate compatible internal tension without
inventing expulsion, abuse, betrayal, death, or reciprocal sentiment.

Preserve first-person generation and fill-empty behavior. New relationship facts
never rewrite authored prose automatically. Include selected edge IDs/revisions in
generation diagnostics for reproducibility and future stale-context notices. Hidden
edges cannot appear in diagnostics accessible to the user. Generated prose creates
no edges; a later suggestion flow must require an explicit authored change.

Useful first templates: attachment to hometown, obligation to a current organization,
lesson from a mentor, commitment to a child, and tension with a rival. Keep the three
existing backstory beats; richer context does not require more segments.

## Delivery sequence and refactor map

1. **Audit the confirmed scope.** Use campaign-only relationships, directed social
   perceptions, owner/co-owner writes, and current/former lifecycle where meaningful.
   Audit standalone/import behavior and current authorization middleware; defer
   in-world dates, repeated episodes, and detailed parentage.
2. **Contracts and storage.** Add strict schemas, kind registry, edge repository,
   canonicalization, indexed uniqueness, revision handling, scoped read projection,
   and usage/deletion integration. Define the transaction boundary for creation.
3. **Cut over existing relationships.** Move memberships and all existing character
   location kinds together; update character sheet/create contracts, Mongoose model,
   builder drafts/finalizers/imports, detail DTOs, organization member projections,
   location connected-parties queries, eligibility collectors, and usage extractors.
   Preserve organization-to-location behavior. Add stable IDs to membership drafts.
4. **Adapt forms and reconciliation.** Keep specialized adapters, change their command
   ports and row identity, support metadata edits, and add section presentation.
5. **First enrichment.** Add hometown, birthplace, parent, partner, sibling, mentor,
   and directed rival; expose existing owns through Property. Other social kinds and
   affiliation follow once this slice is exercised. Do not expose historical episodes,
   ownership fractions, complex calendars, or graph visualization in this release.
6. **Narrative facts.** Add role requirements and a small authored fragment pack;
   test binding, tense, alignment compatibility, visibility, and preservation.
7. **Document and verify.** Update architecture, contracts structure, cross-content
   policy, dashboard builder docs, and all affected package READMEs. Run the current
   tiered repository gates and full pre-push gates before sharing implementation.

This is a dev-only project: make a direct schema/consumer cutover. Update fixtures
and seed definitions and bump persisted draft version to invalidate obsolete drafts.
Do not add dual reads, migration scripts, or mirrored arrays. Do not delete existing
local data without explicit authorization; report any reseeding need separately.

## Acceptance criteria

- One parent edge renders the correct role at each endpoint; inverse edits mutate
  the same edge. Symmetric endpoints normalize consistently under concurrent inserts.
- PC-PC, PC-NPC, and NPC-NPC use identical contracts and scoped visibility rules.
- Duplicate active edges are blocked atomically; multiple valid distinct roles work.
- Stale updates fail explicitly; concurrent unrelated edits cannot overwrite each
  other. Metadata-only changes reconcile correctly in draft and API surfaces.
- Scope prevents facts from leaking between campaigns for the same PC.
- Hidden edges/targets never appear in pickers, inverse reads, narrative, or diagnostics.
- Locations reject invalid kinds; Property references existing location identities.
- Member lists, connected-parties, content usage, and deletion protection agree with
  the canonical edge source. No old arrays remain as an alternate authority.
- Character creation either persists the character and all requested edges or none.
- Narrative distinguishes current/former and parent/child/mentor roles, preserves
  user text, and never treats residence as proof of birthplace.
- Read performance is tested with bounded pagination, batched resolution, and the
  required query indexes. No automatic unbounded multi-hop graph loads.

## Confirmed product decisions

Confirmed by the user on 2026-09-22:

1. Relationships are campaign-specific initially. Personal facts do not automatically
   travel with a standalone character or between campaigns.
2. Social relationships are directed perceptions. Reverse discovery does not imply
   mutual friendship, rivalry, alliance, or enmity.
3. Retain manager writes initially: campaign owner/co-owner. Player-authored
   relationship workflows are deferred.
4. Current/former is sufficient where lifecycle applies. Defer in-world dates,
   repeated episodes, and detailed parentage until a feature needs them.
