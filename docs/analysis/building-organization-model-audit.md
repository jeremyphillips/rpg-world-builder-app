# Building archetypes against a Building ↔ Organization model

**Audit date:** 2026-08-12  
**Scope:** Non-destructive architectural audit; no schema or data changes

## Executive summary

The proposed Building ↔ Organization split is directionally correct, but the corpus supports a
broader decomposition than “archetype moves to business type.”

`BuildingArchetype` is currently a facility/use taxonomy with some physical forms, business
establishments, institutions, and cultural manifestations mixed in. Organization already owns
location relationships cleanly, but its subtype taxonomy also mixes organizational form with
activity. A future model should separate:

```text
Building
├── physical form
├── facility identity / configured use
├── broad functional families
├── manifestation / specialization
└── relationships to occupants/operators

Organization
├── primary domain
├── organizational form
├── activities / industries / services
└── relationships to locations
```

## Report A — Corpus classification

The current corpus contains **143 archetypes**, not 200+.

| Classification                           |   Count | Distribution |
| ---------------------------------------- | ------: | -----------: |
| Structural form                          |       8 |         5.6% |
| Facility / purpose                       |      53 |        37.1% |
| Commercial establishment                 |      10 |         7.0% |
| Institutional establishment              |       2 |         1.4% |
| Hybrid / ambiguous                       |      31 |        21.7% |
| Manifestation / specialization candidate |      38 |        26.6% |
| Needs review                             |       1 |         0.7% |
| **Total**                                | **143** |     **100%** |

“Manifestation / specialization” includes all 33 explicit `manifestationOf` entries and five
additional likely hierarchy cleanups. Hybrid entries are deliberately not forced into one owner.

