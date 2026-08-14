# Building taxonomy roadmap

Status: Active  
Canonical planning document: Yes

This is the **canonical planning entry point** for remaining Building taxonomy and corpus work.
Completed Cursor plans and analysis documents are supporting evidence only unless explicitly linked
from an active phase below. They are not alternate current roadmaps.

Do not start another taxonomy investigation from a Cursor plan, the closed audit, or a historical
analysis note.

## Source-of-truth hierarchy

1. **Runtime Form / Facility registries** — what ships  
   [`building-form.ts`](../../packages/contracts/src/rpg/vocab/location/building-form.ts),
   [`building-facility-type.ts`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts)
2. **Building refactor inventory** — corpus disposition  
   [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts)
3. **This roadmap** — current state, sequencing, gates, deferred work
4. **Linked analysis docs** — supporting evidence only
5. **Completed Cursor plans** — local implementation history only (`.cursor/` is gitignored)

Do not maintain per-status corpus totals, full Facility id lists, or exact tranche membership in
this roadmap when code/tests already own them.

Runtime authoring guidance lives in
[`apps/dashboard/docs/locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md).
That document is the model/UX SSOT, not a second plan.

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
- Organization identity (who operates / owns / occupies) lives on relationships, not Building type.
- The 143-entry `BuildingArchetype` registry is a **quarantined research corpus**, not runtime
  vocabulary.

**Facility admission:** a Facility describes configured **Building-premises** use and must pass the
Form-independent label test. Familiar corpus presence is not enough.

## Current state

Verified 2026-08-14 against registry tests and the refactor inventory (not copied from historical
notes). If documentation and tests disagree, **tests win**.

| Item                                    |                                                                                                                      Value |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------: |
| Forms                                   |                                                                                   **4** — `house`, `tower`, `hall`, `keep` |
| Facilities                              | **36** — see [`BUILDING_FACILITY_TYPE_ENTRIES`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts) |
| Research corpus                         |                                                                                                                    **308** |
| Unresolved                              |                                                                                     **121** — see refactor inventory tests |
| Legacy runtime archetypes (quarantined) |                                                                                                                    **143** |

Persisted ids `watchtower` and `lighthouse` are accepted identifier debt (runtime labels: Watch post,
Beacon station). Do not infer morphology from the id.

**Inventory notables** (exceptions only — not a status ledger)

| Id           | Status         | Note                                                                                      |
| ------------ | -------------- | ----------------------------------------------------------------------------------------- |
| `academy`    | `pending`      | Family B reviewed; premises vs `schoolhouse` unresolved                                   |
| `blockhouse` | `needs-design` | Morphology protocol documented; fortification subgroup reviewed — 19C Form candidacy open |

## Completed

| Work                                    | Outcome                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| Taxonomy discovery (308-concept corpus) | Frozen evidence in [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md) |
| Model E (archetype-primary)             | Shipped, then **retired** at runtime                                                    |
| Building ↔ Organization vertical slice  | Form + Facility persisted; Org domain/form/activity shipped                             |
| Form axis proof                         | `tower`, `hall`, then `keep`                                                            |
| Classification convergence              | Archetype quarantined; representative decompositions proven                             |
| Registry-derived inventory              | `enabled-form` / `enabled-facility` from contracts ids                                  |
| Create-flow Phases 7–8                  | **Closed** — open composition holds; 2B not triggered                                   |
| Preset investigation (2A)               | Frozen policy; **2B not approved**                                                      |
| Manifestation evidence gate             | Failed — no pilot                                                                       |
| Tranche 1 disposition                   | Inventory + later Facility promotions (`bathhouse` … `barn`)                            |
| Tier A sweep                            | **102** high-confidence rows; broad-sweep stopping rule **met**                         |
| Tier B promotion                        | `granary`, `greenhouse`, `arena`                                                        |
| Tier C composite queue                  | **24/24** reviewed; Family B reviewed (`academy` remains `pending`)                     |

Completed-phase counts are historical closeout facts; only the **Current state** section should be
used for present inventory totals.

The closed audit
[`building-organization-model-audit.md`](../analysis/building-organization-model-audit.md)
records implementation history through Phase 18. **Do not append further phases there.**

## Active phase

**Phase 19 — Remaining Building corpus convergence**

| Subphase                                | Status   |
| --------------------------------------- | -------- |
| 19A Morphology / Form evidence          | COMPLETE |
| 19B Production / Facility boundary      | NEXT     |
| 19C Selective runtime promotion         | PLANNED  |
| 19D Exception cleanup / stopping review | PLANNED  |

Future work updates one row in this table rather than creating a new plan.

Do not create a new phase for every handful of corpus terms. Do not start 19A until the user asks
to continue corpus work.

### 19A — Morphology / Form evidence

**Purpose:** Determine whether remaining morphology-rich terms expose a missing canonical Form, or
whether House / Hall / Tower / Keep plus Facilities are sufficient.

**Investigation seeds** (roadmap source list — frozen into executable allowlist 2026-08-14):

`blockhouse`, `martello_tower`, `broch`, `longhouse`, `roundhouse`, `igloo`, `crannog`, `domus`,
`machiya`, `siheyuan`, `tholos`, `tipi`, `yurt`, `cave_dwelling`, `elven_tree_dwelling`,
`shipwreck_dwelling`

**Frozen allowlist (16):** `PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).
Inventory inspection:
[`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md).
Per-term disposition cards proceed from this list only — no scope expansion without a new checkpoint.

**Closeout (2026-08-14):** 13 `decompose`, 2 `outside-building-classification`, 1 `needs-design`
(`blockhouse`). Evidence:
[`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md).
Only `blockhouse` remains a credible **19C Form** candidate.

