# Building corpus disposition — tranche 1

**Checkpoint date:** 2026-08-14  
**Scope:** Inventory + analysis only. No runtime Form/Facility promotion, presets, manifestation, or
create-flow changes.

**Related:** Phase 11 closeout in
[`building-organization-model-audit.md`](./building-organization-model-audit.md); refactor inventory
in [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts).

**SSOT reminder:** [`BUILDING_FORM_IDS`](../../packages/contracts/src/rpg/vocab/location/building-form.ts)
and [`BUILDING_FACILITY_TYPE_IDS`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts)
decide what ships. This note records corpus disposition evidence only. The quarantined Archetype graph
(including `potion_shop → apothecary`) stays frozen as historical evidence.

---

## Tranche summary

| Group                     | Terms                                                                      | Inventory outcome                     |
| ------------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| A. Prior reconciliation   | `gatehouse`, `manor`, `wizard_tower`                                       | `decompose` (accepted prior evidence) |
| B. Required investigation | `apothecary`                                                               | `decompose`                           |
| C. Boundary batch         | `bathhouse`, `embassy`, `blockhouse`, `observatory`, `schoolhouse`, `barn` | see cards below                       |
| D. Outcome groups         | —                                                                          | see §Outcome groups                   |

**Decomposed:** 4 (`apothecary`, `gatehouse`, `manor`, `wizard_tower`).  
**Needs-design:** 1 (`blockhouse`).  
**Facility candidates (inventory `pending`):** none from tranche-1 batch (all promoted).  
**Shipped after tranche 1:** `bathhouse`, `observatory`, `embassy`, `schoolhouse`, `barn` → `enabled-facility` (audit Phase 12–15).  
**Unresolved:** 268 concepts (`pending` or `needs-design`; only `blockhouse` is non-inferable `needs-design`).

The tranche does not optimize for reducing the unresolved count. Resolved statuses must be
trustworthy; unresolved statuses must be actionable.

---

## Evidence layers (all cards)

Every card separates:

```text
Corpus evidence              → quarantined vocabulary
Canonical-model disposition  → Form / Facility / Organization / relationships
Runtime action this slice    → NONE in tranche 1 (Bathhouse promoted in Phase 12 — see audit)
```

Where a term belongs on Facility, disposition says **PRIMARY FACILITY CANDIDATE**. Runtime action
in tranche 1 remains **NONE** until a separate promotion plan is approved.

---

## Disposition rules (tranche 1)

### Facility and Organization coexistence

The canonical model intentionally permits:

```text
Facility     = what the premises are configured to do
Organization   = who operates / occupies / owns / is headquartered there
```

> “This concept can also be modeled as an Organization” is **not** evidence against Facility
> ownership. Many legitimate Facilities naturally have an Organization counterpart.

The relevant question:

> Does the term independently describe a configured use of Building premises, even when the
> operator's identity is modeled separately?

Do not use workflow ownership alone as a `needs-design` trigger.

### Compound familiar labels

Lexical presence of a morphology word (`house`, `hall`, `tower`, etc.) is not automatically axis
impurity. The semantic test is whether the **complete label** requires that morphology to define the
premises use.

```text
Watchtower (former label) → failed — Tower morphology was semantically embedded in the premises label
Bathhouse                 → passes — lexicalized bathing premises; does not require Form: House
Schoolhouse               → passes — instructional premises; does not require Form: House
```

Useful for remaining corpus terms such as `workhouse` and similar compounds.

### Provisional candidate metadata

Facility candidacy in this slice establishes **axis ownership**, not approved registry metadata.
Illustrative fields (`authoringGroups`, `defaultFunctions`, `searchTerms`, `aliases`) are proposed
only and require canonical metadata review during an eventual promotion plan — especially Bathhouse
(`care` vs hygiene semantics) and Observatory (`service` vs `knowledge` alignment).

---

## A. Prior-decision reconciliation

Short rows only — full boundary cards were written in Phase 9 / Slice 1 / 2A.

### gatehouse → DECOMPOSE

| Layer                       | Finding                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | Entry control; `defense_watch` function.                                                                                                                                                                                                                                                                                            |
| Canonical-model disposition | Slice 1 / Phase 9 — contextual decompose; Form admission **rejected**. Example-only: optional House / Tower / Keep + `checkpoint` and/or Watch post (`watchtower`) + optional garrison Organization or occupants connected through the applicable canonical Organization/location or character/location relationship when authored. |
| Runtime action this slice   | **NONE** — no Form, no new Facility.                                                                                                                                                                                                                                                                                                |

