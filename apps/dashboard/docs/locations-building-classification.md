# Building classification

Locations whose `kind` is **structure** and `structureType` is **building** carry Form + Facility
classification: optional **Building Form** (morphology) and/or **Facility type** (configured
purpose). At least one must be present on persisted classification.

**Facility is the primary authoring/discovery axis; Form is optional structural precision.** Setup
requires a Facility discovery group (including Browse all), not a persisted `facilityType`.

| Concern                        | Where to read                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime model**              | This document + [`building-form.ts`](../../../packages/contracts/src/rpg/vocab/location/building/building-form.ts) and [`building-facility-type.ts`](../../../packages/contracts/src/rpg/vocab/location/building/building-facility-type.ts) |
| **Taxonomy planning / status** | [`docs/roadmap/building-taxonomy.md`](../../../docs/roadmap/building-taxonomy.md)                                                                                                                                                           |
| **Semantic gates / history**   | [`building-taxonomy-evidence.md`](../../../docs/analysis/building-taxonomy-evidence.md) — only when boundary reasoning is needed                                                                                                            |
| **Frozen research corpus**     | [`building-taxonomy-discovery.md`](../../../docs/discovery/building-taxonomy-discovery.md) — digest; full record in [`archive/building-taxonomy-discovery-v0.5.md`](../../../docs/discovery/archive/building-taxonomy-discovery-v0.5.md)    |

Do not start from the frozen discovery corpus to learn the current shipped model.

## Canonical axes

| Axis              | Field                         | Question it answers                                                      | Author-facing?                                                     |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Building Form** | `classification.form`         | What is the physical morphology, construction, or architectural pattern? | Optional — Setup radio cards and Details select                    |
| **Facility type** | `classification.facilityType` | What configured purpose or service does the premises provide?            | Primary discovery axis — Setup group + Details searchable combobox |

Both fields are optional in schema, but at least one is required on persisted classification.
Derived **functions** come from a selected Facility (`getEffectiveBuildingFunctions()`), not from
Form. Form-only buildings have no derived functions.

**Authoring principle:** one primary semantic owner per vocabulary term. Facility-primary is UX
emphasis — Setup gates on Facility discovery intent, not on requiring `facilityType` on every
Building. Optional Form does not make both axes equally required at Setup.

### Facility admission rule

A Building Facility describes a configured use of **Building premises**, not primarily a Site/location
concept and not physical morphology owned by Form. Labels must pass the **Form-independent label
test**: if Form is omitted, the Facility label still describes a coherent configured use of Building
premises without requiring the reader to infer morphology.

**Open composition:** Form and Facility compose without pair allowlists. Awkward combinations are
investigated as unusual-but-valid composition or vocabulary label debt — not as evidence for
Form-dependent Facility eligibility.

**Identifier debt:** persisted ids `watchtower` and `lighthouse` are accepted legacy identifiers.
Runtime labels are **Watch post** and **Beacon station**; meaning comes from registry metadata, not
lexical interpretation of the id. Do not rename persisted enum values as UX cleanup unless a
dedicated migration trigger fires (see evidence doc).

**Discovery groups** (`civic`, `commercial`, …) are Setup-only authoring facets; they are never
persisted. The `civic` group displays as **Civic / institutional** — institutional uses without
asserting public ownership.

### Institution vs premises

```text
Facility     = configured premises use
Organization = institution identity
Relationships = operator / owner / occupant / headquarters
```

Organization identity on relationships does not replace Facility when premises configuration is the
claim. Facility and Organization may coexist on the same Building.

### Quarantined archetype corpus

