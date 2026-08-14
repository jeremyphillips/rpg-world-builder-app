# Building corpus disposition — Tier C tranche 1

**Checkpoint date:** 2026-08-14  
**Scope:** Detailed review of the 24-term composite queue, blockhouse morphology protocol, and Family B
non-composite institution terms. Inventory + analysis only — no runtime Form/Facility promotion.

**Related:** Plan [`.cursor/plans/tier_c_disposition_tranche.plan.md`](../../.cursor/plans/tier_c_disposition_tranche.plan.md);
sweep 1 [`building-corpus-disposition-sweep-1.md`](./building-corpus-disposition-sweep-1.md); Phase 18 in
[`building-organization-model-audit.md`](./building-organization-model-audit.md).

**Queue rule:** `kind: composite` selected these terms for review; it is **not** disposition evidence.

---

## Summary

| Metric                                  | Before Tier C |            After Tier C tranche 1 |
| --------------------------------------- | ------------: | --------------------------------: |
| Composite queue reviewed                |        0 / 24 |                       **24 / 24** |
| Family B non-composite reviewed         |         0 / 4 |                         **4 / 4** |
| Batch 2 defense/massing dispositioned   |             — |            **5 / 5** (2026-08-14) |
| Blockhouse morphology protocol          |             — | **Documented** (status unchanged) |
| `decompose` (sweep + Tier C)            |            67 |                            **79** |
| `outside-building-classification`       |            39 |                            **45** |
| `needs-design`                          |             1 |                  1 (`blockhouse`) |
| Unresolved (`pending` + `needs-design`) |           163 |                           **145** |
| Runtime Form/Facility promotion         |             — |                          **NONE** |

**Tier C dispositioned (tranche 1 + Batch 2):** 18 terms (12 `decompose`, 6 `outside-building-classification`).  
**Reviewed, kept `pending`:** 16 composite terms + `academy` (concrete triggers on cards below).

---

## Reusable gates (established this tranche)

### Scale / unit gate

```text
Single Building?
  ↓ yes → stable morphology? → Form candidate?
  ↓ no  → Site / complex / broader Location ownership
```

### Institution + premises pattern

```text
Organization → institution identity (monastic order, guild, customs authority, …)
Facility     → configured premises (temple, schoolhouse, checkpoint, …)
Relationships → who operates / owns / occupies (not a substitute for Facility)
```

Do not express residential premises as “dwelling via relationships.”

### Morphology decision protocol (from blockhouse spike)

Before Batch 2 Form admission, apply:

1. Is the familiar term one Building or a compound/Site?
2. If one Building: is morphology durable, Form-independent, and not status-encoded?
3. If morphology passes: does Keep/Tower/House already cover it without a new Form?
4. If morphology fails: decompose to Form (optional) + Facility + relationships, or `needs-design`.

Vacant/repurposed strongpoints remain valid open compositions — morphology gate is about **label
identity**, not current use.

---

## Batch 1 — Legacy runtime composites

### monastery → DECOMPOSE

| Layer                | Finding                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus               | Worship + cloistered community functions; `ribat → monastery` frozen                                                                  |
| Scale                | Multi-structure compound common — canonical owner is not one archetype label                                                          |
| Organization         | Monastic community / religious institution                                                                                            |
| Facility             | `temple` (worship); `residence` / `boarding_house` (dwelling premises); `schoolhouse` / `library` (instruction/knowledge) as authored |
| Relationships        | Operator / tenant / owner / headquarters as actually authored                                                                         |
| Facility promotion   | **Reject**                                                                                                                            |
| Example (not recipe) | Form optional + `temple` + monastic Organization; separate Building rows for dormitory/kitchen premises when needed                   |
| Runtime              | **NONE**                                                                                                                              |

### palace → DECOMPOSE

| Layer                   | Finding                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Corpus                  | Dwelling + governance; `palace_complex` related (see Batch 4)                                                     |
| Scale                   | Often complex-scale; single-Building palace remains valid open composition                                        |
| Form                    | `house` / `hall` / `keep` as morphology warrants                                                                  |
| Facility                | `residence` when applicable; other civic/administrative Facility **only when premises use is genuinely authored** |
| **Avoid**               | `palace → residence + town_hall` — Town Hall is one civic premises type, not generic governance                   |
| Relationships           | Ruler / government ownership, headquarters, authority                                                             |
| Manor precedent         | Tranche-1 **DECOMPOSE** — status is not Form                                                                      |
| Neighboring observation | No general administrative/governance Facility — vocabulary gap noted; do not force Town Hall                      |
| Runtime                 | **NONE**                                                                                                          |

### shipyard → OUTSIDE-BUILDING-CLASSIFICATION

