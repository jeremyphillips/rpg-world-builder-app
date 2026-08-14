# Building corpus disposition — sweep 1

**Status:** Supporting evidence  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

This note owns family-rule evidence, the false-positive audit, morphology pull lists, and
approximate-Facility exceptions. It is not the current plan. Snapshot totals below are historical
(sweep closeout); live counts live in the refactor inventory and the canonical roadmap.

**Checkpoint date:** 2026-08-14  
**Scope:** High-confidence corpus disposition sweep. Inventory + analysis only. No runtime Form/Facility
promotion, presets, manifestation, or create-flow changes.

**Related:** Tranche 1 (historical) in [`building-corpus-disposition-tranche-1.md`](./building-corpus-disposition-tranche-1.md);
closed audit [`building-organization-model-audit.md`](./building-organization-model-audit.md);
refactor inventory in
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**SSOT reminder:** [`BUILDING_FORM_IDS`](../../packages/contracts/src/rpg/vocab/location/building-form.ts) and
[`BUILDING_FACILITY_TYPE_IDS`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts) decide
what ships. This note records corpus disposition evidence only. The quarantined Archetype graph stays frozen.

---

## Sweep summary

| Metric                                  | Before sweep | After sweep (post audit) |
| --------------------------------------- | -----------: | -----------------------: |
| Corpus size                             |          308 |                      308 |
| `enabled-form`                          |            3 |                        3 |
| `enabled-facility`                      |           32 |                       32 |
| `rehome-to-organization-activity`       |            1 |                        1 |
| `decompose` (prior + sweep)             |            4 |                       67 |
| `outside-building-classification`       |            0 |                       39 |
| `needs-design`                          |            1 |                        1 |
| Unresolved (`pending` + `needs-design`) |          268 |                      166 |

**Sweep reviewed:** 102 high-confidence Tier A rows after the Family F/E false-positive audit (27 terms
returned to `pending`). Success metric is trustworthy decisions, not pending-count reduction.

**Runtime action this sweep:** **NONE** — Facility promotion is a separate follow-up plan.

---

## Summary grid

| Family                             | Rule (short)                 | Reviewed | Bulk disposition                  |  Pulled in audit |
| ---------------------------------- | ---------------------------- | -------: | --------------------------------- | ---------------: |
| F. Outside Building classification | Positive non-Building owner  |       39 | `outside-building-classification` |                3 |
| A. Trade / operator nouns          | Actor noun, not premises     |        8 | `decompose`                       |                0 |
| E. Canonical sufficient            | Axes suffice; corpus frozen  |       52 | `decompose`                       |               25 |
| C. Status / authority              | Status is not Form           |        1 | `decompose`                       |                0 |
| D. Bundled Form + actor            | Real morphology/actor split  |        1 | `decompose`                       |                0 |
| Overlay composition                | Manor pattern + condition    |        1 | `decompose`                       |       1 (from F) |
| **Tier A total**                   |                              |  **102** |                                   | **27 → pending** |
| G. Facility candidates             | Tier B rank only             | 6 ranked | _(inventory unchanged)_           |                — |
| Remainder                          | Tier C / low-confidence tail |      166 | `pending` / `needs-design`        |                — |

---

## False-positive audit (Family F and E)

Before inventory application, a final pass asked whether family similarity made morphological or
premises-specific concepts look easier than they are. **27 terms** returned to `pending`; `haunted_manor`
was rerouted from Family F to overlay-composition **decompose** instead of forcing
`outside-building-classification`.

Ordering rule applied throughout:

```text
classification ownership resolved → DECOMPOSE / outside-building-classification
classification ownership uncertain → pending / Tier C
manifestation relevance recorded only after ownership is resolved
```

---

### Family F spot-checks (kept vs pulled)

