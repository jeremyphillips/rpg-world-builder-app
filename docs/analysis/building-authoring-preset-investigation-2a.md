# Building authoring preset investigation — Slice 2A

**Investigation date:** 2026-08-14  
**Scope:** UX/model investigation only — no preset registry, schema field, or UI implementation  
**Roadmap:** `.cursor/plans/building_classification_roadmap_5966c54d.plan.md` Slice 2A

## Goal

Can familiar worldbuilding language help Building authoring **without** becoming persisted
classification or a parallel picker used by search, filter, or display?

Organization reference behavior: [`organization-form-projection.ts`](../../apps/dashboard/src/features/content/lib/forms/organization-form-projection.ts)
— **Start from familiar type** on Details, projects canonical fields, then **clears
`authoringPresetId`** before persistence.

Building create differs: typed Building flows require **Setup** (Facility discovery group +
optional Form) before the create modal. See
[`location-building-create-setup.lib.ts`](../../apps/dashboard/src/features/content/locations/lib/location-building-create-setup.lib.ts).

## Guardrail

Presets must not become a third persistent classification surface alongside Form and Facility, nor
replace Setup’s intrinsic Form / Facility-discovery configuration. They must not appear in overview
search, Facility filter, function filter, or display summaries.

## Candidates assessed

| Label              | Corpus disposition                                     | Hypothesis      | Outcome                            |
| ------------------ | ------------------------------------------------------ | --------------- | ---------------------------------- |
| **Wizard tower**   | Decompose (Tower + optional Facility + occupant)       | GOOD or PARTIAL | **PARTIAL PRESET**                 |
| **Healer's house** | Decompose (House + optional care + operator)           | PARTIAL         | **PARTIAL PRESET**                 |
| **Manor**          | Decompose (form + status + authority — not morphology) | TOO CONTEXTUAL  | **TOO CONTEXTUAL — DO NOT PRESET** |

### Wizard tower — PARTIAL PRESET

**Decomposition (canonical, not a resolver):**

```text
Form: tower
Facility: residence and/or library (author choice)
Relationship: wizard / arcane order as operator or occupant (suggestion-only)
```

**Why partial, not good:**

- Tower Form and library/residence Facilities already express the durable premises identity.
- “Wizard” is **occupant/operator identity**, not Form or Facility — belongs on Organization or
  character relationships, not a Building preset recipe alone.
- A preset can still accelerate Setup (pre-select `tower`, civic or residential discovery scope)
  and nudge Details (`facilityType: 'library'` or `'residence'`), but it cannot responsibly imply
  a default arcane operator without crossing into relationship authoring policy.

**Safe recipe shape (if 2B approved):** project Setup selection + optional `classification` fields
only; relationship/org drafts remain suggestion-only.

### Healer's house — PARTIAL PRESET

**Decomposition:**

```text
Form: house
Facility: hospital when care premises are configured (form-only valid when care is absent)
Relationship: healer / healing organization as operator (suggestion-only)
```

**Why partial:**

- House + hospital is a strong default for “healer’s house” as a **care premises**, but authors
  legitimately mean form-only dwelling with a healer occupant and no hospital Facility.
- Preset must not force `hospital` when the author intends occupant-only semantics.

**Safe recipe shape:** pre-fill `house` + residential/civic discovery scope; optionally suggest
`hospital` in Details with immediate editability; never require Facility.

### Manor — TOO CONTEXTUAL — DO NOT PRESET

**Why not:**

- Identity mixes **social status, land ownership, scale, and governance** — not a stable Form or
  Facility bundle.
- Decomposition table already routes to House / Hall / Keep + residence and/or town_hall +
  ownership/authority **relationships**; no single recipe covers “manor” without encoding status.
- A preset would reintroduce a parallel “manor type” surface the convergence explicitly rejected.

**Recommendation:** keep as decomposition guidance + search aliases on canonical terms if needed
later; do not add a preset.

## Placement in Building create

Building typed create: Setup modal → create modal (Details, relationships, …). Organization has no
Setup step; Building presets must respect Setup as the Facility-discovery gate.

| Question                                                                 | Answer                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Does a familiar-type shortcut appear **before** Setup?                   | **No.** Setup must remain the entry point for Facility discovery intent.                                                                                                                                                       |
| Where should **Start from familiar type** live?                          | **Optional block at the top of the Setup shell** (first panel content, above Form / Facility group cards). Not on a pre-Setup launcher.                                                                                        |
| Details tab too?                                                         | **No** for v1. Organization applies preset on Details because there is no Setup. Building’s value is accelerating Setup + initial classification; a second Details control adds little and risks double-application confusion. |
| Does selecting one **only** project into Setup/Details canonical fields? | **Yes** — `form`, `facilityAuthoringGroup`, optional `facilityType`; no archetype ids.                                                                                                                                         |
| Can the user **immediately change** values afterward?                    | **Yes** — same as Organization; preset is not a constraint.                                                                                                                                                                    |
| Does the preset **disappear after projection**?                          | **Yes** — no `authoringPresetId` on Location; no provenance in search/filter/display.                                                                                                                                          |

## Safe-init vs suggestion-only

| Projected field                        | Policy                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Setup: Form radio                      | Safe-init (canonical)                                                      |
| Setup: Facility authoring group        | Safe-init (canonical)                                                      |
| Details: `classification.facilityType` | Safe-init when recipe includes a Facility                                  |
| Relationship / Organization drafts     | **Suggestion-only** unless a later policy explicitly allows bundled drafts |

## 2B gate (not in this slice)

Slice 2B requires **separate approval** after 2A. Preconditions if pursued:

1. Implement only **Wizard tower** first (strongest PARTIAL; single-axis Setup acceleration).
2. Mirror Organization ephemeral pattern: contract registry + apply helper + form value sync that
   clears preset id; tests prove no archetype ids and no persisted preset field on Location.
3. Re-evaluate **Healer's house** after Wizard tower UX review — optional Facility default is the
   friction point.
4. Do **not** implement Manor or expand preset catalog until usability evidence demands it.

## Conclusion

**2A winner:** PARTIAL presets only (**Wizard tower** first, **Healer's house** second). **Manor**
is excluded. **2B is not authorized by this investigation** — design note only; no schema or UI in
Slice 2A.