| Archetype            | Current functions             | Classification                 | Possible future owner                      | Notes                                             |
| -------------------- | ----------------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------------- |
| academy              | knowledge                     | Hybrid / ambiguous             | Dual vocabularies/design decision          | Facility and academic institution                 |
| adventurers_guild    | assembly, governance          | Institutional establishment    | Organization kind/subtype                  | Names the actor, not a physical hall              |
| almshouse            | care                          | Facility / purpose             | Building facility/use                      |                                                   |
| apartment_building   | dwelling                      | Structural form                | Building form                              |                                                   |
| apothecary           | retail, care                  | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| archive              | knowledge                     | Facility / purpose             | Building facility/use                      |                                                   |
| arena                | spectacle                     | Facility / purpose             | Building facility/use                      |                                                   |
| armory               | storage, defense_watch        | Facility / purpose             | Building facility/use                      |                                                   |
| arsenal              | storage, defense_watch        | Hybrid / ambiguous             | Dual vocabularies/design decision          | Facility, stockpile, or institution               |
| asylum               | care                          | Facility / purpose             | Building facility/use                      |                                                   |
| auction_house        | retail, assembly              | Commercial establishment       | Organization activity/business             | Premises may remain a facility concept            |
| audience_hall        | assembly, governance          | Facility / purpose             | Building facility/use                      |                                                   |
| bank                 | finance                       | Hybrid / ambiguous             | Building facility + organization activity  | Already an Organization subtype                   |
| barn                 | service, storage              | Facility / purpose             | Building facility/use                      |                                                   |
| barracks             | defense_watch, dwelling       | Facility / purpose             | Building facility/use                      |                                                   |
| barber_surgeon       | care, service                 | Commercial establishment       | Organization activity/business             | Profession/operator noun                          |
| basilica             | worship, assembly             | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| bathhouse            | care                          | Facility / purpose             | Building facility/use                      |                                                   |
| beacon_tower         | defense_watch                 | Facility / purpose             | Building facility/use                      | Tower form plus signaling facility                |
| bell_tower           | defense_watch                 | Facility / purpose             | Building facility/use                      |                                                   |
| blacksmith           | service                       | Commercial establishment       | Organization activity/business             | Profession/operator noun                          |
| blockhouse           | service                       | Structural form                | Building form                              | Function metadata appears questionable            |
| boathouse            | storage                       | Facility / purpose             | Building facility/use                      |                                                   |
| boarding_house       | lodging                       | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| brewery              | production                    | Hybrid / ambiguous             | Building facility + organization activity  | Clear legitimate dual concept                     |
| brickworks           | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| broch                | dwelling, defense_watch       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| brothel              | service                       | Commercial establishment       | Organization activity/business             | Premises may remain a facility concept            |
| caravanserai         | lodging, retail               | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of inn                     |
| charnel_house        | funerary                      | Facility / purpose             | Building facility/use                      |                                                   |
| checkpoint           | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| clock_tower          | defense_watch                 | Facility / purpose             | Building facility/use                      |                                                   |
| coaching_inn         | lodging, transport_support    | Manifestation / specialization | Building lower taxonomy                    | Likely inn specialization                         |
| coffeehouse          | service                       | Commercial establishment       | Organization activity/business             | Premises may remain a facility concept            |
| command_post         | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| cooperage            | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| courthouse           | governance                    | Facility / purpose             | Building facility/use                      |                                                   |
| crannog              | defense_watch, dwelling       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| crematorium          | service                       | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| customs_house        | governance, retail            | Facility / purpose             | Building facility/use                      |                                                   |
| distillery           | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| domus                | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| drum_tower           | defense_watch                 | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of watchtower              |
| embassy              | service                       | Institutional establishment    | Organization kind/subtype                  | Diplomatic mission and premises are separable     |
| exchange             | finance, assembly             | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| factory              | production                    | Facility / purpose             | Building facility/use                      | Operator’s industry remains separate              |
| festhall             | food_drink_social             | Facility / purpose             | Building facility/use                      |                                                   |
| folly                | spectacle                     | Structural form                | Building form                              |                                                   |
| gambling_hall        | service                       | Commercial establishment       | Organization activity/business             | Premises may remain a facility concept            |
| gatehouse            | defense_watch                 | Structural form                | Building form                              |                                                   |
| gladiator_school     | spectacle, lodging            | Facility / purpose             | Building facility/use                      | Could also imply an institution                   |
| glassworks           | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| godown               | storage                       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of warehouse               |
| granary              | storage                       | Facility / purpose             | Building facility/use                      |                                                   |
| granary_on_stilts    | storage                       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of warehouse               |
| greenhouse           | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| guard_post           | defense_watch                 | Facility / purpose             | Building facility/use                      |                                                   |
| guildhall            | assembly, governance          | Facility / purpose             | Building facility/use                      | Correctly distinct from the guild                 |
| hammam               | care                          | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of bathhouse               |
| harbourmaster_office | governance, transport_support | Facility / purpose             | Building facility/use                      |                                                   |
| healers_house        | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Mixes house form with healer identity             |
| hermitage            | dwelling, worship             | Facility / purpose             | Building facility/use                      |                                                   |
| hof                  | food_drink_social, worship    | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| hospice              | lodging, care                 | Facility / purpose             | Building facility/use                      |                                                   |
| hospital             | care                          | Hybrid / ambiguous             | Building facility + institution            |                                                   |
| house                | dwelling                      | Structural form                | Building form                              |                                                   |
| houseboat            | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| hunting_lodge        | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Likely house/lodge refinement                     |
| igloo                | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| inn                  | lodging, food_drink_social    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| insula               | dwelling, retail              | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of apartment building      |
| keep                 | dwelling                      | Structural form                | Building form                              | Function metadata understates defense             |
| kiva                 | worship                       | Facility / purpose             | Building facility/use                      |                                                   |
| lazaretto            | care                          | Facility / purpose             | Building facility/use                      |                                                   |
| library              | knowledge                     | Hybrid / ambiguous             | Building facility + institution            | Already an Organization subtype                   |
| lighthouse           | defense_watch, dwelling       | Facility / purpose             | Building facility/use                      |                                                   |
| longhouse            | dwelling, assembly            | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| machiya              | dwelling, retail              | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| madrasa              | knowledge, worship            | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of academy                 |
| manor                | dwelling, governance          | Hybrid / ambiguous             | Building form/facility                     | Mixes form, status, residence, and authority      |
| market               | retail                        | Hybrid / ambiguous             | Building facility + organization activity  | Also may be an open site, not a building          |
| martello_tower       | service                       | Manifestation / specialization | Building lower taxonomy                    | Likely tower manifestation                        |
| mastaba              | funerary                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of mausoleum               |
| mausoleum            | funerary                      | Facility / purpose             | Building facility/use                      |                                                   |
| meeting_hall         | assembly                      | Facility / purpose             | Building facility/use                      |                                                   |
| memorial_hall        | funerary, assembly            | Facility / purpose             | Building facility/use                      |                                                   |
| menagerie            | spectacle, service            | Facility / purpose             | Building facility/use                      |                                                   |
| mill                 | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| mint                 | finance, production           | Hybrid / ambiguous             | Building facility + institution/activity   |                                                   |
| monastery            | cloistered_community          | Hybrid / ambiguous             | Building facility + religious organization |                                                   |
| moot_hall            | assembly, governance          | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of town hall               |
| mortuary             | service                       | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| mosque               | worship, assembly             | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| museum               | spectacle                     | Hybrid / ambiguous             | Building facility + institution            |                                                   |
| nuraghe              | defense_watch, dwelling       | Needs review                   | Unresolved                                 | Registry itself marks its function contested      |
| observatory          | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| opium_den            | service                       | Commercial establishment       | Organization activity/business             | Premises may remain a facility concept            |
| orphanage            | care                          | Hybrid / ambiguous             | Building facility + institution            |                                                   |
| pagoda               | worship                       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| palace               | dwelling, governance          | Hybrid / ambiguous             | Building form/facility                     | Mixes physical identity, residence, and authority |
| paladin_chapterhouse | defense_watch, worship        | Facility / purpose             | Building facility/use                      | Operator affiliation is embedded in the label     |
| poorhouse            | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| post_house           | transport_support             | Facility / purpose             | Building facility/use                      |                                                   |
| printing_press       | production                    | Commercial establishment       | Organization activity/business             | Names equipment/activity more than form           |
| prison               | governance                    | Facility / purpose             | Building facility/use                      |                                                   |
| records_hall         | governance, knowledge         | Facility / purpose             | Building facility/use                      |                                                   |
| ribat                | defense_watch, worship        | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of monastery               |
| roundhouse           | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| ryokan               | lodging, care                 | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of inn                     |
| salt_works           | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| schoolhouse          | knowledge                     | Facility / purpose             | Building facility/use                      |                                                   |
| shipyard             | production, transport_support | Hybrid / ambiguous             | Building facility + organization activity  | May be a multi-structure site                     |
| shop                 | retail                        | Commercial establishment       | Organization activity/business             | Also a valid generic retail facility              |
| siheyuan             | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| slaughterhouse       | production                    | Facility / purpose             | Building facility/use                      |                                                   |
| smokehouse           | production, storage           | Facility / purpose             | Building facility/use                      |                                                   |
| stable               | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| stave_church         | worship                       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| sweat_lodge          | worship                       | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of bathhouse               |
| synagogue            | worship, knowledge            | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of temple                  |
| tannery              | production                    | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| tavern               | food_drink_social             | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| teahouse             | food_drink_social             | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of tavern                  |
| temple               | worship                       | Hybrid / ambiguous             | Building facility + religious organization | Already an Organization subtype                   |
| tenement             | dwelling                      | Structural form                | Building form                              |                                                   |
| theater              | spectacle                     | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| tholos               | funerary                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of mausoleum               |
| tipi                 | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |
| tolbooth             | governance                    | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of courthouse              |
| tower                | service                       | Structural form                | Building form                              | Current default function is necessarily weak      |
| town_hall            | governance, assembly          | Facility / purpose             | Building facility/use                      |                                                   |
| trading_factory      | retail, dwelling              | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of warehouse               |
| trading_post         | retail, lodging               | Hybrid / ambiguous             | Building facility + organization activity  |                                                   |
| training_hall        | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| treasury             | governance                    | Facility / purpose             | Building facility/use                      |                                                   |
| warehouse            | storage                       | Facility / purpose             | Building facility/use                      |                                                   |
| washhouse            | care, service                 | Facility / purpose             | Building facility/use                      |                                                   |
| watchtower           | defense_watch                 | Facility / purpose             | Building facility/use                      |                                                   |
| waystation           | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| weigh_house          | service                       | Facility / purpose             | Building facility/use                      |                                                   |
| wheelwright          | service                       | Commercial establishment       | Organization activity/business             | Profession/operator noun                          |
| wizard_tower         | dwelling, knowledge           | Manifestation / specialization | Building lower taxonomy                    | Mixes tower form with occupant identity           |
| yurt                 | dwelling                      | Manifestation / specialization | Building lower taxonomy                    | Explicit manifestation of house                   |