| id              | Decision             | Canonical owner                          | Why not Building Form/Facility                                                                 | Why not DECOMPOSE                                                                                          |
| --------------- | -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `apiary`        | **Keep F**           | not_building / Site outdoor installation | Bee colonies are outdoor agricultural fixtures, not configured indoor premises                 | Barn/Shop do not express apiary semantics without forcing an approximate mapping                           |
| `hippodrome`    | **Keep F**           | infrastructure                           | Chariot-circuit ground morphology — civic infrastructure, not configured Building-premises use | Arena/Theater do not preserve hippodrome circuit identity                                                  |
| `palaestra`     | **Keep F**           | infrastructure                           | Open athletic courtyard — infrastructure morphology, not a durable Facility label              | Training hall / gymnasium conflates institution and infrastructure                                         |
| `pyramid`       | **Keep F**           | monument                                 | Monument/tomb massing — not configured premises use                                            | Temple/residence decomposition loses monument identity                                                     |
| `stoa`          | **Keep F**           | infrastructure                           | Colonnade/portico infrastructure                                                               | Assembly hall decomposition loses colonnade morphology                                                     |
| `stupa`         | **Keep F**           | monument                                 | Buddhist monument mound                                                                        | Open shrine / temple decomposition is approximate                                                          |
| `ziggurat`      | **Keep F**           | monument                                 | Mesopotamian stepped monument                                                                  | Temple decomposition is approximate                                                                        |
| `haunted_manor` | **Pull → decompose** | overlay + manor pattern                  | Whole concept is not outside Building classification                                           | **DECOMPOSE** — same manor recipe as tranche 1; **Haunted** is overlay/condition, not a non-Building owner |
| `pigsty`        | **Pull → pending**   | _(unresolved)_                           | Livestock enclosure may be Barn-class premises                                                 | Barn mapping is scale/subtype approximate — production/livestock cluster                                   |
| `tent_pavilion` | **Pull → pending**   | _(unresolved)_                           | Temporary pavilion overlay                                                                     | Overlay + possible assembly/lodging premises — destination not established                                 |

---

### Family E — morphology-rich cultural expressions (pulled)

If vacant or repurposed, these terms remain recognizable primarily from **physical morphology or spatial
organization**. Shipped Form `house` / `hall` / `tower` / `keep` do not obviously preserve the distinction.
Manifestation future value does **not** justify DECOMPOSE when ownership is still uncertain.

**Pulled to `pending` (11):**

`broch`, `crannog`, `domus`, `igloo`, `longhouse`, `machiya`, `roundhouse`, `siheyuan`, `tholos`, `tipi`,
`yurt`

---

### Family E — “Existing Form sufficient” re-check (pulled)

`cave_dwelling`, `elven_tree_dwelling`, and `shipwreck_dwelling` are **not** Form: `house` claims alone.
They embed Site/location context or wreck condition; `residence` Facility and Form: `house` are separate
semantic claims.

**Pulled to `pending` (3):** `cave_dwelling`, `elven_tree_dwelling`, `shipwreck_dwelling`

**Kept Form-sufficient (4):** `cottage`, `farmhouse`, `rectory`, `townhouse`

---

### Family E — approximate Facility mappings (pulled)

These failed the strong test: “Would preserving this corpus term as a new canonical Facility add **no**
meaningful configured-premises distinction?” Nearest shipped Facility **approximately** works — not
clearly sufficient.

**Pulled to `pending` (11):**

`artificer_atelier`, `bounty_office`, `coach_house`, `dyeworks`, `foundry`, `golem_workshop`, `icehouse`,
`kennel`, `ropewalk`, `tollhouse`, `fulling_mill`

(`bounty_office` also carries institution-vs-premises ambiguity.)

---

## Proven rules (carried forward)

- Facility = configured Building-premises use; Form-independent label test
- Organization identity may coexist with Facility
- Trade/profession/practitioner is not Building classification
- Status/authority is not Form
- Bundled morphology+use/actor decomposes across axes (complete-label test, not spelling)
- Open Form×Facility composition remains valid
- Corpus graph is historical; canonical disposition is separate
- Family classification follows **semantic meaning**, not trade-word or morphology-word presence alone

---

## Family F — Outside Building classification

**Proven rule:** The concept's canonical owner is not Building Form or Building Facility.

**Exact member allowlist (39):**

