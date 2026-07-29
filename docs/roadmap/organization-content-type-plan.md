# Organization Content Type and Character Connections Plan

Status: Phases 1–8 complete

Scope: top-level `organizations` content type plus character connections

Reference: [Content Type vs. Vocabulary Guidance](./content-types-roadmap.md)

## Goal

Add Organization as a first-class, campaign-authorable content type and let a
character select zero or more organizations from an optional **Connections**
builder step immediately after **Identity**.

V1 models organization identity and classification, plus deliberately narrow
character connection records. It does not introduce organization membership
queries, relationship graphs, or organization-domain lifecycle fields.

## Locked decisions

### Organization contract

- Content type key, URL segment, response key, and route section:
  `organizations`.
- Contract type: `Organization`.
- Publish-complete body:

  ```ts
  type OrganizationBody = {
    name: string
    imageKey?: string
    description?: string
    organizationKind: OrganizationKind
  }
  ```

- `organizationKind` is explicit rather than `kind`; it remains unambiguous in
  envelopes, form rows, relationship records, and future discriminated unions.
- Draft inputs may omit `organizationKind`; publish inputs require it.
- Organization supports the normal campaign-authored draft/publish, duplication,
  availability, and deletion workflows.
- V1 has no nested authored IDs, so duplication uses
  `nestedIdRegeneration: 'none'`.
- Do not add leaders, members, headquarters, alliances, rivals, ranks, or
  mechanical grants in this slice.

### Organization-kind vocabulary

Use broad primary-purpose classifications:

| ID             | Label                 | Intended coverage                                       |
| -------------- | --------------------- | ------------------------------------------------------- |
| `government`   | Government            | Kingdoms, councils, administrations, governing bodies   |
| `political`    | Political             | Parties, movements, courts, noble blocs                 |
| `religious`    | Religious             | Churches, cults, temples, holy orders                   |
| `military`     | Military              | Armies, guards, militias, martial orders                |
| `criminal`     | Criminal              | Syndicates, gangs, smuggling rings, thieves' guilds     |
| `commercial`   | Commercial            | Companies, merchant houses, trade consortiums           |
| `professional` | Guild or professional | Guilds, trade groups, unions, occupational associations |
| `academic`     | Academic              | Schools, colleges, libraries, learned societies         |
| `community`    | Community             | Clans, mutual-aid groups, neighborhood and civic groups |
| `other`        | Other                 | No useful primary-purpose match                         |

`professional` intentionally excludes learned societies to avoid overlap with
`academic`. `community` replaces the more ambiguous `social`.

Exports follow the two-layer vocabulary pattern:

- `ORGANIZATION_KIND_TERM`
- `ORGANIZATION_KIND_ENTRIES`
- `ORGANIZATION_KIND_IDS`
- `organizationKindSchema`
- `OrganizationKind`
- `getOrganizationKindEntry()`
- `getOrganizationKindLabel()`

Secrecy is not an organization kind; it can apply across kinds and should become
a separate trait only when its semantics are defined.

### Character connection contract

Use object records with a stable expansion path while keeping V1 narrow:

```ts
type CharacterOrganizationConnection = {
  organizationId: string
}

type CharacterConnections = {
  organizations: CharacterOrganizationConnection[]
}
```

The builder draft and persisted character both store:

```ts
connections: CharacterConnections
```

`organizationId` is an opaque content-envelope ID, never a slug or embedded
organization snapshot. The array defaults to `[]` and is unique by
`organizationId`.

Future fields such as role, disposition, membership status, and notes are not
reserved in the schema until their semantics are defined.

### Catalog bundling

Do not create an empty organization seed or catalog package merely to satisfy
loader symmetry. Refactor the integration metadata and runtime loader contract
to represent content types with no bundled system content.

The tooling manifest catalog metadata becomes a discriminated shape:

```ts
type CatalogIntegration =
  | {
      bundledContent: 'bundled'
      packageName: string
    }
  | {
      bundledContent: 'none'
    }
```

