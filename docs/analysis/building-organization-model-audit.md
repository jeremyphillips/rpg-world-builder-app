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

## Phase 7c — Organization taxonomy and Location alignment audit

**Audit date:** 2026-08-12

**Scope:** Organization kind/subtype semantics, authoring presets, member-title suggestions, and
alignment with the Location model. This section recommends a target model; it does not authorize or
implement a schema change.

**Revision status:** Accepted and closed. The canonical domain/form/activity model, ephemeral preset
ownership, and compositional title-resolution policy are settled for the first direct refactor.

### Executive decision

Replace the current persisted `organizationKind + organizationSubtype` pair with exactly one
primary **Organization domain**, an optional reusable **Organization form**, and zero-to-many
**Organization activities**. Keep familiar compound identities as contract-owned, ephemeral
authoring presets by default. Do not persist an `authoringPresetId` merely to record how an
Organization was created.

The existing subtype registry is not suitable as a canonical axis. Its 45 entries mix forms
(`company`, `cooperative`, `council`), institutions (`academy`, `bank`, `church`), activities
(`advocacy_group`, `smuggling_ring`), constituencies (`clan`, `noble_bloc`), and domain-qualified
compositions (`thieves_guild`, `martial_order`). Its attached member-title metadata is valuable,
but that UX behavior does not prove that subtype belongs in persisted classification.

The current runtime makes this a broader change than renaming fields:

- 69 app/package source files reference `organizationKind`; 23 reference `organizationSubtype` outside
  generated JSON schemas.
- Contracts enforce kind/subtype compatibility on published, draft, create, and update shapes.
- The API repeats the enums in Mongo and validates the merged kind/subtype pair before writes.
- Dashboard forms dynamically project subtype options and clear stale subtype values when kind
  changes.
- Detail, overview, picker, filtering, and global-search projections expose kind or subtype.
- Character membership editors and priority stamping resolve five ordered title suggestions from
  the exact kind/subtype pair.

There is no evidence that Organization kind currently controls Location relationship eligibility.
Eligibility is owned by Location kind/`structureType`; Organization classification is display,
filtering, search, validation, and member-title input. That separation should remain.

### Domain test and ten-kind disposition

A domain answers **“in what primary institutional sphere does this actor operate?”** It must not
answer how the actor is constituted, name a premises, or merely identify its members. One domain is
required for a published Organization; cross-domain character is expressed through form and
multiple activities.

| Current kind | Disposition                | Recommended domain | Boundary                                                                                                                                                 |
| ------------ | -------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Government   | Keep and narrow            | `government`       | Exercises public governing, administrative, legislative, or judicial authority. Political influence without public authority is political.               |
| Political    | Keep and narrow            | `political`        | Organizes influence, representation, advocacy, or political change. Holding office does not automatically make every party or movement governmental.     |
| Religious    | Keep                       | `religious`        | Centers faith, worship, ministry, doctrine, or sacred stewardship. Armed or educational work remains activity.                                           |
| Military     | Keep                       | `military`         | Organized primarily for armed command, defense, or warfare. A sacred order may instead be religious with martial activity.                               |
| Criminal     | Keep                       | `criminal`         | Illicit enterprise is the actor's primary identity. An otherwise commercial or political actor does not change domain merely because it commits a crime. |
| Commercial   | Keep and narrow            | `commercial`       | Produces, trades, finances, or operates for economic exchange. Member-serving trade bodies belong in occupational.                                       |
| Professional | Rename and strictly narrow | `occupational`     | Serves, regulates, represents, or develops a trade, craft, profession, or labor community. It does not mean “does skilled work.”                         |
| Academic     | Keep for now; broaden copy | `academic`         | Centers education, research, scholarship, or knowledge stewardship. “Academic and knowledge” is clearer UI copy if libraries remain here.                |
| Community    | Keep and narrow            | `community`        | Organizes kinship, locality, mutual aid, civic participation, or social fellowship where no more specific institutional sphere dominates.                |
| Other        | Keep fallback              | `other`            | Used only when no established domain passes; it must not become a shelter for unmodeled form or activity.                                                |

#### Occupational verdict

`occupational` **narrowly passes** the domain test, but only with an admission rule. It is a valid
institutional sphere when the Organization exists to serve, regulate, represent, or develop an
occupational community. It is constituency leakage if it is assigned simply because members share
a job, and it is activity leakage if it means the Organization performs skilled work.

Examples establish the boundary:

- A blacksmithing company is `commercial + company + blacksmithing`, not occupational.
- A smiths' guild that certifies masters and trains apprentices is
  `occupational + guild + standards/training`.
- A merchants' union that bargains or advocates for members is
  `occupational + union + collective bargaining/advocacy`.
- A neighborhood craft club remains `community + fellowship/association + craft practice` when
  fellowship, not occupational governance, is primary.

This is materially better than the current **Guild or professional** label: `guild` moves to form,
and profession/trade/labor/craft distinctions move to activities or, if later needed for querying,
a separately justified constituency projection.

### Forty-five-subtype semantic disposition

Semantic and preset dispositions remain separate. **Preset only** means the familiar compound noun
has no single canonical counterpart after decomposition; it does not mean the concept disappears
from authoring. An atomic component such as `guild` or `crew` may still survive independently as a
reusable form.