`airship`, `airship_dock`, `apiary`, `aqueduct`, `barrow`, `bridge`, `cairn`, `camp`, `dragon_roost`,
`drydock`, `fountain`, `gallows`, `hippodrome`, `hollowed_colossus`, `market_stall`, `marae`, `memorial`,
`mimic_building`, `moai`, `obelisk`, `open_air_shrine`, `pa`, `palaestra`, `pyramid`, `sheepfold`, `ship`,
`siege_tower`, `sphinx`, `statue`, `staithe`, `stoa`, `stupa`, `triumphal_arch`, `vardo_wagon`,
`wall_segment`, `walled_town`, `war_camp`, `water_tower`, `ziggurat`

**Exact exception list (14 — remain unresolved):**

| id              | Why excluded                                                     |
| --------------- | ---------------------------------------------------------------- |
| `chapel`        | Building premises or Interior depending on corpus meaning        |
| `city_gate`     | Checkpoint premises or fortification Interior                    |
| `forge`         | Workshop premises vs Interior craft space                        |
| `hovel`         | Overlay poverty dwelling; may still describe configured premises |
| `laboratory`    | Knowledge premises vs Interior lab space                         |
| `onsen`         | Bathing Interior vs Bathhouse premises                           |
| `pigsty`        | Livestock premises — Barn approximate (audit pull)               |
| `safe_house`    | Overlay concealment; premises context-dependent                  |
| `shrine`        | Worship Interior vs Temple premises                              |
| `smugglers_den` | Overlay criminal hideout                                         |
| `tent_pavilion` | Overlay + possible assembly premises (audit pull)                |
| `thieves_den`   | Overlay criminal hideout                                         |
| `workshop`      | Craft Interior vs Factory/Workshop premises — Tier B/C           |
| `haunted_manor` | Routed to overlay-composition **decompose**, not F               |

**Bulk disposition:** `outside-building-classification`

**Confidence:** Tier A (post audit)

---

## Family A — Trade / profession / operator nouns

**Exact member allowlist (8):**

`barber_surgeon`, `butcher`, `chandler`, `cobbler`, `jeweler`, `moneylender`, `tailor`, `wheelwright`

**Exact exception list (4 — Family E premises expressions):**

`general_store`, `magic_shop`, `pawnshop`, `potion_shop`

**Bulk disposition:** `decompose`

**Confidence:** Tier A

---

## Family E — Existing canonical sufficient

**Required secondary marker (cultural rows only — after ownership resolved):**

```text
canonical classification resolved
corpus expression remains potentially useful for future discovery/manifestation
```

### E reason subtypes (post audit)

| Subtype                           | Count | Members                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Premises expression               |     4 | `general_store`, `magic_shop`, `pawnshop`, `potion_shop`                                                                                                                                                                                                                                                                            |
| Existing Form sufficient          |     4 | `cottage`, `farmhouse`, `rectory`, `townhouse`                                                                                                                                                                                                                                                                                      |
| Existing Facility sufficient      |    21 | `amphitheater`, `banqueting_house`, `bardic_college`, `beast_stable`, `byre`, `counting_house`, `dovecote`, `fighting_pit`, `flophouse`, `griffon_aerie`, `livery`, `mage_prison`, `oracle_shrine`, `planar_embassy`, `powder_magazine`, `ranger_station`, `shearing_shed`, `threshing_barn`, `tithe_barn`, `watermill`, `windmill` |
| Existing composition sufficient   |     1 | `cathedral`                                                                                                                                                                                                                                                                                                                         |
| Cultural / specialized expression |    22 | `basilica`, `caravanserai`, `drum_tower`, `godown`, `granary_on_stilts`, `hammam`, `hof`, `houseboat`, `insula`, `madrasa`, `mastaba`, `moot_hall`, `mosque`, `pagoda`, `ribat`, `ryokan`, `stave_church`, `sweat_lodge`, `synagogue`, `teahouse`, `tolbooth`, `trading_factory`                                                    |

**Exact member allowlist (52):** union of all subtype rows above.