Existing catalog-backed types declare `bundledContent: 'bundled'`.
Organizations declare:

```ts
catalog: {
  bundledContent: 'none',
}
```

Catalog package drift checks run only for `bundledContent: 'bundled'`. The API
read configuration similarly models the system layer as optional instead of
requiring fake empty loaders and slug sets.

If implementation discovers an external package-resolution constraint that
cannot be removed in scope, an empty package is a documented infrastructure
compatibility adapter—not system organization content—but the preferred plan is
the loader refactor.

### Provenance and UI language

Persist source/provenance consistently with other campaign-created content, but
do not label every organization “Homebrew” in the UI.

Do **not** derive source-badge behavior directly from
`catalog.bundledContent: 'none'`:

- `bundledContent` describes current loader/package topology.
- Source presentation describes the product meaning of provenance.
- Organization source presentation should remain stable if bundled
  organizations are added later.

Add an exhaustive, drift-tested dashboard content-presentation policy keyed by
`ContentTypeKey`, with a source presentation mode such as:

```ts
type ContentSourcePresentation = 'badge-and-filter' | 'suppressed'
```

Organizations use `suppressed`; existing types initially use
`badge-and-filter`. Shared overview and heading components consume this policy
so organizations omit the Homebrew badge, source column, and source filter
without organization-specific conditionals. Draft, published, inactive, and
campaign-availability displays remain independent.

### Overview and picker UX

Organization overview:

- Middle column: **Type**, label-backed and sortable.
- Type-specific filter: **Type equals**, with **All types** as the default.
- Shared status, search, and campaign-availability controls remain.
- Source column/filter follow the source-presentation policy above.

Character selection uses a dedicated organization picker drawer, not a
combobox. Follow the character content-picker architecture built around
`CatalogPickerSheet`, shared row headers, selection actions, empty states,
sorting helpers, and reset behavior.

Picker V1 supports:

- Search text: organization name and organization-kind label.
- Visible row content: name and organization-kind label.
- Structured filters: organization kind only.
- Multiple add/remove selection.
- Organization details in the drawer when the shared details pattern can be
  reused without expanding V1 scope.

### Optional step semantics

Connections is an optional builder step and may be absent from the effective
step sequence when no organizations are selectable.

Refactor builder step orchestration to distinguish:

- registered step metadata; and
- the effective steps for a `CharacterBuildContext`.

Connections metadata declares its applicability from available organizations.
Navigation, rail rendering, review prerequisites, validation traversal, and
next/previous resolution use the effective sequence.

When Connections renders, zero selections are explicitly valid. Its validator
validates connection records and selectability; it is not a no-op added solely
for exhaustive registry typing.

### Reference and availability policy

Keep selection eligibility separate from reference readability:

- A newly selected organization must be currently selectable.
- An unavailable organization cannot be added as a new connection.
- A stale organization ID in an active draft blocks finalization and the
  Connections UI offers explicit Remove or Replace recovery. It is never
  silently dropped.
- A previously persisted character connection remains readable. Character
  detail uses a reference-resolution path that can return an unavailable or
  unpublished referenced organization to an authorized character viewer.
- A missing/deleted reference renders an explicit unavailable-reference
  fallback.

Deletion is blocked while campaign-participating characters reference the
organization. Demotion/unpublishing is **not** blocked merely by a character
reference: existing references remain readable, while the organization becomes
ineligible for new selection.

This requires reference-aware reads rather than weakening general draft
discovery.

### Organization lifecycle vocabulary

Draft/published is authoring and availability state. A future organization
status such as active, disbanded, or destroyed is organization-domain data and
must not reuse or overload publish state. Do not add that domain status in V1.

## Build sequence

### 1. Refactor catalog and presentation capabilities — complete

1. Extend
   `tools/content-types/src/content-type-integration-manifest.ts` with the
   discriminated `bundledContent` catalog metadata.
2. Update manifest queries and drift tests so catalog paths and package exports
   are required only for bundled content.