| Layer                 | Finding                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| Corpus                | Production + transport; `drydock` graph neighbor is infrastructure                     |
| Scale                 | Familiar term names the **whole establishment** (industrial complex), not one Building |
| Canonical owner       | Site / industrial complex — not Building Form or Facility                              |
| Constituent Buildings | `factory`, `warehouse`, etc. when authors model individual structures                  |
| Drydock / slipway     | Infrastructure / Site (already in sweep outside-building set for `drydock`)            |
| Runtime               | **NONE**                                                                               |

**Batch 1 inventory:** `monastery`, `palace` → `decompose`; `shipyard` → `outside-building-classification`.

---

## Blockhouse morphology spike

| Layer               | Finding                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Corpus              | “Standalone strongpoint”; `service` function metadata questionable                                               |
| Scale               | Single Building candidate — morphology unset vs Keep                                                             |
| Protocol            | See reusable morphology gate above; representative survey peers: `blockhouse`, `martello_tower`, `keep`, `broch` |
| Outcomes still open | Form promotion; decompose to `house`/`keep` + `checkpoint` / Watch post / Armory; remain `needs-design`          |
| **Decision**        | **KEEP `needs-design`** — morphology pack incomplete; do not promote to unlock Batch 2                           |
| Trigger to reopen   | Vacant/repurposed strongpoint cases + massing survey                                                             |

**Inventory:** unchanged (`needs-design`).

---

## Batch 2 — Defense / status massing

Structure/complex gate applied after blockhouse morphology protocol. Familiar terms naming fortified **Sites**
or multi-structure complexes → `outside-building-classification`. Constituent Buildings use shipped Form/Facility
on individual rows (same pattern as `shipyard`).

### castle → OUTSIDE-BUILDING-CLASSIFICATION

| Layer                 | Finding                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Scale                 | Familiar term names the **fortified seat** (keep + bailey + curtain works), not one Building morphology |
| Canonical owner       | Site / fortified complex                                                                                |
| Constituent Buildings | Form `keep` / `house` / `tower` + defense/governance Facilities as applicable per structure             |
| Form promotion        | **Reject** — do not admit Castle Form; Keep searchTerms already carry discovery language                |
| Runtime               | **NONE**                                                                                                |

### citadel → OUTSIDE-BUILDING-CLASSIFICATION

| Layer                 | Finding                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| Scale                 | Site-scale fortification dominating a settlement or district                |
| Canonical owner       | Site / fortified complex                                                    |
| Constituent Buildings | `barracks`, `armory`, `checkpoint`, Watch post, etc. on individual premises |
| Runtime               | **NONE**                                                                    |

### fortress → OUTSIDE-BUILDING-CLASSIFICATION

| Layer           | Finding                                                    |
| --------------- | ---------------------------------------------------------- |
| Scale           | Fortified complex — same structure/complex gate as citadel |
| Canonical owner | Site / fortified complex                                   |
| Runtime         | **NONE**                                                   |

### kasbah → OUTSIDE-BUILDING-CLASSIFICATION

| Layer           | Finding                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Scale           | Fortified quarter / urban compound — not one Building                                                      |
| Cultural label  | Canonical axes may describe parts, but familiar term names Site-scale quarter (§11 — decompose not forced) |
| Canonical owner | Site / fortified urban complex                                                                             |
| Runtime         | **NONE**                                                                                                   |

### dzong → DECOMPOSE

| Layer               | Finding                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Scale               | Multi-structure compound, but Batch 1 **monastery** precedent applies — institution + premises on Building rows                         |
| Organization        | Religious community + defensive garrison as authored                                                                                    |
| Facility            | `temple` (worship); `barracks` / `armory` / Watch post / `checkpoint` on constituent defense premises; optional `residence` / `library` |
| vs outside-building | Religious institution configuration is the hinge — not pure fortification Site                                                          |
| Runtime             | **NONE**                                                                                                                                |

**Batch 2 inventory:** `castle`, `citadel`, `fortress`, `kasbah` → `outside-building-classification`; `dzong` → `decompose`.

---

## Batch 3A — Religious institution / premises

### abbey → DECOMPOSE

Compact card — monastery Batch 1 precedent; subordinate/community nuance is Organization metadata, not a second Facility.

| Layer        | Finding                                                 |
| ------------ | ------------------------------------------------------- |
| Organization | Religious community (often subordinate to larger order) |
| Facility     | `temple` + optional `residence` / `library` as authored |
| Runtime      | **NONE**                                                |

### lamasery, wat → KEEP PENDING

Cultural religious compound — canonical axes may suffice (`temple` + Organization), but stable morphology and Site-scale meaning unresolved (§ cultural labels).