Persisted Building classification is **only** `classification.form` and/or
`classification.facilityType`. The 143-entry `BuildingArchetype` registry
([`building-archetype.ts`](../../../packages/contracts/src/rpg/vocab/location/building/building-archetype.ts))
is a **quarantined research corpus** — not exported from runtime barrels, not imported by
production apps (ESLint-enforced). It may inform future presets or manifestation migration; both
remain **deferred** — see [`building-taxonomy.md`](../../../docs/roadmap/building-taxonomy.md#deferred).

**Model E** (archetype-primary classification) was retired. Historical detail:
[`building-taxonomy-evidence.md`](../analysis/building-taxonomy-evidence.md#model-e-retired).

## Overview surfaces

The locations overview exposes Form/Facility discovery:

| Surface             | Behavior                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **Name search**     | Forgiving match on location name plus Form/Facility labels and Facility-derived function labels |
| **Facility filter** | Exact `classification.facilityType`                                                             |
| **Function filter** | Cross-facility grouping via `getEffectiveBuildingFunctions()` (Facility defaults)               |

Kind, source, status, and campaign availability filters behave like other content overviews. See
[content-overviews.md](./content-overviews.md).

## Authoring flow

Location create/edit forms use a dashboard-owned **Location type** projection (`authoringType`)
instead of exposing canonical `kind` + `structureType` separately. The mapping module
(`location-authoring-type.ts`) hydrates and serializes at the form boundary only — API payloads stay
canonical.

| Author intent           | Location type          | Primary field                            | Persists as                                                                                      |
| ----------------------- | ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Inn in a city district  | Building               | Facility discovery → Inn (or Browse all) | `kind: structure`, `structureType: building`, `classification` with `form` and/or `facilityType` |
| Generic defensive wall  | Fortification          | —                                        | `kind: structure`, `structureType: fortification`                                                |
| Rare unclassified shell | Unclassified structure | —                                        | `kind: structure` (no `structureType`)                                                           |

Creation shortcuts use an authoritative fixed session on the create route:

| URL                                                  | Meaning                                          |
| ---------------------------------------------------- | ------------------------------------------------ |
| `/locations/new`                                     | Unrestricted create                              |
| `/locations/new?type=building`                       | Fixed Building session (type locked)             |
| `/locations/new?type=settlement&settlementType=city` | Fixed Settlement + settlement type (after setup) |

Overview promoted shortcuts run through `resolveLocationCreateSession` — Settlement opens a setup
step first; other promoted types navigate directly to the fixed URL. The optional `?parent=` query
param remains a soft initial value for the parent picker on the page.

Detail-page **Add location** opens `LocationCreateModal` (`size="md"`) for both setup-gated and
ready authoring types — one continuous setup ↔ details transaction. City structure partitions
District vs direct choices — see [location-hierarchy.md](./location-hierarchy.md#city-structure-authoring).

Building create with Organization relationship drafts uses atomic composite submit — see
[create-flow.md](./create-flow.md).

### Contained settlement create — starting districts

When the create modal reaches details for a fixed settlement session, authors can optionally seed
**starting districts** in the Structure group below description. Submit creates the settlement
first, then sequentially POSTs each district as a child `kind: 'district'` Location.

| Module                                   | Role                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| `location-create-session.ts`             | `resolveLocationCreateSession`, `completeLocationCreateSetup` |
| `location-create-shortcuts.ts`           | Fixed-session URL parse/serialize                             |
| `location-create-modal.tsx`              | Contained create: setup ↔ details in one modal                |
| `location-classification-form-fields.ts` | Form select + Facility searchable combobox                    |
| `location-building-create-setup.lib.ts`  | Building Setup — Form cards + Facility discovery groups       |

Form lib conventions: [form-lib-conventions.md](./form-lib-conventions.md).

Storybook: tag `phase-7-building-flows` and `phase-20-building-flows` on
[`location-create-modal.stories.tsx`](../src/features/content/locations/components/create/location-create-modal.stories.tsx).

## Authoring modules

| Module                                   | Role                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `location-authoring-type.ts`             | Form projection ids, hydrate/serialize mapping |
| `location-create-shortcuts.ts`           | Fixed-session URL parse/serialize              |
| `location-classification-form-fields.ts` | Form select + Facility searchable combobox     |
| `location-overview-search.lib.ts`        | Overview name-search discovery strings         |
| `locations-overview-filter-schema.ts`    | Facility type and function overview filters    |
