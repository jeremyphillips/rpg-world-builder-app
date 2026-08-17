# Organization taxonomy roadmap

**Status:** Active (runtime model)  
**Organization corpus convergence:** CLOSED (150-concept research frozen)  
**Canonical planning document:** Yes

This is the **canonical planning entry point** for Organization taxonomy — current state,
deferred reopen triggers, and future work. Do not start corpus disposition or taxonomy
investigation from historical analysis notes or completed Cursor plans.

## Required reading

| Priority | Document                                                                                       | When                                                              |
| -------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1        | This roadmap                                                                                   | Status, deferred work, SSOT hierarchy                             |
| 2        | [`organizations-classification.md`](../../apps/dashboard/docs/organizations-classification.md) | Shipped Domain / Form / Functions / Practices model and authoring |
| 3        | [`organization-taxonomy-evidence.md`](../analysis/organization-taxonomy-evidence.md)           | Semantic gates and boundary decisions                             |
| 4        | [`organization-taxonomy-discovery.md`](../discovery/organization-taxonomy-discovery.md)        | Research digest — full corpus in archive only                     |

Create-flow: [`form-lib-conventions.md`](../../apps/dashboard/docs/form-lib-conventions.md) § Organization.

## Source-of-truth hierarchy

1. **Runtime classification registries** — what ships  
   [`organization-domain.ts`](../../packages/contracts/src/rpg/vocab/organization-domain.ts),
   [`organization-form.ts`](../../packages/contracts/src/rpg/vocab/organization-form.ts),
   [`organization-function.ts`](../../packages/contracts/src/rpg/vocab/organization-function.ts),
   [`organization-practice.ts`](../../packages/contracts/src/rpg/vocab/organization-practice.ts),
   [`organization-authoring-preset.ts`](../../packages/contracts/src/rpg/vocab/organization-authoring-preset.ts)
2. **This roadmap** — current state, deferred work, sequencing policy
3. **Consolidated evidence** — reusable gates and boundary reasoning only when needed

Do not maintain per-status corpus totals or full preset id lists here when code/tests already own
them.

## Current authoritative model

Persisted Organization classification is **Domain + optional Form + Functions + Practices + member
class affinities + member species affinities**:

| Axis                          | Field                        | Question                                                      |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------- |
| **Domain**                    | `organizationDomain`         | Primary constituency or sector the organization serves        |
| **Form**                      | `organizationForm`           | How the organization is constituted (guild, order, …)         |
| **Functions**                 | `functions[]`                | Broad organizational missions                                 |
| **Practices**                 | `practices[]`                | Distinctive trades, methods, or operational specialties       |
| **Member class affinities**   | `memberClassAffinityIds[]`   | Classes commonly associated with members (authoring guidance) |
| **Member species affinities** | `memberSpeciesAffinityIds[]` | Species commonly associated with members (authoring guidance) |

- **Familiar starting points** (`authoringPresetId`) are ephemeral create-only projections onto
  domain / form / functions / practices / class affinities — never persisted. **Species affinities
  are not preset-seeded:** species composition is setting-dependent and author-specific; Familiar
  types must not assume species defaults.
- Functions and Practices are separate axes after the functions/practices split; partition keys for
  regression live in [`organization-activity-migration.ts`](../../packages/contracts/src/rpg/vocab/organization-activity-migration.ts).

The retired V1 **`organizationKind` / `organizationSubtype`** model is documented only as history in
[`organization-content-type-plan.md`](./organization-content-type-plan.md).

## Current state

Verified against registry tests and preset coverage fixtures. If documentation and tests disagree,
**tests win**.

| Item              | Value                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domains           | **10** — see [`ORGANIZATION_DOMAIN_IDS`](../../packages/contracts/src/rpg/vocab/organization-domain.ts)                                                                                                                                       |
| Forms             | **9** — see [`ORGANIZATION_FORM_IDS`](../../packages/contracts/src/rpg/vocab/organization-form.ts)                                                                                                                                            |
| Functions         | **20** — see [`ORGANIZATION_FUNCTION_IDS`](../../packages/contracts/src/rpg/vocab/organization-function.ts)                                                                                                                                   |
| Practices         | **58** — see [`ORGANIZATION_PRACTICE_IDS`](../../packages/contracts/src/rpg/vocab/organization-practice.ts)                                                                                                                                   |
| Authoring presets | **50** — see [`ORGANIZATION_AUTHORING_PRESET_IDS`](../../packages/contracts/src/rpg/vocab/organization-authoring-preset.ts)                                                                                                                   |
| Research corpus   | **150** — digest in [`organization-taxonomy-discovery.md`](../discovery/organization-taxonomy-discovery.md); full record in [`archive/organization-taxonomy-discovery-v0.1.md`](../discovery/archive/organization-taxonomy-discovery-v0.1.md) |

## Test artifacts (not product KPIs)

| Fixture / test                                                                                                                                                          | Role                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`organization-preset-coverage.fixture.ts`](../../apps/dashboard/src/features/content/organizations/lib/__tests__/fixtures/organization-preset-coverage.fixture.ts)     | 150-corpus disposition ledger for preset discovery    |
| [`organization-activity-pressure.fixture.ts`](../../apps/dashboard/src/features/content/organizations/lib/__tests__/fixtures/organization-activity-pressure.fixture.ts) | Function/Practice boundary regression after the split |
| [`organization-semantic-flows.test.ts`](../../apps/dashboard/src/features/content/organizations/lib/organization-semantic-flows.test.ts)                                | Durable search and projection cases                   |
| [`organization-authoring-vocab-smoke.test.ts`](../../apps/dashboard/src/features/content/organizations/lib/organization-authoring-vocab-smoke.test.ts)                  | Shipped vocab appears on authoring surfaces           |

## Stopping rule / reopen triggers

Do not open a new organization taxonomy investigation from an isolated awkward example. Reopen
classification only when production authoring cannot honestly express a needed concept, several
materially different presets require the same missing distinction, or a concrete downstream consumer
requires that distinction.

## Discovery follow-through (product decisions)

Phase 8 of the frozen discovery pass mixed **taxonomy conclusions** (in the
[`discovery digest`](../discovery/organization-taxonomy-discovery.md)) with **implementation
questions** that belong here. Most are now resolved by shipped code; keep as history, not reopen
triggers.

| Discovery question                       | Disposition                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Unlock `force` in form rejection tests?  | **Shipped** — `force` and `office` are production forms                                       |
| Ship two forms + four missions together? | **Shipped** — later split into Functions + Practices                                          |
| Preset picker vs “start from X, rename”? | **Ongoing** — 50 presets + discovery combobox; grow presets with coverage fixture updates     |
| Overview form facet?                     | **Deferred** — overview filters domain only unless product asks for host vs office separation |
| Academy / `college` form stretch?        | **Deferred** — see discovery reopen table                                                     |
| Clandestine field?                       | **Rejected** for taxonomy v1 — see evidence doc                                               |

Verbatim Phase 8 Q1–Q10 leans: [`archive/organization-taxonomy-discovery-v0.1.md`](../discovery/archive/organization-taxonomy-discovery-v0.1.md#phase-8--open-questions).

## Deferred

- Additional authoring presets beyond the current 50 — add only with discovery evidence and
  coverage fixture updates.
- Further Function or Practice promotions — follow evidence gates in
  [`organization-taxonomy-evidence.md`](../analysis/organization-taxonomy-evidence.md).