| Current subtype          | Semantic disposition                               | Canonical composition or evidence needed                                                                                                       |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Monarchy                 | Preset only; authority evidence case               | government + council/administration or no form as applicable + rule/governance; a later authority axis needs a non-UX consumer                 |
| Council                  | Reusable form                                      | government + council + deliberation/governance                                                                                                 |
| Assembly                 | Reusable form                                      | government + assembly + legislation/deliberation                                                                                               |
| Administration           | Reusable form                                      | government + administration + administration/governance                                                                                        |
| Magistracy               | Preset only                                        | government + council/administration + adjudication/enforcement                                                                                 |
| Party                    | Reusable form                                      | political + party + campaigning/representation/governance                                                                                      |
| Movement                 | Reusable form                                      | political + movement + advocacy/mobilization                                                                                                   |
| Noble bloc               | Preset only; constituency-bearing composition      | political + network/association + aristocratic advocacy                                                                                        |
| Court faction            | Preset only; context-bearing composition           | political + network + influence/campaigning; “court” is context, not domain                                                                    |
| Advocacy group           | Preset only; activity-bearing composition          | political/community/occupational + association + advocacy                                                                                      |
| Church                   | Preset only; institution evidence case             | religious + congregation/association + worship/ministry                                                                                        |
| Cult                     | Preset only                                        | religious + congregation/order/network + worship/devotion; keep the loaded label out of atomic form                                            |
| Temple                   | Preset only; place/institution composition         | religious + congregation/order + worship/sacred-site stewardship; the premises independently uses Facility type `temple`                       |
| Holy order               | Preset only; form plus activities                  | religious + order + ministry/protection                                                                                                        |
| Monastic order           | Preset only; form plus activities/way of life      | religious + order + worship/study/stewardship                                                                                                  |
| Army                     | Preset only; institution evidence case             | military + warfare/defense; add provisional force only if it passes the form test                                                              |
| Guard                    | Preset only; activity-bearing composition          | military or government + guarding/policing; add provisional force only if it passes the form test                                              |
| Militia                  | Preset only; mobilization/constituency composition | military + local defense/mobilization; add provisional force only if it passes the form test                                                   |
| Mercenary company        | Preset only; form plus activity                    | military + company + mercenary warfare/security                                                                                                |
| Martial order            | Preset only; form plus activities                  | military or religious + order + warfare/protection                                                                                             |
| Syndicate                | Preset only; prefer network/association form       | criminal + network/association + coordinated illicit enterprise                                                                                |
| Gang                     | Preset only                                        | criminal + network/crew + activity such as extortion, theft, or territorial control                                                            |
| Thieves' guild           | Preset only; form plus activities                  | criminal + guild + theft/fencing                                                                                                               |
| Smuggling ring           | Preset only; form plus activity                    | criminal + network + smuggling                                                                                                                 |
| Pirate crew              | Preset only; form plus activity                    | criminal + crew + piracy                                                                                                                       |
| Company                  | Reusable form                                      | commercial + company + one or more actual activities                                                                                           |
| Merchant house           | Preset only; familiar identity plus activity       | commercial + optional form + trade/finance; do not admit `house` solely to preserve this noun                                                  |
| Trading consortium       | Preset only; form plus activity                    | commercial + network/association + trade coordination                                                                                          |
| Bank                     | Preset only; institution evidence case             | commercial + company/cooperative + banking/finance; do not add `institutionType` yet                                                           |
| Cooperative              | Reusable form                                      | commercial/community/occupational + cooperative + actual activities                                                                            |
| Craft guild              | Preset only; form plus activity/constituency       | occupational + guild + craft standards/training                                                                                                |
| Trade guild              | Preset only; form plus activity/constituency       | occupational + guild + trade coordination/standards                                                                                            |
| Professional association | Preset only; form plus activities                  | occupational + association + standards/advocacy/education                                                                                      |
| Labor association        | Preset only; form plus activities                  | occupational + union/association + collective bargaining/advocacy/mutual aid                                                                   |
| Fellowship               | Reusable form                                      | occupational/religious/academic/community + fellowship + actual activities                                                                     |
| School                   | Preset only; institution evidence case             | academic + association/administration as applicable + education                                                                                |
| College                  | Preset only; institution evidence case             | academic + association/administration as applicable + higher education/research                                                                |
| Academy                  | Preset only; institution evidence case             | academic + association/company/order as applicable + education/training/research                                                               |
| Library                  | Preset only; place/institution composition         | academic/community/government + association/administration + knowledge stewardship/access; premises independently uses a library Facility type |
| Learned society          | Preset only; form plus activities                  | academic + association/fellowship + research/knowledge exchange                                                                                |
| Clan                     | Preset only; constituency-bearing composition      | community + network or no form + kinship/mutual aid; kinship is not organizational form                                                        |
| Neighborhood association | Preset only; form plus activities/context          | community + association + local advocacy/stewardship                                                                                           |
| Mutual aid group         | Preset only; activity-bearing composition          | community/occupational + association/network + mutual aid                                                                                      |
| Civic association        | Preset only; form plus activities                  | community/political + association + civic participation/advocacy                                                                               |
| Social club              | Preset only; form plus activities                  | community + association/fellowship + social fellowship                                                                                         |

This decomposition does not establish a new institutional axis. Unresolved hard nouns first land in
canonical decomposition + preset, not in an institution bucket. School/college/academy,
church/temple, Army, and Bank are the strongest tests: only a later consumer that needs their
distinction independently of form, activities, premises, search aliases, presets, and title
suggestions would justify a new persisted axis.

### Reusable Organization form vocabulary

The recommended first vocabulary is intentionally small. A form qualifies when it can host
materially different domains or activities; it is not required to be equally common in every
domain.

