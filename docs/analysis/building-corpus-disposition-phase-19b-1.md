# Building corpus disposition — Phase 19B tranche 1

**Status:** Closed  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

Phase 19B closed 2026-08-14. This note owns the approximate-Facility allowlist, disposition cards,
and frozen inventory allowlists. It is **not** the current plan — **do not append** further Phase 19B
work here; 19C continues from the roadmap.

**Checkpoint date:** 2026-08-14  
**Scope:** 11-term bounded allowlist from sweep Family E approximate Facility pull.

**Related:** [`building-corpus-disposition-sweep-1.md`](./building-corpus-disposition-sweep-1.md) (Family E
approximate Facility pull, Tier B duplicate-vs-distinct test).

---

## Summary

| Metric                                     | Closeout                                         |
| ------------------------------------------ | ------------------------------------------------ |
| **Allowlist reviewed**                     | **11 / 11**                                      |
| **`decompose`**                            | **11** — all nearest shipped Facility sufficient |
| **`pending` / `needs-design` (corpus)**    | **110** (was 121 after 19A)                      |
| **19C Facility candidates (this tranche)** | **0**                                            |
| **Runtime Form/Facility promotion**        | **NONE**                                         |

Exported allowlists: `PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS`, `PHASE_19B_DECOMPOSE_IDS`, subgroup
constants in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**Excluded from allowlist:** `workshop` — sweep Family F exception (interior vs premises); Tier B
Facility candidate — route to **19C**, not this tranche.

**19C carry-forward (not from this tranche):** `blockhouse` (Form), `workshop` (Facility boundary),
`academy` / `museum` (Tier B institution/premises — prior ranking).

---

## Allowlist derivation

Roadmap lists 12 investigation seeds; executable allowlist is the **11-term sweep Family E approximate
Facility pull** only. Each id verified against live inventory:

1. Present in `BUILDING_RESEARCH_CORPUS_IDS`
2. Status `pending` before 19B
3. Failed sweep “strong Facility promotion” test — nearest shipped Facility **approximately** works
4. Not morphology-primary (19A closed)
5. Not institution-composite queue (Tier C closed)

**Do not expand** into the ~40 production/commercial archetype tail or `pigsty` (Barn-approximate
livestock — separate exception).

---

## Investigation gate

```text
configured Building-premises use?
  → Form-independent label test
  → nearest shipped Facility
  → duplicate-vs-distinct (Tier B): scale/style/subtype vs durable configuration
  → decompose / keep pending / 19C Facility candidate
```

**Promotion bar (19C):** a candidate must describe durable premises **configuration** that authors
would lose when using the nearest existing Facility — not trade name, scale, or fantasy flavor alone.

Historical corpus `specialization` / `of:` edges are evidence only — not disposition recipes.

---

## Proven rules (Phase 19B)

1. **Production subtype decomposes to parent Facility** — foundry, dyeworks, ropewalk, golem workshop,
   artificer atelier → **`factory`** when configured production premises is the claim.
2. **Process-specific mill → `mill`** — fulling mill is a mill process, not a missing Facility.
3. **Cold storage → `warehouse`** — icehouse is configured storage premises, not a new Facility axis.
4. **Animal / carriage housing → `stable`** — kennel and coach house are stable-class premises variants.
5. **Toll collection → `checkpoint`** — tollhouse is configured entry/control premises with toll use,
   not a separate Facility label.
6. **Institution-facing office → `shop` + Organization** — bounty office is premises expression;
   adventurers-guild identity is relationship/Organization, not a Building Facility gap.
7. **Corpus expression retained** — decompose closes canonical classification; quarantined labels remain
   discovery vocabulary (manifestation deferred).

---

## Disposition cards

### Rule A — `factory` (5)

| Term                | Nearest Facility | Distinction lost if decomposed?                                                                                                          | Disposition | 19C? |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---- |
| `foundry`           | `factory`        | Metal-casting subtype — scale/process, not new configuration axis                                                                        | `decompose` | no   |
| `dyeworks`          | `factory`        | Dyeing production subtype                                                                                                                | `decompose` | no   |
| `ropewalk`          | `factory`        | Long narrow production floor — factory layout subtype                                                                                    | `decompose` | no   |
| `golem_workshop`    | `factory`        | Fantasy production flavor on factory premises                                                                                            | `decompose` | no   |
| `artificer_atelier` | `factory`        | Craft production at artisan scale — factory/shop gray area; **factory** closes configured production premises without Facility promotion | `decompose` | no   |

### Rule B — `mill` (1)

| Term           | Nearest Facility | Disposition | 19C? |
| -------------- | ---------------- | ----------- | ---- |
| `fulling_mill` | `mill`           | `decompose` | no   |

### Rule C — `warehouse` (1)

| Term       | Nearest Facility | Disposition | 19C? |
| ---------- | ---------------- | ----------- | ---- |
| `icehouse` | `warehouse`      | `decompose` | no   |

### Rule D — `stable` (2)

| Term          | Nearest Facility | Disposition | 19C? |
| ------------- | ---------------- | ----------- | ---- |
| `kennel`      | `stable`         | `decompose` | no   |
| `coach_house` | `stable`         | `decompose` | no   |

### Rule E — `checkpoint` (1)

| Term        | Nearest Facility | Disposition | 19C? |
| ----------- | ---------------- | ----------- | ---- |
| `tollhouse` | `checkpoint`     | `decompose` | no   |

Toll use is configured premises on a checkpoint-class building — not a new Facility id.

### Rule F — `shop` + Organization (1)

| Term            | Nearest Facility                                                   | Disposition | 19C? |
| --------------- | ------------------------------------------------------------------ | ----------- | ---- |
| `bounty_office` | `shop` (+ Organization relationship for guild/adventurer identity) | `decompose` | no   |

Institution-vs-premises ambiguity resolved on **relationships**, not a Bounty Office Facility.

---

## Inventory closeout

| Allowlist constant                             | Count | Status          |
| ---------------------------------------------- | ----: | --------------- |
| `PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS` |    11 | frozen          |
| `PHASE_19B_DECOMPOSE_IDS`                      |    11 | frozen          |
| Unresolved corpus (`pending` + `needs-design`) |   110 | inventory tests |

No corpus-graph retargeting. No runtime registry changes.

---

## Phase closeout

**Closed:** 2026-08-14  
**Next subphase:** 19C Selective runtime vocabulary promotion — see
[`building-taxonomy.md`](../roadmap/building-taxonomy.md).

**Do not append** to this note. Future bounded tranches follow the roadmap execution contract.