## Report B — Building modeling findings

1. **It is not primarily structural.** Only 8 entries, 5.6%, primarily answer “what physical
   form is this?” The registry nevertheless declares archetype to be canonical structural identity
   in `packages/contracts/src/rpg/vocab/location/building-archetype.ts`.
2. **It is primarily facility/use-oriented.** At least 53 entries directly describe configured
   purpose, and most hybrid and manifestation entries also derive identity from use. The corpus
   descriptions repeatedly use “primarily serving…”.
3. **Strict actor/establishment leakage is modest but important.** Twelve entries, 8.4%, primarily
   name businesses or institutions. Another 31, 21.7%, are valid dual concepts or unresolved
   mixtures. The problem is semantic ownership, not simply corpus size.
4. **The existing `functions` field is useful but not a facility identity axis.** It is
   registry-derived, limited to one or two broad families, and `functionOverride` replaces the
   defaults with one family. It cannot distinguish `brewery`, `mill`, and `factory`, all of which
   may resolve to `production`.
5. **There is no independent building-form axis.** Existing `structureType` distinguishes
   `building`, `fortification`, `infrastructure`, `monument`, and `vessel`; it does not distinguish
   house, hall, tower, workshop, or warehouse. Its own definition also mixes “built form or
   primary role.”
6. **Archetype is canonical persisted identity, but not a rules engine.** It is a Zod/Mongoose
   enum, exact overview filter, display identity, search source, and function derivation source. No
   hierarchy, relationship eligibility, permission, or lifecycle rule branches on a particular
   archetype. Relationship eligibility stops at `structureType = building`.
7. **Registry metadata is tightly coupled internally.** Archetype changes clear specialization
   and function override; `manifestationOf` affects inherited discovery; specialization suggestions
   are archetype-owned; aliases/search terms affect picker ranking and overview search; exact
   archetype and effective function are separate filters. This is meaningful taxonomy coupling, not
   merely picker UX.
8. **Additional missing axes:** physical form, facility identity, actual versus typical use,
   mixed-use configuration, operator activity/industry, offered services, institution type,
   cultural manifestation, occupant role, and possibly explicit known-vacant versus unknown
   occupancy.

The strongest split evidence is provided by:

- `tower` versus `wizard_tower`;
- `house` versus `healers_house`;
- `warehouse` versus `trading_factory`;
- `factory` versus `brewery`, `mill`, `tannery`, and `glassworks`;
- `guildhall` versus `adventurers_guild`;
- `temple`, `academy`, `library`, and `bank` appearing naturally as both places and institutions.

## Report C — Organization fit

Organization currently owns only identity, kind, optional subtype, and location connections; there
is no kind-specific profile/config object.

The subtype vocabulary says it represents organizational form, but the values are inconsistent
with that promise:

- Mostly form: `company`, `cooperative`, `council`, `association`, `order`.
- Institution/activity: `bank`, `school`, `academy`, `library`, `temple`.
- Operational composition: `army`, `guard`, `pirate_crew`.
- Activity/network: `smuggling_ring`, `thieves_guild`.

Consequences:

- `commercial + company + blacksmith` is conceptually cleaner than adding `blacksmith` beside
  `company`.
- It does **not** yet fit an established Organization profile pattern; that pattern does not exist.
- Adding only `businessType` would solve the commercial case while leaving the same form/activity
  conflation in academic, religious, criminal, and military organizations.
- The better conceptual extension is an activity/industry axis distinct from organizational form,
  potentially kind-scoped where genuinely necessary.
- Services such as weapon forging and armor repair are a further, narrower axis and should not be
  inflated into subtypes.
- The activity registry must be contract-owned and projected outward. A second manually maintained
  list in API/dashboard would violate the project’s contracts-first SSOT.

## Report D — Relationship fit

The existing relationship architecture already supports most of the proposed model.

| Required meaning             | Existing kind          | Fit                                                    |
| ---------------------------- | ---------------------- | ------------------------------------------------------ |
| Owns                         | `owns`                 | Exact                                                  |
| Occupies                     | `tenant`               | Partial: implies tenancy/lease, not neutral occupancy  |
| Operates                     | `operator`             | Exact and best match for a business running a building |
| Headquartered at             | `headquarters`         | Exact; maximum one per organization                    |
| Geographic presence          | `operates_in`          | Not appropriate for a specific building                |
| Private residence            | Character `resides_at` | Character-owned path, not Organization                 |
| Neutral non-tenant occupancy | None                   | Semantic gap                                           |

Cardinality findings:

- One organization can own, tenant, or operate multiple buildings.
- Multiple organizations can own, tenant, operate, or have headquarters at one building.
- One organization can have only one headquarters.
- An organization may carry more than one site role at the same building, such as owner plus
  operator.

Ownership is clear:

```text
Organization document
└── connections.locations[]
    ├── locationId
    └── kind

Location detail
└── inverse projection only
```

Both directions are authorable, but location-side editing still mutates the organization-owned
record. This avoids parallel ownership.

Lifecycle behavior is also sound:

- Removing/deleting an organization removes its embedded location edges while leaving buildings
  intact.
- A referenced building cannot be deleted silently; organization references are registered as
  location deletion blockers.
- Changing operators does not require changing building identity.
- No embedded `partyAssociations`, occupant, operator, ownership, or headquarters fields compete
  with this relationship path in the current Building or Organization schemas.

## Report E — Candidate migration groups

These are investigation groups, not migration instructions.

### Strong Building-owned concepts

- Forms: `apartment_building`, `blockhouse`, `folly`, `gatehouse`, `house`, `keep`, `tenement`,
  `tower`.
