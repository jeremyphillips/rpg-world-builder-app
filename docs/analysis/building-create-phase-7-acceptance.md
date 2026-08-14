# Building create Phase 7–8 acceptance

**Status:** Historical evidence / create-flow track closed  
**Current Building planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)  
**Create-flow SSOT:** [`apps/dashboard/docs/create-flow.md`](../../apps/dashboard/docs/create-flow.md)

Keep this note for open-composition evidence, Form-independent labels, watchtower/lighthouse
identifier debt, and 2B acceptance findings. It is not current corpus guidance.

**Investigation date:** 2026-08-14  
**Scope:** UX review, semantic disposition cards, localized vocabulary/copy fixes, create-flow closeout  
**Prerequisite:** frozen 2A preset policy — [`building-authoring-preset-investigation-2a.md`](./building-authoring-preset-investigation-2a.md)

Evidence in this note is from Storybook, Vitest interaction tests, and code-path inspection of
Setup → Details → Organizations. It is **not** an external usability study. Later live authoring
may reopen preset, grouping, or identifier-migration questions.

---

## UX review (observations before dispositions)

Reviewed typed Building create via Storybook (`LocationCreateModal`, tag `phase-7-building-flows`),
Vitest interaction tests, and code-path inspection. Desktop and constrained-width layouts share the
same `CreateSetupShell` / `CreateModalShell` chrome; Form radios (4 values) and Facility discovery
groups scan at both widths.

### Setup hierarchy

- **Form** (optional): four morphology cards scan quickly; descriptions correctly separate morphology
  from use (`Tower` — “independent of watch, defense, residence, or other use”).
- **Facility discovery** (required): six populated groups + Browse all. Civic lists 13 Facilities when
  scoped — scan is long but option count alone is not a split trigger.
- **Selected-state compression** (`House · Civic / institutional`) communicates both axes without
  teaching a third “type.”
- **Change-to-Setup** for Form works; Facility group is Setup-only projection as designed.

### Scenario matrix — stereotypical

| Composition            | UX read  | Notes                                                       |
| ---------------------- | -------- | ----------------------------------------------------------- |
| House + Residence      | Coherent | Residential group + Form align with intent                  |
| Tower + Residence      | Coherent | Vertical form + dwelling use is recognizable                |
| Hall + Town hall       | Coherent | Lexical overlap (Hall vs town hall) is safe — distinct axes |
| Hall + Guildhall       | Coherent | Assembly premises in hall morphology reads naturally        |
| Keep + Armory          | Coherent | Defensive massing + arms storage                            |
| Tower + Watch post     | Coherent | Stereotypical watchtower composition                        |
| Tower + Beacon station | Coherent | Stereotypical lighthouse composition                        |
| Keep + Checkpoint      | Coherent | Gatehouse-adjacent without Form admission                   |

### Scenario matrix — unstereotypical

| Composition                                    | Friction class    | Notes                                                |
| ---------------------------------------------- | ----------------- | ---------------------------------------------------- |
| Hall + Archive                                 | unusual-but-valid | Knowledge custody in hall volume — no axis collision |
| Hall + Watch post                              | unusual-but-valid | Low hall watch station — valid after label cleanup   |
| Hall + Beacon station                          | unusual-but-valid | Shore-side hall with signal function — valid         |
| House + Checkpoint                             | unusual-but-valid | Cottage gatehouse pattern                            |
| Keep + Library                                 | unusual-but-valid | Fortified record room                                |
| Form-unspecified + Watch post / Beacon station | unusual-but-valid | Form-independent labels describe premises use        |
| Tower + Town hall                              | unusual-but-valid | Unusual civic tower — authorable without policy      |

**Pre-fix smell:** `Watchtower` and `Lighthouse` Facility **labels** in Civic group read as
morphology+use bundles when paired with Hall Form, even though descriptions are use-coded. Root cause
is **axis-impure labels**, not a forbidden Hall+Civic combination or missing Form×Facility filter.

### Familiar-expression reachability (no presets)

These are reachability notes, not canonical recipes. Facility and relationships stay explicitly
authored when they apply.

| Familiar term  | Reachable without preset? | Path                                                                                                                                                                                                    |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wizard Tower   | Yes                       | Form Tower is directly reachable; Facility remains explicitly authored when applicable (library and/or residence are available, not implied)                                                            |
| Healer's House | Yes                       | Form House is directly reachable; Hospital is available when the premises itself provides care                                                                                                          |
| Gatehouse      | Yes                       | Possible decompositions include House, Tower, or Keep Form plus Checkpoint or Watch post when those premises uses apply; an occupying Organization may be connected as operator or tenant when authored |
| Lighthouse     | Yes                       | Search “lighthouse” resolves the Beacon station alias                                                                                                                                                   |
| Guildhall      | Yes                       | Civic group → Guildhall                                                                                                                                                                                 |

