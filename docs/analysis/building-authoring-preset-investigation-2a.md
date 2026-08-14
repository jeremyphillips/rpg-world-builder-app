# Building authoring preset investigation — Slice 2A

**Status:** Deferred supporting evidence  
**2B remains unapproved**  
**Current planning:** [`docs/roadmap/building-taxonomy.md`](../roadmap/building-taxonomy.md)

This note is the frozen 2A design record. It is not the current Building roadmap. Reopen only if
the deferred Presets / 2B trigger on that roadmap is met.

**Investigation date:** 2026-08-14  
**Revised:** 2026-08-14 (projection policy, suggestion semantics, copy evaluation)  
**Scope:** UX/model investigation only — no preset registry, schema field, or UI implementation

## Goal

Can familiar worldbuilding language help Building authoring **without** becoming persisted
classification or a parallel picker used by search, filter, or display?

A Building preset is an **authoring shortcut**, not a type. It must not reintroduce archetype as a
competing classification axis.

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

## Core model (frozen for 2A)

```text
Preset (familiar label — not a canonical type)
    ↓
What can we infer confidently?
    ↓
Safe canonical initialization
    +
Hints for ambiguous choices
    ↓
Normal Setup / Details / Relationships UI
    ↓
Preset identity disappears
```

A preset is **not** a recipe that must fill every part of a decomposition. It initializes what is
unambiguous, hints where author choice remains, then relinquishes authority to the normal create
flow.

## Safe-init rule

**A preset may initialize a Setup or classification value only when that value is unambiguous for the
named concept. Ambiguous downstream values remain for explicit author choice.**

Setup requires **one** Facility discovery intent (`facilityAuthoringGroup` or Browse all). A preset
must not guess between civic, residential, or other groups when the familiar name does not resolve
to a single discovery scope.

## Canonical vs authoring-only projection

```text
Canonical values (persisted on Location.classification)
├─ classification.form
└─ classification.facilityType

Authoring-only state (Setup projection — not preset semantics)
└─ facilityAuthoringGroup
```

`facilityAuthoringGroup` scopes Facility suggestions during create; it is never persisted. Treat it
as **authoring projection**, not something a preset recipe declares as canonical meaning.

If a future preset unambiguously initializes a Facility type, the Setup discovery group may be
**derived** from that Facility to support the UI (e.g. `library` → civic group). Avoid recipes that
independently declare both `facilityType` and `facilityAuthoringGroup` — those can drift.

## Evaluation dimensions

Assess candidates on **shortcut value** (recognizable author language) and **projection
confidence** (how much canonical state can safely be inferred):

| Candidate          | Shortcut value | Projection confidence | Preset verdict                       |
| ------------------ | -------------- | --------------------- | ------------------------------------ |
| **Wizard tower**   | High           | Partial               | **GOOD PRESET / PARTIAL PROJECTION** |
| **Healer's house** | High           | Partial               | **GOOD PRESET / PARTIAL PROJECTION** |
| **Manor**          | Medium/high    | Too contextual        | **TOO CONTEXTUAL — DO NOT PRESET**   |

“Partial” describes **projection**, not whether the shortcut is worth offering. Wizard tower and
Healer's house are highly recognizable; what is limited is how much canonical state can be safely
inferred without guessing.

## Candidates assessed

### Wizard tower — GOOD PRESET / PARTIAL PROJECTION

**Decomposition (canonical, not a resolver):**

```text
Form: tower
Facility: residence and/or library (author choice)
Relationship: wizard / arcane order as operator or occupant (hint only — see below)
```

**Preset projection:**

| Field          | Policy                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Form: `tower`  | **Safe-init** — unambiguous morphology                                                                    |
| Facility group | **User chooses** — library vs residence spans groups; preset must not guess                               |
| `facilityType` | **Optional hint later** — e.g. passive copy or actionable “Use Library” in Details; not safe-init default |
| Relationships  | **Hints only** — no pre-created drafts (see Suggestion semantics)                                         |

**Why projection is partial, not why the preset is weak:**

- One high-confidence canonical projection: **Form `tower`**.
- Facility and occupant semantics stay explicitly authored — “wizard” is not Form or Facility.
- Do not describe this as “single-axis Setup acceleration”; it is one confidently inferred axis plus
  contextual downstream possibilities.

### Healer's house — GOOD PRESET / PARTIAL PROJECTION

**Decomposition:**

```text
Form: house
Facility: hospital when care premises are configured (form-only valid when care is absent)
Relationship: healer / healing organization as operator (hint only)
```

**Preset projection:**

