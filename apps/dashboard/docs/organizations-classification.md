# Organization classification

Organizations carry **Domain**, optional **Form**, **Functions**, **Practices**, and optional
**member class affinities** and **member species affinities**. At least **Domain** is required
on publish.

**Familiar starting points** are create-only ephemeral projections — they seed domain / form /
functions / practices / affinities and are stripped before persist.

| Concern                        | Where to read                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime model**              | This document + [`organization-domain.ts`](../../../packages/contracts/src/rpg/vocab/organization-domain.ts), [`organization-form.ts`](../../../packages/contracts/src/rpg/vocab/organization-form.ts), [`organization-function.ts`](../../../packages/contracts/src/rpg/vocab/organization-function.ts), [`organization-practice.ts`](../../../packages/contracts/src/rpg/vocab/organization-practice.ts) |
| **Taxonomy planning / status** | [`docs/roadmap/organization-taxonomy.md`](../../../docs/roadmap/organization-taxonomy.md)                                                                                                                                                                                                                                                                                                                  |
| **Semantic gates / history**   | [`organization-taxonomy-evidence.md`](../../../docs/analysis/organization-taxonomy-evidence.md) — only when boundary reasoning is needed                                                                                                                                                                                                                                                                   |
| **Frozen research corpus**     | [`organization-taxonomy-discovery.md`](../../../docs/discovery/organization-taxonomy-discovery.md) — digest; full Phases 1–8 in [`archive/organization-taxonomy-discovery-v0.1.md`](../../../docs/discovery/archive/organization-taxonomy-discovery-v0.1.md)                                                                                                                                               |

Do not start from the frozen discovery corpus to learn the current shipped model.

## Canonical axes

| Axis                          | Field                        | Question it answers                                     | Author-facing?                               |
| ----------------------------- | ---------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| **Domain**                    | `organizationDomain`         | Primary constituency or sector                          | Required chips                               |
| **Form**                      | `organizationForm`           | Constitutional pattern (guild, order, company, …)       | Optional select                              |
| **Functions**                 | `functions[]`                | Broad organizational missions                           | Multi chips                                  |
| **Practices**                 | `practices[]`                | Distinctive trades, methods, or operational specialties | Searchable combobox                          |
| **Member class affinities**   | `memberClassAffinityIds[]`   | Classes commonly associated with members                | Multi chips; drives member guidance surfaces |
| **Member species affinities** | `memberSpeciesAffinityIds[]` | Species commonly associated with members                | Multi chips; same guidance surfaces as class |

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
- Preset selection writes domain / form / functions / practices / affinities via
  `buildOrganizationFormValueSyncs`, clears `authoringPresetId`, and sets **recommended practices**
  through `ContentFormCtx.organizationPracticeRecommendationIds` (authoring guidance only).
- Edit routes omit the preset combobox (`mode: 'edit'`).

### Detail surfaces

Organization detail stat rows show Domain, optional Form, Functions, Practices, and member
class/species affinities (when present). Membership rosters intersect affinities with the NPC
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
