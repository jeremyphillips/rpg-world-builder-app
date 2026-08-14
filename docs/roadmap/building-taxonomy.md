# Building taxonomy roadmap

Status: Active (runtime model)  
**Building corpus convergence: CLOSED**  
**Phase 20 — Commercial / Production vocabulary enrichment: COMPLETE**  
**Phase 21 — Commercial / Production tail reconciliation: COMPLETE**  
**Phase 22 — Final practical Building coverage review: COMPLETE**  
Canonical planning document: Yes

This is the **canonical planning entry point** for Building taxonomy — runtime model, deferred
reopen triggers, and Phase 19–22 sequencing. Broad corpus disposition is **closed**.
Completed Cursor plans and analysis documents are supporting evidence only unless explicitly linked
from the active or completed phase below. They are not alternate current roadmaps.

Do not start corpus disposition or another taxonomy investigation from a Cursor plan, the closed
audit, or a historical analysis note.

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
| Facilities                              | **40** — see [`BUILDING_FACILITY_TYPE_ENTRIES`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts) |
| Research corpus                         |                                                                                                                    **308** |
| Unresolved                              |                                                                                      **56** — see refactor inventory tests |
| Unresolved breakdown                    |                                                     **55** `pending` + **1** `needs-design` — post-Phase 22 snapshot below |
| Legacy runtime archetypes (quarantined) |                                                                                                                    **143** |

Persisted ids `watchtower` and `lighthouse` are accepted identifier debt (runtime labels: Watch post,
Beacon station). Do not infer morphology from the id.

**Inventory notables** (exceptions only — not a status ledger)

| Id           | Status             | Note                                                                                               |
| ------------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| `academy`    | `pending`          | 19C gate rejected Facility promotion; Tier C Family B reviewed                                     |
| `blockhouse` | `needs-design`     | 19C gate rejected Form promotion; morphology protocol documented                                   |
| `museum`     | `pending`          | 19C gate rejected Facility promotion — exhibition reads as flavor on library-class premises        |
| `workshop`   | `enabled-facility` | **Phase 20A PROMOTE** — artisan craft/production premises; corpus `interior` disposition unchanged |

**Post-Phase 22 unresolved snapshot** (verified 2026-08-14 — tests win):

```text
pending:          55
needs-design:      1  (blockhouse)
total unresolved: 56
```

| Corpus `kind`    | Unresolved | Inventory status split          | Post-Phase 22 posture                       |
| ---------------- | ---------: | ------------------------------- | ------------------------------------------- |
| `interior`       |     **38** | 38 `pending`                    | **Deferred** — out of scope                 |
| `archetype`      |     **17** | 16 `pending` + 1 `needs-design` | 11 carry-forward controls + 6 cultural tail |
| `overlay`        |      **1** | 1 `pending` (`tent_pavilion`)   | Scenario/context — intentionally unresolved |
| `specialization` |      **0** | —                               | Closed in 22A (`orangery`, `silo`)          |
| `not_building`   |      **0** | —                               | Closed in 22A (`pigsty` → outside)          |
| `manifestation`  |      **0** | —                               | Closed — all dispositioned                  |