**Gate**

```text
scale / unit
  → stable morphology
  → existing Form sufficiency
  → decompose / outside-building-classification / needs-design
```

Runtime Form promotion is a **separate 19C** decision if a term actually earns admission.

Evidence to consult when 19A starts:
[`building-corpus-disposition-sweep-1.md`](../analysis/building-corpus-disposition-sweep-1.md)
(morphology pull list),
[`building-corpus-disposition-tier-c-1.md`](../analysis/building-corpus-disposition-tier-c-1.md)
(morphology protocol).

### 19B — Production / Facility boundary

**Purpose:** Determine whether existing Facilities (Factory, Warehouse, Shop, Checkpoint, Barn, …)
preserve the configured-premises distinction, or whether a Facility is genuinely missing.

**Investigation seeds** (not an executable allowlist):

`foundry`, `dyeworks`, `ropewalk`, `workshop`, `icehouse`, `kennel`, `coach_house`,
`artificer_atelier`, `bounty_office`, `fulling_mill`, `tollhouse`, `golem_workshop`

These ids are investigation seeds only. The executable tranche begins only after an exact allowlist
is derived from the current inventory. **Do not** launch another broad count-reduction sweep.

### 19C — Selective runtime vocabulary promotion

Promote the strongest Form or Facility candidates produced by accepted 19A/19B evidence **or** prior
Tier B investigation. Do not hard-code Museum / Workshop / Academy.

Valid outcome: **zero**, **one**, or a **small coherent tranche**. Each addition must pass the
existing admission bar. Runtime registry changes stay separate from inventory disposition.

### 19D — Remaining exceptions + stopping review

Review only high-value unresolved terms after 19A–C. Then decide whether remaining corpus rows
should stay `pending` indefinitely.

**Stopping criteria** (all may justify leaving rows unresolved):

- remainder is predominantly low-frequency
- unresolved meaning is manifestation or cultural naming, not canonical classification
- evidence cost exceeds likely author-facing value
- no repeated gap identifies a missing Form or Facility
- further work would primarily reduce counts rather than improve the product model

Remaining corpus rows **may stay `pending` indefinitely** when resolving them has no current product
value.

## Execution contract

Every future bounded tranche follows this contract. A tranche does **not** automatically require a
new Cursor plan or analysis document.

```text
1. Select exact investigation allowlist
2. Apply established semantic gates
3. Record only genuinely necessary evidence
4. Freeze accepted disposition ids
5. Smallest coherent inventory and/or runtime PR
6. Update tests
7. Record outcome + next subphase in this roadmap
8. Close/supersede any temporary investigation artifact
9. Stop
```

Create a dedicated analysis note only when the investigation produces reusable evidence that this
roadmap cannot concisely own.

## Deferred