### manor → DECOMPOSE

| Layer                       | Finding                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | Dwelling + governance functions; estate/status specialization terms.                                                                                                                |
| Canonical-model disposition | Phase 9 Slice D; 2A **TOO CONTEXTUAL — DO NOT PRESET**. Example-only: House / Hall / Keep + `residence` and/or `town_hall` + ownership/authority relationships. Status is not Form. |
| Runtime action this slice   | **NONE** — no Form, no Facility, no preset.                                                                                                                                         |

### wizard_tower → DECOMPOSE

| Layer                       | Finding                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | Dwelling + knowledge functions; wizard occupant identity in search terms.                                                                                                                                 |
| Canonical-model disposition | Phase 9 Slice D; 2A GOOD PRESET / PARTIAL PROJECTION — **2B not approved**. Example-only: Form `tower`; Facility authored when applicable (`residence`, `library`); wizard is occupant/operator identity. |
| Runtime action this slice   | **NONE** — no Building type; preset track remains ungated.                                                                                                                                                |

---

## B. Apothecary (required)

### Corpus evidence

- Label: “A building primarily serving retail (remedies).”
- Functions: `retail`, `care`. Alias: pharmacy.
- Specialization: `potion_shop` → `apothecary` (**frozen** — do not retarget in this slice).

### Canonical-model disposition

**DECOMPOSE** — the familiar term does **not** uniquely identify premises use.

- `shop` expresses retail premises when applicable.
- `hospital` expresses configured care premises when applicable.
- Neither is implied universally; there is no deterministic `apothecary → shop | hospital` mapping.
- Form remains optional and independent.
- Operator / tenant / owns relationships are authored, not inferred from the familiar name.

**Secondary domain finding (Organization, not Building):** Apothecary exposes an Organization
activity vocabulary gap around pharmacy/healing/herbal **practice**. Exact activity decomposition
belongs to a focused Organization audit. The Building tranche identifies the missing owner; it does
not design the neighboring vocabulary.

### Runtime action this slice

**NONE** — no Apothecary Facility. Do not rehome-only (premises still need Building axes when they
exist).

```text
Canonical disposition: DECOMPOSE
Example Building expression: Shop / Hospital as applicable (contextual, not a recipe)
Organization follow-up: activity vocabulary gap — audit separately
```

---

## C. Boundary batch

### bathhouse

**Why selected:** hygiene/service premises control; decision clarifies likely canonical owner for
`hammam`, `onsen`, `thermae`, `sweat_lodge` as **disposition leverage only** — those terms do not
become runtime children of a Bathhouse Facility.

| Layer                       | Finding                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | “Bathing service”; `care` function. Manifestations include `hammam`, `sweat_lodge`; `thermae` is composite; `onsen` is interior-scoped in refactor graph. |
| Canonical-model disposition | **PRIMARY FACILITY CANDIDATE** — distinct from `hospital`; compound label passes.                                                                         |
| Runtime action this slice   | Tranche 1: **NONE**; shipped Phase 12.                                                                                                                    |

**Approved registry metadata (Phase 12):**

| Field            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| id               | `bathhouse`                                                      |
| label            | Bathhouse                                                        |
| description      | Bathing/hygiene/wellness premises — not medical treatment        |
| authoringGroups  | `civic`, `commercial`                                            |
| defaultFunctions | `care`                                                           |
| aliases          | Public baths                                                     |
| searchTerms      | bathing, baths, hygiene, wellness, hammam, thermae, public baths |

**Open compositions (examples):** Hall + Bathhouse (civic); House + Bathhouse (commercial); Form
omitted + Bathhouse when morphology is incidental.

**Inventory:** `enabled-facility` (registry-derived).

---

### embassy

**Why selected:** diplomatic mission vs representational premises.