**Exact exception list (31 — remain unresolved):**

| Group                            | Members                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior Family E exceptions        | `bakery`, `clinic`, `dower_house`, `orangery`, `silo`, `workhouse`                                                                                          |
| Morphology-rich cultural (audit) | `broch`, `crannog`, `domus`, `igloo`, `longhouse`, `machiya`, `roundhouse`, `siheyuan`, `tholos`, `tipi`, `yurt`                                            |
| Form-sufficient rejects (audit)  | `cave_dwelling`, `elven_tree_dwelling`, `shipwreck_dwelling`                                                                                                |
| Approximate Facility (audit)     | `artificer_atelier`, `bounty_office`, `coach_house`, `dyeworks`, `foundry`, `fulling_mill`, `golem_workshop`, `icehouse`, `kennel`, `ropewalk`, `tollhouse` |
| Deferred                         | `ferry_house`                                                                                                                                               |

**Bulk disposition:** `decompose`

**Confidence:** Tier A (post audit)

---

## Family C — Status / ownership / authority

**Exact member allowlist (1):** `dower_house`

**Exact exception list (5):** `almshouse`, `citadel`, `dzong`, `fortress`, `kasbah`

**Bulk disposition:** `decompose`

---

## Family D — Bundled Form + use / actor

**Exact member allowlist (1):** `healers_house`

**Exact exception list (4):** `bell_tower`, `clock_tower`, `martello_tower`, `workhouse`

**Bulk disposition:** `decompose`

---

## Overlay composition decompose

**Exact member allowlist (1):** `haunted_manor`

Manor → **decompose** (tranche-1 recipe); Haunted → overlay/condition authored separately. Not
`outside-building-classification`.

---

## Family B — Institution vs premises (not bulked)

`academy`, `monastery`, `abbey`, `adventurers_guild`, `customs_house`, `orphanage`

---

## Tier B — Facility candidate ranking (inventory unchanged)

Duplicate-vs-distinct test:

> What user-visible distinction would be lost if the author used the nearest existing Facility instead?

Additional admission question (pre-promotion):

> Does the candidate describe a durable premises **configuration**, or mainly a scale/style/subtype of an
> existing Facility?

| id           | Nearest shipped Facility | Distinction / scale test                                                                  | Bucket            |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------------- | ----------------- |
| `granary`    | Warehouse / Barn         | Stored-grain drying/ventilation — **configuration**, not just smaller warehouse           | **SHIPPED**       |
| `greenhouse` | Barn                     | Cultivation climate control — **configuration**                                           | **SHIPPED**       |
| `arena`      | Theater                  | Combat spectacle premises — **configuration** vs performance                              | **SHIPPED**       |
| `museum`     | Archive / Library        | Exhibition vs custody — **mixed; mostly flavor**                                          | PROMOTE LATER     |
| `workshop`   | Factory                  | Craft premises vs industrial scale — **subtype/scale**, not clearly durable configuration | KEEP AS CANDIDATE |
| `academy`    | Schoolhouse              | Institution identity collision                                                            | KEEP AS CANDIDATE |

**Spot-check notes:**

- **Granary vs Warehouse** — grain-specific ventilation/drying behavior; not merely a smaller depot.
- **Arena vs Theater** — configured combat spectacle; not performance subtype alone.
- **Workshop vs Factory** — often scale/style of production premises; keep candidate until behavior case is proven.

**PR 2 guidance:** Smallest coherent passing set (including **none**).

---

## Remainder analysis (historical snapshot — 163 unresolved at sweep closeout)

Tier C later closed the composite queue (24/24). Current unresolved count and sequencing live on
the [canonical roadmap](../roadmap/building-taxonomy.md). The buckets below are sweep-closeout
evidence, not a live work queue.

