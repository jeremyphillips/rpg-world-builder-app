# Building classification (Model E)

Locations whose `kind` is **structure** and `structureType` is **building** carry Model E
classification: optional **Building Form** (morphology) and/or **Facility type** (configured
purpose). At least one must be present on persisted classification.

**Facility is the primary authoring/discovery axis; Form is optional structural precision.** Setup
requires a Facility discovery group (including Browse all), not a persisted `facilityType`.
Canonical registries live in `@rpg/contracts` — [`building-form.ts`](../../../packages/contracts/src/rpg/vocab/location/building-form.ts)
and [`building-facility-type.ts`](../../../packages/contracts/src/rpg/vocab/location/building-facility-type.ts).
Evidence and curation history: [docs/roadmap/building-taxonomy-discovery.md](../../../docs/roadmap/building-taxonomy-discovery.md)
(historical curation, not current ownership).

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

## Quarantined archetype corpus

Persisted Building classification is **only** `classification.form` and/or
`classification.facilityType`. The 143-entry `BuildingArchetype` registry
([`building-archetype.ts`](../../../packages/contracts/src/rpg/vocab/location/building-archetype.ts))
is a **quarantined research corpus** — not exported from runtime barrels, not imported by
production apps (ESLint-enforced). It may inform future authoring presets or manifestation
migration; that is **possible, not promised**.

## Overview surfaces

The locations overview exposes Form/Facility discovery:

| Surface             | Behavior                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **Name search**     | Forgiving match on location name plus Form/Facility labels and Facility-derived function labels |
| **Facility filter** | Exact `classification.facilityType`                                                             |
| **Function filter** | Cross-facility grouping via `getEffectiveBuildingFunctions()` (Facility defaults)               |

Kind, source, status, and campaign availability filters behave like other content
overviews. See [content-overviews.md](./content-overviews.md).

## Historical Model E (archetype-primary, retired)

The sections below describe the **superseded** archetype-primary Model E that persisted
`classification.archetype`. Runtime authoring, Mongo, and API no longer use these fields or
surfaces. Kept as design history only.

### Former four layers

| Layer              | Field (retired)                       | Question it answered                                           | Former author-facing?                                                                         |
| ------------------ | ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Archetype**      | `classification.archetype`            | What is this building?                                         | Primary picker (removed)                                                                      |
| **Functions**      | Registry `functions` on the archetype | What does this kind of building normally do?                   | Derived metadata below Archetype (`Typical uses`)                                             |
| **Specialization** | `classification.specialization`       | How is _this instance_ narrowed?                               | Optional disclosure text field with inline registry suggestion actions (`Add specialization`) |
| **Override**       | `classification.functionOverride`     | Does _this instance_ serve a substantially different function? | Optional disclosure select (`Add function override`); excluded archetype default functions    |

Two more registry fields support discovery but are not separate authored layers:

- **Aliases** — alternative names for the same archetype (warehouse / storehouse).
- **Search terms** — broader vocabulary for finding archetypes (traveler, caravan, books).

Changing archetype clears specialization and function override so stale semantic
state cannot survive an identity change.

## Former worked examples

### Thieves' guild in a guildhall vs a warehouse

Both might be authored as child locations under a city, but the building
classification differs:

- **Guildhall** archetype — assembly + governance. "Thieves' guild" is
  organization ownership, not building identity; the hall remains a guildhall.
- **Warehouse** archetype — storage. A front business occupying a warehouse keeps
  the warehouse identity; smuggling activity is narrative, not a new archetype.

Do not mint a `thieves_guild` archetype because criminals meet there.

### Coaching inn with a child stable

Author the inn as **Inn** with specialization `Coaching inn` (lodging + food &
drink by default). Put the horses in a **child structure** classified as
**Stable** (service). Model E does not fold every offered facility into the
parent archetype.

### Caravanserai

**Caravanserai** is a cultural **manifestation** of **Inn** in the registry
(`manifestationOf: 'inn'`). Authors pick Caravanserai when that identity matters;
discovery search still connects it to inn/traveler/caravan vocabulary at
projection time. The archetype picker shows manifestation context on option rows;
post-selection authoring shows **Typical uses** only (not a separate Related
archetype line) to keep a single stable metadata row below the control.

### Temple with a care override