| Layer                       | Finding                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | “Diplomatic mission”; `service` function; specialization `planar embassy`.                                                                                                                                                                                                                                                                                                 |
| Premises-use test           | Can Building premises independently be configured for diplomatic representation, reception, consular work, and administration while the diplomatic mission remains an Organization? **Yes.** Example composition: Form House / Hall / other + Facility diplomatic premises + Organization diplomatic mission + operator / tenant / headquarters relationships as authored. |
| Organization coexistence    | A diplomatic Organization and diplomatic premises Facility are **cleanly separable** — coexistence is evidence **for** the split, not ambiguity. Operator departure does not invalidate Facility ownership (configured use may change, as with any Facility).                                                                                                              |
| Label refinement            | If `embassy` bundles mission identity too strongly at promotion time, evaluate axis-pure labels such as “Diplomatic premises” before rejecting Facility ownership.                                                                                                                                                                                                         |
| Canonical-model disposition | **PRIMARY FACILITY CANDIDATE** — representational premises independent of diplomatic Organization.                                                                                                                                                                                                                                                                         |
| Runtime action this slice   | Tranche 1: **NONE**; shipped Phase 14.                                                                                                                                                                                                                                                                                                                                     |

**Approved registry metadata (Phase 14):**

| Field            | Value                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| id               | `embassy`                                                                                   |
| label            | Embassy                                                                                     |
| description      | Diplomatic representation/reception/consular/administration premises — not the Organization |
| authoringGroups  | `civic`                                                                                     |
| defaultFunctions | `governance`, `assembly`                                                                    |
| aliases          | Diplomatic premises                                                                         |
| searchTerms      | diplomatic, consulate, ambassador, planar embassy, …                                        |

Organization coexistence remains clean: diplomatic mission is modeled separately via Organization and
relationships.

**Inventory:** `enabled-facility` (registry-derived).

---

### blockhouse

**Why selected:** Form-adjacent morphology vs Keep — Form promotion explicitly out of scope.

| Layer                                        | Finding                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence                              | “Standalone strongpoint”; `service` function (metadata questionable — use reads as defense).                                                                                                                                                                                                                                                              |
| Canonical-model disposition                  | **NEEDS DESIGN** — morphology evidence required before Form candidacy or a committed decompose recipe. Keep’s “compact, thick-walled central block” does **not** close Blockhouse. Representative blockhouses may differ in massing/construction from Keep.                                                                                               |
| Axis discipline (illustrative, not a recipe) | Potential **Form:** Keep / Tower / unspecified Form depending on actual structure. Potential **Facilities:** Checkpoint / Watch post / Armory / Barracks as applicable. **Remaining question:** Does Blockhouse identify sufficiently stable morphology to warrant Form admission? Keep is Form, not use — do not collapse morphology and configured use. |
| Runtime action this slice                    | **NONE**                                                                                                                                                                                                                                                                                                                                                  |

**Trigger for reopen:** representative morphology survey (`blockhouse`, `martello_tower`, `keep`,
`broch`) with vacant/repurposed recognition cases.

**Inventory:** `needs-design`.

---

### observatory

**Why selected:** instrumented sky-observation premises vs viewpoint Site; distinct from Watch post
and Library.

| Layer                       | Finding                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | “Sky observation”; `service` function; astronomy search terms.                                            |
| Canonical-model disposition | **PRIMARY FACILITY CANDIDATE** — instrumented observation premises; distinct from Watch post and Library. |
| Runtime action this slice   | Tranche 1: **NONE**; shipped Phase 13.                                                                    |

**Approved registry metadata (Phase 13):**

| Field            | Value                                                               |
| ---------------- | ------------------------------------------------------------------- |
| id               | `observatory`                                                       |
| label            | Observatory                                                         |
| description      | Instrumented sky observation premises — not outdoor viewpoint/site  |
| authoringGroups  | `civic`                                                             |
| defaultFunctions | `knowledge`                                                         |
| searchTerms      | astronomy, stars, sky, telescope, stargazing, celestial observation |

**Site boundary:** description excludes outdoor viewpoints and landmark sites without configured
Building premises (Beacon station precedent).

**Inventory:** `enabled-facility` (registry-derived).

---

### schoolhouse

**Why selected:** education/training premises vs Library; `education` Organization activity already
ships.