### shinto_shrine → KEEP PENDING

Shrine vs temple semantics; outdoor/Site boundary (`open_air_shrine` already outside-building). Trigger: shrine premises vs Site shrine disposition.

**Batch 3A inventory:** `abbey` → `decompose`.

---

## Batch 3B — Education / care institution composites

### mage_college, university_college → DECOMPOSE

| Layer        | Finding                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| Pattern      | Instructional/knowledge premises + academic Organization                 |
| Facility     | `schoolhouse` / `library` as authored — not deterministic mapping        |
| vs `academy` | Institution collision — `academy` remains separate Family B pending card |
| Runtime      | **NONE**                                                                 |

### leprosarium → DECOMPOSE

| Layer        | Finding                                                         |
| ------------ | --------------------------------------------------------------- |
| Facility     | `hospital`-class care premises + isolation behavior as authored |
| Organization | Care institution operator                                       |
| Runtime      | **NONE**                                                        |

### gymnasium → KEEP PENDING

Athletics + school dual use; sweep noted `palaestra` / gymnasium infrastructure conflation. Trigger: institution premises vs athletic Site/infrastructure.

**Batch 3B inventory:** `mage_college`, `university_college`, `leprosarium` → `decompose`.

---

## Batch 4 — Mixed composites (scheduling batch)

Independent cards — no batch-wide disposition rule.

| Term                | Outcome              | Notes                                                                                                  |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `farmstead`         | **KEEP PENDING**     | Scale gate: one Building vs agricultural compound/Site                                                 |
| `palace_complex`    | **OUTSIDE-BUILDING** | Complex-scale; link `palace` card — not forced single-Building decompose                               |
| `royal_mews`        | **DECOMPOSE**        | `stable` premises + Organization/status relationships                                                  |
| `souk`              | **KEEP PENDING**     | Market compound — Site bazaar vs `market`/`shop` Buildings                                             |
| `thermae`           | **DECOMPOSE**        | Bath complex — `bathhouse` axes suffice; corpus expression frozen (`hammam`, `thermae` in searchTerms) |
| `dwarven_forgehold` | **KEEP PENDING**     | Fantasy production + dwelling + defense compound                                                       |
| `ksar`              | **KEEP PENDING**     | Fortified compound — cultural / Site scale (§ cultural labels)                                         |
| `yamen`             | **KEEP PENDING**     | Administrative compound — cultural / Site scale                                                        |

**Batch 4 inventory:** `palace_complex` → `outside-building-classification`; `royal_mews`, `thermae` → `decompose`.

---

## Family B — Non-composite institution terms

Organization identity may coexist with Facility identity — test premises independently.

### academy → KEEP PENDING

Tier B **KEEP AS CANDIDATE** — compare with shipped `schoolhouse` premises; institution collision unresolved.

### adventurers_guild → DECOMPOSE

| Layer        | Finding                                  |
| ------------ | ---------------------------------------- |
| Organization | Guild institution (quest brokerage)      |
| Facility     | `guildhall` when assembly premises apply |
| Runtime      | **NONE**                                 |

### customs_house → DECOMPOSE

| Layer        | Finding                                              |
| ------------ | ---------------------------------------------------- |
| Facility     | `checkpoint` / trade-inspection premises as authored |
| Organization | Customs authority                                    |
| Runtime      | **NONE**                                             |

### orphanage → DECOMPOSE

| Layer        | Finding                                                       |
| ------------ | ------------------------------------------------------------- |
| Facility     | `boarding_house` / `hospital`-class care premises as authored |
| Organization | Child-welfare institution                                     |
| Runtime      | **NONE**                                                      |

**Family B inventory:** `adventurers_guild`, `customs_house`, `orphanage` → `decompose`.

---

## Cultural labels (§11)

For `lamasery`, `wat`, `kasbah`, `dzong`, `ksar`, `yamen`, `thermae` (where applicable):

```text
canonical classification may be expressible ≠ cultural concept has no independent semantic value
```

Deferred manifestation is **not** a reason to force closure. **KEEP PENDING** preferred when morphology, Site scale, or culturally specific premises behavior remains unresolved.

---

## Explicit non-goals

- Runtime Facility or Form promotion
- Corpus graph retargeting
- Manifestation pilot / presets 2B
- Organization activity implementation
- Using `kind: composite` as disposition evidence

---

## Inventory closeout

**Implemented:** 2026-08-14 in [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

Exported allowlists: `TIER_C_COMPOSITE_QUEUE_IDS`, `TIER_C_DECOMPOSE_IDS`, `TIER_C_OUTSIDE_BUILDING_CLASSIFICATION_IDS`, per-batch constants.

**Frozen corpus graph:** unchanged.
