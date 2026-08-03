# Implement Building Classification — Model E

Implementation specification (relocated from `building-taxonomy-discovery.md`).
Evidence and the 308-concept corpus remain in
[building-taxonomy-discovery.md](./building-taxonomy-discovery.md).

Move the location building model forward using **Model E: archetype-primary, function-backed**, as selected by the completed Building Taxonomy Discovery.

Do not revisit Models A–D unless implementation exposes a concrete contradiction with the adopted decision.

The core model is:

```ts
interface BuildingClassification {
  archetype: BuildingArchetype
  functionOverride?: BuildingFunctionFamily
  specialization?: BuildingSpecialization
}
```

with authoritative registry metadata conceptually shaped like:

```ts
interface BuildingArchetypeDefinition {
  label: string
  description: string

  /**
   * Semantic function families this archetype normally serves.
   * Usually one; at most two when the blend is identity-bearing.
   */
  functions: readonly BuildingFunctionFamily[]

  /**
   * Optional broader archetype represented by a cultural,
   * fantasy, historical, or otherwise specialized manifestation.
   */
  manifestationOf?: BuildingArchetype

  /**
   * Curated discovery vocabulary.
   * Search-only; does not classify the building.
   */
  searchTerms?: readonly string[]

  /**
   * Optional curated specialization suggestions appropriate
   * for this archetype.
   */
  specializationTerms?: readonly BuildingSpecialization[]

  /**
   * Informational architectural/form note only.
   * Must not compete with structureType ownership.
   */
  formNote?: string
}
```

Treat the exact field names as starting points and reconcile them with current contracts conventions.

## Locked semantic rules

Preserve these decisions:

```text
Author chooses WHAT IT IS
→ archetype

Registry knows WHAT IT NORMALLY DOES
→ functions

An unusual instance may deviate
→ functionOverride

A narrower authored variation may refine it
→ specialization

Search vocabulary improves discovery
→ searchTerms
```

Do not recreate:

```text
building type
→ subtype
```

The previous primary-use parent categories are dissolved.

Do not introduce generic `other` values. An unset optional field remains the escape hatch where applicable.

Keep these ownership boundaries:

- physical form → `structureType`
- containment → `LOCATION_KIND_DEFINITIONS` / `parentLocationId`
- affiliation/ownership → organization relationships later
- interior layout → interior classification
- condition/status → separate metadata
- building archetype → Model E building registry

Classification must not create hierarchy rules.

---

# Phase 1 — Contracts and canonical Model E shape

Implement the smallest canonical Model E contract before expanding vocabulary.

## Replace the old building type/subtype model

Remove the existing two-level building classification based on:

```ts
buildingType
buildingSubtype
BUILDING_TYPE_DEFINITIONS
```

Replace it with a building classification object approximately like:

```ts
export interface BuildingClassification {
  archetype: BuildingArchetype
  functionOverride?: BuildingFunctionFamily
  specialization?: string
}
```

Prefer a nested classification object rather than scattering related fields across the structure variant:

```ts
{
  kind: 'structure',
  structureType: 'building',

  classification: {
    archetype: 'inn',
    specialization: 'coaching inn',
  },
}
```

rather than:

```ts
{
  buildingArchetype: 'inn',
  buildingFunctionOverride: ...,
  buildingSpecialization: ...,
}
```

Review whether `classification` should itself remain optional so a building can exist before it is classified.

## Function override semantics

Define this explicitly before implementation.

Recommended meaning:

> `functionOverride` replaces the registry's normal function-family set for this particular instance.

For example:

```ts
{
  archetype: 'temple',
  functionOverride: 'healthcare',
}
```

means:

> This is still a Temple archetype, but this particular temple's relevant semantic function is Healthcare rather than the archetype default.

Do not make authors choose an override during normal creation.

If the discovery evidence suggests an override occasionally needs multiple functions, review whether the field should be:

```ts
functionOverride?: BuildingFunctionFamily;
```

or:

```ts
functionOverrides?: readonly [
  BuildingFunctionFamily,
  BuildingFunctionFamily?,
];
```

Do not introduce multiple override values merely for symmetry. Prefer the smallest shape supported by real examples.

## Registry constraints

Create a contracts-owned archetype registry.

It must be the SSOT for:

- archetype ids
- labels/descriptions
- default function families
- manifestation relationships
- search/discovery terms
- curated specialization suggestions
- semantic lookup helpers

Integrity rules should include:

- every archetype has a valid label/description
- zero duplicate archetype ids
- one or two default functions maximum
- every referenced function family exists
- every `manifestationOf` target exists
- manifestation relationships cannot cycle
- an archetype cannot manifest itself
- search terms are normalized/deduplicated
- specialization suggestions are normalized/deduplicated