- Clear facilities: `archive`, `arena`, `armory`, `barn`, `barracks`, `bathhouse`, `boathouse`,
  `courthouse`, `factory`, `granary`, `greenhouse`, `guildhall`, `hospital`, `lighthouse`,
  `mausoleum`, `prison`, `schoolhouse`, `stable`, `town_hall`, `warehouse`, `watchtower`.
- Most remaining Report A facility entries are also Building-owned, although some need better form
  metadata.

### Strong Organization/activity candidates

- `blacksmith`
- `barber_surgeon`
- `wheelwright`
- `adventurers_guild`
- `embassy`

These most clearly fail the persistence test. The current Building term should generally become a
physical premises or facility classification, with the named activity/institution modeled
separately.

### Likely dual concepts

- `academy`, `apothecary`, `arsenal`, `bank`, `brewery`, `brickworks`
- `cooperage`, `crematorium`, `distillery`, `exchange`, `glassworks`
- `hospital`, `inn`, `library`, `market`, `mill`, `mint`, `monastery`
- `mortuary`, `museum`, `orphanage`, `salt_works`, `shipyard`, `tannery`
- `tavern`, `temple`, `theater`, `trading_post`
- Potentially `auction_house`, `brothel`, `coffeehouse`, `gambling_hall`, `opium_den`, and `shop`

The same label can legitimately exist in a Building facility vocabulary and an Organization
activity/institution vocabulary without sharing ownership.

### Likely manifestation/specialization cleanup

- All 33 existing `manifestationOf` entries should remain in the Building taxonomy unless their
  roots change.
- Additional candidates: `coaching_inn → inn`, `martello_tower → tower`,
  `hunting_lodge → house/lodge`, and possibly `wizard_tower → tower`.
- `healers_house` should likely decompose into house form plus care facility or healer operator
  rather than remain a standalone peer archetype.
- `paladin_chapterhouse` similarly embeds affiliation into a facility label.

### Needs design decision

- `nuraghe`, whose registry description explicitly marks its function as contested.
- `manor` and `palace`, which combine form, status, residence, and governance.
- Whether `market` and `shipyard` are buildings or multi-structure sites.
- Whether `inn`, `tavern`, and similar hospitality terms are facility identities, commercial
  activities, or both.
- Whether known vacancy must be persisted. Absence of relationships currently means “no modeled
  occupant,” not necessarily “confirmed vacant.”

## Report F — Representative pilot

A later proof of concept should use these eight cases:

| Pilot          | Architectural question                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `blacksmith`   | Can a profession/activity leave Building while preserving a usable physical premises classification? |
| `shop`         | Can a generic retail facility coexist with a specific commercial activity?                           |
| `brewery`      | Can the same word exist independently as production facility and business activity?                  |
| `academy`      | Can facility identity be separated from an academic institution without abusing subtype?             |
| `inn`          | Can hospitality facility, operator, lodging function, and food/drink function remain distinct?       |
| `temple`       | Can a worship facility coexist with a religious organization currently also called `temple`?         |
| `house`        | Structural control case with no Organization required                                                |
| `wizard_tower` | Difficult case combining form, use, and occupant identity                                            |

## Authoring-flow assessment

A unified authoring experience is feasible, but not atomically supported today.

The existing APIs create Location, Organization, and relationship records separately.
Relationship creation requires both records to exist and then updates the Organization document.
There is precedent for a composite dashboard flow, but settlement-plus-district creation performs
sequential client-side writes and reports partial failure rather than providing one transaction.

Therefore:

- One apparent UI save is achievable with current primitives.
- An all-or-nothing save would require an orchestration boundary, transaction, or deliberate
  compensation policy.
- The relationship must continue to be created through the canonical Organization-owned edge path.
- Occupancy should remain an authoring concept projected onto relationships.
- A scalar `building.occupancyType` would conflict with multiple organizations, multiple
  relationship roles, private character residence, and mixed-use buildings.
- “Vacant” can be transient form intent unless the product needs to distinguish confirmed vacancy
  from unknown/unmodeled occupancy.

## Codebase questions resolved

1. **Archetype/function/structure distinction?** Yes, but only partially: `structureType` is broad,
   archetype conflates form and facility, and functions are derived broad-use tags.
2. **Rules beyond presentation/search?** Closed-schema persistence, manifestation integrity,
   function derivation, specialization/override synchronization, and exact filtering; no
   archetype-specific domain rules were found.
3. **Existing kind-specific Organization profile pattern?** No.
4. **Are subtypes consistently organizational form?** No; they already mix form, institution,
   composition, and activity.
5. **Best relationship for a business operating there?** `operator`.
6. **Many-to-many supported?** Yes, except the intentional one-headquarters-per-organization limit.
7. **Conflicting occupancy/ownership paths?** None found in Location or Organization schemas.
8. **Inline Organization creation fit?** UI composition fits; atomic persistence would require new
   orchestration.
9. **Strongest split evidence?** `tower/wizard_tower`, `house/healers_house`,
   `warehouse/trading_factory`, production facilities, and institution/place duplicates.
10. **Cleanest model?** Building → Organization separation is necessary but insufficient; form,
    facility, broad function, organizational form, and activity must be distinct conceptual axes.

## Recommendation

Retain Building as the physical-place aggregate, with separate concepts for physical form,
facility identity, broad use, and manifestation/specialization. Retain Organization as the actor,
but separate organizational form from activity/industry before expanding commercial taxonomy.
Keep ownership, tenancy, operation, and headquarters exclusively in the existing relationship
system.

The smallest sensible later pilot is `house`, `blacksmith`, `shop`, `brewery`, `academy`, `inn`,
`temple`, and `wizard_tower`.

## Semantic-boundary report

**Analysis date:** 2026-08-12  
**Status:** Conceptual model only; no schema, migration, API, UI, vocabulary, or relationship changes

This phase refines the audit's candidate axes into ownership boundaries. The central distinction is
not simply Building versus Organization. It is among intrinsic physical identity, durable facility
configuration, broad functional interpretation, actor classification, and current relationship or
operational state.

### A. Recommended conceptual axes