3. Refactor `ContentTypeConfig` to model the system catalog as an optional
   cohesive capability rather than mandatory `loadSystem` and `systemSlugs`
   functions.
4. Update the generic campaign resolver, slug collision resolver, and write
   paths to use empty system collections internally when the system capability
   is absent.
5. Keep system patching capability-based: organizations have no patch model
   because there are no system organization targets.
6. Add the exhaustive dashboard content-presentation policy and update shared:
   - content overview column construction;
   - base overview filter construction;
   - edit/detail heading badges;
   - content option/source-label helpers where organizations appear.
7. Prove with tests that no-bundle content needs no catalog export and that
   source suppression does not alter persisted provenance or lifecycle actions.

### 2. Add organization vocabulary and content contracts — complete

1. Add organization-kind vocabulary and tests under
   `packages/contracts/src/rpg/vocab/`.
2. Add `organizations` to content type keys, terms, capabilities, and public
   barrels. Keep API and Homebrew-summary key sets capability-specific until
   their runtime integrations land.
3. Add `ORGANIZATION_CONTENT_TYPE_TERM`.
4. Create `packages/contracts/src/rpg/content/organization.ts` with:
   - publish and draft body schemas;
   - stored publish and draft schemas;
   - publish/draft create and update inputs;
   - patch envelope only if shared public contract completeness requires it,
     while API system patching remains unsupported;
   - co-located parsing and vocabulary tests.
5. Register organizations in the integration manifest with the capabilities
   implemented in this phase:
   - `catalog: { bundledContent: 'none' }`;
   - duplication capability.

   API metadata is added in Phase 3; dashboard route, form, and sidebar metadata
   is added in Phase 4. Drift checks remain strict for every declared
   capability, avoiding placeholder files between phases.

### 3. Add API persistence and lifecycle behavior — complete

1. Add `apps/api/src/features/content/organizations/` with:
   - `homebrew-organization.model.ts`;
   - `organizations.config.ts`;
   - no seed loader and no system patch model.
2. Persist `organizationKind` using `ORGANIZATION_KIND_IDS` and the shared
   campaign/slug identity fields.
3. Register organizations in `content-types.ts`, add `organizations` to
   `API_CONTENT_TYPE_KEYS`, and declare the API registration path in the
   integration manifest.
4. Exercise generic campaign list, draft/publish, create/update, duplication,
   availability, and delete routes.
5. Add organization usage matching:

   ```ts
   { 'connections.organizations.organizationId': contentId }
   ```

6. Block deletion for referenced campaign NPCs and participating PCs.
7. Do not add a demotion blocker for character references.
8. Add a reference-aware organization resolver for authorized character-detail
   reads. Keep it separate from list/discovery endpoints so unpublished records
   cannot be newly selected.

### 4. Add dashboard organization management — complete

Use `skill-proficiencies` as the flat authoring template and `feats` as the
vocabulary-aware overview template.

1. Add `apps/dashboard/src/features/content/organizations/` with list API,
   query hook, display mapper, form fields/values/definition, overview columns,
   and overview/detail/create/edit routes.
2. Form:
   - shared identity fields;
   - rich-text description;
   - required single-select Type for publish;
   - relaxed Type for draft.
3. Detail:
   - Type metadata;
   - authored description;
   - no reverse member list in V1.
4. Overview:
   - sortable Type column;
   - Type equals filter with an All types default;
   - no Homebrew source badge/filter under the presentation policy.
5. Wire content routes, lazy routes, router tree, content exports,
   sidebar/Homebrew registry, `HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS`, and the
   test-only content form registry. Add the implemented dashboard metadata to
   the integration manifest.
6. Add CSF3 stories, interaction tests, and axe checks for new visual and
   interactive surfaces.

Reverse membership remains derivable from character references but is not a V1
query or organization-detail feature; adding it later requires permissions,
pagination, and performance design.

### 5. Add character connection contracts and persistence — complete

1. Add:
   - `characterOrganizationConnectionSchema`;
   - `characterConnectionsSchema`;
   - their inferred public types.