Do not make dashboard code reconstruct these relationships.

## Start with a deliberately small seed registry

Phase 1 is about proving the contract, not making the archetype list comprehensive.

Seed enough archetypes to cover:

```text
house
inn
tavern
warehouse
guildhall
temple
stable
palace
blacksmith
library
```

plus at least one manifestation example:

```text
caravanserai → inn
```

and at least one blended-function example.

The comprehensive registry comes later.

## Contracts helpers

Provide semantic helpers such as:

```ts
getBuildingArchetypeDefinition(archetype)
getBuildingArchetypeLabel(archetype)
getBuildingArchetypeFunctions(archetype)
getEffectiveBuildingFunctions(classification)
getBuildingArchetypeSearchTerms(archetype)
getBuildingSpecializationTerms(archetype)
getBuildingManifestationRoot(archetype)
```

Keep helpers domain-oriented.

Do not add dashboard-specific projections such as `{ value, label }[]` unless that convention is already explicitly contracts-owned elsewhere.

---

# Phase 2 — API and persistence

Once the contract is stable, update API persistence independently from dashboard UX.

## Persistence shape

Replace the old building type/subtype fields with the Model E classification shape.

Conceptually:

```ts
classification: {
  archetype: string;
  functionOverride?: string;
  specialization?: string;
}
```

Persistence should mirror contracts rather than duplicate semantic registries.

Contracts/Zod remains authoritative for:

- valid archetype ids
- valid function override values
- classification branch shape
- specialization constraints

Do not hard-code another archetype/function mapping in Mongoose or API services.

## Clean break

This is still dev-only unless current repository state says otherwise.

Prefer:

- fixture updates
- tests updates
- schema regeneration

over migration infrastructure if no persisted production data requires it.

## API tests

Cover at least:

```text
building with archetype only
building with specialization
building with function override
cultural manifestation archetype
invalid archetype
invalid function override
classification fields on non-building structure
unclassified building, if supported
```

Do not alter location hierarchy validation.

A building's archetype/functions must never affect valid parent kinds.

---

# Phase 3 — Dashboard form fields and UX

Implement the Model E authoring flow only after the API shape is settled.

The UX should preserve the discovery result:

> The normal authoring question is "What is this building?"

The user should not normally classify abstract function families.

## Normal creation flow

When:

```text
Kind
[ Structure ]

Structure type
[ Building ]
```

show:

```text
Building classification

Archetype
[ Search archetypes...                         ▾ ]

  Typical uses
  Lodging · Food & drink

Specialization                                  Optional
[                                               ]

Advanced classification                         ▾
```

### Archetype field

This is the primary field.

The picker should support search and rich result rows.

Example:

```text
Archetype

[ Search building archetypes... ]

Inn
Lodging · Food & drink

Caravanserai
Inn manifestation · Lodging · Trade

Tavern
Food & drink · Social

Stable
Animal care · Boarding
```

The user selects the concrete archetype:

```text
Inn
Guildhall
Warehouse
Temple
Caravanserai
```

rather than a broad function family.

## Typical uses

After an archetype is selected, render its registry functions as read-only supporting information:

```text
Typical uses
Lodging · Food & drink
```

These are not normal form controls.

Do not render:

```text
Function
[ Lodging ▾ ]
```

beside Archetype during normal authoring.

That would recreate the ambiguity Model E was chosen to eliminate.

## Specialization

Show an optional specialization field below archetype.

Example:

```text
Specialization                            Optional
[ Coaching inn                           ]
```

Its purpose is:

> Narrow this instance without changing what archetype it is.

Examples:

```text
Inn → Coaching inn
Temple → Sea temple
Warehouse → Bonded warehouse
Palace → Summer palace
```

Initially, specialization may be authored text.

However, once comprehensive specialization terms exist, the UI should support registry suggestions while still allowing appropriate authored refinement if the final contract permits it.

Potential UX:

```text
Specialization
[ Search or enter...                      ]

Suggested
Coaching inn
Roadside inn
Posting inn
```

Do not turn specialization into a second mandatory taxonomy.

## Advanced classification

Keep exceptional semantic changes collapsed by default.

```text
Advanced classification ▾
```

Expanded:

```text
Function override                         Optional
[ Use archetype defaults                 ▾ ]

Default functions
Lodging · Food & drink

Only change this when this particular building serves
a substantially different function than its archetype normally does.
```

Example:

```text
Archetype
Temple

Default
Worship · Assembly

Function override
Healthcare
```