| Recommended axis               | Question answered                                                                                                | Owner                                                     | Cardinality                                                                         | Semantic nature and persistence                                                                                                             | Examples                                                                                              | Explicit exclusions                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Building form**              | What physical or architectural kind of building is this?                                                         | Building                                                  | Optional; zero or one primary form                                                  | Additional intrinsic precision; persist independently; normally changes only after substantial reconstruction                               | house, tower, hall, apartment building, keep                                                          | Operator, industry, services, broad use, current occupant; `warehouse` and `workshop` belong here only if the term is deliberately defined morphologically rather than by use              |
| **Facility type**              | What is this place durably designed, configured, or conventionally recognized to be?                             | Building                                                  | One primary by default; additional values only for genuine whole-building mixed use | Primary configured identity for ordinary authoring; persist independently; stable across operator changes but may change through conversion | brewery, inn, courthouse, barracks, archive, prison, hospital, stable, guildhall, warehouse, workshop | Organization identity, who operates it, narrow services, temporary activity, generic function such as production or storage; independently operated sub-premises                           |
| **Building function**          | What broad purposes does this place normally or currently serve?                                                 | Building                                                  | Multi-valued                                                                        | Default functions derive from facility types; an optional instance adjustment produces effective functions                                  | production, retail, dwelling, knowledge, governance, lodging, storage, worship                        | Specific facility identity, business industry, operator identity, architectural form, operational status                                                                                   |
| **Taxonomy manifestation**     | Is this vocabulary term a cultural, historical, or architectural realization of a broader term on the same axis? | Form or facility vocabulary registry                      | Zero or one parent per term; parent and child remain on the same axis               | Registry metadata, not instance-authored state; stable                                                                                      | `broch → house`, `caravanserai → inn`, `ryokan → inn`, `stave_church → temple`                        | Cross-axis decomposition, operator identity, arbitrary refinement, instance condition; `wizard_tower → tower` is invalid unless both are admitted to the form vocabulary                   |
| **Instance specialization**    | How is this particular instance narrowed without becoming a new canonical type?                                  | Building instance, scoped to a selected form or facility  | Optional and axis-scoped; potentially one or more short qualifiers                  | Persisted instance refinement; moderately stable                                                                                            | roadside inn, summer palace, bonded warehouse                                                         | Aliases, manifestations, conditions such as abandoned, affiliations, operator professions, restating the selected type                                                                     |
| **Organization domain**        | In what broad social or institutional domain does this organization primarily operate?                           | Organization                                              | Exactly one primary domain for a published organization                             | High-level identity; persisted and usually stable                                                                                           | commercial, government, religious, criminal, academic, military                                       | Constitutional form, specific activity, services, location role; current `kind` descriptions must stop mixing purpose with structure                                                       |
| **Organization form**          | How is this organization constituted or governed as a collective actor?                                          | Organization                                              | Zero or one principal form                                                          | Intrinsic organizational identity; persist independently; relatively stable                                                                 | company, cooperative, council, association, congregation, order, guild, chapter, crew                 | Banking, education, worship, healing, smuggling, facility names, location roles; a value passes only if it can host materially different activities                                        |
| **Organization activity**      | What sustained work, mission, trade, or practice does this organization perform?                                 | Organization                                              | One or more, with one primary activity when prioritization matters                  | Persisted actor classification; moderately stable and more extensible than form                                                             | blacksmithing, brewing, banking, shipping, education, healing, smuggling, mercenary work              | Concrete offerings, organizational constitution, premises, ownership or tenancy; “industry” should initially be derived grouping metadata on activities rather than a second authored axis |
| **Service offering**           | What concrete service or outcome can this organization presently provide?                                        | Organization                                              | Zero to many                                                                        | Optional capability/current offering; persisted only when useful to discovery or mechanics; less stable than activity                       | weapon forging, armor repair, tool repair, horseshoeing                                               | Primary identity, domain, form, broad activity, building facility; should not be mandatory for ordinary organizations                                                                      |
| **Location relationship role** | Why is this actor connected to this place?                                                                       | Organization-owned or character-owned relationship record | Multi-valued under existing relationship cardinality rules                          | Persisted current relational fact; changes independently of both entities' classifications                                                  | owns, tenant, operator, headquarters, resides_at, works_at                                            | Facility identity, activity, form, vacancy, or inferred ownership                                                                                                                          |

#### Physical form versus facility type

The admission test for **Building form** must be stricter than the original audit's provisional
structural bucket. A term qualifies as form only when its meaning is grounded primarily in shape,
construction, spatial arrangement, or architectural pattern. `Tower`, `hall`, and `apartment
building` can pass. `Warehouse` and `workshop` normally fail because storage and work configuration
define them more strongly than geometry. `House` is a legitimate dual-use word: it can denote an
architectural form, while **residence** is the clearer facility type.

This means most of today's `BuildingArchetype` is a candidate predecessor of **Facility type**, not
Building form. It should not be renamed wholesale, because actor terms, manifestations, and mixed
concepts still require decomposition.

**Form is optional; Facility type is the primary semantic classification for ordinary Building
authoring.** Authors should not be forced to invent architectural information merely to classify a
place. Both of these are valid and complete conceptual descriptions:

```text
Facility: Brewery       Form: —
Facility: Residence     Form: Tower
```

A Building has one primary facility identity by default. Additional facility identities are
appropriate only when the Building as a whole is conventionally understood as mixed-use.
Independently operated sub-premises should prefer child Locations once they need distinct
relationships, identity, or lifecycle. Spatial granularity—not unconstrained tagging—is the
mechanism for complex occupancy.

#### Default function versus current function

Default and effective function are conceptually distinct, but they use one function vocabulary:

```text
Facility type
     │
     └── derives default functions

Building instance
     │
     └── optional function adjustment
             │
             └── produces effective functions
```

- **Default functions** describe what a facility type normally supports and should remain derived
  registry metadata.
- **Effective functions** are always the resolved projection of defaults plus any authored instance
  adjustment; they remain conceptually distinct even when no adjustment exists.
- The existing `functionOverride` proves the need for deviation, but its scalar, replace-all
  behavior may be too restrictive for mixed use. The remaining product question is whether
  authoring an adjustment is valuable, not whether default and effective functions are separate.
