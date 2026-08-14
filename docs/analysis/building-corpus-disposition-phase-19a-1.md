# Building corpus disposition — Phase 19A tranche 1

**Status:** Active investigation evidence  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

This note owns the Phase 19A morphology allowlist freeze and per-term inventory inspection. It is
not the current plan. Per-term disposition cards are added here as the tranche proceeds.

**Checkpoint date:** 2026-08-14  
**Scope:** Freeze an exact, bounded investigation allowlist from the roadmap morphology seeds.
Inventory inspection only — no runtime Form/Facility promotion (19C is separate).

**Related:** Sweep 1 Family E
[`building-corpus-disposition-sweep-1.md`](./building-corpus-disposition-sweep-1.md);
morphology protocol
[`building-corpus-disposition-tier-c-1.md`](./building-corpus-disposition-tier-c-1.md).

---

## Summary

| Metric                              | Value                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| **Roadmap investigation seeds**     | 16                                                                                 |
| **Frozen allowlist**                | **16** — exact match; no additions, no omissions                                   |
| **Reviewed (fortification)**        | **2 / 2** — `martello_tower` `decompose`; `blockhouse` `needs-design`              |
| **Inventory status (allowlist)**    | 14 `pending`, 1 `needs-design`, 1 `decompose`                                      |
| **Unresolved corpus (total)**       | **135** (`pending` + `needs-design`) — was 136 before `martello_tower` disposition |
| **Runtime Form/Facility promotion** | **NONE** (19A evidence only)                                                       |

Exported allowlists: `PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS`, subgroup constants in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

---

## Allowlist derivation

Roadmap seeds are the sole source. Each id was verified against the live 308-concept inventory
(tests win over documentation):

1. Present in `BUILDING_RESEARCH_CORPUS_IDS`
2. Status is `pending` or `needs-design` (unresolved)
3. Not already dispositioned by Tier A sweep or Tier C review
4. Morphology-primary investigation target (not production/Facility boundary — that is 19B)

**Selection rule:** include a seed iff it appears in the roadmap 19A investigation seed list. Do not
expand the tranche from adjacent morphology-adjacent pending rows (`nuraghe`, `bell_tower`, `kiva`,
…).

---

## Frozen allowlist (16)

### Fortification morphology (2)

| Id               | Corpus kind | Status         | Legacy runtime | Selection note                                                      |
| ---------------- | ----------- | -------------- | -------------- | ------------------------------------------------------------------- |
| `blockhouse`     | archetype   | `needs-design` | yes            | Fortification subgroup reviewed — morphology unset vs shipped Forms |
| `martello_tower` | archetype   | `decompose`    | yes            | Fortification subgroup reviewed — Form `tower` sufficient           |

### Cultural morphology expressions (11)

Sweep Family E — vacant/repurposed recognition stays morphology-primary.

| Id           | Corpus kind   | Status    | Legacy runtime | Frozen graph target |
| ------------ | ------------- | --------- | -------------- | ------------------- |
| `broch`      | manifestation | `pending` | yes            | `house`             |
| `crannog`    | manifestation | `pending` | yes            | `house`             |
| `domus`      | manifestation | `pending` | yes            | `house`             |
| `igloo`      | manifestation | `pending` | yes            | `house`             |
| `longhouse`  | manifestation | `pending` | yes            | `house`             |
| `machiya`    | manifestation | `pending` | yes            | `house`             |
| `roundhouse` | manifestation | `pending` | yes            | `house`             |
| `siheyuan`   | manifestation | `pending` | yes            | `house`             |
| `tholos`     | manifestation | `pending` | yes            | `mausoleum`         |
| `tipi`       | manifestation | `pending` | yes            | `house`             |
| `yurt`       | manifestation | `pending` | yes            | `house`             |

### Site/context morphology (3)

Sweep Family E re-check — Form `house` alone is insufficient; Site or condition is embedded.

| Id                    | Corpus kind    | Status    | Legacy runtime | Frozen graph target |
| --------------------- | -------------- | --------- | -------------- | ------------------- |
| `cave_dwelling`       | specialization | `pending` | yes            | `house`             |
| `elven_tree_dwelling` | specialization | `pending` | yes            | `house`             |
| `shipwreck_dwelling`  | specialization | `pending` | yes            | `house`             |

---

## Explicit exclusions (not in allowlist)

These pending or morphology-adjacent corpus rows are **out of scope** for this tranche:

| Id / cluster                             | Reason excluded                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `nuraghe`, `kiva`, `hobbit_burrow`       | Morphology-adjacent but not roadmap 19A seeds                          |
| `bell_tower`, `clock_tower`, `workhouse` | Family D bundled Form+use audit track, not Family E morphology         |
| Production / premises cluster            | 19B seeds (`foundry`, `workshop`, `icehouse`, …)                       |
| `academy`                                | Family B reviewed — remains `pending` on institution card              |
| Already dispositioned rows               | Tier A sweep + Tier C (`decompose`, `outside-building-classification`) |