| Form             | Reuse evidence                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `administration` | governmental bureaucracy, religious administration, commercial administration                                                                                         |
| `assembly`       | legislature, civic assembly, religious assembly                                                                                                                       |
| `association`    | political advocacy, professional standards, learned society, civic group                                                                                              |
| `company`        | commercial enterprise, mercenary company, criminal front                                                                                                              |
| `congregation`   | worship, ministry, education, mutual aid within a religious domain                                                                                                    |
| `cooperative`    | commercial production, occupational services, community mutual aid                                                                                                    |
| `council`        | government council, guild council, religious council, community council                                                                                               |
| `crew`           | pirate crew, shipping crew, military crew                                                                                                                             |
| `fellowship`     | occupational, religious, academic, and social fellowship                                                                                                              |
| `force`          | **Provisional:** army, guard, militia, enforcement, and private security reuse it, but Phase 7d must prove it describes constitution rather than operational grouping |
| `guild`          | craft/trade regulation, mutual aid, criminal coordination, learned practice                                                                                           |
| `movement`       | political, religious, and community mobilization                                                                                                                      |
| `network`        | syndicate, trade consortium, scholarly network, mutual-aid network                                                                                                    |
| `order`          | holy, monastic, martial, and learned orders                                                                                                                           |
| `party`          | campaigning, representation, governance, patronage within political organizations                                                                                     |
| `union`          | labor representation, trade coordination, mutual aid, political advocacy                                                                                              |

`house` is deliberately excluded from the first atomic form vocabulary despite plausible reuse.
Its collision with Building form, authoring copy, search, and developer terminology outweighs the
current evidence. Merchant house, Noble house/bloc, and Clan remain familiar presets with an
optional different form or no form. Reconsider an organization-specific concept such as
`dynastic_house` only after a non-preset consumer proves common constitutional semantics.

`force` remains the weakest admitted candidate. It has stronger reuse evidence than `house`, but
Phase 7d must test whether it describes how an actor is constituted rather than merely a military
or enforcement grouping. If it fails, Army, Guard, and Militia remain presets over military or
government domain + activities with form unset. `gang`, `bank`, `academy`, `church`, `army`, and
`clan` should not enter the atomic form list in the first pass.

### Organization activity backlog

The implemented activity vocabulary currently contains only `blacksmithing`, `brewing`, and
`worship`. The domain/form model cannot carry the decomposed subtypes without expanding it. The
first backlog should be broad enough to express current identities but should avoid services and
rank titles:

| Family       | Candidate activities                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Government   | governance, administration, legislation, adjudication, taxation, diplomacy, public works, law enforcement                      |
| Political    | advocacy, campaigning, representation, mobilization, patronage, political education                                            |
| Religious    | ministry, devotion, proselytizing, sacred-site stewardship, charity, monastic practice                                         |
| Military     | warfare, defense, guarding, policing, training, mercenary service, logistics                                                   |
| Criminal     | theft, fencing, smuggling, piracy, extortion, illicit trade, espionage, territorial control                                    |
| Commercial   | trade, retail, banking, finance, production, transport, hospitality, brokerage                                                 |
| Occupational | standards, certification, apprenticeship, vocational training, collective bargaining, member advocacy, occupational mutual aid |
| Academic     | education, higher education, training, research, knowledge stewardship, archiving, knowledge exchange                          |
| Community    | mutual aid, civic participation, local stewardship, social fellowship, cultural practice                                       |

Activities remain multi-valued and cross-domain. `advocacy`, `education`, `training`, `mutual aid`,
and `stewardship` must not be duplicated per domain. More specific services such as a bank's loan
product or a temple's named ceremony remain optional offerings, not classification activities.

The table is a backlog, not the first implementation set. Phase 7d should enable only what the six
stress cases require, alongside the existing values:

| Status              | Activities                      |
| ------------------- | ------------------------------- |
| Already implemented | blacksmithing, brewing, worship |
| Church              | ministry                        |
| Army                | warfare, defense                |
| Bank                | banking, finance                |
| Academy             | education, training, research   |
| Craft guild         | standards, apprenticeship       |
| Smuggling ring      | smuggling                       |

Do not add the remaining backlog merely for taxonomy completeness. Each later activity family
should enter with a concrete preset, authoring, search, or rules consumer.

### Authoring preset assessment

Presets are contract-owned input recipes. Selecting one initializes domain/form/activities and may
provide creation-session title suggestions; once initialized, canonical form values own persisted
classification. A preset is not a fourth classification axis.

Preset values are defaults, never constraints. Immediately after application, the preset has no
authority over domain, form, or activities. Changing any initialized value is an ordinary edit: it
does not require preset compatibility, confirmation, invalidation, restoration of defaults, or a
replacement preset. Only canonical form state is submitted.

The dependency direction is one-way:

```text
domain / form / activity registries
                ↑
                │ referenced by
                │
authoring preset registry
```

A preset recipe may reference canonical values. Canonical schemas, vocabulary validation, title
resolution, and persistence must never import or depend on the preset registry. This prevents
authoring convenience from becoming hidden taxonomy validation.