| Deferred                                               | Reopen trigger                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Interior substructure corpus                           | Interior authoring needs corpus alignment, or a term proves whole-Building premises                                              |
| Presets / 2B                                           | Real authoring friction that aliases cannot solve; start from Wizard tower per 2A                                                |
| Manifestation runtime model                            | Search, discovery, or inheritance requires semantic parent-child that aliases/metadata cannot represent; exact axis and ≥2 pairs |
| Corpus graph retargeting                               | A runtime consumer starts treating frozen `of:` edges as live classification                                                     |
| Archetype deletion                                     | No remaining migration/research consumers; quarantine stays until then                                                           |
| `watchtower` / `lighthouse` persisted-id normalization | Real API/domain confusion, lexical-id inference in new code, or a broader Facility-id pass                                       |
| `academy` promotion                                    | Premises distinction materially exceeds Schoolhouse plus institution identity                                                    |
| Low-confidence cultural tail                           | 19A exposes repeated missing morphology, or manifestation work reopens                                                           |
| Broad production sweep for count reduction             | **Do not reopen** solely to lower the unresolved count                                                                           |
| Form × Facility compatibility matrices                 | A reviewed semantic counterexample to open composition                                                                           |
| Searchable / grouped Form Setup                        | Form count materially exceeds current radio-card scanability (empirical warning ~8–10)                                           |
| Apartment dual-axis Form                               | New morphology evidence; currently facility-only                                                                                 |
| Gatehouse as Form                                      | New morphology evidence; currently decompose                                                                                     |
| Apothecary Organization activity gap                   | Separate Organization vocabulary audit, not a Building Facility                                                                  |

Do not create speculative implementation work from this table.

## Evidence index

Open these only for the reason listed. None of them is the current plan.

| Document                                                                                                     | Status                         | Open when                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------- |
| [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md)     | Runtime authoring SSOT         | Understanding the shipped model                                           |
| [`building-corpus-disposition-sweep-1.md`](../analysis/building-corpus-disposition-sweep-1.md)               | Supporting evidence            | 19A/19B — family rules, morphology pulls, approximate-Facility exceptions |
| [`building-corpus-disposition-tier-c-1.md`](../analysis/building-corpus-disposition-tier-c-1.md)             | Supporting evidence            | 19A — scale/unit gate, morphology protocol, composite cards               |
| [`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md)       | Closed supporting evidence     | 19A closeout — allowlist, rules, disposition cards                        |
| [`building-authoring-preset-investigation-2a.md`](../analysis/building-authoring-preset-investigation-2a.md) | Deferred evidence              | 2B is reopened                                                            |
| [`building-create-phase-7-acceptance.md`](../analysis/building-create-phase-7-acceptance.md)                 | Historical; create-flow closed | Identifier debt, open composition, 2B acceptance findings                 |
| [`building-corpus-disposition-tranche-1.md`](../analysis/building-corpus-disposition-tranche-1.md)           | Historical                     | Apothecary or early blockhouse cards                                      |
| [`building-organization-model-audit.md`](../analysis/building-organization-model-audit.md)                   | Closed audit                   | Original axis split, Org 7c/7d, Form admission protocol                   |
| [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md)                                         | Frozen discovery               | Reconstructing the 308-concept matrix                                     |
| [`building-model-e-implementation-spec.md`](./building-model-e-implementation-spec.md)                       | Superseded                     | Retired Model E implementation history                                    |
| [`building-create-relationship-tabs-phase-0.md`](../analysis/building-create-relationship-tabs-phase-0.md)   | Superseded                     | Pre-implementation create-flow architecture                               |
| [`create-flow.md`](../../apps/dashboard/docs/create-flow.md)                                                 | Runtime create-flow SSOT       | Shared shell / Add-Pending ownership                                      |

## Completed Cursor plans (do not reopen)

Local only (`.cursor/plans/` is gitignored). After the 2026-08-14 consolidation, **zero** Building
taxonomy Cursor plans are active. Do not resurrect them as current guidance.

Discovery, Model E, location taxonomy refactor, vertical slice, Form expansion, convergence,
post-convergence roadmap, create-flow refinement, create acceptance, tranche 1, sweep 1, Tier B
promotion, and Tier C disposition are **completed or superseded**. Future work is driven from this
file.