| Field               | Policy                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| Form: `house`       | **Safe-init**                                                             |
| Facility group      | **User chooses** — care premises vs dwelling-only is author intent        |
| `hospital` Facility | **Optional suggestion, not default** — form-only path must remain obvious |
| Relationships       | **Hints only**                                                            |

**Why projection is partial:**

- House Form is unambiguous; hospital vs form-only dwelling is not.
- Preset must not force `hospital` or pre-select civic/residential discovery scope.

### Manor — TOO CONTEXTUAL — DO NOT PRESET

**Why not:**

- Identity mixes **social status, land ownership, scale, and governance** — not a stable Form or
  Facility bundle.
- Decomposition table routes to House / Hall / Keep + residence and/or town_hall +
  ownership/authority **relationships**; no single recipe covers “manor” without encoding status.
- Shortcut value does not overcome too-contextual projection — a preset would reintroduce a parallel
  “manor type” surface the convergence explicitly rejected.

**Recommendation:** decomposition guidance + search aliases on canonical terms if needed later; no
preset.

## Placement in Building create

Building typed create: Setup modal → create modal (Details, relationships, …). Organization has no
Setup step; Building presets must respect Setup as the Facility-discovery gate.

| Question                                              | Answer                                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Does a shortcut appear **before** Setup?              | **No.** Setup remains the entry point for Facility discovery intent.                                                                     |
| Where should the control live?                        | **Optional block at the top of the Setup shell** (above Form / Facility group cards). Not on a pre-Setup launcher.                       |
| Details tab too?                                      | **No** for v1 — avoids double-application; Setup + initial classification is enough.                                                     |
| What gets projected?                                  | **Safe-init** canonical fields only; **hints** for ambiguous fields; **authoring-only** group derived only when Facility is unambiguous. |
| Can the user **immediately change** values afterward? | **Yes** — preset is not a constraint.                                                                                                    |
| Does preset identity **disappear after projection**?  | **Yes** — no `authoringPresetId` on Location; no provenance in search/filter/display.                                                    |

### Control copy (UX decision — not frozen)

Organization uses **Start from familiar type**. For Building, “type” risks teaching users that
Wizard tower is another canonical Building type. Evaluate alternatives before 2B:

| Copy option                    | Tradeoff                                             |
| ------------------------------ | ---------------------------------------------------- |
| Start from familiar type       | Cross-domain consistency with Organization           |
| Start from a familiar building | Emphasizes spatial object, still slightly type-like  |
| Start from a familiar concept  | Neutral; matches decomposition framing               |
| Use a familiar starting point  | Clearest that this is a shortcut, not classification |

**Recommendation for 2B:** prefer **Use a familiar starting point** or **Start from a familiar
concept** unless product review chooses Organization parity. Document the choice explicitly in
implementation; do not inherit Organization wording by default.

## Suggestion semantics (clarify before 2B)

Three implementation levels — **not interchangeable**:

| Level                              | Example                                                 | 2B pilot                                      |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| **Passive helper text**            | “Often configured as a library or residence.”           | Allowed                                       |
| **Actionable suggestion**          | “Use Library” control that sets `facilityType` on click | Allowed if clearly non-default and reversible |
| **Pre-created relationship draft** | Operator/org row inserted awaiting confirmation         | **Prohibited for pilot**                      |

“Suggestion-only relationships” must **not** quietly become relationship-composition policy. The
pilot may use passive copy and optional actionable Facility suggestions only; bundled Organization
or relationship drafts require a separate policy decision.

## 2B gate (not in this slice)

Slice 2B requires **separate approval** after 2A. Preconditions if pursued:

1. Implement **Wizard tower** first — one high-confidence canonical projection (`form: 'tower'`)
   while leaving Facility discovery group, Facility type, and relationship semantics explicitly
   authored.
2. Mirror Organization ephemeral pattern: contract registry + apply helper + value sync that clears
   preset id; tests prove no archetype ids and no persisted preset field on Location.
3. Re-evaluate **Healer's house** after Wizard tower UX review — hospital as optional suggestion
   (not default) is the friction point.
4. Do **not** implement Manor or expand the catalog until usability evidence demands it.
5. Resolve control copy via explicit UX decision (see above).
6. Implement only passive hints + optional actionable Facility suggestions; no pre-created
   relationship drafts.

## Conclusion

**2A winners:** **GOOD PRESET / PARTIAL PROJECTION** for **Wizard tower** (first if 2B approved)
and **Healer's house** (second). **Manor** excluded.

**2B is not authorized by this investigation** — design note only; no schema or UI in Slice 2A.