| Current identity         | Canonical composition                                                              |                              Keep as preset? | Creation-session suggestions    |
| ------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------: | ------------------------------- |
| Monarchy                 | government + administration or no form + governance                                |                                          Yes | royal/court titles              |
| Council                  | government + council + governance                                                  |               No — direct form is sufficient | derive council titles           |
| Assembly                 | government + assembly + legislation                                                |               No — direct form is sufficient | derive assembly titles          |
| Administration           | government + administration + administration                                       |               No — direct form is sufficient | derive administrative titles    |
| Magistracy               | government + administration/council + adjudication                                 |                                          Yes | magistrate/judicial titles      |
| Party                    | political + party + campaigning/representation                                     |                                          Yes | party leadership titles         |
| Movement                 | political + movement + advocacy/mobilization                                       | No — direct form plus activity is sufficient | derive movement titles          |
| Noble bloc               | political + network/association + aristocratic advocacy                            |                                          Yes | noble-faction titles            |
| Court faction            | political + network + influence                                                    |                                          Yes | court-faction titles            |
| Advocacy group           | political + association + advocacy                                                 |                                          Yes | advocacy/organizer titles       |
| Church                   | religious + congregation + worship/ministry                                        |                                          Yes | clergy titles                   |
| Cult                     | religious + congregation/order + devotion                                          |                                          Yes | cult leadership titles          |
| Temple                   | religious + congregation/order + worship/stewardship                               |                                          Yes | priest/keeper titles            |
| Holy order               | religious + order + ministry/protection                                            |                                          Yes | order/clergy titles             |
| Monastic order           | religious + order + monastic practice                                              |                                          Yes | monastic titles                 |
| Army                     | military + provisional force or no form + warfare/defense                          |                                          Yes | rank titles                     |
| Guard                    | military/government + provisional force or no form + guarding                      |                                          Yes | guard/watch ranks               |
| Militia                  | military + provisional force or no form + local defense                            |                                          Yes | militia ranks                   |
| Mercenary company        | military + company + mercenary service                                             |                                          Yes | company ranks                   |
| Martial order            | military/religious + order + warfare/protection                                    |                                          Yes | order/rank titles               |
| Syndicate                | criminal + network + illicit enterprise                                            |                                          Yes | syndicate hierarchy             |
| Gang                     | criminal + network/crew + selected illicit activity                                |                                          Yes | gang roles                      |
| Thieves' guild           | criminal + guild + theft/fencing                                                   |                                          Yes | guild/theft titles              |
| Smuggling ring           | criminal + network + smuggling                                                     |                                          Yes | smuggling roles                 |
| Pirate crew              | criminal + crew + piracy                                                           |                                          Yes | shipboard roles                 |
| Company                  | commercial + company + selected activities                                         |               No — direct form is sufficient | derive company titles           |
| Merchant house           | commercial + optional form + trade/finance                                         |                                          Yes | house/trade titles              |
| Trading consortium       | commercial + network/association + trade                                           |                                          Yes | consortium roles                |
| Bank                     | commercial + company/cooperative + banking                                         |                                          Yes | finance titles                  |
| Cooperative              | commercial/community + cooperative + selected activities                           |               No — direct form is sufficient | derive cooperative titles       |
| Craft guild              | occupational + guild + craft standards/training                                    |                                          Yes | craft-guild ranks               |
| Trade guild              | occupational + guild + trade coordination                                          |                                          Yes | trade-guild ranks               |
| Professional association | occupational + association + standards/advocacy                                    |                                          Yes | practitioner/association titles |
| Labor association        | occupational + union/association + bargaining/advocacy                             |                                          Yes | steward/organizer titles        |
| Fellowship               | selected domain + fellowship + selected activities                                 |               No — direct form is sufficient | derive fellowship titles        |
| School                   | academic + association/administration + education                                  |                                          Yes | school titles                   |
| College                  | academic + association/administration + higher education/research                  |                                          Yes | college titles                  |
| Academy                  | academic + association/order + education/training/research                         |                                          Yes | academy titles                  |
| Library                  | academic/community/government + administration/association + knowledge stewardship |                                          Yes | librarian/archive titles        |
| Learned society          | academic + association/fellowship + research/exchange                              |                                          Yes | scholarly titles                |
| Clan                     | community + network or no form + kinship/mutual aid                                |                                          Yes | kinship titles                  |
| Neighborhood association | community + association + local stewardship/advocacy                               |                                          Yes | neighborhood roles              |
| Mutual aid group         | community/occupational + association/network + mutual aid                          |                                          Yes | coordinator/volunteer roles     |
| Civic association        | community/political + association + civic participation                            |                                          Yes | civic roles                     |
| Social club              | community + association/fellowship + social fellowship                             |                                          Yes | club/host titles                |

This deliberately preserves direct access to familiar identities while allowing the canonical
vocabularies to stay small. Pure atomic forms do not need duplicate presets unless usability testing
shows that a preset-first picker is the only effective authoring path.

### Member-title suggestion resolution

The current title resolver does two jobs: it offers labels in later membership editors and maps a
recognized label to a default priority. Membership records already persist the selected title and
priority, so classification changes do not rewrite historical membership facts. The behavior to
preserve is **suggestion specificity**, not subtype provenance.

Do not replace subtype with another registry of whole-composition identities. Each canonical axis
may contribute suggestions independently:

```text
domain contribution      broad roles for the institutional sphere
form contribution        roles implied by how the actor is constituted
activity contributions   specialist roles implied by each sustained activity
            │
            └── collect → rank → deduplicate → present
```

Policy and content have distinct owners. Domain, form, and activity entries own only their local
`memberTitles` contributions. One shared
`resolveOrganizationMemberTitleSuggestions(classification)` function owns collection, ordering,
deduplication, current-value preservation, and returned suggestion shape. It must contain no
identity-specific tuple branches such as `domain === 'criminal' && form === 'guild'`; such branches
would recreate subtype outside the registries.

Illustrative contributions show that specificity can survive decomposition:

| Composition                                         | Domain contribution                                 | Form contribution                                | Activity contribution                         | Useful result without preset identity                                                                          |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| criminal + guild + theft                            | Boss, Enforcer, Associate                           | Guildmaster, Master, Apprentice, Member          | Master Thief, Thief, Cutpurse, Fence, Lookout | Guild hierarchy and theft roles both remain available                                                          |
| criminal + network + smuggling                      | Boss, Operative, Associate                          | Coordinator, Agent, Member                       | Ringleader, Smuggler, Courier, Lookout        | Reconstructs the useful Smuggling ring role family                                                             |
| criminal + crew + piracy                            | Boss, Operative, Associate                          | Captain, Quartermaster, Crew                     | Boatswain, Pirate, Sailor, Swab               | Reconstructs shipboard and criminal roles without `pirate_crew`                                                |
| military + accepted `force` (if admitted) + warfare | Commander, Captain, Officer, Soldier, Recruit       | General, Commander, Sergeant, Member             | Strategist, Captain, Combatant, Scout         | Tests whether provisional `force` adds constitutional rank roles; military + warfare remains useful without it |
| commercial + company + banking                      | Proprietor, Partner, Manager, Agent, Employee       | Director, Partner, Manager, Agent, Employee      | Treasurer, Banker, Clerk, Auditor             | Preserves Bank's distinctive finance roles while deduplicating generic company roles                           |
| religious + congregation + worship                  | High Priest, Priest, Deacon, Acolyte, Initiate      | Elder, Steward, Minister, Member                 | Celebrant, Priest, Acolyte, Keeper            | Preserves Church/Temple clergy roles; exact institution noun is unnecessary                                    |
| occupational + guild + standards/training           | Guildmaster, Master, Journeyman, Apprentice, Member | Guildmaster, Master, Steward, Apprentice, Member | Assessor, Instructor, Practitioner, Trainee   | Preserves craft-guild hierarchy from canonical fields                                                          |
| academic + association + education/research         | Rector, Professor, Scholar, Fellow, Student         | President, Officer, Fellow, Member               | Instructor, Tutor, Researcher, Student        | Useful for School/College/Academy, though it no longer selects Chancellor solely from the institution noun     |

The labels are evidence examples, not a proposed final vocabulary. The later contract registry must
own the actual entries and must not copy contributor maps into dashboard code.

#### Ranking, deduplication, and priority

Resolution should be deterministic and should distinguish **suggestion order** from persisted
membership **priority**:

1. Collect entries from every selected activity, then optional form, then primary domain. Process
   activities in canonical registry order, never authoring-array or object-iteration order.
2. Preserve each contributor's local suggestion rank. Interleave by local rank so one contributor
   cannot exhaust a bounded UI list: first-ranked activity/form/domain entries precede second-ranked
   entries, and so on. Within the same local rank use source specificity
   `activity > form > domain`, then stable contributor ID and normalized label.
3. Deduplicate case-insensitively by trimmed label. When the same label appears more than once, the
   winner is the contribution with the earliest resolved suggestion order. Its label and default
   membership priority win; development assertions should expose conflicting priorities rather
   than silently depending on registry iteration.
4. Preserve the current membership title as an additional option when it is absent from the derived
   set. A current custom or historical title never disappears merely because classification
   changed.
5. Stamp a suggestion's default membership priority only when that suggestion is selected. An
   explicitly persisted membership priority remains authoritative, as it is today.

This produces a coherent union rather than requiring an exact tuple such as
`criminal + guild + theft → thieves_guild_titles`. A consumer may present a bounded prefix, but the
shared resolver—not each UI—must own the ordering and deduplication contract.

#### Durable-profile verdict

Compositional contribution is sufficiently specific for the high-value guild, smuggling, pirate,
army, bank, church/temple, and library cases. The remaining loss is fine institutional flavor:
School, College, and Academy no longer independently imply Headmaster, Dean, or Chancellor, and
Monarchy/Magistracy no longer independently imply every court or judicial title. That loss does not
currently justify durable Organization state because:

- derived suggestions remain relevant rather than generic;
- preset suggestions can assist during the active authoring session;
- membership titles are editable and custom values remain supported;
- an already selected title and its explicit priority persist independently;
- no display, filtering, search, or rules consumer needs the title family identity.

Therefore Phase 7c recommends **no `MemberTitleSuggestionProfile` field** in the initial refactor.
Reserve that exact name for a later, explicitly selected behavior-only fallback if editing evidence
shows that composition-derived suggestions materially fail. It must never be named or populated as
creation provenance and must not become classification.

### Stale-state rules

| Change                                 | Ephemeral preset behavior                                            | Canonical classification                           | Optional durable title profile, if later justified                     |
| -------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| Preset selected                        | Initialize fields and session suggestions, then relinquish authority | Form state immediately owns domain/form/activities | Do not persist automatically                                           |
| Domain changes                         | No compatibility check; recompute suggestions                        | New domain is authoritative                        | Clear or reject when the profile's local compatibility predicate fails |
| Form changes or clears                 | No compatibility check; recompute suggestions                        | New/absent form is authoritative                   | Clear or reject if the profile requires the prior form                 |
| Any activity is removed                | No compatibility check; recompute from remaining activities          | Remaining activities are authoritative             | Clear or reject if required activities no longer match                 |
| Any activity is added                  | No compatibility check; include its contributions                    | Full activity set is authoritative                 | May remain when required conditions still hold                         |
| Organization is reopened later         | No preset state is reconstructed                                     | Load only canonical classification                 | Derive suggestions; load a profile only if it was explicitly persisted |
| Existing member has a custom/old title | Keep it as an available current value                                | No classification effect                           | No profile required; persisted title/priority remains authoritative    |