Clearly communicate that the building remains a Temple.

## Manifestations

`manifestationOf` is registry metadata, not normal authored data.

If the selected archetype is:

```text
Caravanserai
```

show informational metadata if useful:

```text
Related archetype
Inn

Typical uses
Lodging · Trade
```

Do not make the author select:

```text
Manifestation of
[ Inn ]
```

when creating the location.

## Field flow

The normal UX should therefore be:

```text
1. Choose Structure
2. Choose Building
3. Search/select Archetype
4. See Typical uses
5. Optionally add Specialization
6. Save
```

Exceptional path:

```text
1–5 normal flow
6. Expand Advanced classification
7. Override function only when this instance is unusual
8. Save
```

## Examples

### Thieves' guild operating from a guildhall

```text
Name
The Black Hand

Structure type
Building

Archetype
Guildhall

Typical uses
Assembly · Administration

Organization
Black Hand Guild        [future relationship field]
```

"Thieves" is not part of building classification.

### Thieves' guild operating from a warehouse

```text
Archetype
Warehouse

Typical uses
Storage · Logistics

Organization
Black Hand Guild
```

Do not create a `thieves_guild` archetype merely because thieves occupy it.

### Inn with tavern + restaurant + stable

Building:

```text
Archetype
Inn

Typical uses
Lodging · Food & drink · Social

Specialization
Coaching inn
```

Distinct visitable stable:

```text
child location
→ structure / building / stable
```

Distinct dining/common rooms:

```text
child locations
→ interior / space
```

Do not model every offered facility as another building archetype on the parent.

---

# Phase 4 — Search and discovery architecture

Once the basic field UX works, add registry-backed discovery.

Keep three concepts separate:

```text
archetype
→ canonical identity

functions
→ structured semantic querying

searchTerms
→ discovery vocabulary
```

## Search terms

Search terms are curated registry metadata.

Example:

```ts
inn: {
  label: 'Inn',
  functions: ['lodging', 'food_drink_social'],

  searchTerms: [
    'lodging',
    'rooms',
    'traveler',
    'travel',
    'food',
    'drink',
  ],
},
```

Example manifestation:

```ts
caravanserai: {
  label: 'Caravanserai',
  manifestationOf: 'inn',
  functions: ['lodging', 'trade'],

  searchTerms: [
    'caravan',
    'merchant',
    'travel',
    'lodging',
    'trade',
    'courtyard',
  ],
},
```

Search should match:

- archetype label
- archetype aliases, if modeled
- search terms
- function labels/terms
- manifestation parent label
- specialization suggestions where useful

Search metadata must not become schema classification.

Avoid naming this field `tags` internally unless the project already reserves `tags` for curated semantic search.

Prefer:

```ts
searchTerms
```

or:

```ts
discoveryTerms
```

Keep future user-authored tags separate.

## Archetype search UX

The picker should support queries such as:

```text
lodging
horses
weapons
books
merchant
worship
```

and surface appropriate archetypes even when the query does not match their label directly.

Examples:

```text
"lodging"
→ Inn
→ Caravanserai
→ Ryokan
→ Boarding House

"horses"
→ Stable
→ Livery
→ Coaching Inn

"books"
→ Library
→ Archive
→ Scriptorium, if it is a building archetype

"weapons"
→ Armory
→ Arsenal
→ Blacksmith
```

Ranking semantics should be explicitly defined.

Recommended rough priority:

```text
exact archetype label
→ label prefix
→ alias
→ specialization
→ manifestation relation
→ function
→ search term
```

Review existing project search conventions before inventing a parallel search-ranking system.

---

# Phase 5 — Comprehensive function-family vocabulary

Do not build the comprehensive archetype registry until the Model E mechanics and UI have stabilized.

First define the canonical function families.

Use the completed 308-concept discovery corpus as the primary evidence source.

The discovery suggested roughly 12–18 curated function families, with one or two allowed per archetype.

Create a focused function taxonomy review before locking ids.

Candidate dimensions likely include concepts around:

```text
dwelling
lodging
food/drink/social
retail/trade
craft/service
production
storage
administration
assembly
worship
education/knowledge
healthcare/care
detention
defense/watch
transport/travel
spectacle/leisure
```

Do not blindly use these exact names.

Review the discovery corpus and collapse near-duplicates where authors/system queries would not benefit from distinction.

Function families must answer:

> What semantic cross-archetype query does this enable?

Examples:

```text
Find places providing lodging
Find storage buildings
Find worship buildings
Find production facilities
Find assembly venues
```

If a proposed function family does not support a meaningful cross-archetype query, question whether it belongs in the canonical vocabulary.

