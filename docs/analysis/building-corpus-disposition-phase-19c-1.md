# Building corpus disposition — Phase 19C tranche 1

**Status:** Closed  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

Phase 19C closed 2026-08-14. This note owns the selective promotion gate for the four 19A/19B
carry-forwards only. It is **not** the current plan — **do not append** further Phase 19C work here.
Phase 19D stopping review and corpus convergence closeout live in the roadmap only.

**Checkpoint date:** 2026-08-14  
**Scope:** Four carry-forward candidates — no corpus expansion, no discovery sweep.

**Related:** [`building-corpus-disposition-phase-19a-1.md`](./building-corpus-disposition-phase-19a-1.md),
[`building-corpus-disposition-phase-19b-1.md`](./building-corpus-disposition-phase-19b-1.md),
[`building-corpus-disposition-sweep-1.md`](./building-corpus-disposition-sweep-1.md) (Tier B
duplicate-vs-distinct test).

---

## Summary

| Metric                                      | Closeout                                          |
| ------------------------------------------- | ------------------------------------------------- |
| **Candidates reviewed**                     | **4 / 4**                                         |
| **Runtime Form promotions**                 | **0**                                             |
| **Runtime Facility promotions**             | **0**                                             |
| **Inventory disposition changes**           | **NONE** — statuses unchanged from 19A/19B/Tier C |
| **Unresolved (`pending` + `needs-design`)** | **110** (unchanged)                               |

Exported allowlists: `PHASE_19C_CANDIDATE_IDS`, `PHASE_19C_NO_PROMOTION_IDS` in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**Discipline:** 19C is a promotion gate for already-known candidates, not another discovery phase.
Valid outcome: zero runtime additions.

---

## Promotion gates (applied)

**Form admission**

```text
scale / unit → stable morphology → morphology-only axis
  → existing Form sufficiency OR committed Form definition
  → scanability / authoring cost (warning ~8–10 Forms)
  → promote OR reject
```

**Facility admission**

```text
configured Building-premises use? → Form-independent label test
  → duplicate-vs-distinct (Tier B): durable configuration vs scale/subtype/flavor
  → nearest shipped Facility sufficiency
  → promote OR reject / keep pending
```

Historical corpus `specialization` / `of:` / `interior` edges are evidence only — not promotion
recipes.

---

## Decision table

| Candidate    | Axis                            | Key unresolved question                                                                       | Gate outcome                                             |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `blockhouse` | Form (possible 5th)             | Is its stable morphology important enough to deserve a fifth Form?                            | **REJECT** — keep `needs-design`                         |
| `workshop`   | Facility                        | Is whole-building craft configuration genuinely distinct from Factory and Interior workspace? | **REJECT** — keep `pending`                              |
| `museum`     | Facility                        | Is exhibition a durable premises behavior distinct enough from Library/Archive?               | **REJECT** — keep `pending`                              |
| `academy`    | Facility / institution boundary | Does it describe premises strongly enough to escape Schoolhouse + Organization identity?      | **REJECT** — keep `pending` (reviewed Tier C / Family B) |

---

## Candidate cards

### blockhouse → REJECT Form promotion (keep `needs-design`)

| Layer                   | Finding                                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior evidence          | 19A + Tier C morphology protocol — stable compact loopholed strongpoint; no shipped Form sufficient; decompose recipe not committed                                           |
| Stable morphology       | **Yes** — squat loopholed massing distinct from `tower` height emphasis and `keep` central-block organization                                                                 |
| Form-independent test   | N/A (Form axis)                                                                                                                                                               |
| Admission bar           | Promotion would add a **fifth Form** before scanability warning threshold (~8–10) is empirically triggered; no committed Form entry passed the morphology protocol closeout   |
| Author loss if rejected | Familiar strongpoint label — mitigated by quarantined corpus vocabulary; open composition (`keep` / `house` + `checkpoint`, `armory`, Watch post) covers strongpoint premises |
| **Decision**            | **REJECT** — morphology gap noted in 19A does not independently clear the Form admission bar without authoring friction evidence and a committed Form definition              |
| Inventory               | **`needs-design`** unchanged                                                                                                                                                  |