The preset column intentionally contains no invalidation behavior: there is no persisted preset to
invalidate. If a future explicit profile is justified, its validity must live with the
title-suggestion registry, not in the preset registry or a general Organization classifier. The
form should clear an incompatible profile immediately; the API should validate the merged update so
stale suggestion metadata cannot survive a direct write. That safety rule applies only to the
hypothetical behavior-specific profile.

#### Preset-collision stress tests

| Authoring sequence                                                                      | Resulting canonical state            | Required behavior                                                                                                                                                                                                | Result                                                                                        |
| --------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Select Thieves' Guild (`criminal + guild + theft`), then remove theft and add smuggling | `criminal + guild + smuggling`       | Keep domain/form edits exactly as authored; derive guild, criminal, and smuggling contributions. Do not restore theft, change guild to network, or retain a hidden Thieves' Guild identity                       | Passes with ephemeral defaults; the unusual guild of smugglers is valid canonical composition |
| Select Army, then change/add form to order                                              | `military + order + warfare/defense` | If `force` is admitted, replace it; if omitted, add order. In either case derive military, order, warfare, and defense contributions without restoring a preset default or requiring conversion to Martial order | Passes with ephemeral defaults; the user has authored a military order directly               |

These are not stale-state cases because preset state no longer exists after initialization. Only a
future independently persisted `MemberTitleSuggestionProfile` could become incompatible, and Phase
7c does not currently recommend adding one.

### Worked compositions and single-domain stress tests

| Case                                 | Primary domain + form + activities                                                                                                                                                                             | Facility/relationship alignment                                                          | Result                                                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Temple                               | religious + congregation/order + worship, ministry, sacred-site stewardship                                                                                                                                    | Building Facility `temple`; Organization connected as operator/owner/tenant/headquarters | Clean; premises identity is not copied into Organization classification                                              |
| Academy                              | academic + association/order + education, training, research                                                                                                                                                   | Building Facility `academy`; operator relationship                                       | Clean; exact academy titles are preset/session UX or a later title profile, not proof of subtype                     |
| Craft guild                          | occupational + guild + standards, apprenticeship, training                                                                                                                                                     | Guildhall Facility; operator/headquarters relationship                                   | Clean if occupational admission rule is enforced                                                                     |
| Bank                                 | commercial + company/cooperative + banking, finance                                                                                                                                                            | Bank Facility; operator/headquarters relationship                                        | Clean; no institutional axis required by current consumers                                                           |
| Government council                   | government + council + governance, deliberation                                                                                                                                                                | Council chamber/town hall Facility; governs/headquarters/operator as distinct edges      | Clean; council is reusable form, while `governs` remains relational                                                  |
| Military guard                       | military + accepted `force` or no form + guarding, defense                                                                                                                                                     | Barracks/guardhouse Facility; operator/headquarters relationship                         | Clean; guarding is activity, guardhouse is place; `force` remains subject to its form test                           |
| Pirate crew                          | criminal + crew + piracy                                                                                                                                                                                       | Vessel Location; operator/owns relationship where eligible                               | Clean; crew is form and piracy is activity                                                                           |
| Community association                | community + association + local stewardship, civic participation                                                                                                                                               | Meeting hall/community-center Facility; operator/tenant                                  | Clean; community is domain, association is form                                                                      |
| Religious–military holy order        | religious + order + worship, ministry, armed protection when sacred mission is primary; military + order + warfare, sacred stewardship when armed command is primary                                           | Temple/fortification relationships remain factual                                        | Passes. Choosing a primary institutional identity is meaningful; activities preserve the other character             |
| Political–criminal insurgent network | political + movement/network + advocacy, mobilization, smuggling or violence when political change is primary; criminal + network + smuggling/extortion, political advocacy when illicit enterprise is primary | Hideout/headquarters/operator relationships remain factual                               | Semantically passes. Domain-only filters would hide the secondary character unless activity filters/search are added |
| Commercial–criminal smuggling front  | criminal + network/company + smuggling, illicit trade when illegality is constitutive; commercial + company + trade plus a criminal activity when it is genuinely a commercial actor committing offenses       | Warehouse/shop Facility and operator relationship remain independent                     | Passes, but activity vocabulary and search must not sanitize or suppress illicit activities                          |
| Religious–academic monastic school   | religious + order + worship, education, research when monastic identity is primary; academic + order + education, research, devotion when teaching is primary                                                  | Monastery/academy Facilities can be separate or mixed-use according to spatial rules     | Passes without a second domain                                                                                       |

The single-domain rule has one genuine product cost: a strict domain-only filter cannot find every
cross-domain facet. That is not evidence for multi-domain persistence. Activities must participate
in picker search and eventually in explicit filters/groupings. If a later non-search consumer needs
two simultaneous domains—for example, rules that grant domain-specific capabilities—reopen the
cardinality decision with that concrete consumer.

For Phase 7d, activity discovery is a requirement rather than follow-up polish: global search and
Organization entity pickers must index activity labels and registry-owned aliases. A political
Organization with smuggling activity must be discoverable by “smuggling” even though it correctly
does not appear under a strict Criminal-domain filter. Domain filters remain exact; activity search
preserves the secondary facet without introducing a second domain.

### Alignment with the Location model

The two content types should align by ownership pattern, not by sharing vocabularies or IDs:

```text
Location                              Organization
structureType: broad spatial family  domain: broad institutional sphere
form: physical morphology            form: actor constitution
facilityType: durable place identity activities: sustained actor work
authoring group/preset: input recipe authoring preset: input recipe
function projection: derived use     title suggestions: derived UX metadata

Organization ↔ Location relationship: why this actor and place are connected
```

