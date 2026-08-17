# Building taxonomy discovery

**Status:** Research digest (corpus v0.5 frozen)  
**Do not start here for the shipped model** — read
[`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md) or
[`building-taxonomy.md`](../roadmap/building-taxonomy.md) first.

This file is an **index and digest** of the 308-concept building classification investigation
(Phases 0–5 plus editorial appendices). It is not a condensed replay of the coded matrix or model
tests. The full frozen record — 308-row matrix, dimension reports, Models A–E scoring, Phase 5
decision record, and post-decision editorial appendices — lives unchanged in the archive:

**[`archive/building-taxonomy-discovery-v0.5.md`](./archive/building-taxonomy-discovery-v0.5.md)**
(~1,198 lines; do not rewrite in place)

Companion pattern: [`organization-taxonomy-discovery.md`](./organization-taxonomy-discovery.md).

| Document                                                                                                 | Role                                              |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`building-taxonomy.md`](../roadmap/building-taxonomy.md)                                                | Planning authority, current counts, deferred work |
| [`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md)                             | Reusable semantic gates                           |
| [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md) | Shipped Form + Facility runtime model             |
| [`archive/building-taxonomy-discovery-v0.5.md`](./archive/building-taxonomy-discovery-v0.5.md)           | Frozen Phases 0–5 + editorial appendices          |

Interactive corpus review may live in IDE-local canvas artifacts; the archive markdown is the
git-durable record.

---

## Purpose

Pressure-test whether a **small, stable classification model** could represent a broad building
corpus **without** enumerating every archetype as production vocabulary.

**Success is not a comprehensive enum.** The likely end state is a stable semantic model that can
_express_ hundreds of familiar concepts — via dimensions, unset values, name, and context — even
when a concept never becomes a canonical id.

Discovery optimizes for **dimensions that stay stable across examples**, not catalog completeness.

---

## Method

```text
collect building concepts (Phase 1)
→ code dimensional matrix (Phase 2)
→ dimension / boundary / stress-set reports (Phase 3)
→ test candidate models A–D and emergent E (Phase 4)
→ decision record + gaps pass (Phase 5)
→ only then define canonical vocab / schema (implementation — later retired at runtime)
```

### Rules in force during discovery

- No changes to shipped vocab, schemas, fixtures, or tests while mapping.
- **Hierarchy out of scope** — discovery classifies what a building _is_, not where it lives.
  `LOCATION_KIND_DEFINITIONS` remains the sole hierarchy authority.
- Corpus **freezes** when the Phase 3 stress set is fixed (300 concepts), before model scoring.
- Post-test **gaps pass** closes the corpus at **308** concepts (Phase 5).

### Coding dimensions (matrix v0.2)

Applied to every corpus row — full column definitions and all 308 coded rows are archive-only.

| Dimension                 | Role                                                                       |
| ------------------------- | -------------------------------------------------------------------------- |
| Concept level (`Lvl`)     | Keep abstraction levels separate (`arch`, `spec`, `cult`, `comp`, overlay) |
| Boundary (`Bnd`)          | Building vs non-building vs context-dependent                              |
| Composite (`Cmp`)         | Single building vs compound                                                |
| Primary function          | Core semantic hypothesis (free-form at discovery)                          |
| Form                      | Morphology overlap with `structureType` — coded to prove ownership         |
| Affiliation               | Operator identity — coded to evict toward organizations                    |
| Access / Scale            | Provisional — may be policy, not identity                                  |
| Primary signal (`Sig`)    | Why single-dimension models fail                                           |
| Context-sensitive (`Ctx`) | Standalone vs child classification                                         |
| Term overloaded (`Ovl`)   | Polysemy vs ontology ambiguity                                             |
| Ambiguous with            | Builds the Phase 4 stress set                                              |

---

## Corpus metadata (v0.5)

**308 concepts** after the Phase 5 gaps pass (frozen from 300 at Phase 3).

**15 readability buckets** — coverage quotas only, not persisted taxonomy:

