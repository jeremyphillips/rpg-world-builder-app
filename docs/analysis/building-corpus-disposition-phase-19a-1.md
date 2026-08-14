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

| Metric                              | Value                                            |
| ----------------------------------- | ------------------------------------------------ |
| **Roadmap investigation seeds**     | 16                                               |
| **Frozen allowlist**                | **16** — exact match; no additions, no omissions |
| **Inventory status**                | 15 `pending`, 1 `needs-design` (`blockhouse`)    |
| **Prior review overlap**            | **0** — none in Tier A/C disposition allowlists  |
| **Runtime Form/Facility promotion** | **NONE** (19A evidence only)                     |

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

| Id               | Corpus kind | Status         | Legacy runtime | Selection note                                     |
| ---------------- | ----------- | -------------- | -------------- | -------------------------------------------------- |
| `blockhouse`     | archetype   | `needs-design` | yes            | Morphology protocol documented; reopen trigger     |
| `martello_tower` | archetype   | `pending`      | yes            | Family D sweep exception; fortification morphology |

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

1. Work the frozen allowlist in subgroup order: fortification → cultural → site/context.
2. Record per-term disposition cards below as each id is reviewed.
3. Freeze accepted disposition ids in inventory (`INITIAL_STATUS_BY_ID`) when the tranche closes.
4. Route any runtime Form candidate to **19C** separately.

Per-term cards: _(none yet — tranche opened 2026-08-14)_.