Facility and activity terms may have parallel labels—brewery/brewing, temple/worship,
bank/banking—but must remain separate registry entries because they make different claims. Presets
may initialize both sides in a create session, but may not infer or persist an Organization from a
Facility or a Facility from an Organization. Location relationship kinds remain unchanged and must
not be derived from Organization domain/form/activity.

### Recommended direct-refactor boundary and likely scope

There is no data-migration or compatibility requirement. When implementation is authorized, replace
the dev-only model directly and update all compile-time/runtime consumers in the same refactor. The
scope below is a coordination map, not a migration plan.

1. **Contracts:** introduce domain/form vocabularies, expand activities, replace body/input fields,
   define ephemeral preset recipes, and change member-title resolution to ranked/deduplicated
   contributions from canonical axes.
2. **API:** replace Mongo enums and merged-write validation. Preserve the valuable pattern of
   validating the effective merged state, but validate independent fields rather than a kind-bound
   subtype pair.
3. **Dashboard canonical form projection:** replace Type/Subtype with Domain/Form/Activities. A
   preset applies defaults once; it does not install form synchronization or compatibility rules.
   The Location modal's embedded Organization projection must consume this same owner rather than
   define a second schema.
4. **Consumers:** update Organization detail/overview, entity pickers, type filters, global search,
   fixtures, and tests. Activity labels and registry-owned aliases must enter global search and
   entity discovery in the same cutover so cross-domain Organizations remain findable.
5. **Membership UX:** update title suggestion and priority stamping consumers together. Preserve
   explicit membership title/priority semantics and custom-title fallback.
6. **Authoring presets:** add a contract registry and setup projection only after canonical fields
   work. Preset selection initializes form state and then disappears; no provenance field is added.

The recommended first implementation slice is **domain/form/activity contracts plus form
projection and compositional member-title contribution tests**, not all 45 presets. Prove Church,
Army, Bank, Academy, Craft guild, and Smuggling ring before expanding the preset catalog. These
cases exercise institutional ambiguity, cross-domain reusable forms, title specificity, and preset
independence without forcing an institutional axis.

`institutionType` is explicitly rejected for that slice. Church, Army, Bank, and Academy are
adequately preserved by canonical composition + ephemeral presets; reopen an institutional axis
only when a non-UX consumer cannot recover a required distinction.

### Phase 7c conclusion

The Organization and Location models can now share the same architectural grammar while remaining
semantically independent. The target separates three levels:

```text
Canonical persisted meaning
    one primary domain + optional reusable form + multiple activities

Authoring convenience
    ephemeral familiar preset
        └── initializes canonical form values, then relinquishes authority

Editing assistance
    ranked/deduplicated contributions from domain + form + activities
        ↓ only if later evidence proves insufficient
    optional behavior-specific MemberTitleSuggestionProfile
```

`occupational` is acceptable under a strict member-serving/regulatory boundary. Familiar identities
should remain selectable as presets, but preset provenance and constraints should not persist.
Compositional member-title contribution is sufficient for the initial refactor, so Phase 7c does
not recommend `MemberTitleSuggestionProfile`. Only demonstrated loss of later editing quality would
justify that separately owned, compatibility-checked fallback. No current consumer requires
multi-domain Organizations or a general institutional designation axis. `house` is excluded from
the first Organization form vocabulary; `force` is provisional and must either pass its
constitutional form test during Phase 7d or be omitted without blocking Army authoring.

### Phase 7d implementation checkpoint

The bounded direct refactor now proves all six initial recipes through the same standalone and
embedded Organization form projection: Church, Army, Bank, Academy, Craft guild, and Smuggling
ring. Each recipe initializes canonical values and immediately clears its UI-only preset selection;
serialization and reload retain only domain, optional form, and activities.

`force` was omitted. The first vocabulary pass did not establish that it describes constitutional
structure rather than an operational or institutional grouping, and Army remains complete as
`military + warfare + defense` with no form. `house` also remains outside the atomic form
vocabulary.

Compositional member-title suggestions interleave local activity, form, and domain ranks and
deduplicate normalized labels without tuple-specific branches. Activity labels, aliases, and search
terms now participate in global and entity-picker discovery, while domain filters remain exact. A
political Organization with smuggling activity is therefore discoverable by “smuggling” without
being classified as Criminal.

No legacy kind/subtype runtime fields, persisted preset provenance, reverse preset display lookup,
institution axis, multi-domain escape hatch, or durable title profile was introduced. Expansion
beyond the six recipes should wait for UI review of this checkpoint.

## Phase 8 — Building Form axis expansion checkpoint

**Checkpoint date:** 2026-08-14  
**Scope:** Admit `tower` and `hall` to `BUILDING_FORM_ENTRIES`; prove registry-driven projection;
document admission/decomposition rules; identify next architectural triggers.

### Four-axis classification contract

| Axis                          | Semantic responsibility                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Building Form**             | Physical morphology, construction, spatial arrangement, or architectural pattern       |
| **Facility type**             | Configured purpose, service, or use of the premises                                    |
| **Organization relationship** | Who owns, occupies, operates, governs, or is headquartered there                       |
| **Archetype / manifestation** | Named specialized/cultural expression that may project onto one or more canonical axes |

**Primary-owner rule:** a vocabulary candidate should have one clear primary semantic owner. Do not
use Form as a catch-all for terms whose identity is primarily use, occupant, status, or authority.

**Authoring principle:** Facility is the primary authoring/discovery axis; Form is optional structural
precision. Setup requires a Facility discovery group (including Browse all), not a persisted
`facilityType`. Canonical classification remains `form` and/or `facilityType` — form-only,
facility-only, and both are valid.