2. Enforce unique, non-empty `organizationId` values and default
   `organizations` to `[]`.
3. Add `connections` to the shared character sheet and create-input contracts.
4. Add `connections` to the character Mongoose model and repository/service
   round trips.
5. Cover empty, populated, duplicate, PC, NPC, create, and read cases.
6. Add `connections` to the builder draft, initialize it empty, and bump
   `CHARACTER_BUILDER_DRAFT_VERSION` without migration.

### 6. Add builder catalog and optional-step orchestration — complete

1. Add `organizations` to `CharacterBuildCatalog`, its index, builder catalog
   clients, campaign catalog clients, fixtures, and context tests.
2. Add organizations to `resolveAvailableContent()` using shared viewer and
   campaign-availability discovery rules.
3. Insert registered Connections metadata after Identity.
4. Introduce effective-step resolution from builder context and update all
   navigation, rail, review, validation, and step-status consumers.
5. Connections is applicable only when at least one organization is selectable
   or when the draft already contains a connection needing display/recovery.
6. Add a Connections validator that:
   - accepts zero records;
   - rejects duplicates or malformed records;
   - reports active-draft IDs that are no longer selectable;
   - targets recovery issues to the Connections step.

### 7. Add the Connections step and organization picker drawer — complete

1. Add a Connections step that shows selected organization rows and opens a
   dedicated picker drawer.
2. Add organization picker modules following the established drawer split:
   client component, types, pure filter/sort/display library, fixtures, stories,
   and tests.
3. Build on `CatalogPickerSheet` and shared picker primitives.
4. Support:
   - name and organization type search;
   - Type as the sole structured filter;
   - name and kind label in result rows;
   - add/remove multiple connections;
   - selected summary;
   - reset view;
   - empty, no-results, and stale-selection recovery states.
5. Update the draft through narrow
   `{ organizationId }` connection records only.
6. Add keyboard, interaction, restoration, navigation-order, and axe coverage.

### 8. Finalization and character display — complete

1. Finalization verifies active draft selections against currently selectable
   organizations and copies normalized connection records into
   `CreateCharacterInput`.
2. Stale draft records block with actionable Connections issues.
3. Review displays selected organization names and kind labels.
4. Character detail displays connections through the reference-aware resolver,
   including unpublished/unavailable and missing-reference states.
5. Do not add organizations to the permanent builder preview rail in V1.
   Reconsider only when connection mechanics or repeated in-builder decisions
   make persistent preview materially useful.
6. Do not query or display reverse organization membership in V1.

## Verification

During implementation, run targeted tests for each changed package. Before the
work is complete, run the content-type drift suites plus the repository gates:

```text
pnpm --filter @rpg/content-types test
pnpm gate:json-schemas
pnpm typecheck:affected
pnpm test:affected
pnpm gate:fallow-dupes
pnpm gate:fallow-health
```

Before sharing:

```text
pnpm gate:pre-push
pnpm coverage
pnpm gate:fallow-health:coverage
pnpm build
```

Required behavior coverage:

- no-bundle manifest and API resolver behavior;
- source-presentation suppression without provenance loss;
- organization contracts, authoring, routes, overview, and accessibility;
- optional effective-step navigation and validation;
- picker search by name/kind and kind-only filtering;
- connection persistence, stale-draft recovery, and reference-aware reads;
- deletion blocked by references and demotion allowed.

## Deferred

- Organization hierarchy
- Roles, ranks, reputation, disposition, and membership history
- Leaders and reverse member directories
- Headquarters and controlled locations
- Alliances, rivalries, and relationship graphs
- Organization mechanics or grants
- Secret/known-to-character visibility
- Organization-domain active/disbanded/destroyed status
- Bundled/SRD organization records
- Permanent preview-rail organization display

Update `docs/roadmap/content-types-roadmap.md` and character feature
documentation when implementation lands. Document reverse membership as
derivable, not as a promised V1 UI or query.
