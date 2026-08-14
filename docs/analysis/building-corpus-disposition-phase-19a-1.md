# Building corpus disposition — Phase 19A tranche 1

**Status:** Closed supporting evidence  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

This note owns the Phase 19A morphology allowlist, disposition cards, and frozen inventory
allowlists. It is not the current plan.

**Checkpoint date:** 2026-08-14  
**Scope:** All 16 roadmap morphology seeds reviewed. Inventory + analysis only — no runtime Form/Facility
promotion (19C is separate).

**Related:** Sweep 1 Family E
[`building-corpus-disposition-sweep-1.md`](./building-corpus-disposition-sweep-1.md);
morphology protocol
[`building-corpus-disposition-tier-c-1.md`](./building-corpus-disposition-tier-c-1.md).

---

## Summary

| Metric                                  | Closeout                                             |
| --------------------------------------- | ---------------------------------------------------- |
| **Allowlist reviewed**                  | **16 / 16**                                          |
| **`decompose`**                         | **13** — fortification 1, cultural 9, site/context 3 |
| **`outside-building-classification`**   | **2** — `crannog`, `siheyuan`                        |
| **`needs-design`**                      | **1** — `blockhouse` (unchanged)                     |
| **`pending` / `needs-design` (corpus)** | **121** (was 136 at Tier C closeout)                 |
| **Runtime Form/Facility promotion**     | **NONE**                                             |

Exported allowlists: `PHASE_19A_DECOMPOSE_IDS`, `PHASE_19A_OUTSIDE_BUILDING_CLASSIFICATION_IDS`,
subgroup constants in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**19C Form candidate (only):** `blockhouse` — stable morphology without shipped Form sufficiency.

---

## Proven rules (Phase 19A)

1. **Scale gate first** — compound / platform / courtyard **Site** patterns →
   `outside-building-classification`; model constituent Buildings separately.
2. **Cultural naming ≠ missing Form** — when vacant/repurposed recognition is preserved by
   `house`, `hall`, or `tower`, decompose; corpus expression may still aid discovery (manifestation
   deferred).
3. **Material / permanence / portability orthogonal** — igloo / tipi / yurt decompose to Form
   `house` + `residence`; felt/snow/cone identity is cultural/material, not a Form gap.
4. **Site/context in the label** — cave, tree, wreck, or island setting is authored via Location
   hierarchy / Site context; Form `house` covers the adapted dwelling envelope only.
5. **Funerary vault morphology** — tholos decomposes without Form; configured funerary premises as
   authored (`mortuary` when applicable).
6. **Stable morphology without Form match** — keep `needs-design` and route Form candidacy to 19C
   (`blockhouse`); do not invent Form in 19A.

Historical corpus `manifestationOf` / `specialization` edges are evidence only — not disposition
recipes.

---

## Fortification morphology (2)

### martello_tower → DECOMPOSE

| Layer             | Finding                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Scale / unit      | One Building — round tower on pedestal                                                                       |
| Stable morphology | Yes — round tower massing + base                                                                             |
| Existing Form     | **`tower`** sufficient                                                                                       |
| Disposition       | `decompose` — Form `tower` + defense Facilities (`checkpoint`, Watch post, `armory`, `barracks`) as authored |
| 19C candidate?    | No                                                                                                           |

### blockhouse → KEEP `needs-design`

| Layer             | Finding                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Scale / unit      | One Building — standalone loopholed strongpoint                                                           |
| Stable morphology | Yes — compact loopholed massing                                                                           |
| Existing Form     | **None sufficient** — not `tower` (low/squat), not `keep` (perimeter ≠ central block), not `house`/`hall` |
| Disposition       | `needs-design` — decompose recipe not committed; would collapse blockhouse-specific identity              |
| 19C candidate?    | **Yes** — if open composition cannot satisfy author need                                                  |

---

## Cultural morphology (11)

### Rule A — Form `house` + dwelling premises (cultural envelope variant)

Vacant/repurposed, the distinction lost is **cultural naming or plan/material variant**, not a
missing canonical Form.

