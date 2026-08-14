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
| Unresolved                              |                                                                                     **110** — see refactor inventory tests |
| Legacy runtime archetypes (quarantined) |                                                                                                                    **143** |

Persisted ids `watchtower` and `lighthouse` are accepted identifier debt (runtime labels: Watch post,
Beacon station). Do not infer morphology from the id.

**Inventory notables** (exceptions only — not a status ledger)

| Id           | Status         | Note                                                                                        |
| ------------ | -------------- | ------------------------------------------------------------------------------------------- |
| `academy`    | `pending`      | 19C gate rejected Facility promotion; Tier C Family B reviewed                              |
| `blockhouse` | `needs-design` | 19C gate rejected Form promotion; morphology protocol documented                            |
| `museum`     | `pending`      | 19C gate rejected Facility promotion — exhibition reads as flavor on library-class premises |
| `workshop`   | `pending`      | 19C gate rejected Facility promotion — interior / craft-scale; deferred interior bucket     |

## Completed

| Work                                    | Outcome                                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Taxonomy discovery (308-concept corpus) | Frozen evidence in [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md)                                      |
| Model E (archetype-primary)             | Shipped, then **retired** at runtime                                                                                         |
| Building ↔ Organization vertical slice  | Form + Facility persisted; Org domain/form/activity shipped                                                                  |
| Form axis proof                         | `tower`, `hall`, then `keep`                                                                                                 |
| Classification convergence              | Archetype quarantined; representative decompositions proven                                                                  |
| Registry-derived inventory              | `enabled-form` / `enabled-facility` from contracts ids                                                                       |
| Create-flow Phases 7–8                  | **Closed** — open composition holds; 2B not triggered                                                                        |
| Preset investigation (2A)               | Frozen policy; **2B not approved**                                                                                           |
| Manifestation evidence gate             | Failed — no pilot                                                                                                            |
| Tranche 1 disposition                   | Inventory + later Facility promotions (`bathhouse` … `barn`)                                                                 |
| Tier A sweep                            | **102** high-confidence rows; broad-sweep stopping rule **met**                                                              |
| Tier B promotion                        | `granary`, `greenhouse`, `arena`                                                                                             |
| Tier C composite queue                  | **24/24** reviewed; Family B reviewed (`academy` remains `pending`)                                                          |
| Phase 19A morphology                    | **16/16** reviewed — 13 `decompose`, 2 `outside-building-classification`, 1 `needs-design` (`blockhouse`); no Form promotion |
| Phase 19B approximate Facility          | **11/11** reviewed — all `decompose` onto existing Facilities; **0** new Facility candidates                                 |
| Phase 19C selective promotion           | **4/4** carry-forwards gate-reviewed — **0** runtime Form/Facility promotions                                                |

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
| 19B Production / Facility boundary      | COMPLETE |
| 19C Selective runtime promotion         | COMPLETE |
| 19D Exception cleanup / stopping review | NEXT     |

Future work updates one row in this table rather than creating a new plan.

Do not create a new phase for every handful of corpus terms. **19C is closed.** Do not start 19D
until the user asks to continue corpus work.

### 19A — Morphology / Form evidence (closed)

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
Only `blockhouse` was the 19A Form carry-forward; 19C gate rejected promotion. Evidence note **closed** —
[`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md).

**Gate** (historical)

```text
scale / unit
  → stable morphology
  → existing Form sufficiency
  → decompose / outside-building-classification / needs-design
```

Runtime Form promotion is a **separate 19C** decision if a term actually earns admission.

Supporting evidence (historical): [`building-corpus-disposition-sweep-1.md`](../analysis/building-corpus-disposition-sweep-1.md),
[`building-corpus-disposition-tier-c-1.md`](../analysis/building-corpus-disposition-tier-c-1.md),
[`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md).

### 19B — Production / Facility boundary (closed)

**Purpose:** Determine whether existing Facilities (Factory, Warehouse, Shop, Checkpoint, Barn, …)
preserve the configured-premises distinction, or whether a Facility is genuinely missing.