| #   | Bucket                 | Concepts (v0.2 matrix) |
| --- | ---------------------- | ---------------------: |
| 1   | Domestic               |                     26 |
| 2   | Trade & services       |                     29 |
| 3   | Governance             |                     17 |
| 4   | Religion               |                     27 |
| 5   | Military               |                     16 |
| 6   | Production             |                     29 |
| 7   | Agriculture            |                     16 |
| 8   | Education & knowledge  |                     13 |
| 9   | Health & social care   |                     12 |
| 10  | Leisure                |                     20 |
| 11  | Transport & travel     |                     16 |
| 12  | Funerary               |                     13 |
| 13  | Magical & fantasy      |                     28 |
| 14  | Temporary & mobile     |                     14 |
| 15  | Monumental & composite |                     24 |

Cross-era coverage: all 15 buckets populated (ancient through fantasy). Cross-cultural forms
appear in 12 of 15 buckets.

### Phase 3 stress set

**43 concepts** (strata A+B+C) used for model scoring and the Phase 5 reproducibility recode.
Full membership: archive Phase 3.

### Corpus log (headline)

| Version               |   Total | Milestone                                             |
| --------------------- | ------: | ----------------------------------------------------- |
| v0.1 seed + expansion |     299 | Prior plan tables + hist/cult/fant/edge passes        |
| v0.2 coding           |     300 | Full matrix coded; **`guildhall` added**              |
| v0.3 analysis         |     300 | Dimension reports; **corpus frozen for model tests**  |
| v0.4 model testing    |     300 | Models A–D scored; **Model E formulated**             |
| v0.5 decision         | **308** | Gaps pass (+8); **Model E adopted; discovery closed** |

Per-concept rows, bucket tables, and corpus batch notes: archive Phase 2 matrix and Corpus log.

---

## Headline findings (Phases 3–4)

### Dimension ownership (survived into evidence doc)

- **Function** is the core semantic dimension — but belongs on **Facility** in the shipped runtime
  model, not on Form.
- **Form** answers morphology; must pass the Form-independent label test.
- **Affiliation** evicts to Organization / relationships — not Building type.
- **Access, scale, condition** are overlays or separate archetypes — not permanent schema fields.
- **Interior roles** default to non-building unless a freestanding counterexample exists.
- **Cultural entries** lean toward **`manifestationOf`** a broader archetype, not new top-level ids
  for every culture.

### Model testing summary (Phase 4)

| Model                                      | Verdict                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **A** (type/subtype tree)                  | **Fails structurally** — scatters storage family, leaves assembly/archive homeless, 14 misfiles |
| **C** (function × form grid)               | **Fails discrimination** — distinct stress concepts collapse to identical cells                 |
| **B** (instance function override)         | Strong nuance; weak cross-family query decisiveness                                             |
| **D** (registry function metadata)         | Strong decisiveness when metadata is authoritative                                              |
| **E** (archetype-primary, function-backed) | **Synthesis** — one authoring question + registry function families + rare override             |

**Provisional selection: Model E** (Phase 4). **Adopted** in Phase 5 (2026-08-03).

### Phase 5 reproducibility (compression boundary)

Independent recode of the **43-concept stress set** under Model E:

| Level                             | Disagreements                                                 |
| --------------------------------- | ------------------------------------------------------------- |
| Archetype (author's one question) | **0 / 43**                                                    |
| Registry function-family set      | 3 / 43 (editorial blend-cap choices, not authoring ambiguity) |

**Post-test gaps pass:** 8 late entrants absorbed **without restructuring** — corpus closed at 308.

Full model score tables, deciding evidence list, and gaps-pass row detail: archive Phase 4–5.

---

## What shipped vs what discovery decided

Discovery **adopted Model E** (flat archetype registry + function families + specialization).
Subsequent product passes **implemented** Model E, then **retired it at runtime** (2026-08-14).

**Current shipped model:** **Building Form** + **Building Facility type** only. The 143-entry
`BuildingArchetype` registry is **quarantined research corpus**, not product vocabulary.

| Discovery outcome                                      | Runtime today                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| Model E archetype + function override + specialization | **Retired** — see evidence doc § Model E retired              |
| ~18 curated function families                          | **Derived from Facility** (`getEffectiveBuildingFunctions()`) |
| Form owned by `structureType`                          | **`classification.form`** (4 shipped Forms)                   |
| Primary discovery axis                                 | **`classification.facilityType`** (40 Facilities)             |

Editorial appendices in the archive (specialization cleanup, overview filters, preset investigation)
document **historical implementation** — not current authoring SSOT.

---

## Settled — do not reopen (discovery)

Treat as constraints unless the stopping rule below fires.

- **No comprehensive archetype enum** as the goal state.
- **Hierarchy stays out of Building classification** — containment is location graph policy.
- **Affiliation is not a Building field** — operator/owner via Organization relationships.
- **Condition and quality are overlays** — not type (e.g. haunted manor, hovel quality axis).
- **Interior-default rule** — throne room, crypt, scriptorium, etc. are not freestanding types
  unless corpus documents a counterexample.
- **Infrastructure / site concepts** — wharves, staithes, wall segments, enclosures — outside
  Building premises classification.
- **Model A type/subtype tree** — rejected; do not revive as runtime SSOT.
- **Model C function×form grid** — rejected for authoring discrimination.
- **Access / scale / geographic scope fields** — not admitted as classification axes.

Full Phase 5 consequence list and seed migration table (25 subtypes → archetypes): archive Phase 5.

---

## Rejected directions (and why)

| Direction                                       | Verdict  | Why                                                               |
| ----------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Single-parent type tree (Model A)               | Rejected | Storage scatter; blend fiat; assembly/archive gaps                |
| Function×form authoring grid (Model C)          | Rejected | Collapses library/archive, feast/guild/meeting halls              |
| New domain-like “building kind” per famous noun | Rejected | 81%+ signature collapse — presets/aliases, not ids                |
| Craft-specific function per trade               | Rejected | Catalog trap; narrow trades stay narrow                           |
| `court` / `crew` as separate Form ids           | Rejected | Fold into office/force analogs or name                            |
| Clandestine visibility field                    | Rejected | No independent filter consumer at discovery close                 |
| Form × Facility pair allowlists                 | Rejected | Open composition reviewed — awkward pairs are valid or label debt |

Gap taxonomy and dimension reports: archive Phase 3.

---

## Taxonomy research still open (reopen conditions)

**Classification research only** — product implementation choices (presets 2B, overview facets,
specialization authoring UX, refactor tooling retirement) live in
[`building-taxonomy.md`](../roadmap/building-taxonomy.md).

| Topic                                       | Evidence today                                  | Reopen when                                                                     |
| ------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| **Interior substructure corpus**            | Many coded `no`/`ctx` as interior               | Interior authoring needs alignment, or whole-Building premises evidence         |
| **`blockhouse` / gatehouse as Form**        | Morphology stable; no shipped Form              | New morphology evidence authors cannot express with tower/keep/hall/house       |
| **`academy` / `museum` as Facility**        | Institution > premises; promotion rejected      | Concrete premises-configuration case clears Facility admission bar              |
| **Manifestation runtime encoding**          | `manifestationOf` edges in quarantined registry | Consumer needs same-axis inheritance aliases metadata cannot represent          |
| **Apartment dual-axis Form**                | Currently facility-only                         | New morphology evidence for multi-unit block pattern                            |
| **Remaining ~56 unresolved inventory rows** | Deferred in refactor inventory                  | **Closed by default** — real authoring usage exposes a concrete missing concept |

**Stopping rule:** Stop Building corpus taxonomy work unless real authoring usage exposes a
concrete missing concept. See roadmap for active deferred table.

---

## Where to go next

| Need                                                         | Read                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Shipped Form + Facility authoring                            | [`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md)                 |
| Current counts, deferred work, implementation follow-through | [`building-taxonomy.md`](../roadmap/building-taxonomy.md)                                                                |
| Form/Facility admission gates                                | [`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md)                                             |
| Full 308-row matrix + Models A–E + Phase 5 decision verbatim | [`archive/building-taxonomy-discovery-v0.5.md`](./archive/building-taxonomy-discovery-v0.5.md)                           |
| Corpus disposition membership                                | [`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts) |

**Do not summarize away the archive.** When this digest and the archive disagree on historical
counts or Model E details, the archive wins for research provenance; contracts tests and the
refactor inventory win for what ships today.