| Term         | Scale | Stable morphology                 | Nearest Form | Disposition                                      | 19C? |
| ------------ | ----- | --------------------------------- | ------------ | ------------------------------------------------ | ---- |
| `domus`      | 1 Bld | courtyard house envelope          | `house`      | `decompose`                                      | no   |
| `machiya`    | 1 Bld | urban shop-house row form         | `house`      | `decompose` (+ `shop` / `residence` as authored) | no   |
| `roundhouse` | 1 Bld | circular dwelling envelope        | `house`      | `decompose`                                      | no   |
| `igloo`      | 1 Bld | snow dome (material axis)         | `house`      | `decompose`                                      | no   |
| `tipi`       | 1 Bld | conical lodge (portable family)   | `house`      | `decompose`                                      | no   |
| `yurt`       | 1 Bld | round felt tent (portable family) | `house`      | `decompose`                                      | no   |

### Rule B — Form `hall` + premises

| Term        | Scale | Stable morphology              | Nearest Form | Disposition                                          | 19C? |
| ----------- | ----- | ------------------------------ | ------------ | ---------------------------------------------------- | ---- |
| `longhouse` | 1 Bld | dominant elongated hall volume | `hall`       | `decompose` (+ `residence` / `assembly` as authored) | no   |

### Rule C — Form `tower` + premises

| Term    | Scale | Stable morphology       | Nearest Form | Disposition                                         | 19C? |
| ------- | ----- | ----------------------- | ------------ | --------------------------------------------------- | ---- |
| `broch` | 1 Bld | drystone tower envelope | `tower`      | `decompose` (+ `residence`, Watch post as authored) | no   |

Drystone/Celtic specificity is cultural expression — not a Form gap distinct from `tower`.

### Rule D — Site / compound scale

| Term       | Scale | Stable morphology              | Disposition                       | 19C? |
| ---------- | ----- | ------------------------------ | --------------------------------- | ---- |
| `crannog`  | Site  | artificial island platform     | `outside-building-classification` | no   |
| `siheyuan` | Site  | courtyard compound (multi-bld) | `outside-building-classification` | no   |

Constituent Buildings: Form `house` + `residence` (and other Facilities) per structure.

### Rule E — Funerary vault; no Form match

| Term     | Scale | Stable morphology  | Nearest Form | Disposition                                                            | 19C? |
| -------- | ----- | ------------------ | ------------ | ---------------------------------------------------------------------- | ---- |
| `tholos` | 1 Bld | beehive vault tomb | none         | `decompose` — Form omitted; `mortuary` / funerary premises as authored | no   |

---

## Site/context morphology (3)

### Rule F — Setting/context via Location hierarchy; Form `house` for adapted envelope

The familiar term embeds **Site, terrain, or wreck context** — not Building Form morphology. When
vacant, authors still want the setting in hierarchy/narrative; the enclosed adapted space remains a
house-scale envelope.

| Term                  | Scale | Context axis            | Form    | Disposition | 19C? |
| --------------------- | ----- | ----------------------- | ------- | ----------- | ---- |
| `cave_dwelling`       | 1 Bld | cave / rock hollow Site | `house` | `decompose` | no   |
| `elven_tree_dwelling` | 1 Bld | arboreal Site           | `house` | `decompose` | no   |
| `shipwreck_dwelling`  | 1 Bld | wreck / vessel Site     | `house` | `decompose` | no   |

Example (not recipe): child Building under parent cave / tree / wreck Location; Form `house` +
`residence`.

---

## Inventory closeout

| Allowlist constant                              | Count | Status                |
| ----------------------------------------------- | ----: | --------------------- |
| `PHASE_19A_DECOMPOSE_IDS`                       |    13 | frozen                |
| `PHASE_19A_OUTSIDE_BUILDING_CLASSIFICATION_IDS` |     2 | frozen                |
| `PHASE_19A_FORTIFICATION_NEEDS_DESIGN_IDS`      |     1 | frozen (`blockhouse`) |
| Unresolved corpus (`pending` + `needs-design`)  |   121 | inventory tests       |

No corpus-graph retargeting. No runtime registry changes.