## Function registry structure

Follow existing vocab patterns.

Potentially:

```ts
BUILDING_FUNCTION_FAMILY_TERM
BUILDING_FUNCTION_FAMILY_ENTRIES
BUILDING_FUNCTION_FAMILY_IDS
BuildingFunctionFamily
```

If the function vocabulary becomes large, split it into multiple files by semantic cluster rather than allowing a giant monolithic file.

For example:

```text
building/functions/
  domestic.ts
  commerce.ts
  civic.ts
  institutional.ts
  production.ts
  travel.ts
  index.ts
```

But preserve one canonical exported registry/list.

Do not create multiple independent function registries.

---

# Phase 6 — Comprehensive archetype registry

After function families stabilize, convert the discovery corpus into a comprehensive curated archetype registry.

Do not assume all 308 corpus concepts become archetypes.

For each corpus concept determine:

```text
canonical archetype
manifestation
specialization
form-only concept
interior concept
site concept
composite
overlay/condition
not a building
```

Only building archetypes belong in the building registry.

## Archetype definition

Conceptually:

```ts
export interface BuildingArchetypeDefinition {
  label: string
  description: string

  functions: readonly [BuildingFunctionFamily, BuildingFunctionFamily?]

  manifestationOf?: BuildingArchetype

  searchTerms?: readonly string[]
  specializationTerms?: readonly string[]

  formNote?: string
}
```

Do not necessarily use tuple typing if another project convention is cleaner.

## Registry curation rules

For every archetype:

- choose one or two identity-bearing functions
- put additional tertiary behavior in the description, not a third function
- determine whether it is a manifestation of another archetype
- add useful discovery terms
- add only meaningful specialization suggestions
- do not encode ownership/affiliation
- do not encode hierarchy
- do not encode condition
- do not encode arbitrary architectural form as building function

Use the discovery decision rule for three-function cases:

> Select the two identity-bearing families; describe the third.

## File decomposition

Do not allow the comprehensive registry to become an unmaintainable 2,000-line file.

If the registry grows materially large, split it into thematic source files while retaining one public SSOT projection.

For example:

```text
building/archetypes/
  domestic.ts
  commerce.ts
  civic.ts
  religious.ts
  military.ts
  production.ts
  agriculture.ts
  knowledge.ts
  health.ts
  leisure.ts
  transport.ts
  funerary.ts
  fantasy.ts
  index.ts
```

These files are organizational only.

They must compose into one canonical:

```ts
BUILDING_ARCHETYPE_DEFINITIONS
```

with integrity tests guaranteeing:

- no duplicate ids across files
- every archetype is exported
- no orphan manifestations
- all function ids valid

Do not let thematic file placement become semantic parentage.

For example, placing `caravanserai` in `transport.ts` must not imply its function family is "transport."

---

# Phase 7 — Search terms and aliases expansion

After archetypes are comprehensive, deliberately curate discovery metadata.

Do not try to author perfect search terms while initially defining every archetype.

Run this as its own pass.

For each archetype consider:

```text
common synonyms
historical terms
fantasy/common-RPG wording
things an author would search for
services strongly associated with it
manifestation/root terms
common spelling variants
```

Potential distinction:

```ts
aliases?: readonly string[];
searchTerms?: readonly string[];
```

Where:

```text
aliases
→ alternative names for essentially the same concept

searchTerms
→ broader discovery vocabulary
```

Example:

```ts
warehouse: {
  aliases: ['storehouse'],
  searchTerms: ['storage', 'goods', 'cargo', 'logistics'],
}
```

Do not use aliases for concepts that deserve distinct archetype identity.

Test search quality using realistic queries from the discovery corpus.

---

# Phase 8 — Specialization vocabulary

Treat specialization as the final vocabulary layer, after archetype boundaries are known.

Its role is:

> Refine an archetype without creating another canonical archetype where the distinction does not deserve first-class identity.

Examples to evaluate:

```text
Inn
→ coaching inn
→ roadside inn

Palace
→ summer palace
→ winter palace

Warehouse
→ bonded warehouse

Temple
→ sea temple
→ funerary temple
```

Do not automatically convert every historical/cultural variant into specialization.

Use:

```text
manifestationOf
```

when the variant has meaningful cultural/historical identity worth preserving as an archetype.

Use:

```text
specialization
```

when it is simply a narrower instance-level refinement.

## Curated specialization terms

If specialization suggestions become substantial, organize them by archetype.

Conceptually:

```ts
export const BUILDING_SPECIALIZATION_TERMS = {
  inn: ['coaching_inn', 'roadside_inn'],

  palace: ['summer_palace', 'winter_palace'],
} as const
```