Exact membership: post-Phase 22 tests in
[`building-archetype-refactor-inventory.test.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.test.ts).
22A disposition allowlists: `PHASE_22A_*` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**Pre-Phase 22 entry snapshot** (historical): pending **70**, needs-design **1**, total **71**.
Count-reconciliation note: `38 + 25 + 5 + 2 + 1 = 71` by kind; pending sum is
`38 + 24 + 5 + 2 + 1 = 70` because `blockhouse` is `needs-design` within the 25 `archetype` rows.

## Completed

| Work                                    | Outcome                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Taxonomy discovery (308-concept corpus) | Frozen evidence in [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md)                                         |
| Model E (archetype-primary)             | Shipped, then **retired** at runtime                                                                                            |
| Building ↔ Organization vertical slice  | Form + Facility persisted; Org domain/form/activity shipped                                                                     |
| Form axis proof                         | `tower`, `hall`, then `keep`                                                                                                    |
| Classification convergence              | Archetype quarantined; representative decompositions proven                                                                     |
| Registry-derived inventory              | `enabled-form` / `enabled-facility` from contracts ids                                                                          |
| Create-flow Phases 7–8                  | **Closed** — open composition holds; 2B not triggered                                                                           |
| Preset investigation (2A)               | Frozen policy; **2B not approved**                                                                                              |
| Manifestation evidence gate             | Failed — no pilot                                                                                                               |
| Tranche 1 disposition                   | Inventory + later Facility promotions (`bathhouse` … `barn`)                                                                    |
| Tier A sweep                            | **102** high-confidence rows; broad-sweep stopping rule **met**                                                                 |
| Tier B promotion                        | `granary`, `greenhouse`, `arena`                                                                                                |
| Tier C composite queue                  | **24/24** reviewed; Family B reviewed (`academy` remains `pending`)                                                             |
| Phase 19A morphology                    | **16/16** reviewed — 13 `decompose`, 2 `outside-building-classification`, 1 `needs-design` (`blockhouse`); no Form promotion    |
| Phase 19B approximate Facility          | **11/11** reviewed — all `decompose` onto existing Facilities; **0** new Facility candidates                                    |
| Phase 19C selective promotion           | **4/4** carry-forwards gate-reviewed — **0** runtime Form/Facility promotions                                                   |
| Phase 19D stopping review               | Stopping criteria met — **no** further broad corpus disposition; **110** rows remain deferred                                   |
| Phase 20A foundation Facility admission | **2 / 2** promoted — `workshop`, `office`; unresolved **109**                                                                   |
| Phase 20B specialist Facility admission | **2 / 8** promoted — `bakery`, `auction_house`; unresolved **107**                                                              |
| Phase 20C authoring / discovery review  | Grouping held; Setup scanability verified at **40** Facilities; Storybook tag `phase-20-building-flows`                         |
| Phase 21 Commercial / Production tail   | **38 / 38** reviewed — **34** `decompose`, **2** `outside-building-classification`, **2** `pending`; unresolved **71**          |
| Phase 22 Final practical coverage       | **22 / 22** 22A + urban audit — **14** `decompose`, **1** `outside-building-classification`, **7** `pending`; unresolved **56** |

Completed-phase counts are historical closeout facts; only the **Current state** section should be
used for present inventory totals.

The closed audit
[`building-organization-model-audit.md`](../analysis/building-organization-model-audit.md)
records implementation history through Phase 18. **Do not append further phases there.**

## Phase 19 — COMPLETE

**Building taxonomy convergence: CLOSED** (2026-08-14)

| Subphase                           | Status   |
| ---------------------------------- | -------- |
| 19A Morphology / Form evidence     | COMPLETE |
| 19B Production / Facility boundary | COMPLETE |
| 19C Selective runtime promotion    | COMPLETE |
| 19D Stopping review                | COMPLETE |

No further broad corpus disposition is planned. The **110** remaining `pending` / `needs-design` rows
stay in the quarantined research corpus — **deferred / research-only** unless a concrete product need
reopens a bounded exception (see **Deferred**).

Do not start another corpus disposition tranche from historical analysis notes or Cursor plans.
Phase 20 and future explicitly scoped phases update this roadmap — not incremental count-reduction
sweeps.

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

### 19D — Stopping review (closed)

**Purpose:** Roadmap-level closeout after 19A–C — three questions only. Not another investigation
tranche; no dedicated analysis document.

**Closeout (2026-08-14):**

| Question                                                                                                                   | Answer                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is there any repeated unresolved pattern that still indicates a missing Form or Facility?                                  | **No.** 19B decomposed **11/11** approximate-Facility rows onto existing Facilities; 19C gate-rejected all four carry-forwards. No convergent gap survived targeted review. |
| Are the remaining **~110** rows mostly low-value tail, cultural/manifestation language, interiors, or contextual variants? | **Yes.** Interior substructures (~33), production/commercial tail (~40), low-confidence cultural/manifestation naming, and contextual variants dominate. Leave unresolved.  |
| Is there any bounded exception worth resolving now because it affects authoring or migration?                              | **No.** No authoring friction or migration blocker identified beyond the four 19C-reviewed carry-forwards (all rejected). Close corpus convergence.                         |

**Outcome:** Stopping criteria met. No broad corpus disposition continues. Remainder buckets stay
deferred:

| Remainder bucket (approx.)               | Post-19D posture                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Interior substructures (~33)             | **Deferred** — interior authoring or whole-Building premises evidence only                         |
| Production / commercial archetypes (~40) | **Deferred for disposition** — Phase 20 may promote individual Facilities from product review only |
| Family F / sweep exceptions (~14)        | **Deferred** — no repeated authoring gap after 19B–C                                               |
| Low-confidence cultural tail             | **Deferred** — manifestation/naming, not canonical classification                                  |
| Reviewed `pending` carry-forwards        | **Closed at 19C** — `academy`, `museum`, `workshop`, `blockhouse`                                  |

**19D did not reopen:** Tier A sweep, morphology allowlist (19A), approximate Facility pull (19B),
or 19C promotion candidates.

Phase 19 closeout stands. **Phase 20 does not undo 19D** — it responds to a post-convergence
authoring review, not a finding that convergence should have continued.

## Phase 20 — Commercial / Production vocabulary enrichment

**Status:** COMPLETE (2026-08-14)

Product-driven Facility admission — not continuation of corpus disposition. The **~110** unresolved
corpus rows are evidence sources, not the scope. Do not create a Phase 20 analysis document up front;
record admission decisions in this roadmap and implementation/tests.

| Subphase                          | Status   |
| --------------------------------- | -------- |
| 20A Foundation Facility admission | COMPLETE |
| 20B Specialist Facility admission | COMPLETE |
| 20C Authoring / discovery review  | COMPLETE |

### Reopen trigger

Post-convergence authoring review found that the current Commercial / Production vocabulary may force
too many distinct premises concepts through `factory`, `shop`, and institution-specific Facilities.

This is product-driven vocabulary enrichment, not continuation of corpus disposition. The **~110**
unresolved corpus rows are evidence sources, not the scope.

### 20A — Foundation Facility admission

**Evaluate:**

- `workshop`
- `office`

**Primary questions:**

- Does **Workshop** represent durable small-scale craft/production premises meaningfully distinct
  from Factory and Interior workspace?
- Does **Office** represent durable administrative/professional premises currently overloading Shop,
  Town Hall, or Organization identity?

Do not promote either merely to absorb corpus terms.

**Gate** (same admission bar as 19C — product case must clear independently):

```text
configured Building-premises use?
  → Form-independent label test
  → duplicate-vs-distinct (durable configuration vs scale/subtype/flavor)
  → nearest shipped Facility sufficiency
  → promote OR reject
```

Valid outcome: **zero**, **one**, or **both**. `office` is not in the research corpus — admission
is judged on authoring need, not corpus membership.

**Closeout (2026-08-14):** **2 / 2** promoted. Unresolved corpus **109** (`workshop` →
`enabled-facility`; `office` is registry-only).

| Candidate  | Outcome     | Rationale                                                                                                                                                                                                                                                   |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workshop` | **PROMOTE** | Product case clears 19C bar: durable whole-building craft/batch production premises; distinct from Factory (industrial manufacturing) and Shop (retail); Form-independent label passes. Corpus `interior` disposition retained as historical evidence only. |
| `office`   | **PROMOTE** | Administrative/professional premises gap — Shop (retail), Town hall (civic assembly), and Organization identity do not cover counting-house, harbourmaster, post-house, or generic clerical premises; Form-independent label passes. Not corpus-driven.     |

**Gate applied:** configured Building-premises use → Form-independent label → duplicate-vs-distinct →
nearest Facility sufficiency → promote.

**20C note:** grouping scanability verified in registry tests — Workshop in Production + Commercial;
Office in Commercial + Civic; no new authoring groups.

### 20B — Specialist Facility admission

Only after **20A** closes. Evaluate concepts that still retain meaningful premises distinctions.

**Frozen allowlist (8):** `PHASE_20B_SPECIALIST_ALLOWLIST_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**Gate** (same admission bar as 20A):

```text
configured Building-premises use?
  → Form-independent label test
  → duplicate-vs-distinct (durable configuration vs scale/subtype/flavor)
  → nearest shipped Facility sufficiency (post-20A landscape)
  → promote OR reject — keep pending
```

**Closeout (2026-08-14):** **2 / 8** promoted. Unresolved corpus **107**.

| Candidate        | Outcome     | Nearest shipped        | Rationale                                                                                                                                                            |
| ---------------- | ----------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bakery`         | **PROMOTE** | Shop, Factory, Brewery | Configured on-site baking premises — brewery parallel; production + optional retail front; authors lose oven/production configuration under generic Shop or Factory. |
| `auction_house`  | **PROMOTE** | Market, Shop, Theater  | Configured sale-by-auction venue — distinct from multi-merchant Market and single retail Shop (arena/theater configuration distinction applies).                     |
| `slaughterhouse` | **REJECT**  | Factory, Workshop      | Animal-processing process subtype — 19B/20A production cluster sufficient (`foundry`, `dyeworks` precedent). Keep `pending`.                                         |
| `tannery`        | **REJECT**  | Factory                | Hide-processing works subtype — `dyeworks` decomposed to Factory in 19B. Keep `pending`.                                                                             |
| `mint`           | **REJECT**  | Factory, Bank, Office  | Coin production + state institution blend — premises via Factory/Bank + Organization identity. Keep `pending`.                                                       |
| `mortuary`       | **REJECT**  | Hospital, Workshop     | Death-care trade premises — no funerary Facility cluster approved; defer partial funerary promotion. Keep `pending`.                                                 |
| `crematorium`    | **REJECT**  | Factory, Mortuary      | Cremation works + chapel blend — kiln/factory production-form rhyme; pairs with deferred mortuary cluster. Keep `pending`.                                           |
| `gambling_hall`  | **REJECT**  | Tavern, Theater        | Gaming/spectacle flavor on hospitality or performance premises — museum-reject pattern (flavor, not configuration). Keep `pending`.                                  |

**20C note:** Bakery in Production + Commercial; Auction house in Commercial only; existing groups sufficient — no grouping redesign.

### 20C — Authoring / discovery review (closed)

**Closeout (2026-08-14):**

| Check                            | Outcome                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Commercial / Production grouping | **Pass** — no new authoring groups; Production **10**, Commercial **17**, Civic **19** at **40** total Facilities                        |
| Setup scanability                | **Pass** — group counts remain scannable; option count alone is not a split trigger (Phase 7 precedent)                                  |
| `searchTerms` / aliases          | **Pass** — registry metadata + combobox search resolves `office` (`counting house`), `auction_house` (`auction`), `workshop` (`artisan`) |
| Overview name search             | **Pass** — promoted Facilities expose label + derived function strings                                                                   |
| Storybook                        | **Pass** — `phase-20-building-flows` stories for `workshop`, `office`, `bakery`, `auction_house`                                         |

**Evidence (dashboard tests):** `location-building-create-setup.lib.test.ts` (20C describe),
`location-classification-form-fields.test.ts`, `location-overview-search.lib.test.ts`,
`location-create-modal.stories.tsx`.

**Phase 20 runtime additions (4):** `workshop`, `office`, `bakery`, `auction_house` — **40** Facilities total.
Corpus convergence remains **closed**; unresolved **107**.

### Non-goals

- reopening broad corpus convergence
- resolving the remaining **~110** for count reduction
- manifestation
- presets
- Form × Facility compatibility
- adding every familiar commercial archetype as a Facility

## Phase 21 — Commercial / Production tail reconciliation

**Status:** COMPLETE (2026-08-14)

Product-driven reconciliation pass over the Commercial / Production tail **not** reviewed in Phase 20.
Phase 20 enriched canonical Facility vocabulary (`workshop`, `office`, `bakery`, `auction_house`); Phase 21
tests whether that landscape now absorbs previously unreviewed corpus terms cleanly.

This is **not** a broad corpus sweep and **not** count-reduction for its own sake. Building corpus
convergence remains **closed**.

| Subphase                        | Status   |
| ------------------------------- | -------- |
| 21A Allowlist freeze + regroup  | COMPLETE |
| 21B Canonical-owner disposition | COMPLETE |
| 21C Promotion-candidate review  | COMPLETE |

### Reopen trigger

After Phase 20, the question was:

> Now that the Commercial / Production vocabulary is richer, which previously unreviewed corpus terms
> can be cleanly expressed by existing canonical Facilities, and which repeated gaps — if any — remain?

### Frozen allowlist (38)

`PHASE_21_ALLOWLIST_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

Verified 2026-08-14 against live inventory:

- **38** terms — exact count of Phase-20-unreviewed Commercial / Production tail candidates
- **`gambling_hall` excluded** — already reviewed Phase 20B (`pending` control, not reinvestigated)
- **No overlap** with Phase 20A/20B allowlists, Phase 19A–C disposition sets, or Tier A / Tier C sweeps

**Phase 20 reviewed-pending controls** (comparison only — not Phase 21 targets):
`slaughterhouse`, `tannery`, `mint`, `mortuary`, `crematorium`, `gambling_hall`.

### Review method

Terms were regrouped by **canonical Facility or ownership boundary**, not historical thematic headings:

| Bucket | Boundary tested                              | Allowlist terms (representative)                                                         |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A      | Workshop / Factory                           | `brickworks`, `glassworks`, `cooperage`, `printing_press`, `smokehouse`                  |
| B      | Office / civic administration                | `exchange`, `weigh_house`, `harbourmaster_office`, `treasury`, `records_hall`            |
| C      | Inn / Tavern / Shop / Stable compositions    | `ferry_house`, `post_house`, `coaching_inn`, `waystation`, `coffeehouse`, `trading_post` |
| D      | Hospital / Boarding House / care institution | `clinic`, `almshouse`, `asylum`, `poorhouse`, `hospice`, `lazaretto`, `workhouse`        |
| E      | Existing obvious canonical equivalents       | `odeon`, `arsenal`, `records_hall`, `clinic`, `audience_hall`, `memorial_hall`           |
| F      | Scale / Site                                 | `salt_works`, `menagerie`, `trading_post`, `boathouse`                                   |
| G      | Possible repeated premises gap               | `washhouse`, `festhall`, `meeting_hall`, `brothel`, `divination_parlor`                  |

**Gate** (established semantic gates — no new runtime promotions during disposition):

```text
scale / unit
  → configured Building-premises use?
  → Form-independent label test
  → nearest shipped Facility (post-20A/20B landscape)
  → institution vs premises separation
  → decompose / outside-building-classification / pending
```

### Closeout (2026-08-14)

**38 / 38** reviewed. Unresolved corpus **71** (was **107**).

| Outcome                           |  Count | Terms                                   |
| --------------------------------- | -----: | --------------------------------------- |
| `decompose`                       | **34** | See disposition allowlists in inventory |
| `outside-building-classification` |  **2** | `salt_works`, `menagerie`               |
| `pending` (intentional)           |  **2** | `brothel`, `washhouse`                  |

**Closed by `workshop` (3):** `cooperage`, `printing_press`, `smokehouse`

**Closed by `office` (3):** `exchange`, `harbourmaster_office`, `weigh_house`

**Closed by other existing Facilities (28 decompose):**

| Target Facility  | Terms                                                     |
| ---------------- | --------------------------------------------------------- |
| `factory`        | `brickworks`, `glassworks`                                |
| `inn`            | `coaching_inn`, `ferry_house`, `post_house`, `waystation` |
| `tavern`         | `coffeehouse`, `festhall`, `opium_den`                    |
| `hospital`       | `asylum`, `clinic`, `hospice`, `lazaretto`                |
| `boarding_house` | `almshouse`, `poorhouse`, `workhouse`                     |
| `archive`        | `memorial_hall`, `records_hall`                           |
| `theater`        | `audience_hall`, `odeon`                                  |
| `town_hall`      | `meeting_hall`                                            |
| `armory`         | `arsenal`                                                 |
| `warehouse`      | `boathouse`, `trading_post`                               |
| `shop`           | `divination_parlor`                                       |
| `schoolhouse`    | `gladiator_school`, `training_hall`                       |
| `bank`           | `treasury`                                                |

**Outside Building classification (2):** `salt_works` (evaporation-pond / works-grounds scale),
`menagerie` (animal-grounds compound — not a single configured premises unit)

**Intentionally `pending` (2):**

| Term        | Rationale                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `brothel`   | Illicit-hospitality flavor on Tavern/Inn premises — same rejection pattern as Phase 20B `gambling_hall`; not a durable configured-premises distinction |
| `washhouse` | Communal laundry premises — no repeated author-facing gap after Shop/Bathhouse review; single awkward corpus term                                      |

**Promotion candidates:** **0** — no repeated missing configured-premises concept survived the threshold.
Phase 20 reviewed-pending controls (`slaughterhouse`, `tannery`, `mint`, `mortuary`, `crematorium`,
`gambling_hall`) were not reopened.

**Conclusion:**

```text
Current Commercial / Production vocabulary:
SUFFICIENT
```

No further enrichment phase is warranted from Phase 21 evidence alone.

### Non-goals

- reopening broad corpus convergence
- resolving all remaining **~71** terms
- revisiting interiors, morphology, or Phase 20 rejected candidates
- adding manifestation, presets, or Form × Facility compatibility
- retargeting the frozen corpus graph
- optimizing unresolved-count reduction

## Phase 22 — Final practical Building coverage review

**Status:** COMPLETE (2026-08-14)

Final bounded pass before stopping Building corpus taxonomy work. Two independent tracks executed:

1. **22A** — residual non-interior corpus review against enriched Form + Facility vocabulary;
2. **22B** — common urban premises coverage audit independent of the research corpus.

| Subphase                                | Status   |
| --------------------------------------- | -------- |
| 22A Residual non-interior corpus review | COMPLETE |
| 22B Common urban coverage audit         | COMPLETE |
| 22C Selective closeout                  | COMPLETE |

### Closeout (2026-08-14)

**Entry snapshot:** pending **70**, needs-design **1**, total **71**.  
**Exit snapshot:** pending **55**, needs-design **1**, total **56**.

#### 22A — Residual corpus (22 / 22 reviewed)

| Outcome                           |  Count | Terms                                                                                  |
| --------------------------------- | -----: | -------------------------------------------------------------------------------------- |
| `decompose`                       | **14** | See `PHASE_22A_DECOMPOSE_IDS`                                                          |
| `outside-building-classification` |  **1** | `pigsty`                                                                               |
| `pending` (intentional)           |  **7** | `charnel_house`, `folly`, `hermitage`, `kiva`, `mausoleum`, `nuraghe`, `tent_pavilion` |

**Closed by Tower Form (2):** `bell_tower`, `clock_tower`

**Closed by other existing vocabulary (12 decompose):**

| Target                        | Terms                                                 |
| ----------------------------- | ----------------------------------------------------- |
| `lighthouse` (Beacon station) | `beacon_tower`                                        |
| `barracks`                    | `command_post`                                        |
| `checkpoint`                  | `guard_post`                                          |
| `guildhall`                   | `paladin_chapterhouse`                                |
| `apartment_building`          | `tenement`                                            |
| `greenhouse`                  | `orangery`                                            |
| `granary`                     | `silo`                                                |
| `inn`                         | `hunting_lodge`                                       |
| overlay composition           | `hovel`, `safe_house`, `smugglers_den`, `thieves_den` |

**Outside Building classification (1):** `pigsty` (livestock enclosure — align with `sheepfold` gate)

**Intentionally unresolved (7):** cultural/morphology/scenario tail — canonical vocabulary does not
clearly preserve useful author-facing distinction; acceptable indefinite deferral.

**Carry-forward controls (11):** not reopened — `blockhouse`, `academy`, `museum`, `slaughterhouse`,
`tannery`, `mint`, `mortuary`, `crematorium`, `gambling_hall`, `brothel`, `washhouse`.

#### 22B — Common urban coverage audit

**Domains audited:** Housing, Food/hospitality, Retail/trade, Craft/production, Storage/logistics,
Civic/administration, Security/emergency, Health/care, Education, Religion, Culture/leisure,
Transport, Death care.

**Urban probes evaluated (10):**

```text
fire station / firehouse
post / courier office
slaughterhouse
mortuary / funeral premises
crematorium
washhouse / laundry
watch / police station
assembly / meeting hall
public works / maintenance depot
tenement
```

| Probe                   | Coverage verdict                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Fire station            | **Awkward but acceptable** — `workshop` + `office` + Organization; no durable fire-premises gap    |
| Post / courier office   | **Covered** — `office`                                                                             |
| Slaughterhouse          | **Awkward but acceptable** — `factory` / `workshop`; Phase 20B reject stands — no new 22B evidence |
| Mortuary / funeral      | **Awkward but acceptable** — `hospital` / `workshop` / `office`; no funerary cluster warranted     |
| Crematorium             | **Awkward but acceptable** — production-form rhyme on `factory`; pairs with mortuary deferral      |
| Washhouse / laundry     | **Awkward but acceptable** — `shop` / `workshop` / `bathhouse`; Phase 21 pending stands            |
| Watch / police station  | **Covered** — `office` + `checkpoint` / `barracks` / Watch post                                    |
| Assembly / meeting hall | **Covered** — `town_hall` / `guildhall` / `theater` / Hall Form                                    |
| Public works depot      | **Covered** — `workshop` + `warehouse` + `office`                                                  |
| Tenement                | **Covered** — `apartment_building` (22A decompose)                                                 |

**Repeated missing premises concept:** **None**

**Previously rejected candidates reopened:** **None** — urban audit did not produce new product
evidence beyond Phase 20/21 conclusions.

**Runtime outcome:** **0** new Forms, **0** new Facilities.

**Conclusion:**

```text
COMMON URBAN COVERAGE: SUFFICIENT
```

### Final stopping rule (active)

> Stop Building corpus taxonomy work unless real authoring usage exposes a concrete missing concept.

Remaining **56** unresolved research rows (mostly **38** interiors + reviewed carry-forwards +
cultural tail) may stay deferred indefinitely. Phase 22 confirms the canonical vocabulary is
**practically useful for ordinary authoring**.

### Non-goals (held)

- reopening interiors or manifestations
- broad corpus sweep or zero-pending chase
- culturally narrow Facilities for flavor
- every production process as a Facility
- relitigating all Phase 20/21 rejects without new 22B evidence
- Form × Facility compatibility, corpus graph retargeting, presets, manifestation runtime, new axes
- exhaustive medieval/urban research

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
| `workshop` promotion                                   | **Closed — promoted Phase 20A**                                                                                                     |
| `museum` promotion                                     | Exhibition premises configuration case stronger than Library/Archive + spectacle Facilities                                         |
| Low-confidence cultural tail                           | Manifestation work reopens, or repeated authoring gap after 19B–C                                                                   |
| Remaining corpus (~56 unresolved)                      | **Closed at Phase 22** — stop unless authoring exposes a concrete gap                                                               |
| Production / commercial corpus tail (~40)              | **Closed at Phase 21** — tail reconciled; no further disposition sweep                                                              |
| Residual non-interior corpus tail (22)                 | **Closed at Phase 22A** — `PHASE_22A_*` disposition recorded                                                                        |
| Common urban premises coverage                         | **Closed at Phase 22B** — `COMMON URBAN COVERAGE: SUFFICIENT`                                                                       |
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