- Vacancy, abandonment, closure, or operational readiness are not functions. If those facts need to
  be durable and queryable, they require an explicit state concept rather than a special function.

#### Manifestation versus specialization

Manifestation is not a third identity axis. It is a **same-axis registry relationship**:

- `broch → house` is a form manifestation.
- `caravanserai → inn` is a facility manifestation.
- `madrasa → academy` is a facility manifestation if both terms remain facility types.
- `basilica → temple` and `stave_church → temple` are facility manifestations, even though their
  architectural form may also be independently describable.

Specialization is instance-authored and does not create a new canonical identity. A single generic
`manifestationOf` graph spanning form and facility would create a parallel SSOT and permit invalid
links across semantic axes; each registry must own and validate its own hierarchy.

#### Activity versus industry

The first durable actor axis should be **Organization activity**, not separate activity and industry
fields. Activities answer the useful authoring question directly and can carry broader grouping
metadata such as industry or sector for search and reporting. For example, `blacksmithing` may group
under metalworking and `brewing` under beverage production without making authors select both.

Activities should be reusable across organization domains. Domain-specific suggestion and
eligibility rules may exist later, but separate per-kind vocabularies would duplicate terms and
drift. Multiple activities are necessary; a primary activity provides presentation and filtering
precedence without discarding secondary work.

#### Service offerings

Services are a subordinate optional layer, not another required identity taxonomy. A proposed term
belongs here when it is a concrete customer-facing outcome or capability narrower than the sustained
activity: `blacksmithing` is an activity; `armor repair` is a service. Controlled service vocabulary
should be introduced only where discovery, rules, or reuse justify it. Otherwise this axis is the
most likely to become an unbounded catch-all.

#### Institutional designation

The prototype should **not** introduce an `institutionType` axis. Institution/place terms should
first be tested compositionally:

```text
Temple organization
domain: religious
form: congregation | order | association
activity: worship | ministry | sacred-site stewardship

Academy organization
domain: academic
form: association | company | order
activity: education | training | research
```

Only evidence that users must distinguish academy versus university versus library independently of
both form and activity would justify another axis. Current subtype nouns are evidence of existing
conflation, not evidence that the future model must preserve an institutional designation.

### B. Boundary decision rules

Future vocabulary proposals should be evaluated in this order:

1. **Form rule:** If the term primarily denotes shape, construction, or spatial arrangement
   regardless of use, place it in Building form.
2. **Facility persistence rule:** If the operator disappears and the configured place is still
   conventionally called that term, consider Facility type.
3. **Configuration rule:** A facility term requires durable physical configuration or recognized
   place identity; an activity merely occurring inside a building is insufficient.
4. **Primary-facility rule:** Assign one primary Facility type by default. Add another only when the
   whole Building has a durable mixed-use identity, not merely because another activity occurs
   there.
5. **Spatial-granularity rule:** When a sub-premises needs its own operator, relationships, identity,
   or lifecycle, model it as a child Location rather than accumulating whole-Building facility tags.
6. **Optional-form rule:** Building form adds structural precision but is not required for ordinary
   Facility-first authoring.
7. **Replacement rule:** If another actor can take over without changing the place's identity, keep
   facility and operator/activity separate.
8. **Actor portability rule:** If the same actor can perform the work from a house, shack, shop,
   hall, or industrial building, place the work in Organization activity.
9. **Actor rule:** A profession, enterprise, institution, faction, crew, or operating body is not a
   Building type merely because it commonly occupies a dedicated premises.
10. **Form-host rule:** An Organization form is valid only if materially different activities can use
    it: a company can brew, bank, ship, or smith; `bank` therefore fails as form.
11. **Function breadth rule:** If a term groups many distinct facilities by broad purpose, it is a
    Building function, not a facility identity.
12. **Service granularity rule:** If the term describes a concrete offering beneath a sustained
    activity, place it in Service offering rather than form, subtype, or activity.
13. **Relationship rule:** Ownership, tenancy, operation, headquarters, residence, and presence
    always belong to relationship records, never entity classification.
14. **State rule:** Vacant, abandoned, closed, occupied, and temporarily repurposed describe current
    state. Do not encode them as form, facility, activity, or relationship type.
15. **Manifestation scope rule:** A manifestation may only point to a parent in the same vocabulary
    and must remain a recognizable canonical type, not an instance adjective.
16. **Specialization rule:** Use instance specialization when the qualifier is useful but not stable,
    reusable, or distinct enough for canonical vocabulary.
17. **Dual-concept rule:** The same display word may exist in two vocabularies when the questions are
    different, such as facility `brewery` and activity `brewing`. Shared spelling does not imply
    shared IDs or ownership.
18. **Single-claim SSOT rule:** Each semantic claim has one canonical owner. Derived labels, search
    terms, and filters must project from that owner rather than repeat mappings in consumer code.
19. **No inference rule:** A brewery facility does not prove that a brewing organization currently
    exists, and a brewing organization does not prove that every related building is a brewery.

### C. Pilot decomposition

The table uses illustrative values to test boundaries; it does not propose vocabulary entries.

