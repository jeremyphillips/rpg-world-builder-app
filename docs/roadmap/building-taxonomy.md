# Building taxonomy roadmap

**Status:** Active (runtime model)  
**Building corpus convergence: CLOSED**  
**Canonical planning document:** Yes

This is the **canonical planning entry point** for Building taxonomy — current state, deferred reopen
triggers, and future work. Do not start corpus disposition or taxonomy investigation from historical
analysis notes or completed Cursor plans.

## Required reading

| Priority | Document                                                                                                 | When                                          |
| -------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1        | This roadmap                                                                                             | Status, deferred work, SSOT hierarchy         |
| 2        | [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md) | Shipped Form + Facility model and authoring   |
| 3        | [`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md)                             | Semantic gates and boundary decisions         |
| 4        | [`building-taxonomy-discovery.md`](../discovery/building-taxonomy-discovery.md)                          | Research digest — full corpus in archive only |

Create-flow: [`create-flow.md`](../../apps/dashboard/docs/create-flow.md).

## Source-of-truth hierarchy

1. **Runtime Form / Facility registries** — what ships  
   [`building-form.ts`](../../packages/contracts/src/rpg/vocab/location/building-form.ts),
   [`building-facility-type.ts`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts)
2. **Building refactor inventory** — corpus disposition membership  
   [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts)
3. **This roadmap** — current state, deferred work, sequencing policy
4. **Consolidated evidence** — reusable gates and boundary reasoning only when needed

Do not maintain per-status corpus totals or full Facility id lists here when code/tests already own
them.

## Current authoritative model

Persisted Building classification is **Form + Facility only**:

| Axis              | Field                         | Question                                                    |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| **Building Form** | `classification.form`         | Physical morphology, construction, or architectural pattern |
| **Facility type** | `classification.facilityType` | Configured purpose or service of the premises               |

- Facility is the primary authoring/discovery axis; Form is optional structural precision.
- At least one of Form or Facility is required on persisted classification.
- Open Form × Facility composition: no pair allowlists.
- Functions derive from Facility (`getEffectiveBuildingFunctions()`), never from Form.
- Organization identity lives on relationships, not Building type.
- The 143-entry `BuildingArchetype` registry is a **quarantined research corpus**, not runtime
  vocabulary.

**Model E** (archetype-primary classification) was retired. See
[`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md#model-e-retired).

## Current state

Verified against registry tests and the refactor inventory. If documentation and tests disagree,
**tests win**.

| Item                                    | Value                                                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Forms                                   | **4** — `house`, `tower`, `hall`, `keep`                                                                                   |
| Facilities                              | **40** — see [`BUILDING_FACILITY_TYPE_ENTRIES`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts) |
| Research corpus                         | **308**                                                                                                                    |
| Unresolved (`pending` + `needs-design`) | **56** — see refactor inventory tests                                                                                      |
| Legacy runtime archetypes (quarantined) | **143**                                                                                                                    |

Persisted ids `watchtower` and `lighthouse` are accepted identifier debt (runtime labels: Watch post,
Beacon station).

**Inventory notables** (exceptions only):

| Id           | Status             | Note                                                        |
| ------------ | ------------------ | ----------------------------------------------------------- |
| `academy`    | `pending`          | Institution > premises — Facility promotion rejected        |
| `blockhouse` | `needs-design`     | Stable morphology; no shipped Form; Form promotion rejected |
| `museum`     | `pending`          | Exhibition ≈ flavor on library/archive/spectacle Facilities |
| `workshop`   | `enabled-facility` | Promoted Phase 20A — product case cleared admission bar     |

Exact unresolved membership: post-Phase 22 tests in
[`building-archetype-refactor-inventory.test.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.test.ts).

## Completed work (summary)

Broad corpus disposition and vocabulary enrichment are **closed** (Phases 19–22, 2026-08-14).

| Track                             | Outcome                                                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Taxonomy discovery (308 concepts) | Digest [`building-taxonomy-discovery.md`](../discovery/building-taxonomy-discovery.md); full record [`archive/building-taxonomy-discovery-v0.5.md`](../discovery/archive/building-taxonomy-discovery-v0.5.md) |
| Model E                           | Shipped, then **retired** at runtime                                                                                                                                                                          |
| Form + Facility convergence       | Archetype quarantined; `tower`, `hall`, `keep` admitted                                                                                                                                                       |
| Create-flow Phases 7–8            | **Closed** — open composition; presets **2B not approved**                                                                                                                                                    |
| Corpus disposition (19A–19D)      | Morphology, approximate Facility, promotion gate, stopping review — **no further broad sweeps**                                                                                                               |
| Phase 20 Facility enrichment      | `workshop`, `office`, `bakery`, `auction_house` promoted                                                                                                                                                      |
| Phase 21 commercial tail          | **38/38** reviewed — vocabulary **sufficient**                                                                                                                                                                |
| Phase 22 final coverage           | **22/22** residual + urban audit — **common urban coverage sufficient**                                                                                                                                       |

Phase closeout detail lives in git history, inventory allowlists, and
[`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md).

## Discovery follow-through (product decisions)

Phase 5 and the editorial appendices mixed **taxonomy conclusions** (in the
[`discovery digest`](../discovery/building-taxonomy-discovery.md)) with **implementation
questions** that belong here. Model E shipped, then runtime converged to Form + Facility; most
items below are historical or deferred.

| Discovery / appendix topic                  | Disposition                                                         |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Model E registry + specialization authoring | **Retired at runtime** — quarantined archetype corpus               |
| Seed migration (25 subtypes → archetypes)   | **Historical** — pre–Form/Facility convergence                      |
| Specialization cleanup (Phase 8 appendix)   | **Historical** — free-text specialization no longer on runtime path |
| Overview archetype/function filters         | **Superseded** — overview uses Form/Facility discovery              |
| Presets / Slice 2B                          | **Deferred** — see evidence doc; not approved                       |
| Manifestation runtime encoding              | **Deferred** — see deferred table below                             |
| Foundry search in Archetype picker          | **Product decision** — closed with Model E retirement               |

Verbatim Phase 5 implementation handoff and appendices:
[`archive/building-taxonomy-discovery-v0.5.md`](../discovery/archive/building-taxonomy-discovery-v0.5.md).

## Stopping rule (active)

> Stop Building corpus taxonomy work unless real authoring usage exposes a concrete missing concept.

Remaining **56** unresolved research rows (mostly interiors + reviewed carry-forwards + cultural tail)
may stay deferred indefinitely.

## Execution contract

Future bounded work follows:

```text
1. Select exact investigation allowlist
2. Apply established semantic gates (evidence doc)
3. Record only genuinely necessary evidence
4. Freeze accepted disposition ids in inventory
5. Smallest coherent inventory and/or runtime PR
6. Update tests
7. Record outcome in this roadmap
8. Delete or avoid temporary investigation artifacts
9. Stop
```

## Documentation retention

> If a completed investigation's accepted conclusions are represented by current code/tests and its
> reusable reasoning has been captured in a canonical runtime doc or
> [`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md), delete the
> investigation document. Git history is the archive.

## Deferred

| Deferred                                         | Reopen trigger                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Interior substructure corpus                     | Interior authoring needs alignment, or whole-Building premises evidence               |
| Presets / 2B                                     | Real authoring friction aliases cannot solve — see evidence doc                       |
| Manifestation runtime                            | Consumer needs same-axis inheritance aliases/metadata cannot represent                |
| Corpus graph retargeting                         | Runtime consumer treats frozen `of:` edges as live classification                     |
| Archetype deletion / refactor tooling retirement | No migration, corpus investigation, or research consumer — see **Transition tooling** |
| `watchtower` / `lighthouse` id normalization     | API/domain confusion or lexical-id inference in new code                              |
| `academy` / `museum` / `blockhouse`              | See evidence doc boundary table                                                       |
| Remaining corpus (~56 unresolved)                | **Closed** — stop unless authoring exposes a concrete gap                             |
| Form × Facility compatibility matrices           | Reviewed semantic counterexample to open composition                                  |
| Searchable / grouped Form Setup                  | Form count exceeds radio-card scanability (~8–10)                                     |
| Apartment dual-axis Form                         | New morphology evidence — currently facility-only                                     |
| Gatehouse as Form                                | New morphology evidence — currently decompose                                         |
| Apothecary Organization activity                 | Separate Organization vocabulary audit                                                |

Do not create speculative implementation work from this table.

## Transition tooling

These remain for corpus research and disposition verification — **do not delete without a retirement
pass**:

| Asset                                                                                                                    | Role                                             |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [`building-archetype.ts`](../../packages/contracts/src/rpg/vocab/location/building-archetype.ts) + shards                | Quarantined research corpus                      |
| [`building-archetype-quarantine.js`](../../packages/config/src/eslint/building-archetype-quarantine.js)                  | ESLint guard — production must not import corpus |
| [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts) | Disposition membership SSOT                      |

**Retirement trigger:** retire Building refactor tooling when no remaining planned corpus
investigation, migration, or research consumer requires it.

**Future cleanup (not in scope now):** if taxonomy work stays closed and the corpus is reference-only,
a later pass could move quarantined corpus data out of `packages/contracts` into tooling/reference
data — only when ESLint consumers and inventory derivation have a safe new home.

## Evidence

- [`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md) — semantic gates and
  important boundary decisions
- [`building-taxonomy-discovery.md`](../discovery/building-taxonomy-discovery.md) — research digest;
  full 308-concept record in
  [`archive/building-taxonomy-discovery-v0.5.md`](../discovery/archive/building-taxonomy-discovery-v0.5.md)
- [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md) —
  runtime authoring SSOT
- [`create-flow.md`](../../apps/dashboard/docs/create-flow.md) — Building create UX / composite submit