Do not expand the allowlist during card review without a new roadmap checkpoint.

---

## Investigation gate (per term)

Apply the established morphology protocol before any 19C runtime promotion:

```text
scale / unit
  → stable morphology
  → existing Form sufficiency (house / hall / tower / keep)
  → decompose / outside-building-classification / needs-design
```

Vacant/repurposed strongpoints and dwellings remain valid open compositions — the gate tests **label
identity**, not current configured use.

---

## Next steps

1. ~~Work the frozen allowlist in subgroup order: fortification → cultural → site/context.~~ Fortification subgroup **complete**.
2. Record per-term disposition cards below as each id is reviewed.
3. Freeze accepted disposition ids in inventory (`INITIAL_STATUS_BY_ID`) when each subgroup closes.
4. Route any runtime Form candidate to **19C** separately.

---

## Fortification morphology cards

### martello_tower → DECOMPOSE

**Why selected:** Peer to `blockhouse` in the fortification morphology subgroup; Family D sweep
exception (bundled Form+use label) held pending for morphology review.

| Layer                     | Finding                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scale / unit              | **One Building** — round tower on a thick pedestal; not a fortified Site/complex like `castle` / `citadel`.                                                                                              |
| Stable morphology         | **Yes** — vacant or repurposed, the term stays recognizable from round tower massing + podium base. Morphology is Form-independent; configured coastal gun use is separate.                              |
| Existing Form sufficiency | **Yes — `tower`** — vertically emphasized round tower envelope. Keep’s “dominant central block” does not fit; House/Hall do not preserve the label.                                                      |
| Corpus                    | “Coastal gun platform”; `service` function metadata (use-coded). Discovery matrix codes morphology as **round tower** with military configured use.                                                      |
| Form promotion            | **Reject** — shipped Form `tower` closes morphology without a new Form.                                                                                                                                  |
| Facility                  | Author defense premises as applicable: `checkpoint`, Watch post (`watchtower`), `armory`, `barracks`. No Facility promotion — gun-platform use is not a distinct configured-premises label at this gate. |
| Relationships             | Military operator / garrison Organization or occupants as authored.                                                                                                                                      |
| **Avoid**                 | Treating “coastal gun platform” as a Facility label — use is relationship + Facility composition, not morphology.                                                                                        |
| Example (not recipe)      | Form `tower` + Watch post or Checkpoint + military Organization relationship.                                                                                                                            |
| Runtime                   | **NONE**                                                                                                                                                                                                 |

**Inventory:** `decompose`.

---

### blockhouse → KEEP `needs-design`

**Why selected:** Prior tranche-1 and Tier C morphology spike; reopened with `martello_tower` peer
survey per trigger.

| Layer                     | Finding                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scale / unit              | **One Building** — standalone loopholed strongpoint; discovery notes fortification family but not Site-scale like `castle`.                                                                                                                                                                                                                                  |
| Stable morphology         | **Yes** — vacant or repurposed, “blockhouse” stays recognizable from compact loopholed massing. Label identity is morphology-primary, not current garrison use.                                                                                                                                                                                              |
| Existing Form sufficiency | **No** — peer survey against shipped Forms: **`tower`** rejected (low, squat profile — not vertically emphasized); **`keep`** rejected (perimeter strongpoint ≠ “dominant central block”); **`house` / `hall`** rejected (fortified loopholed envelope ≠ house/hall organization). `martello_tower` closing via `tower` does **not** transfer to blockhouse. |
| Corpus                    | “Standalone strongpoint”; questionable `service` function metadata. Graph neighbors: `keep`, `guard_post`.                                                                                                                                                                                                                                                   |
| Form promotion            | **Open — not approved (19C)** — morphology is stable enough to **consider** a future Form candidate, but evidence does not yet justify registry admission. Do not promote in 19A.                                                                                                                                                                            |
| Decompose recipe          | **Not committed** — a gatehouse-style open composition (optional Keep/Tower + Checkpoint / Watch post / Armory) is **illustrative only** and collapses blockhouse-specific identity authors may still want.                                                                                                                                                  |
| Facility                  | When decomposed illustratively: `checkpoint`, Watch post, `armory`, `barracks` as authored — same defense cluster as other strongpoints.                                                                                                                                                                                                                     |
| **Decision**              | **KEEP `needs-design`** — morphology confirmed stable; neither shipped Form sufficiency nor a committed decompose recipe closes the term. Revisit only via **19C Form candidacy** or an explicit decompose policy decision.                                                                                                                                  |
| Runtime                   | **NONE**                                                                                                                                                                                                                                                                                                                                                     |

**Inventory:** `needs-design` (unchanged).

**19C trigger:** repeated author need for blockhouse-specific morphology that optional Keep/Tower +
defense Facilities cannot satisfy in open composition review.

---

## Remaining allowlist

Cultural morphology (11) and site/context morphology (3) — **pending** review.