| Concept        | Building form                                                       | Facility type                                                                 | Building function                                                                 | Organization domain/form                                 | Organization activity                                   | Relationship                                                                     | Fit notes                                                                                            |
| -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `house`        | house                                                               | None required; residence only when that durable facility identity is intended | none from form alone; dwelling derives from residence                             | None required                                            | None required                                           | Character `resides_at` or `owns`; Organization relationship only when applicable | Proves form can exist independently and residence is not synonymous with house                       |
| `blacksmith`   | shack, house, hall, or unspecified                                  | None required; smithy/workshop only when durably configured                   | none from activity alone; production/service derive from a facility or adjustment | commercial + company/cooperative/other form              | blacksmithing                                           | `operator`; possibly `tenant` or `owns` as additional facts                      | Proves activity can exist without a dedicated facility type                                          |
| `shop`         | house, hall, generic building, or unspecified                       | shop/retail premises                                                          | retail                                                                            | commercial + company/cooperative/other form              | retail/trade plus a more specific activity where useful | `operator`, optionally `tenant` or `owns`                                        | Fits both a generic facility and actor activity model; “shop” should not be Organization form        |
| `brewery`      | workshop, industrial building, warehouse conversion, or unspecified | brewery                                                                       | production                                                                        | commercial + company/cooperative/other form              | brewing                                                 | `operator`, optionally `tenant`, `owns`, or `headquarters`                       | Clean dual concept: facility `brewery`, activity `brewing`                                           |
| `academy`      | hall, campus building, house conversion, or unspecified             | academy                                                                       | knowledge, possibly assembly                                                      | academic + association/company/order as applicable       | education, training, research                           | `operator`, optionally `headquarters`, `tenant`, or `owns`                       | Organization is compositional; no institutional designation is assumed                               |
| `inn`          | house, hall, courtyard complex, or unspecified                      | inn                                                                           | lodging plus food/drink                                                           | commercial + company/cooperative/other form              | hospitality, food/drink service                         | `operator`, optionally `tenant`, `owns`, or `headquarters`                       | Clean facility/activity separation; mixed functions show why effective function must be multi-valued |
| `temple`       | hall, shrine form, tower, complex, or unspecified                   | temple                                                                        | worship, possibly assembly or knowledge                                           | religious + congregation/order/association as applicable | worship, ministry, sacred-site stewardship              | `operator`, optionally `headquarters`, `tenant`, or `owns`                       | Facility identity is clean; Organization remains compositional without `institutionType`             |
| `wizard_tower` | tower                                                               | residence and/or arcane study facility                                        | dwelling plus knowledge                                                           | None required; an arcane order is optional and separate  | Organization activity only if an organization exists    | Character `resides_at`, `owns`, or `operator`; Organization edge only if present | Decomposes cleanly; “wizard” is occupant identity, not form or facility type by itself               |

The axes handle all eight concepts without requiring a Building to embed an Organization. `Temple`
and `academy` should first use domain + form + activity composition. The prototype must not add an
institutional designation; it should instead collect evidence about whether those compositions fail
to preserve a distinction users actually need.

### Mixed-use and lifecycle stress tests

| Scenario                                                                 | Decomposition                                                                                                                                               | Result or pressure exposed                                                                                 |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Shack used as residence, smithy, or shrine                               | Same form `shack`; facility varies among residence, workshop/smithy, and shrine; functions derive accordingly                                               | Works. Demonstrates that form and facility cannot be aliases                                               |
| Brewery changes from Company A to Company B                              | Brewery facility and default production function remain; replace `operator` relationship                                                                    | Works with current relationship ownership; no Building reclassification required                           |
| Merchant company with shop, warehouse, and headquarters                  | One Organization with retail/trade activity; relationships to multiple Buildings; headquarters is a relationship role                                       | Works with current cardinality                                                                             |
| Guildhall with guild operator, tavern tenant, and merchant office tenant | Primary facility guildhall; independently operated tavern and office prefer child premises with their own organization edges                                | Works while preventing the whole Building from accumulating tenant-specific facility tags                  |
| House with ground-floor shop                                             | Form house; primary facility chosen from the whole-building identity; add a second facility only for durable mixed use, otherwise use a child shop premises | Proves additional facility values are exceptional and spatial granularity remains canonical                |
| Abandoned brewery                                                        | Facility brewery persists; default function remains production; no operator edge                                                                            | “Abandoned” or “inactive” requires explicit current state only if absence of an operator is not sufficient |
| Blacksmith operating from an unmodified shack                            | Form shack; no dedicated facility required; Organization activity blacksmithing; operator edge                                                              | Works and proves facility identity must not be inferred from activity                                      |
| Academy, temple, library, hospital, or bank                              | Same term may label a Building facility while Organization uses domain + form + activity                                                                    | Works compositionally for the prototype; a new institutional axis requires evidence of lost distinctions   |

The model does not break under operator replacement or many-to-many relationships. It does expose
two facts that classification alone cannot solve:

1. **Spatial granularity:** one primary Facility type is the default. Additional Facility types are
   reserved for genuine whole-building mixed use; separately operated premises prefer child
   Locations when they need their own relationships.
2. **Operational state:** absence of an operator means “no modeled operator,” not necessarily
   confirmed vacancy, abandonment, or closure.

Current interior eligibility allows Organization `tenant` but not `operator`, `owns`, or
`headquarters`. That is not a reason to add relationship kinds, but it matters if future authoring
expects precise organization-to-suite operation rather than whole-building relationships.

### D. Current-model mapping

| Current concept                        | Future responsibility                                                                                                    | Recommendation                                                             | Conflation or reusable infrastructure                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `structureType`                        | Outer Location structure family: building, fortification, infrastructure, monument, vessel                               | **Remain and narrow its documentation**; do not repurpose as Building form | Reusable discriminator and relationship-eligibility input; currently described as form or role, which overstates its precision                                          |
| `BuildingArchetype`                    | Source material for primary Facility type, optional Building form, Organization activity, and axis-scoped manifestations | **Split and eventually replace; Facility type is the main successor**      | Primary conflation point; most entries seed Facility type, a small subset seeds optional form, and actor terms seed activity                                            |
| Registry `functions`                   | Default broad Building functions derived from Facility type                                                              | **Remain derived; re-home under facility definitions**                     | Existing 18-value vocabulary and display/filter helpers are reusable; archetype ownership is obsolete                                                                   |
| `functionOverride`                     | Optional authored function adjustment used with defaults to produce effective functions                                  | **Replace or substantially narrow**                                        | Default and effective functions remain conceptually separate; only the value of authoring adjustments is unresolved, and scalar replace-all may conflict with mixed use |
| `specialization`                       | Axis-scoped instance refinement                                                                                          | **Split/scoped to form or facility**                                       | Free-text mechanism is reusable; current single archetype ownership is ambiguous                                                                                        |
| `manifestationOf`                      | Same-axis registry relationship                                                                                          | **Reuse as a pattern, but enforce axis locality**                          | Discovery inheritance and cycle validation are reusable; one cross-axis graph would be unsafe                                                                           |
| Organization `kind`                    | Organization domain                                                                                                      | **Remain but narrow semantically**                                         | Current values mostly fit; descriptions mix primary purpose and structure and should no longer license form-like additions                                              |
| Organization subtype                   | Organization form plus misplaced institution/activity values                                                             | **Split and eventually replace; do not pre-create institution type**       | Kind-scoped registry and member-title attachment are reusable patterns; bank, academy, library, school, and temple must first be tested as domain + form + activity     |
| Organization location connection kinds | Actor-to-place relationship role                                                                                         | **Remain unchanged**                                                       | `owns`, `tenant`, `operator`, and `headquarters` already provide the canonical path; neutral non-tenant occupancy remains a reported gap                                |
| Character location connection kinds    | Character-to-place relationship role                                                                                     | **Remain unchanged**                                                       | `resides_at`, `works_at`, `owns`, and `operator` prevent occupancy from leaking into Building classification                                                            |
| Archetype aliases/search terms         | Axis-owned discovery metadata                                                                                            | **Re-home with the term they describe**                                    | Projection helpers are reusable; copies must not be maintained across form, facility, and activity registries                                                           |

