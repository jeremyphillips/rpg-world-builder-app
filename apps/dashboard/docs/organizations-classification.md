# Organization classification

Organizations carry **Domain**, optional **Form**, **Functions**, **Practices**, and a nested
**`members`** object for member guidance and the membership title catalog. At least **Domain**
is required on publish.

```ts
type OrganizationMembers = {
  classAffinityIds: string[]
  speciesAffinityIds: string[]
  npcTemplateId?: NpcTemplateId // default role when a title has none
  titles: OrganizationMembershipTitleDefinition[] // snapshot catalog
}
```

**Familiar starting points** are create-only draft UI (`startingPointId`) — they materialize domain /
form / functions / practices / class affinities, the default NPC role, and membership titles into
organization-owned form state. The association is not persisted on the organization record.
`members.npcTemplateId` is persisted and owned-editable. The role picker itself is a later
surface; create and edit already round-trip the preset value.

| Concern                        | Where to read                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime model**              | This document + [`organization-domain.ts`](../../../packages/contracts/src/rpg/vocab/organization-domain.ts), [`organization-form.ts`](../../../packages/contracts/src/rpg/vocab/organization-form.ts), [`organization-function.ts`](../../../packages/contracts/src/rpg/vocab/organization-function.ts), [`organization-practice.ts`](../../../packages/contracts/src/rpg/vocab/organization-practice.ts) |
| **Taxonomy planning / status** | [`docs/roadmap/organization-taxonomy.md`](../../../docs/roadmap/organization-taxonomy.md)                                                                                                                                                                                                                                                                                                                  |
| **Semantic gates / history**   | [`organization-taxonomy-evidence.md`](../../../docs/analysis/organization-taxonomy-evidence.md) — only when boundary reasoning is needed                                                                                                                                                                                                                                                                   |
| **Frozen research corpus**     | [`organization-taxonomy-discovery.md`](../../../docs/discovery/organization-taxonomy-discovery.md) — digest; full Phases 1–8 in [`archive/organization-taxonomy-discovery-v0.1.md`](../../../docs/discovery/archive/organization-taxonomy-discovery-v0.1.md)                                                                                                                                               |

Do not start from the frozen discovery corpus to learn the current shipped model.

## Canonical axes

| Axis                          | Field                          | Question it answers                                     | Author-facing?                               |
| ----------------------------- | ------------------------------ | ------------------------------------------------------- | -------------------------------------------- |
| **Domain**                    | `organizationDomain`           | Primary constituency or sector                          | Required chips                               |
| **Form**                      | `organizationForm`             | Constitutional pattern (guild, order, company, …)       | Optional select                              |
| **Functions**                 | `functions[]`                  | Broad organizational missions                           | Multi chips                                  |
| **Practices**                 | `practices[]`                  | Distinctive trades, methods, or operational specialties | Searchable combobox                          |
| **Member class affinities**   | `members.classAffinityIds[]`   | Classes commonly associated with members                | Multi chips; drives member guidance surfaces |
| **Member species affinities** | `members.speciesAffinityIds[]` | Species commonly associated with members                | Multi chips; same guidance surfaces as class |

### Functions vs Practices

- **Functions** describe reusable organizational missions spanning many familiar types (`trade`,
  `warfare`, `education`, …).
- **Practices** describe distinctive operational specialties (`blacksmithing`, `smuggling`,
  `investigation`, …).
- The same lexical token must not appear on both axes — enforced by disjoint registries and
  [`organization-activity-migration.ts`](../../../packages/contracts/src/rpg/vocab/organization-activity-migration.ts)
  partition tests.

### Familiar starting points (presets)

- Registry: [`organization-authoring-preset.ts`](../../../packages/contracts/src/rpg/vocab/organization-authoring-preset.ts)
- Create routes mount `OrganizationAuthoringFormShell` + `OrganizationAuthoringPresetBridge`.
- Starting point selection writes domain / form / functions / practices / affinities / titles via
  `buildOrganizationFormValueSyncs` while keeping an editable clearable `startingPointId` select.
  **Recommended practices** flow through `ContentFormCtx.organizationPracticeRecommendationIds`
  (authoring guidance only) while a starting point remains selected.
- Removing the starting point clears the association and recommendations but retains materialized
  profile values, class affinities, and titles.
- Edit routes expose **Use familiar type…** on the Organization profile legend. The temporary
  field replaces profile values plus class affinities after confirmation, leaves titles unchanged,
  then closes.

### Membership title catalog