**Frozen allowlist (11):** `PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).
Sweep Family E approximate Facility pull only — **not** the broader production/commercial tail.

**Excluded:** `workshop` (interior vs premises — Tier B / 19C boundary; sweep Family F exception).

**Closeout (2026-08-14):** **11 / 11** `decompose` onto nearest shipped Facility
(`factory`, `mill`, `warehouse`, `stable`, `checkpoint`, `shop` + Organization). **0** new Facility
candidates from this tranche. Evidence:
[`building-corpus-disposition-phase-19b-1.md`](../analysis/building-corpus-disposition-phase-19b-1.md).

**Gate**

```text
configured Building-premises use?
  → Form-independent label test
  → nearest shipped Facility
  → duplicate-vs-distinct (configuration vs scale/subtype)
  → decompose / pending / 19C Facility candidate
```

**19C carry-forward (prior ranking + 19A):** `blockhouse` (Form), `workshop` (Facility),
`academy`, `museum` (institution/premises — not reopened here).

### 19C — Selective runtime vocabulary promotion (closed)

**Purpose:** Promotion gate only — apply existing Form/Facility admission bars to the four carry-forwards
from 19A/19B/Tier B. **Not** a discovery phase; do not pull in additional corpus terms.

**Frozen allowlist (4):** `PHASE_19C_CANDIDATE_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

| Candidate    | Axis     | Key question                                                                             |
| ------------ | -------- | ---------------------------------------------------------------------------------------- |
| `blockhouse` | Form     | Is stable morphology important enough to deserve a fifth Form?                           |
| `workshop`   | Facility | Is whole-building craft configuration distinct from Factory and Interior workspace?      |
| `museum`     | Facility | Is exhibition a durable premises behavior distinct from Library/Archive?                 |
| `academy`    | Facility | Does it describe premises strongly enough to escape Schoolhouse + Organization identity? |

**Closeout (2026-08-14):** **4 / 4** gate-reviewed; **0** runtime promotions. All candidates fail to
independently clear the admission bar. Evidence:
[`building-corpus-disposition-phase-19c-1.md`](../analysis/building-corpus-disposition-phase-19c-1.md).

| Candidate    | Outcome                                                       |
| ------------ | ------------------------------------------------------------- |
| `blockhouse` | **REJECT** Form — keep `needs-design`                         |
| `workshop`   | **REJECT** Facility — keep `pending` (interior / craft-scale) |
| `museum`     | **REJECT** Facility — keep `pending` (exhibition ≈ flavor)    |
| `academy`    | **REJECT** Facility — keep `pending` (institution > premises) |

**Gate**

```text
carry-forward candidate only
  → apply Form or Facility admission bar (no new evidence gathering)
  → promote OR reject with unchanged inventory disposition
```

Valid outcome: **zero**, **one**, or a **small coherent tranche**. Runtime registry changes stay
separate from inventory disposition.

### 19D — Remaining exceptions + stopping review

**Purpose:** After 19A–C, decide whether further corpus disposition work has product value — not
another broad sweep for count reduction.

**Scope (~110 unresolved):** spot-check high-value remainder buckets only; bulk tail may stay
`pending` indefinitely per stopping criteria below.

| Remainder bucket (approx.)               | 19D posture                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Interior substructures (~33)             | **Deferred** — revisit only when interior authoring needs corpus alignment     |
| Production / commercial archetypes (~40) | **Stopping candidate** — nearest Facility + Organization pattern proven in 19B |
| Family F / sweep exceptions (~14)        | Spot-check only if repeated authoring gap surfaces                             |
| Low-confidence cultural tail             | **Stopping candidate** — manifestation/naming, not canonical classification    |
| Reviewed `pending` carry-forwards        | **Closed at 19C** — `academy`, `museum`, `workshop`, `blockhouse`              |

**19D does not reopen:** Tier A sweep, morphology allowlist (19A), approximate Facility pull (19B),
or 19C promotion candidates.

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