No compatibility layer is recommended by this semantic analysis. When implementation is authorized,
the repository's dev-only policy favors a direct clean shape and deliberate data/schema update rather
than dual reads or duplicated vocabulary ownership.

#### Vocabulary scale and sustainability

The ranges below are expected orders of magnitude, not target quotas.

| Axis                         |                         Expected scale | Change rate   | Sustainability rule                                                                           | Catch-all risk                                                                                         |
| ---------------------------- | -------------------------------------: | ------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Building form                |                    Small, roughly tens | Low           | Admit only morphology/construction terms                                                      | Medium if facility words such as workshop and warehouse are admitted casually                          |
| Facility type                |       Larger, potentially low hundreds | Moderate      | Require durable place identity; one primary by default, additional only for genuine mixed use | High; main successor to archetype, so admission tests, hierarchy, and spatial boundaries are essential |
| Building function            | Small, roughly the current 18 families | Low           | Broad grouping only; derive defaults from facility                                            | Low if consumers cannot mint local function maps                                                       |
| Form/facility manifestations | Dozens attached to parent vocabularies | Moderate      | Same-axis parent, valid root, cycle checks, inherited discovery                               | Medium if used for arbitrary variants or cross-axis decomposition                                      |
| Organization domain          |                  About the current ten | Low           | One broad social/institutional domain                                                         | Low if descriptions stop mixing domain and form                                                        |
| Organization form            |                    Small, roughly tens | Low           | Must support materially different activities                                                  | Medium if institution/activity nouns are admitted                                                      |
| Organization activity        |       Larger, potentially low hundreds | Moderate/high | Multi-valued, reusable across domains, broader groupings derived                              | High; needs granularity guidance to keep services out                                                  |
| Service offering             |        Potentially large or open-ended | High          | Optional; control only queryable/reused terms                                                 | Very high; should not become required canonical identity                                               |
| Relationship role            |        Current small closed vocabulary | Low           | Add only genuinely relational semantics with cardinality policy                               | Low under the existing registry architecture                                                           |

This hierarchy is sustainable if the two large axes—Facility type and Organization activity—have
strict admission tests and if default functions, industry groupings, labels, and search projections
remain derived. The principal parallel-SSOT risks are:

- persisting default function mappings both on facilities and Building instances;
- duplicating activity vocabularies per Organization domain;
- treating matching facility/activity labels as a shared semantic ID;
- allowing services to duplicate activities at arbitrary granularity;
- maintaining manifestation or search metadata outside the registry that owns the term.

The settled ownership model is:

```text
Location structureType
    broad structural family

Building form (optional)
    physical/architectural morphology

Facility type (one primary by default)
    durable place identity
        ↓
    default functions

Building function adjustment (optional)
        ↓
    effective functions

Organization domain
    broad actor domain

Organization form
    how the actor is constituted

Organization activity
    what the actor does

Service offering
    specific optional offering

Relationship
    why actor ↔ place are connected
```

Each semantic claim has exactly one canonical owner. Functions, groupings, labels, search metadata,
and other projections derive from that owner.

### E. Open design questions

Three unresolved questions materially affect a future schema or authoring projection:

1. **Mixed-use threshold and spatial granularity:** One primary Facility type is settled as the
   default, and separately operated premises prefer child Locations. The prototype must establish
   the threshold at which a second whole-Building Facility type is clearer than a child premises.
2. **Function-adjustment value and operational state:** Default and effective functions are settled
   as distinct concepts, with an optional adjustment between them. The remaining questions are
   whether adjustment is worth authoring and whether vacancy, abandonment, or closure needs a
   separate durable state rather than narrative description and relationship absence.
3. **Form vocabulary threshold:** Terms such as house, hall, keep, gatehouse, and apartment building
   mix morphology with conventional use to different degrees. The first form vocabulary must apply
   a consistent morphology threshold rather than simply inherit the audit's eight provisional
   entries.

Institutional designation is deliberately **not** an open schema axis for the prototype. Temple,
academy, library, hospital, and bank organizations must first use domain + form + activity. A later
institutional axis requires concrete evidence that a user-important distinction cannot be expressed
or projected from that composition.

### F. Recommended next step

The architecture is stable enough for a **small schema/projection prototype**, provided the
prototype is explicitly used to resolve the three design questions above and does not begin corpus
migration.

The smallest useful subset is:

- `house` — prove form can exist independently of Facility type and residence is not synonymous
  with house;
- `blacksmith` — prove activity can exist without a dedicated Facility type;
- `brewery` — prove Facility type and Organization activity can independently represent closely
  related concepts;
- `temple` — prove Facility identity remains clean while Organization classification stays
  compositional.

This four-concept subset validates every major ownership boundary without requiring the other 139
archetypes to move. The prototype should exercise projections from canonical sample data, including
derived default/effective functions and existing relationship records. It should use Facility-first
authoring with optional form, allow only deliberate mixed-use additions, and introduce no
`institutionType`. It should not preserve `BuildingArchetype` or Organization subtype through a
parallel compatibility path; migration design should begin only after the prototype resolves its
spatial-granularity and function-adjustment questions.

Architecturally, **Facility type** is the correct contract term. User-facing copy may later use a
friendlier label such as **Building type** if “facility” sounds overly institutional; that copy
decision does not change semantic ownership and is outside this pass.