### Other surfaces

- **Details Facility combobox:** empty query scopes to group; typed query searches full registry —
  recoverability is adequate for the reviewed scenarios.
- **Organizations tab:** untouched and valid; Add/Pending drafts work.
- **Validation / Create building footer:** unchanged; mobile height stable via shared modal shell.
- **28 Facilities:** groups + search remain usable in the reviewed scenarios. Option count alone
  does not justify a new group.

---

## Watchtower disposition card

### Semantic-axis evidence

| Question                      | Finding                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Premises use vs Site?         | Yes — observation/signaling/watch duties on Building premises                                                     |
| Form-independent label?       | **No** with label `Watchtower` — implies tower morphology. **Yes** with **Watch post**                            |
| Encodes shape?                | Former label and persisted id bundle `tower`; authoring label does not                                            |
| Encodes operator/trade?       | No                                                                                                                |
| Survives across Forms?        | Yes — watch duty applies to house/hall/keep/tower/unspecified                                                     |
| Decompose with existing axes? | Optional Tower Form + watch use; checkpoint covers entry control, not observation                                 |
| `guard_post` corpus term?     | Broader (watch/**public order**, patrol) — does not own observation/signaling semantics cleanly; **not promoted** |

### Observed UX evidence

- Civic group scan surfaces the former Watchtower label between armory and library — plausible
  membership, but the label reads as “a tower” rather than watch duties.
- Hall + Watchtower felt like axis collision before review; cause is label impurity, not invalid
  composition.
- Search for “watchtower” must still resolve the Facility — alias requirement confirmed.

### Recommendation

```text
Canonical Facility meaning: Watch post
Persisted id retained: watchtower
Reason: compatibility / localized change only
Search alias: Watchtower
PROMOTE EXISTING CORPUS TERM — rejected (guard_post too broad)
NEW FACILITY TERM REQUIRED — rejected
```

`watchtower` is **accepted identifier debt**, not a second semantic owner. Runtime meaning comes from
registry metadata, not lexical interpretation of the persisted id.

---

## Lighthouse disposition card (independent)

Lighthouse independently passes the premises-use test after label cleanup; retain the persisted id
and use the selected Form-independent authoring label.

### Semantic-axis evidence

| Question                               | Finding                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Premises use vs Site?                  | Yes — staffed signaling premises; description rejects coastal landmark Site |
| Form-independent label (`Lighthouse`)? | **No** — implies tower-like coastal structure                               |
| Encodes shape?                         | Former label and persisted id encode a familiar lighthouse silhouette       |
| Non-tower premises same Facility?      | Yes — navigation-signal function is Facility-owned regardless of Form       |
| `beacon_tower` corpus?                 | Fire signaling, not maritime navigation — **not promoted**                  |

### Replacement-label premises test

The admission rule was re-run against **candidate labels**, not only the old `lighthouse` concept.

| Candidate          | Premises-owned? | Notes                                                                                |
| ------------------ | --------------- | ------------------------------------------------------------------------------------ |
| Navigation beacon  | **No**          | Names the signaling apparatus or Site feature more than the Building                 |
| Beacon station     | **Yes**         | “Station” names staffed premises; signaling identity stays without requiring a tower |
| Navigation station | Weak            | Premises-coded, but reads as a navigation office rather than signal emission         |
| Signal station     | Weak            | Premises-coded, but broader than maritime navigation signaling                       |

**Beacon station** is retained because it names configured premises. It is not chosen for symmetry
with Watch post (`post` vs `station` are independent premises words).

### Observed UX evidence

- Former Lighthouse label in Civic group still suggested morphology even after group copy broadened.
- Tower + lighthouse-style signaling is stereotypical; Hall/House + the same use remains authorable.
- Search “lighthouse” and “navigation beacon” must still resolve — alias and searchTerms confirmed.

### Recommendation

```text
Canonical Facility meaning: Beacon station
Persisted id retained: lighthouse
Reason: compatibility / localized change only
Search alias: Lighthouse
```

`lighthouse` is **accepted identifier debt**, not a second semantic owner.

---

## Accepted identifier debt

The authoring semantics are now Form-independent at the label/description level. `watchtower` and
`lighthouse` remain legacy persisted identifiers whose names no longer exactly match their canonical
Facility meaning.

This is **accepted identifier debt**, not a second semantic owner.

```text
runtime meaning comes from registry metadata
not lexical interpretation of the persisted id
```

Guard: [`building-semantic-vocab.test.ts`](../../packages/contracts/src/rpg/vocab/location/building-semantic-vocab.test.ts)
and [`location-display-summary.test.ts`](../../packages/contracts/src/rpg/content/location/location-display-summary.test.ts)
assert labels and display resolve from registry metadata, and that Hall/House compositions remain
valid without inferring Form from the id.

**Migration trigger** (dedicated sub-slice, not create-flow work):

- ids materially confuse API/domain consumers;
- new code starts inferring semantics from the literal id;
- a broader Facility-id normalization migration is already warranted.

Until then, do not rename persisted enum values as UX cleanup.

---

## Civic / Government group review

### Evidence gate (scenario review, not a user study)

| Repeated failure signal                                       | Observed in Phase 7 review?                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Reviewer cannot predict group membership for a known Facility | No — search recovers Facilities                                        |
| Scan regularly obscures the intended choice                   | Mild — 13 Civic options, mitigated by search                           |
| Competing semantic clusters in the same authoring task        | Partial — admin vs culture vs defense vs care share institutional life |
| Search inadequate                                             | No                                                                     |

No repeated discovery failure was observed during the Phase 7 scenario review that would justify
splitting `civic`.

**Pre-fix:** label `Civic / government` under-described library, hospital, theater, lighthouse,
checkpoint, and armory. **Post Watch post / Beacon station cleanup:** Hall+Civic smell reduced.

### Relationship-leakage review

`Civic / public institutions` improved coverage over `Civic / government` but **public
institutions** still implies public/government ownership or operation. That leaks actor/authority
semantics into Facility discovery.

Checked against the current group: town hall, guildhall, courthouse, prison, barracks, checkpoint,
armory, watch post, library, beacon station, archive, hospital, theater. Guildhall, hospital, and
theater need not be publicly owned; barracks/checkpoint/armory need not assert territorial
authority.

### Group naming outcome

```text
RENAME AUTHORING LABEL ONLY
```

Registry id remains `civic`. Display label → **Civic / institutional**. Description names
institutional uses without asserting public ownership, government operation, or territorial
authority.

```text
KEEP CURRENT AUTHORING LABEL — rejected (public-ownership leakage)
GROUP STRUCTURE NEEDS FUTURE EVIDENCE — not triggered by this review
```

---

## Building-premises Facility admission rule

> A Building Facility must describe a configured use of **Building premises**, not primarily a
> Site/location concept and not physical morphology already owned by Form.

**Form-independent label test** (primary admission column): If Form is omitted, does the Facility
label still describe a coherent configured use of Building premises without requiring the reader to
infer morphology?

| Term       | Premises use?           | Form-independent label?                                                | Encodes shape?                           | Encodes operator/trade? | Survives across Forms? | Decompose with existing axes?                  |
| ---------- | ----------------------- | ---------------------------------------------------------------------- | ---------------------------------------- | ----------------------- | ---------------------- | ---------------------------------------------- |
| checkpoint | Yes (Slice 1)           | Yes                                                                    | No                                       | No                      | Yes                    | Form optional + checkpoint Facility            |
| watchtower | Yes                     | Yes after **Watch post** label; persisted id remains morphological     | Former label yes; id still morphological | No                      | Yes                    | Optional Tower Form                            |
| lighthouse | Yes (Slice 1)           | Yes after **Beacon station** label; persisted id remains morphological | Former label yes; id still morphological | No                      | Yes                    | Optional Tower Form for stereotypical cases    |
| apothecary | Pending (`needsDesign`) | —                                                                      | —                                        | Trade-adjacent          | —                      | Decompose to shop + operator; **non-blocking** |

---

## Open-composition acceptance

> Every reviewed awkward combination can be explained as either unusual-but-valid composition or
> vocabulary ownership debt. No reviewed case demonstrates a domain rule requiring Form-dependent
> Facility eligibility.

```text
Authoring composition
→ clean after label/metadata correction

Persisted identifier naming
→ some legacy semantic debt remains (watchtower, lighthouse)
```

The open-composition finding does **not** require renaming persisted ids immediately. It only
requires that runtime Facility semantics be independent of Form.

Hall + Watch post, Hall + Beacon station, Tower + Town hall, and related matrix rows parse, submit,
and display without axis collision once labels are Form-independent. Pre-fix awkwardness traced to
**label impurity**, not invalid domain pairings. **No counterexample** found that would require
Form×Facility allowlists or compatibility infrastructure.

---

## Search aliases vs familiar-expression presets (2B gate)

| Finding                                            | Alias sufficient in review?                                | Preset needed?                                       |
| -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| “watchtower” discoverability                       | Yes — alias on Watch post + searchTerms                    | No                                                   |
| “lighthouse” / “navigation beacon” discoverability | Yes — alias and searchTerms on Beacon station              | No                                                   |
| Wizard tower                                       | Partial — Tower Form is reachable; Facility stays authored | 2A GOOD/PARTIAL; **2B not triggered** by this review |
| Healer's house                                     | Partial — House Form is reachable; Hospital stays optional | Same                                                 |

The reviewed scenarios do not provide evidence sufficient to trigger 2B. Multi-step composition
(Form + group + Facility) is not by itself preset friction. Frozen 2A policy applies — **2B not
approved.** Later real usage may reopen the preset question.

---

## Localized Phase 7 fixes (authorized)

Applied in [`building-facility-type.ts`](../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts):

| Change                                                                                                      | Type                         |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `watchtower` label → Watch post; alias Watchtower; expanded searchTerms                                     | label/alias/search           |
| `lighthouse` label → Beacon station; alias Lighthouse; searchTerms include lighthouse and navigation beacon | label/alias/search           |
| `civic` group label → Civic / institutional                                                                 | authoring-group display copy |

**Not in scope:** persisted Facility id replacement, Form×Facility filters, new groups, presets,
manifestation.

---

## Phase 8 closeout summary

See closed-audit Phase 11
([`building-organization-model-audit.md`](./building-organization-model-audit.md#phase-11--building-create-flow-closeout)),
runtime authoring
[`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md),
and current planning
[`building-taxonomy.md`](../roadmap/building-taxonomy.md).

| Item                      | Outcome                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Canonical Form values     | `house`, `tower`, `hall`, `keep`                                                                                           |
| Canonical Facility values | **36** ids at consolidation — see `BUILDING_FACILITY_TYPE_IDS` (28 at this review)                                         |
| Facility admission rule   | Documented above (Form-independent label test included)                                                                    |
| Open-composition policy   | Evidence-backed statement — holds; identifier debt acknowledged                                                            |
| Deferred concepts         | apothecary **decompose** (Org activity gap deferred); gatehouse decompose; manifestation ungated; id normalization ungated |
| Preset evidence           | Aliases sufficient in review; 2B not approved                                                                              |
| Manifestation evidence    | Still ungated (Phase 10)                                                                                                   |
| Civic group               | RENAME AUTHORING LABEL ONLY → Civic / institutional                                                                        |
| Watchtower disposition    | Canonical meaning Watch post; persisted id `watchtower`                                                                    |
| Lighthouse disposition    | Canonical meaning Beacon station; persisted id `lighthouse`                                                                |
| Storybook                 | Scenario matrix under `phase-7-building-flows`                                                                             |

---

## Verification

Recorded 2026-08-14 during Phase 7–8 implementation (not a substitute for `pnpm gate:pre-push`).

| Check                                                     | Result                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:affected`                                      | PASS — 18 packages; dashboard 5028 passed / 168 skipped                                                                                                             |
| `pnpm typecheck:affected`                                 | PASS                                                                                                                                                                |
| `pnpm lint:affected`                                      | FAIL on pre-existing `@rpg/dashboard` errors unrelated to this slice (`create-modal-shell.client.test.tsx` `consistent-type-imports`); no new lint on changed files |
| Storybook Phase 7 scenarios (`phase-7-building-flows`)    | Authored with play coverage of the scenario matrix; reviewed via stories + interaction tests                                                                        |
| Constrained-width review                                  | PASS via shared `CreateSetupShell` / `CreateModalShell` chrome (same flow as desktop; no separate screenshot pass)                                                  |
| `pnpm gate:pre-push` (coverage + fallow coverage + build) | **Not run** in this closeout                                                                                                                                        |
| Archetype quarantine guard                                | **Not re-run**; no quarantine/inventory files changed in this slice                                                                                                 |

Follow-up contracts tests added for identifier-debt guards:

- `building-semantic-vocab.test.ts` — labels/functions from registry metadata; Hall/House + legacy ids remain valid
- `location-display-summary.test.ts` — display uses Watch post / Beacon station, not the persisted id

---

**Building create-flow Phase 7–8 is closed:** reviewed scenarios are coherent, localized authoring
vocabulary fixes are verified, open composition remains valid, and no preset or manifestation
trigger was found. Remaining identifier normalization and unresolved corpus concepts are independent
follow-up work and do not keep the create-flow track open.