| Deferred                                               | Reopen trigger                                                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Interior substructure corpus                           | Interior authoring needs corpus alignment, or a term proves whole-Building premises                                                 |
| Presets / 2B                                           | Real authoring friction that aliases cannot solve; start from Wizard tower per 2A                                                   |
| Manifestation runtime model                            | Search, discovery, or inheritance requires semantic parent-child that aliases/metadata cannot represent; exact axis and ≥2 pairs    |
| Corpus graph retargeting                               | A runtime consumer starts treating frozen `of:` edges as live classification                                                        |
| Archetype deletion                                     | No remaining migration/research consumers; quarantine stays until then                                                              |
| `watchtower` / `lighthouse` persisted-id normalization | Real API/domain confusion, lexical-id inference in new code, or a broader Facility-id pass                                          |
| `academy` promotion                                    | Premises distinction materially exceeds Schoolhouse plus institution identity                                                       |
| `blockhouse` promotion                                 | Repeated authoring friction for strongpoint morphology under open composition; committed Form definition passes morphology protocol |
| `workshop` promotion                                   | Whole-building craft premises case stronger than Factory + interior deferred work                                                   |
| `museum` promotion                                     | Exhibition premises configuration case stronger than Library/Archive + spectacle Facilities                                         |
| Low-confidence cultural tail                           | Manifestation work reopens, or repeated authoring gap after 19B–C                                                                   |
| Broad production sweep for count reduction             | **Do not reopen** solely to lower the unresolved count                                                                              |
| Form × Facility compatibility matrices                 | A reviewed semantic counterexample to open composition                                                                              |
| Searchable / grouped Form Setup                        | Form count materially exceeds current radio-card scanability (empirical warning ~8–10)                                              |
| Apartment dual-axis Form                               | New morphology evidence; currently facility-only                                                                                    |
| Gatehouse as Form                                      | New morphology evidence; currently decompose                                                                                        |
| Apothecary Organization activity gap                   | Separate Organization vocabulary audit, not a Building Facility                                                                     |

Do not create speculative implementation work from this table.

## Evidence index

Open these only for the reason listed. None of them is the current plan.

| Document                                                                                                     | Status                         | Open when                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------------- |
| [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md)     | Runtime authoring SSOT         | Understanding the shipped model                                            |
| [`building-corpus-disposition-phase-19c-1.md`](../analysis/building-corpus-disposition-phase-19c-1.md)       | Closed                         | 19C closeout — promotion gate, four carry-forwards, zero runtime additions |
| [`building-corpus-disposition-phase-19b-1.md`](../analysis/building-corpus-disposition-phase-19b-1.md)       | Closed                         | 19B closeout — approximate Facility allowlist, rules, disposition cards    |
| [`building-corpus-disposition-sweep-1.md`](../analysis/building-corpus-disposition-sweep-1.md)               | Supporting evidence            | Family rules, Tier B duplicate-vs-distinct test                            |
| [`building-corpus-disposition-tier-c-1.md`](../analysis/building-corpus-disposition-tier-c-1.md)             | Closed supporting evidence     | Morphology protocol history; scale/unit gate                               |
| [`building-corpus-disposition-phase-19a-1.md`](../analysis/building-corpus-disposition-phase-19a-1.md)       | Closed                         | 19A morphology closeout — do not append; use for historical rules/cards    |
| [`building-authoring-preset-investigation-2a.md`](../analysis/building-authoring-preset-investigation-2a.md) | Deferred evidence              | 2B is reopened                                                             |
| [`building-create-phase-7-acceptance.md`](../analysis/building-create-phase-7-acceptance.md)                 | Historical; create-flow closed | Identifier debt, open composition, 2B acceptance findings                  |
| [`building-corpus-disposition-tranche-1.md`](../analysis/building-corpus-disposition-tranche-1.md)           | Historical                     | Apothecary or early blockhouse cards                                       |
| [`building-organization-model-audit.md`](../analysis/building-organization-model-audit.md)                   | Closed audit                   | Original axis split, Org 7c/7d, Form admission protocol                    |
| [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md)                                         | Frozen discovery               | Reconstructing the 308-concept matrix                                      |
| [`building-model-e-implementation-spec.md`](./building-model-e-implementation-spec.md)                       | Superseded                     | Retired Model E implementation history                                     |
| [`building-create-relationship-tabs-phase-0.md`](../analysis/building-create-relationship-tabs-phase-0.md)   | Superseded                     | Pre-implementation create-flow architecture                                |
| [`create-flow.md`](../../apps/dashboard/docs/create-flow.md)                                                 | Runtime create-flow SSOT       | Shared shell / Add-Pending ownership                                       |

## Completed Cursor plans (do not reopen)

Local only (`.cursor/plans/` is gitignored). After the 2026-08-14 consolidation, **zero** Building
taxonomy Cursor plans are active. Do not resurrect them as current guidance.

Discovery, Model E, location taxonomy refactor, vertical slice, Form expansion, convergence,
post-convergence roadmap, create-flow refinement, create acceptance, tranche 1, sweep 1, Tier B
promotion, and Tier C disposition are **completed or superseded**. Future work is driven from this
file.