A temple normally carries **worship**. A field hospital operating in a temple
shell stays **Temple** archetype but sets **function override → Care**. Semantic
function queries (overview function filter, effective-function helpers) see
`care`; archetype identity stays temple.

### Wizard tower blend

**Wizard tower** was its own archetype whose registry functions blended **dwelling**
and **knowledge** — one identity, two semantic functions, no override required. Under the
current model, decompose onto Form + Facility + Organization relationships instead.

## Authoring flow

Location create/edit forms use a dashboard-owned **Location type** projection
(`authoringType`) instead of exposing canonical `kind` + `structureType`
separately. The mapping module (`location-authoring-type.ts`) hydrates and
serializes at the form boundary only — API payloads stay canonical.

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

Overview promoted shortcuts run through `resolveLocationCreateSession` — Settlement opens a
setup step first; other promoted types navigate directly to the fixed URL. The optional
`?parent=` query param remains a soft initial value for the parent picker on the page.

Detail-page **Add location** (Contained locations panel, City structure Direct locations
subgroup, and District row `+`) opens `LocationCreateModal` (`size="md"`) for both
setup-gated and ready authoring types — one continuous setup ↔ details transaction with
no drawer handoff. City structure partitions District vs direct choices from one canonical
eligibility result — see
[location-hierarchy.md](./location-hierarchy.md#city-structure-authoring).

### Contained settlement create — starting districts

When the create modal reaches details for a fixed settlement session (after setup chooses
`settlementType`), authors can optionally seed **starting districts** in the Structure
group below description. Field order uses `composeLocationCreateBodyFields` with an
`afterDescription` slot — overview create continues to call `buildLocationFields`
directly and does not surface this UI.

| Layer             | Module                                                   | Role                                                                                             |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Form placement    | `location-form-fields.ts`                                | `composeLocationCreateBodyFields`, presentation-only `buildSettlementStartingDistrictsFormItems` |
| Interactive UI    | `location-settlement-starting-districts-slot.client.tsx` | Name rows, add/remove                                                                            |
| Composition state | `settlement-create-composition-context.client.tsx`       | Empty baseline per open session                                                                  |
| Workflow          | `location-settlement-create-composition.lib.ts`          | Validation, `buildStartingDistrictCreateInput`, `createSettlementWithStartingDistricts`          |

Submit creates the settlement first, then sequentially POSTs each district as a child
`kind: 'district'` Location with `parentLocationId` set to the new settlement. Partial
district or deferred campaign-access failures surface as **one** aggregated warning toast;
success still trusted-closes the modal.

**Campaign access:** starting districts inherit default public access — locations do not
inherit parent/child access. A default-public district can appear in list/search while a
restricted parent remains hidden. Session-access mirroring for composed districts is a
follow-up candidate only.

| Module                                                                    | Role                                                                                                                                                                             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `location-create-session.ts`                                              | `resolveLocationCreateSession`, `completeLocationCreateSetup`                                                                                                                    |
| `location-create-shortcuts.ts`                                            | Fixed-session URL parse/serialize, child-type menus, Create/Add headings                                                                                                         |
| `location-create-modal.client.tsx`                                        | Contained create surface: setup ↔ details in one `md` modal; transaction dirty + draft prune                                                                                     |
| `@/lib/create-setup` (`CreateSetupPanel`, `create-setup-sequence.lib.ts`) | Shared setup chrome/panel: compact summaries, `dependsOn` invalidation, active-set expansion, derived Continue — see [create-setup README](../../src/lib/create-setup/README.md) |
| `location-settlement-structure.lib.ts`                                    | District vs direct-place partition helpers                                                                                                                                       |

Create-setup choice collapse and selected-summary presentation are owned by the shared shell/sequence — Site, Settlement, and Region supply ordered choice-set definitions only (no per-type selected-card or collapse wiring).

## Authoring modules

| Module                                   | Role                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `location-authoring-type.ts`             | Form projection ids, hydrate/serialize mapping |
| `location-create-shortcuts.ts`           | Fixed-session URL parse/serialize              |
| `location-classification-form-fields.ts` | Form select + Facility searchable combobox     |
| `location-overview-search.lib.ts`        | Overview name-search discovery strings         |
| `locations-overview-filter-schema.ts`    | Facility type and function overview filters    |

Form lib conventions: [form-lib-conventions.md](./form-lib-conventions.md).