| Layer                       | Finding                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | “Basic local education”; `knowledge` function. Sibling corpus terms (`academy`, `madrasa`, `bardic_college`, `university_college`) raise canonical-owner questions — not runtime children of Schoolhouse.                                                                                                                                                                                   |
| Premises-use test           | Does `schoolhouse` name premises independently of the particular school organization? **Yes.** Can those premises exist without requiring an Organization record? **Yes.** Can different educational organizations occupy the same kind of Facility? **Yes.** Does Library fail to express instructional use? **Yes** — Library is records/study custody, not configured teaching premises. |
| Organization coexistence    | School as Organization + `education` activity **and** configured teaching premises Facility are cleanly separable — evidence **for** Facility ownership, not dual-path ambiguity.                                                                                                                                                                                                           |
| Compound label              | “Schoolhouse” passes the compound-label rule — instructional premises, not Form: House.                                                                                                                                                                                                                                                                                                     |
| Canonical-model disposition | **PRIMARY FACILITY CANDIDATE** — instructional premises; Organization coexistence clean.                                                                                                                                                                                                                                                                                                    |
| Runtime action this slice   | Tranche 1: **NONE**; shipped Phase 15.                                                                                                                                                                                                                                                                                                                                                      |

**Approved registry metadata (Phase 15):**

| Field            | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| id               | `schoolhouse`                                                               |
| label            | Schoolhouse                                                                 |
| description      | Teaching/local instruction — not records custody or the school Organization |
| authoringGroups  | `civic`                                                                     |
| defaultFunctions | `knowledge`                                                                 |
| searchTerms      | school, education, teaching, instruction, children, pupils                  |

**Inventory:** `enabled-facility` (registry-derived).

---

### barn

**Why selected:** farm storage/outbuilding vs shipped `warehouse` and `stable`; clarifies farm
outbuilding corpus cluster.

| Layer                       | Finding                                                                                                                                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus evidence             | “Farm storage and outbuildings”; `service`, `storage`; specializations include `byre`, `dovecote`, `shearing_shed`, `threshing_barn`, `tithe_barn`.                                                                                                                          |
| Re-open finding             | Barns commonly combine crop/material storage, livestock shelter, and agricultural work. Warehouse + Stable approximates **parts** of that identity but may lose the distinct **agricultural-premises** configured use — barn is not merely generic storage or mount shelter. |
| Premises-use test           | Form-independent label **passes** — “Barn” names configured agricultural outbuilding premises without requiring a specific Form. Operator/trade leakage: low — farm operation is typically Organization/relationship, not embedded in the Facility label.                    |
| Canonical-model disposition | **PRIMARY FACILITY CANDIDATE** — agricultural-premises identity distinct from warehouse/stable.                                                                                                                                                                              |
| Runtime action this slice   | Tranche 1: **NONE**; shipped Phase 15.                                                                                                                                                                                                                                       |

**Approved registry metadata (Phase 15):**

| Field            | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| id               | `barn`                                                                                    |
| label            | Barn                                                                                      |
| description      | Farm storage, livestock shelter, agricultural premises — not cargo depot or mount shelter |
| authoringGroups  | `production`, `commercial`                                                                |
| defaultFunctions | `storage`, `service`                                                                      |
| searchTerms      | farm, livestock, agricultural outbuilding, hay, byre, threshing barn                      |

Farm outbuilding specializations remain corpus disposition leverage, not runtime children.

**Inventory:** `enabled-facility` (registry-derived).

---

## D. Outcome groups

### Inventory-only (decompose)

| id             | Source               |
| -------------- | -------------------- |
| `gatehouse`    | Prior reconciliation |
| `manor`        | Prior reconciliation |
| `wizard_tower` | Prior reconciliation |
| `apothecary`   | Tranche 1 card       |

### Facility candidates (independent — not a shipping bundle)

Tranche-1 Facility candidates are **fully promoted** (Phases 12–15). Registry metadata for
remaining corpus work belongs to future disposition tranches, not this note.

**Shipped (Phase 12):** `bathhouse`  
**Shipped (Phase 13):** `observatory`  
**Shipped (Phase 14):** `embassy`  
**Shipped (Phase 15):** `schoolhouse`, `barn`

### Organization follow-ups

| Finding                                                                      | Source                                  |
| ---------------------------------------------------------------------------- | --------------------------------------- |
| Organization activity vocabulary gap around pharmacy/healing/herbal practice | Apothecary — focused Organization audit |

### needs-design (actionable trigger)

| id           | Trigger                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `blockhouse` | Morphology evidence pack — does Blockhouse warrant Form admission vs contextual Form + Facilities? |

---

## Explicit non-goals (tranche 1 slice)

- Runtime Facility or Form promotion _(Bathhouse shipped separately — Phase 12)_
- Building presets / 2B
- Manifestation pilot or corpus-graph retargeting (including `potion_shop`)
- Organization activity implementation
- Building create-flow changes