No additional semantic axis was required to explain the ambiguous terms reviewed in this audit.

### Form admission protocol

A candidate belongs on **Building Form** only when its identity is grounded primarily in shape,
construction pattern, massing, vertical/horizontal organization, spatial arrangement, or
architectural envelope.

A candidate must **not** be admitted when its identity is primarily use, operator, occupant,
trade/activity, institutional function, social status, territorial authority, or an interior room.

**Whole-building rule:** Form describes the building's architectural organization, not a room it
happens to contain.

Admission result is one of: `ADMIT` · `NEEDS DESCRIPTION/POLICY WORK` · `DECOMPOSE` · `DEFER` ·
`REJECT`.

#### Admission cards (this pass)

| Candidate | Primary axis     | Result                          | Notes                                                                         |
| --------- | ---------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| House     | Form             | ADMIT (shipped; copy tightened) | Small-scale house envelope/massing, independent of use                        |
| Tower     | Form             | ADMIT (this pass)               | Vertical morphology, independent of watch/defense/residence use               |
| Hall      | Form             | ADMIT (this pass)               | Whole-building hall volume; lexical overlap with `town_hall` Facility is safe |
| Keep      | Form (contested) | NEEDS DESCRIPTION/POLICY WORK   | Morphology vs refuge-use still mixed in archetype copy                        |
| Gatehouse | Form (contested) | NEEDS DESCRIPTION/POLICY WORK   | Gateway envelope vs entry-control facility overlap                            |

### Runtime vs audit metadata

`BUILDING_FORM_ENTRIES` contains only `GameTermEntry` fields consumed today: `id`, `label`,
`description`. No `aliases`, `searchTerms`, `defaultFunctions`, grouping, or `manifestationOf`.
Facility owns discovery metadata; Form Setup uses label + description only.

### Registry-driven consumer proof

Adding `tower` and `hall` required **no feature-local Form allowlists, label maps, or pair
filters**. All consumers derive from `BUILDING_FORM_ENTRIES`:

- `buildingFormSchema` / `BUILDING_FORM_IDS`
- Mongo enum (spreads `BUILDING_FORM_IDS`)
- `buildBuildingFormRadioOptions()` → Setup panel
- `buildBuildingCreateSetupSummaryEntries`
- `location-classification-form-fields` Form select
- `getLocationOverviewSearchText` via `getBuildingFormLabel`
- `location-form-values` serialization

### Decomposition outcomes (ambiguous corpus)

| Term                                               | Outcome          | Notes                          |
| -------------------------------------------------- | ---------------- | ------------------------------ |
| House, Tower, Hall                                 | PRIMARY FORM     | Optional Facility composition  |
| Town Hall, Watchtower, Warehouse                   | PRIMARY FACILITY | Optional Form is composition   |
| Wizard tower, Healer's house, Blacksmith           | DECOMPOSE        | Bundles multiple axes          |
| Martello tower, Drum tower, Longhouse              | MANIFESTATION    | Defer rewiring until migration |
| Keep, Gatehouse, Manor, Palace, Apartment building | DEFER            | See recommendations below      |

### Manifestation evaluation (no encoding chosen)

`manifestationOf` remains on archetype shard entries, validated against `BUILDING_ARCHETYPE_ENTRIES`.
Form and Facility registries are not legal manifestation targets today. String-ID collisions exist
(`house`, `tower`, `town_hall`, `apartment_building`).

| Encoding                        | Fit                                                              | Risk                                                                                 |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Axis-local graphs**           | Form `manifestationOf` only Form ids; Facility only Facility ids | Duplicate graph helpers; cross-axis links unrepresentable (matches audit constraint) |
| **Discriminated shared target** | `{ axis: 'form'; id } \| { axis: 'facility'; id }`               | Can become a generic cross-axis graph the audit avoids                               |

**Migration trigger:** when a manifestation parent leaves the archetype registry, same-string IDs
collide across axes, or archetype retirement begins for terms with canonical Form/Facility ids.
Adding Form `tower` beside archetype `tower` is evidence, not the trigger itself.

### Setup UI scalability trigger

Form choices remain flat radio cards (3 after this pass). Migration is **semantic-first,
count-second**: trigger when scanning the full Form set as radio cards becomes meaningfully worse
than searching or grouping. 8–10 options is an empirical warning range (Site type is the largest
flat Setup set today), not a hard rule. Future scalable extension belongs in `@/lib/create-setup`,
not location-building feature code.

### Apartment building dual-axis question (undecided)

`apartment_building` remains Facility-only. Before any concept may exist on multiple canonical axes,
each axis must answer a different question, values must be independently authorable, shared
spelling must use distinct IDs, and if selecting one typically implies the other, keep a single
primary owner. A future Form candidate should use clearer morphological terms (block, tenement
massing) rather than duplicating "Apartment building."

### Keep and gatehouse recommendations

- **Keep:** Do not admit until description is morphology-first and defense is owned by
  Facility/relationships. Likely next Form after this pass.
- **Gatehouse:** Do not admit until Form vs Facility ownership is written into the entry. If
  control/use dominates after rewrite, `DECOMPOSE` rather than force onto Form.

### Classification ownership doc

[`locations-building-classification.md`](../../apps/dashboard/docs/locations-building-classification.md)
ownership section updated to Form/Facility contract. Archetype picker/filter/manifestation
migration remains deferred.

### Manifestation cleanup

Still deferred. No `manifestationOf: 'tower'` retargeting for `wizard_tower` / `martello_tower`;
no standalone `hall` archetype introduced.