Organizations carry a snapshot catalog at `members.titles[]`. Three ID layers apply:

| Layer        | Field                   | Meaning                                                        |
| ------------ | ----------------------- | -------------------------------------------------------------- |
| Vocabulary   | `titleId`               | Canonical reusable concept (`captain`, `quartermaster`)        |
| Preset ref   | `{ titleId, priority }` | Curated titles for a familiar starting point                   |
| Organization | `id` (`omt_*`)          | Opaque org-local identity; optional `sourceTitleId` provenance |

**Open vocabulary:** the canonical registry is typed for preset references, but organizations
may hold custom titles with no vocabulary entry. Preset `titleId` refs stay compile-time typed;
org title space stays open.

**Create path:** dashboard sends explicit `members.titles[]` when a starting point materialized
the catalog (or when authored manually). The API persists title rows as given.

| Path          | Client sends               | API persists                                                                     |
| ------------- | -------------------------- | -------------------------------------------------------------------------------- |
| Materialized  | `members.titles` snapshot  | As given (validate ids; preserve order)                                          |
| Manual create | optional `members.titles`  | As given (validate ids; preserve order)                                          |
| Duplicate     | (N/A — server copies body) | Source title rows copied in order with new `omt_*` ids; `sourcePresetId` omitted |

**Create path:** the dashboard materializes `members.titles` from the selected starting point
(or authors titles manually) and sends the snapshot on create. The API validates ids and
persists the catalog as given.

**Edit path:** classification forms expose `members.classAffinityIds`,
`members.speciesAffinityIds`, and the membership title catalog for mutation. **Use familiar
type…** replaces profile values and class affinities after confirmation but **never** replaces
`members.titles`. `connections` stay off the classification form; location connections use
dedicated mutations.

**Referential integrity:** writes that remove a title id fail when character relationship edges
still reference that `omt_*` id (including draft organization saves that run the same validation).

**Array order:** preset and stored `members.titles` order is meaningful — snapshot creation,
Mongo mapping, API serialization, duplication, and parse round-trips must preserve array
order. Roster/display sort uses priority descending, then original array index as tie-break.

**Character memberships:** relationship edges store optional `membershipTitleId` referencing
organization-owned `omt_*` ids. Label and roster rank are projected from `members.titles` at read
time; the create form shows the materialized catalog before save, and clearing a starting point
does not erase it.

**Retired:** classification-derived membership titles (five-slot resolver pipeline) were
removed. Titles come only from the create-boundary snapshot or explicit manual catalog —
never from domain / form / function inference at runtime.

Detail: [`organization/membership-titles.ts`](../../../packages/contracts/src/rpg/content/organization/membership-titles.ts),
[`organization-membership-title.ts`](../../../packages/contracts/src/rpg/vocab/organization-membership-title.ts).

### Detail surfaces

Organization detail stat rows show Domain, optional Form, Functions, Practices, and member
class/species affinities (when present). A **Membership titles** section lists `members.titles` in
canonical hierarchy order (same sort as member-title pickers). Authoring forms edit label and rank;
presets may seed the catalog at create. Once materialized, titles are organization-owned and are not
replaced when applying a familiar type on edit.

Membership rosters intersect affinities with the NPC
playable catalog from `resolvePlayableBuilderContent` to badge recommended picker rows. The
picker candidate list loads independently — recommendations decorate rows once that universe
is ready; a failed build context degrades badges only.

Affinity fields reference content ids only — they do **not** apply Species creature-type
authoring policy or campaign `visibilityMode`. Consumption surfaces apply
`resolvePlayableBuilderContent` for the relevant `playActor` when resolving recommendations.
Detail:
[`campaign-access-enforcement.md`](../../../apps/api/docs/campaign-access-enforcement.md)
§ Organization member affinities vs Species authoring vs character play.

## Authoring flow

Standalone create: [`organization-create.tsx`](../routes/organization-create.tsx).

Embedded building-org create reuses the same field projection under the
`operatorOrganization.*` prefix — see [`form-lib-conventions.md`](./form-lib-conventions.md) §
Organization.

## Retired V1 model

The first organization slice used `organizationKind` / `organizationSubtype`. That model was
superseded by Domain / Form / Functions / Practices. Historical plan:
[`organization-content-type-plan.md`](../../../docs/roadmap/organization-content-type-plan.md).

The interim `activities[]` field was replaced by `functions[]` and `practices[]`. Legacy bodies
that contain only `activities` are stripped on parse with **no migration** — classification data
on those records is intentionally discarded in this dev-only environment.