Prefer registry ownership rather than a completely separate manually synchronized mapping if practical:

```ts
inn: {
  ...
  specializationTerms: [
    'coaching_inn',
    'roadside_inn',
  ],
}
```

If specialization vocab becomes very large, extract it into multiple files while composing it back into the archetype registry.

Do not duplicate specialization ownership.

---

# Phase 9 — Search/filter surfaces

Once comprehensive vocab exists, expose Model E semantics beyond the authoring picker.

Evaluate filters such as:

```text
Archetype
Function
```

Example:

```text
Function: Lodging
```

may surface:

```text
Inn
Caravanserai
Ryokan
Hospice
Coaching Inn
```

based on effective function semantics.

Keep these distinct:

```text
Search
→ broad discovery; labels + aliases + functions + search terms

Archetype filter
→ exact canonical identity

Function filter
→ semantic cross-archetype grouping
```

If `functionOverride` exists, define whether function filtering uses:

```ts
getEffectiveBuildingFunctions(classification)
```

Recommended: yes.

The override should affect semantic function queries for that particular instance while leaving its archetype identity unchanged.

---

# UX summary

The normal building authoring experience should remain:

```text
Structure type
[ Building ]

Archetype
[ Search... ]

Typical uses
<read-only registry projection>

Specialization                    Optional
[ ... ]

Advanced classification           ▾
```

Expanded exceptional state:

```text
Advanced classification

Function override                 Optional
[ Use archetype defaults ▾ ]

Default functions
<read-only>
```

Rules:

- Archetype is the primary authored classification.
- Function is normally read-only.
- Function override is exceptional and visually secondary.
- Specialization is optional refinement.
- Manifestation is registry metadata.
- Search terms are invisible semantic discovery metadata.
- Organization ownership/affiliation is separate.
- Child locations model spatially distinct facilities.

---

# Tests and drift prevention

Add focused tests around Model E's new SSOT.

At minimum:

## Registry integrity

- unique archetype ids
- valid function ids
- function count within allowed cap
- valid manifestation targets
- no manifestation cycles
- no self-manifestation
- normalized/deduplicated aliases/search terms
- valid specialization ownership

## Schema

- archetype-only building
- optional specialization
- optional function override
- invalid archetype rejected
- invalid function rejected
- building classification rejected on non-building branches
- stale old `buildingType` / `buildingSubtype` rejected

## Dashboard

- archetype field only appears for buildings
- selecting archetype updates read-only Typical uses
- search matches archetype labels
- search matches aliases/search terms/functions as designed
- specialization suggestions follow selected archetype
- changing archetype clears specialization only when incompatible
- changing away from `structureType: building` clears building classification
- function override remains collapsed by default

## Search

Build a small golden query suite:

```text
lodging
horses
books
weapons
worship
merchant
storage
```

Assert representative expected archetypes appear.

Do not tightly snapshot complete ranking if that makes search evolution brittle; test critical inclusions and precedence rules.

---

# Documentation

Update the location taxonomy documentation to explain Model E in plain language:

```text
Archetype = what the building is.
Functions = what that archetype normally does.
Specialization = optional narrower refinement.
Function override = rare instance deviation.
Search terms = discovery metadata only.
```

Include worked examples:

- thieves' guild in a guildhall
- thieves' guild in a warehouse
- coaching inn with child stable
- caravanserai as manifestation of inn
- temple with healthcare override
- wizard tower as a blended archetype

Keep the completed Building Taxonomy Discovery document as the decision evidence rather than copying its entire corpus into implementation docs.

---

# Sequencing guard

Do not attempt to do the comprehensive vocabulary expansion in the same PR as the foundational schema/UI migration.

Recommended delivery:

```text
PR / Phase 1
Contracts Model E foundation

PR / Phase 2
API persistence + fixtures

PR / Phase 3
Dashboard fields + basic archetype picker

PR / Phase 4
Search/discovery plumbing

PR / Phase 5
Function-family vocabulary

PR / Phase 6
Comprehensive archetype registry

PR / Phase 7
Aliases + search-term curation

PR / Phase 8
Specialization-term curation

PR / Phase 9
Filters/search polish + docs
```

The important sequencing principle is:

> Prove the Model E machinery with a small registry before filling it with comprehensive content.

Do not let vocabulary scale obscure architectural problems.

Conversely, once the machinery is stable, treat comprehensive archetype/function/search/specialization curation as deliberate content work with its own reviews and integrity tests rather than incidental additions to application code.

Prompt with any clarifying questions
