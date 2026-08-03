# Building classification (Model E)

Locations whose `kind` is **structure** and `structureType` is **building** can
carry Model E classification: what the building **is**, what it normally
**does**, and optional refinements or exceptions.

Registry vocabulary lives in `@rpg/contracts`
(`building-archetype.ts`, `building-function-family.ts`). Evidence and curation
history: [docs/roadmap/building-taxonomy-discovery.md](../../../docs/roadmap/building-taxonomy-discovery.md).

## The four layers

| Layer              | Field                                 | Question it answers                                            | Author-facing?                                             |
| ------------------ | ------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| **Archetype**      | `classification.archetype`            | What is this building?                                         | Yes — primary picker                                       |
| **Functions**      | Registry `functions` on the archetype | What does this kind of building normally do?                   | Read-only hint (Typical uses)                              |
| **Specialization** | `classification.specialization`       | How is _this instance_ narrowed?                               | Yes — optional free text with registry suggestions         |
| **Override**       | `classification.functionOverride`     | Does _this instance_ serve a substantially different function? | Yes — optional disclosure select (`Add function override`) |

Two more registry fields support discovery but are not separate authored layers:

- **Aliases** — alternative names for the same archetype (warehouse / storehouse).
- **Search terms** — broader vocabulary for finding archetypes (traveler, caravan, books).

Changing archetype clears specialization and function override so stale semantic
state cannot survive an identity change.

## Worked examples

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
projection time.

### Temple with a care override

A temple normally carries **worship**. A field hospital operating in a temple
shell stays **Temple** archetype but sets **function override → Care**. Semantic
function queries (overview function filter, effective-function helpers) see
`care`; archetype identity stays temple.

### Wizard tower blend

**Wizard tower** is its own archetype whose registry functions blend **dwelling**
and **knowledge** — one identity, two semantic functions, no override required.

## Overview surfaces

The locations overview keeps three discovery paths distinct:

| Surface              | Behavior                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Name search**      | Forgiving match on location name plus building labels, aliases, function labels, and search terms |
| **Archetype filter** | Exact canonical identity (`classification.archetype`)                                             |
| **Function filter**  | Cross-archetype grouping via `getEffectiveBuildingFunctions()` — respects override                |

Kind, source, status, and campaign availability filters behave like other content
overviews. See [content-overviews.md](./content-overviews.md).

## Authoring flow

Location create/edit forms use a dashboard-owned **Location type** projection
(`authoringType`) instead of exposing canonical `kind` + `structureType`
separately. The mapping module (`location-authoring-type.ts`) hydrates and
serializes at the form boundary only — API payloads stay canonical.

| Author intent           | Location type          | Primary field   | Persists as                                       |
| ----------------------- | ---------------------- | --------------- | ------------------------------------------------- |
| Inn in a city district  | Building               | Archetype → Inn | `kind: structure`, `structureType: building`, …   |
| Generic defensive wall  | Fortification          | —               | `kind: structure`, `structureType: fortification` |
| Rare unclassified shell | Unclassified structure | —               | `kind: structure` (no `structureType`)            |

Creation shortcuts (`?type=` on the create route, overview dropdown, detail-page
**Add location** menu) only prefill the same form — they never bypass hierarchy
validation or parent availability.

## Authoring modules

| Module                                    | Role                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `location-authoring-type.ts`              | Form projection ids, hydrate/serialize mapping, field validity        |
| `location-create-shortcuts.ts`            | Create-route prefill, promoted shortcuts, child-type menus            |
| `location-classification-form-fields.ts`  | Archetype combobox, specialization, optional function-override select |
| `building-archetype-form-options.ts`      | Registry → combobox options, search ranking                           |
| `building-specialization-form-options.ts` | Archetype-driven specialization suggestions                           |
| `location-form-sync.ts`                   | Clears specialization and override on archetype change                |
| `location-overview-search.lib.ts`         | Overview name-search discovery strings                                |
| `locations-overview-filter-schema.ts`     | Archetype and function overview filters                               |

Form lib conventions: [form-lib-conventions.md](./form-lib-conventions.md).