| Remainder bucket                    |                Approx. count | Examples                                       |
| ----------------------------------- | ---------------------------: | ---------------------------------------------- |
| Tier C ambiguity / composite        |                          ~24 | `abbey`, `castle`, `monastery`, `palace`, …    |
| Morphology / Form investigation     |                          ~14 | `broch`, `longhouse`, `igloo`, `blockhouse`, … |
| Tier B Facility candidates          | ~3 ranked + funerary cluster | `museum`, `workshop`, `academy`, …             |
| Approximate Facility / production   |                          ~11 | `foundry`, `tollhouse`, `fulling_mill`, …      |
| Family B institution default        |                           ~6 | `academy`, `orphanage`, …                      |
| Family F / E exceptions             |                          ~14 | `chapel`, `pigsty`, `workshop`, …              |
| Interior substructures (deferred F) |                          ~33 | `anchorhold`, `crypt`, `tomb`, …               |
| Production / commercial archetypes  |                          ~40 | `brewery`, `brickworks`, `tannery`, …          |
| Low-confidence tail                 |                    remainder | assorted rows                                  |

**Stopping rule:** Broad-sweep stopping rule is **met** after the Family F/E false-positive audit. Remaining
corpus is predominantly ambiguity, morphology, approximate Facility mapping, or low-value tail. One more
family sweep is permissible only if a genuinely high-confidence family emerges with a low exception rate.

Do not start another broad sweep merely to lower the pending count.

---

## Implementation closeout

**Implemented:** 2026-08-14 in [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

| Outcome                           | Status                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Final false-positive audit        | Complete — 27 terms returned to `pending`; `haunted_manor` rerouted to decompose |
| Explicit Tier A allowlists frozen | Complete — exported `SWEEP_*` constants                                          |
| Inventory statuses applied        | Complete — 102 Tier A rows                                                       |
| Runtime Form/Facility registries  | **Unchanged**                                                                    |
| Quarantined Archetype graph       | **Unchanged** (`potion_shop → apothecary` preserved)                             |
| Tier B Facility promotion         | **Implemented** — `granary`, `greenhouse`, `arena` shipped 2026-08-14            |
| Tier C detailed review            | Closed after this sweep — see roadmap; do not treat 163 as current               |

Original pre-audit Tier A estimate: **129** rows. Final implemented Tier A: **102** rows. The 27-row
reduction (27 returned to `pending`, plus `haunted_manor` rerouted within Tier A) is successful exception
detection, not a shortfall.

### Final Tier A counts by family

| Family                             |   Count | Inventory status                   |
| ---------------------------------- | ------: | ---------------------------------- |
| F. Outside Building classification |      39 | `outside-building-classification`  |
| A. Trade / operator nouns          |       8 | `decompose`                        |
| E. Canonical sufficient            |      52 | `decompose`                        |
| C. Status / authority              |       1 | `decompose`                        |
| D. Bundled Form + actor            |       1 | `decompose`                        |
| Overlay composition                |       1 | `decompose`                        |
| Prior tranche-1 decompositions     |       4 | `decompose` (included in 67 total) |
| **Tier A implemented**             | **102** |                                    |

**Total `decompose` rows at sweep closeout:** 67 (includes prior 4). Unresolved **163** was the
sweep-closeout snapshot (`162 pending` + `blockhouse` `needs-design`). Live totals: inventory tests
and [`building-taxonomy.md`](../roadmap/building-taxonomy.md).

---

## Inventory mechanics

| Status                            | Meaning                                                                |
| --------------------------------- | ---------------------------------------------------------------------- |
| `decompose`                       | Building Form/Facility/relationships suffice (Family E reason on card) |
| `outside-building-classification` | Canonical owner is not Building Form or Facility (destination on card) |
| `rehome-to-organization-activity` | True activity rehome (`blacksmith`)                                    |
| `needs-design`                    | Actionable evidence trigger (`blockhouse`)                             |
| `pending`                         | Unreviewed or Tier B/C queue                                           |

No compound statuses. No corpus-graph retargeting.

---

## Explicit non-goals

- Runtime Facility or Form promotion
- Presets / 2B
- Manifestation pilot (secondary marker recorded only after ownership resolved)
- Archetype deletion or corpus-graph retargeting
- Heuristic/kind/prefix inventory classification
- Filling a Facility tranche to a target size
