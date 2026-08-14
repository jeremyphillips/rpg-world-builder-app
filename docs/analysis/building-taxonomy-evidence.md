# Building taxonomy evidence

**Status:** Supporting evidence  
**Canonical roadmap:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)  
**Runtime classification:** [`apps/dashboard/docs/locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md)

Reusable semantic gates and boundary decisions from corpus disposition, create-flow acceptance, and
preset investigation. Not a roadmap, inventory ledger, or phase chronology — git history and
[`building-archetype-refactor-inventory.ts`](../../tools/building-refactor/src/building-archetype-refactor-inventory.ts)
own disposition membership and counts.

## Documentation retention

> If a completed investigation's accepted conclusions are represented by current code/tests and its
> reusable reasoning has been captured in a canonical runtime doc or this evidence doc, delete the
> investigation document. Git history is the archive.

Do not accumulate `phase-X-analysis.md`, `phase-X-closeout.md`, `tranche-X.md`, `acceptance-X.md`, or
`handoff-X.md` unless durable evidence cannot live elsewhere.

## Semantic gates

### Form admission

- **Morphology only** — Form answers physical massing, construction, or architectural pattern; not
  configured use, trade, status, or operator identity.
- **Durable when vacant/repurposed** — if the label only holds while occupied, it is not Form.
- **Form-independent** — morphology must stand without Facility or Organization context.
- **Existing Form sufficiency** — promote only when `house`, `hall`, `tower`, and `keep` do not
  preserve the distinction authors need.
- **Scale/unit gate** — one Building envelope; compounds and Sites are not Form candidates.

### Facility admission

- **Configured Building-premises use** — not Site morphology, not Interior substructure by default,
  not primarily a location concept.
- **Form-independent label test** — if Form is omitted, the Facility label still describes coherent
  configured premises use without requiring morphology inference.
- **Duplicate-vs-distinct test** — promotion requires a durable premises **configuration** authors
  would lose under the nearest shipped Facility; scale, process subtype, trade name, or fantasy flavor
  alone is insufficient.
- **Organization identity may coexist with Facility** — “also modeled as Organization” is not evidence
  against Facility ownership.

### Scale / unit

```text
Single Building / premises?
  ↓ yes → morphology or premises gate
  ↓ no  → Site / infrastructure / compound — outside-building-classification or child Buildings
```

Examples: `castle`, `citadel`, `shipyard`, `salt_works`, `menagerie`, `crannog`, `siheyuan`.

### Institution vs premises

```text
Organization → institution identity (guild, monastic order, diplomatic mission, …)
Facility     → configured premises (temple, schoolhouse, checkpoint, embassy, …)
Relationships → operator / owner / occupant / headquarters (not a substitute for Facility)
```

Do not express dwelling premises as “dwelling via relationships.”

### Complete-label / decomposition rule

Lexical presence of `house`, `hall`, `tower`, etc. is not automatically axis impurity. The test is
whether the **complete label** requires that morphology to define premises use.

```text
Watchtower (former label) → failed — tower morphology embedded in premises label
Bathhouse                 → passes — bathing premises; does not require Form: House
Schoolhouse               → passes — instructional premises; does not require Form: House
```

Bundled morphology+use/actor decomposes across Form + Facility + Organization/relationships.

### Open composition

Form and Facility compose without pair allowlists. Awkward combinations are unusual-but-valid or
vocabulary label debt — not evidence for Form-dependent Facility eligibility.

## Important boundary decisions

| Concept                              | Outcome                             | Rationale                                                                                           |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Apartment building**               | Facility-only                       | Dual-axis Form promotion rejected — morphology not independently durable                            |
| **Gatehouse**                        | Decompose                           | Form admission rejected; House/Tower/Keep + checkpoint and/or Watch post + optional garrison        |
| **Blockhouse**                       | `needs-design`                      | Stable squat loopholed morphology; no shipped Form sufficient; 19C Form promotion rejected          |
| **Martello tower**                   | Decompose                           | Form `tower` sufficient; defense Facilities as authored                                             |
| **Watch post** (`watchtower` id)     | Shipped Facility                    | Label Form-independent; persisted id is accepted identifier debt                                    |
| **Beacon station** (`lighthouse` id) | Shipped Facility                    | Same identifier-debt pattern; `beacon_tower` corpus not promoted                                    |
| **Workshop**                         | Promoted Phase 20A                  | Whole-building craft premises distinct from Factory and Shop; 19C reject superseded by product case |
| **Academy**                          | `pending`                           | Institution identity exceeds Schoolhouse + Organization; 19C Facility reject stands                 |
| **Museum**                           | `pending`                           | Exhibition reads as flavor on library/archive/spectacle Facilities                                  |
| **Apothecary**                       | Decompose                           | Shop and/or Hospital as applicable; Organization activity gap is separate audit                     |
| **Manor**                            | Decompose; no preset                | Status/estate too contextual for preset or Form                                                     |
| **Wizard tower**                     | Decompose; partial preset candidate | Form `tower` safe-init only if 2B approved                                                          |
| **Tree / cave / wreck dwellings**    | Decompose                           | Site/context in label; Form `house` covers adapted envelope only                                    |
| **Palace / monastery**               | Decompose                           | Multi-structure or status blends; avoid `palace → residence + town_hall` recipe                     |

**Identifier debt:** runtime meaning for `watchtower` and `lighthouse` comes from registry metadata,
not lexical interpretation of persisted ids. Migration trigger: API/domain confusion, new code
inferring semantics from ids, or a broader Facility-id normalization pass.

## Corpus disposition patterns

| Pattern                            | Rule                                                | Examples                                                                                   |
| ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Trade / practitioner nouns         | Actor noun, not premises                            | `blacksmith`, `barber_surgeon`, `tailor` → decompose + Organization activity               |
| Canonical Facility/Form sufficient | Cultural expression retained in frozen corpus       | `caravanserai`, `roundhouse`, `domus` → decompose when vacant/repurposed recognition holds |
| Outside-Building concepts          | Positive non-Building owner                         | monuments, infrastructure, vessels, outdoor installations                                  |
| Overlays / context                 | Condition or scenario, not classification           | `haunted_manor`, `safe_house`, `thieves_den` → overlay composition on base decomposition   |
| Cultural/morphology expressions    | Not missing Form when House/Hall/Tower/Keep suffice | igloo, tipi, yurt, broch, longhouse                                                        |
| Compound / Site concepts           | Model constituent Buildings                         | `castle`, `walled_town`, `shipyard`                                                        |

**Ordering rule:** resolve classification ownership first → decompose or outside-building; if
uncertain → `pending`; record manifestation relevance only after ownership is resolved.

Historical corpus `manifestationOf`, `specialization`, and `of:` edges are evidence only — not
disposition or promotion recipes.

## Runtime-promotion lessons

- Promotion is justified when **product authoring** exposes a repeated configured-premises gap that
  clears the admission bar — not when a corpus term is merely familiar.
- **Broad count reduction is not a goal** — trustworthy disposition beats lowering unresolved totals.
- **Phase 20 precedent:** `workshop` was rejected at 19C then promoted when authoring review cleared
  the bar independently of corpus `interior` disposition.
- **Specialist rejects stand:** slaughterhouse, tannery, mint, mortuary, crematorium, gambling_hall,
  brothel, washhouse — flavor or process subtype, not durable configuration gaps after Phase 20/21.
- **Commercial/Production tail:** post-Phase 21 landscape is **sufficient**; Phase 22 urban audit
  found no repeated missing premises concept.

## Model E (retired)

Model E used **Archetype** as the primary Building classification (`classification.archetype`). It
was superseded by optional **Form + Facility** classification. The 143-entry Archetype registry
remains a **quarantined research corpus** — not runtime vocabulary. Do not treat archetype ids as
live classification or import archetype modules from production apps.

## Deferred concepts / reopen triggers

| Topic                                       | Reopen when                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Manifestation runtime**                   | A shipped consumer needs same-axis parent/child inheritance that aliases/metadata cannot represent; exact axis + ≥2 pairs identified |
| **Presets / 2B**                            | Real authoring friction aliases cannot solve; start from Wizard tower per preset investigation below                                 |
| **Interiors**                               | Interior authoring needs corpus alignment, or a term proves whole-Building premises                                                  |
| **Blockhouse Form**                         | Repeated strongpoint morphology friction under open composition + committed Form definition passes morphology protocol               |
| **Academy / museum Facility**               | Premises configuration case materially exceeds Schoolhouse/Library + institution identity                                            |
| **Corpus graph retargeting**                | A runtime consumer treats frozen `of:` edges as live classification                                                                  |
| **Archetype deletion / tooling retirement** | No remaining migration, corpus investigation, or research consumer — see roadmap tooling note                                        |
| **Identifier normalization**                | `watchtower` / `lighthouse` ids confuse API/domain or new code infers morphology from ids                                            |
| **Apothecary Organization activity**        | Separate Organization vocabulary audit — not a Building Facility gap                                                                 |

## Presets (Slice 2A — frozen)

Presets are **ephemeral authoring projections**, not classification axes. They must not appear in
overview search, Facility filter, function filter, or display summaries. No `authoringPresetId` on
Location; preset identity disappears before persistence.

**Safe-init rule:** initialize Setup/classification values only when unambiguous; ambiguous Facility
group and Facility type remain author choice.

| Candidate      | Verdict                          | Notes                                                                  |
| -------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Wizard tower   | GOOD PRESET / PARTIAL PROJECTION | Safe-init `form: tower` only; Facility and relationships author-chosen |
| Healer's house | GOOD PRESET / PARTIAL PROJECTION | Safe-init `form: house`; hospital suggestion-only, not default         |
| Manor          | TOO CONTEXTUAL                   | Decomposition + aliases only                                           |

**Placement (if 2B approved):** optional control at top of Building Setup shell — not before Setup,
not on Details v1.

**Suggestion semantics:** passive helper text and optional actionable Facility suggestions allowed;
**pre-created relationship drafts prohibited** for pilot.

**2B gate:** aliases resolved watchtower/lighthouse discoverability in Phase 7 review; multi-step
Form + group + Facility composition alone does not trigger 2B.

**Control copy:** prefer “Use a familiar starting point” or “Start from a familiar concept” over
“Start from familiar type” to avoid teaching a third canonical type.

## Create-flow acceptance (Phase 7–8)

- **Open composition holds** — no Form×Facility allowlists or compatibility infrastructure required.
- **Civic group label:** registry id `civic`; display **Civic / institutional** — avoids public-ownership leakage.
- **Familiar expressions reachable without presets** — Wizard tower, Healer's house, Gatehouse,
  Lighthouse, Guildhall via Form/Facility/search aliases.
- **Building create-flow Phases 7–8 closed** — remaining identifier normalization and corpus deferrals
  are independent tracks.

## Composite create architecture (Building + Organizations)

Building create with relationship drafts is **atomic** — no sequential or compensating fallback.

- **Endpoint:** `POST /api/campaigns/:campaignId/content/locations/building-create-compositions`
- **Validation:** structured `422` (`building_create_plan_invalid`) with scoped issues
  (`building`, `organization`, `relationship`, `composition`); transaction unavailable → `503`
  (`atomic_write_unavailable`)
- **Preflight:** complete validation before any mutation; race-sensitive state revalidated inside
  transaction
- **Draft IDs:** opaque client-generated; server generates persisted Mongo ids independently
- **Policy:** pending relationships use the same contract-owned eligibility, family, cardinality, and
  occupancy rules as persisted edges

Detail: [`apps/dashboard/docs/create-flow.md`](../../apps/dashboard/docs/create-flow.md).