### workshop → REJECT Facility promotion (keep `pending`)

| Layer                 | Finding                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior evidence        | Sweep Family F exception; Tier B **KEEP AS CANDIDATE**; 19B excluded from approximate-Facility allowlist                                                                    |
| Corpus kind           | **`interior`** — default claim is substructure/workspace, not whole-Building premises                                                                                       |
| Nearest Facility      | **`factory`** — 19B proved craft/production subtypes (`golem_workshop`, `artificer_atelier`, `foundry`, …) decompose to Factory when premises-scale production is the claim |
| Duplicate-vs-distinct | Tier B: craft vs industrial scale reads as **subtype/scale**, not a durable premises configuration authors lose under Factory                                               |
| Interior deferred     | Whole-building workshop vs interior workspace belongs in deferred **interior substructure** work — not a 19C promotion without premises-scale evidence                      |
| **Decision**          | **REJECT** — does not pass Form-independent whole-building premises bar                                                                                                     |
| Inventory             | **`pending`** unchanged                                                                                                                                                     |

### museum → REJECT Facility promotion (keep `pending`)

| Layer                 | Finding                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior evidence        | Tier B ranked **PROMOTE LATER** — exhibition vs custody mixed; **mostly flavor**                                                                                                  |
| Nearest Facilities    | **`library`** (study + accessible records), **`archive`** (restricted custody)                                                                                                    |
| Configuration test    | Public exhibition is not a durable premises **configuration** distinct from custody/study axes — spectacle behavior overlaps **`arena`**, **`theater`**, and knowledge Facilities |
| Form-independent test | “Museum” fails as a premises label independent of Form — reads as collection/exhibition flavor on library-class or civic assembly premises                                        |
| **Decision**          | **REJECT** — Tier B duplicate-vs-distinct test not cleared                                                                                                                        |
| Inventory             | **`pending`** unchanged                                                                                                                                                           |

### academy → REJECT Facility promotion (keep `pending`)

| Layer                | Finding                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior evidence       | Tier C Family B reviewed — **KEEP PENDING**; roadmap deferred row ties promotion to premises materially exceeding schoolhouse + institution identity                |
| Nearest Facility     | **`schoolhouse`** — explicitly instructional premises, not the school Organization                                                                                  |
| Institution boundary | Academy identity (collegiate org, ranks, charter) belongs on **Organization** relationships — not a missing Facility axis                                           |
| Premises behavior    | No case stronger than “advanced school” naming; `bardic_college` / `madrasa` corpus edges are specialization/manifestation naming, not a premises configuration gap |
| **Decision**         | **REJECT** — institution/premises collision unresolved in favor of promotion; deferred trigger unchanged                                                            |
| Inventory            | **`pending`** unchanged (listed in `TIER_C_REVIEWED_PENDING_IDS`)                                                                                                   |

---

## Inventory closeout

| Allowlist constant           | Count | Status                                   |
| ---------------------------- | ----: | ---------------------------------------- |
| `PHASE_19C_CANDIDATE_IDS`    |     4 | frozen — carry-forwards only             |
| `PHASE_19C_NO_PROMOTION_IDS` |     4 | frozen — gate rejected all candidates    |
| Unresolved corpus            |   110 | unchanged (`109 pending` + `blockhouse`) |

No corpus-graph retargeting. **No runtime registry changes.**

---

## Phase closeout

**Closed:** 2026-08-14  
**Next subphase:** 19D Exception cleanup / stopping review — see
[`building-taxonomy.md`](../roadmap/building-taxonomy.md).

**Do not append** to this note. Remaining corpus work follows the roadmap execution contract.
