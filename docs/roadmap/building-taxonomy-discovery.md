# Building Taxonomy Discovery

> **Frozen evidence set — corpus v0.5 (308 concepts).** Content through the
> Phase 5 decision record (v0.5) below is immutable discovery evidence. Later
> editorial output (function-family curation, archetype disposition) is appended
> in clearly dated sections at the end — never edited in place. Implementation
> guidance lives in
> [building-model-e-implementation-spec.md](./building-model-e-implementation-spec.md).

Working artifact for the building classification discovery process. Companion
research notes: the superseded taxonomy plan (Candidate Model A and its
outlier catalogue). Current shipped vocab under test:
[`building-type-definitions.ts`](../../packages/contracts/src/rpg/vocab/location/building-type-definitions.ts).

| Phase                                     | Status                                           |
| ----------------------------------------- | ------------------------------------------------ |
| 0 — Restructure prior plan                | Done                                             |
| 1 — Corpus collection (250+)              | Done — corpus v0.1                               |
| 2 — Dimensional coding                    | Done — matrix v0.2                               |
| 3 — Dimension/boundary/stress-set reports | Done — v0.3, corpus frozen                       |
| 4 — Model testing (A–D, emergent E)       | Done — Model E provisionally selected            |
| 5 — Decision record                       | **Done — Model E adopted, corpus closed at 308** |

## Success definition

**Success is not a comprehensive enum.** The likely end state is a _small,
stable semantic model that can represent a comprehensive corpus_ — not an enum
containing every building archetype. Discovery optimizes for finding the
dimensions that remain stable across hundreds of examples; a concept that the
model can _express_ (via dimensions, unset values, name, or context) counts as
covered even if it never becomes a canonical id.

## Method

```text
collect building concepts
→ cluster by semantic dimension
→ identify ambiguous/outlier cases
→ test candidate classification models
→ choose model
→ only then define canonical vocab/schema
```

Rules in force during discovery:

- No changes to `building-type-definitions.ts`, schemas, fixtures, or tests.
- Hierarchy stays out of scope — discovery classifies what a building _is_,
  not where it can live. Context sensitivity is observed, never turned into
  containment policy (`LOCATION_KIND_DEFINITIONS` remains the sole hierarchy
  authority).
- The corpus **freezes** when the Phase 3 stress set is fixed, before any
  model scoring. A post-test gaps pass happens in Phase 5.

## Coding dimensions (applied in matrix v0.2)

| Dimension                       | Values                                                                | Purpose                                                                      |
| ------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Concept level (`Lvl`)           | `arch` \| `spec` \| `cult` \| `comp` \| `—`                           | Keep abstraction levels from blurring; `—` = overlay/non-concept case        |
| Boundary (`Bnd`)                | `yes` \| `no` \| `ctx` \| `comp`                                      | Richer than binary Building?                                                 |
| Composite? (`Cmp`)              | `y` \| `semi` \| `n` \| `—`                                           | Complex-vs-single-building; `semi` = single building with compound character |
| Primary function                | free-form; `+` joins mixed, `?` marks uncertainty                     | Core semantic hypothesis                                                     |
| Form                            | free-form                                                             | Expected overlap with `structureType` — coded to prove ownership             |
| Affiliation (`Affil`)           | free-form                                                             | Expected eviction toward organizations — coded to prove it                   |
| Access (`Acc`) _(provisional)_  | `pub` \| `patron` \| `priv` \| `restr` \| `mixed` \| `?` \| `—`       | May be occupancy policy, not identity                                        |
| Scale (`Scl`) _(provisional)_   | `S` \| `M` \| `L` \| `C` \| `—`                                       | Abstract only — never form-words                                             |
| Primary semantic signal (`Sig`) | `func` \| `form` \| `inst` \| `trade` \| `cultarch` \| `mixed` \| `—` | Why a concept resists single-dimension models                                |
| Context-sensitive? (`Ctx`)      | `y` \| `n`                                                            | Classifies differently standalone vs as child                                |
| Term overloaded? (`Ovl`)        | `y` \| `n`                                                            | Polysemy is vocabulary ambiguity, not ontology ambiguity                     |
| Ambiguous with (`Ambiguous`)    | concept ids                                                           | Builds the Phase 4 stress set                                                |
| Notes                           | free                                                                  | Key findings only                                                            |

Coding discipline: values were assigned free-form (no controlled vocabulary);
`cult`/`hist`/`edge`/`fant` entries were coded before `seed` entries so Model A
assumptions did not anchor the vocabulary. Compound signals (`func+form`) mark
two co-primary signals; `mixed` marks genuinely inseparable blends.

## Coded matrix — v0.2 (300 concepts)

Bucket placement remains a coverage device only — not classification.

### 1. Domestic (26)

| Id                  | Src  | Lvl  | Bnd  | Cmp  | Function                               | Form                   | Affil       | Acc    | Scl | Sig      | Ctx | Ovl | Ambiguous                          | Notes                                          |
| ------------------- | ---- | ---- | ---- | ---- | -------------------------------------- | ---------------------- | ----------- | ------ | --- | -------- | --- | --- | ---------------------------------- | ---------------------------------------------- |
| house               | seed | arch | yes  | n    | dwelling                               | —                      | —           | priv   | S   | func     | n   | n   | cottage, townhouse                 | easy control                                   |
| cottage             | hist | spec | yes  | n    | dwelling                               | —                      | —           | priv   | S   | func     | n   | n   | house, hovel                       | rural variant of house                         |
| hovel               | hist | spec | yes  | n    | dwelling                               | —                      | —           | priv   | S   | func     | n   | n   | cottage                            | quality axis masquerading as type              |
| townhouse           | hist | spec | yes  | n    | dwelling                               | rowhouse               | —           | priv   | M   | func     | n   | n   | house                              | —                                              |
| tenement            | seed | arch | yes  | n    | dwelling (multi-household)             | block                  | —           | priv   | M   | func     | n   | n   | apartment_building, boarding_house | quality/era split vs apartment_building        |
| apartment_building  | seed | arch | yes  | n    | dwelling (multi-household)             | block                  | —           | priv   | L   | func     | n   | n   | tenement                           | —                                              |
| manor               | seed | arch | yes  | semi | dwelling + estate administration       | great house            | nobility    | priv   | L   | mixed    | n   | n   | palace, hunting_lodge              | residence + seat blend                         |
| palace              | seed | arch | comp | y    | dwelling + governance + court          | monumental compound    | crown       | restr  | C   | mixed    | n   | n   | manor, citadel, palace_complex     | flagship mixed case                            |
| farmhouse           | hist | spec | yes  | n    | dwelling (work-linked)                 | —                      | —           | priv   | S   | func     | y   | n   | house                              | child of farmstead                             |
| dower_house         | hist | spec | yes  | n    | dwelling                               | —                      | nobility    | priv   | M   | func     | y   | n   | manor                              | estate child                                   |
| gamekeepers_cottage | hist | spec | yes  | n    | dwelling (work-tied)                   | —                      | estate      | priv   | S   | func     | y   | n   | cottage                            | —                                              |
| rectory             | hist | spec | yes  | n    | dwelling (office-tied)                 | —                      | faith       | priv   | M   | mixed    | y   | n   | house                              | office defines the dwelling                    |
| boarding_house      | seed | arch | yes  | n    | lodging (residential-term)             | —                      | trade       | patron | M   | func     | n   | n   | tenement, inn, flophouse           | dwelling/lodging boundary case                 |
| flophouse           | seed | spec | yes  | n    | lodging (transient)                    | —                      | trade       | patron | M   | func     | n   | n   | boarding_house, inn                | quality axis again                             |
| safe_house          | seed | —    | ctx  | n    | concealment + dwelling                 | —                      | covert      | restr  | S   | mixed    | n   | n   | thieves_den                        | role overlay — any building can be one         |
| hunting_lodge       | seed | arch | yes  | n    | dwelling (seasonal leisure)            | lodge                  | nobility    | priv   | M   | func     | n   | n   | manor, banqueting_house            | seasonal-use axis                              |
| dormitory           | seed | arch | ctx  | n    | group dwelling                         | block                  | institution | restr  | M   | inst     | y   | n   | barracks, tenement                 | dormitory ≈ civil barracks                     |
| longhouse           | cult | cult | yes  | semi | communal dwelling + assembly           | long hall              | kin-group   | priv   | M   | cultarch | n   | n   | feast_hall, hof, house             | dwelling-hall fusion                           |
| roundhouse          | cult | cult | yes  | n    | dwelling                               | round                  | —           | priv   | S   | cultarch | n   | n   | house                              | form-named dwelling                            |
| broch               | cult | cult | yes  | n    | dwelling + defense                     | drystone tower         | kin         | priv   | M   | mixed    | n   | n   | watchtower, tower, nuraghe         | dwelling-fort blend; purpose partly unknown    |
| crannog             | cult | cult | yes  | semi | dwelling + defense                     | island platform        | —           | priv   | S   | cultarch | n   | n   | broch                              | site+structure fusion                          |
| insula              | cult | cult | yes  | n    | dwelling (multi) + ground-floor retail | block                  | —           | priv   | L   | cultarch | n   | n   | apartment_building, machiya        | live/work stack                                |
| domus               | cult | cult | yes  | n    | dwelling                               | courtyard house        | —           | priv   | M   | cultarch | n   | n   | house, manor                       | —                                              |
| machiya             | cult | cult | yes  | n    | dwelling + shopfront                   | shop-house             | trade       | mixed  | M   | mixed    | n   | n   | shop, insula                       | canonical live/work                            |
| siheyuan            | cult | cult | yes  | semi | dwelling (multi-generation)            | courtyard compound     | kin         | priv   | M   | cultarch | n   | n   | domus                              | —                                              |
| hobbit_burrow       | fant | cult | ctx  | n    | dwelling                               | earth-sheltered burrow | —           | priv   | S   | form     | n   | n   | root_cellar                        | envelope test pressure — no freestanding shell |

### 2. Trade & services (29)

| Id              | Src  | Lvl  | Bnd  | Cmp  | Function                                  | Form          | Affil         | Acc    | Scl | Sig      | Ctx | Ovl | Ambiguous                                  | Notes                                                   |
| --------------- | ---- | ---- | ---- | ---- | ----------------------------------------- | ------------- | ------------- | ------ | --- | -------- | --- | --- | ------------------------------------------ | ------------------------------------------------------- |
| shop            | seed | arch | yes  | n    | retail (general)                          | storefront    | trade         | pub    | S   | func     | n   | n   | general_store, market_stall                | umbrella archetype; easy control                        |
| general_store   | seed | spec | yes  | n    | retail (broad goods)                      | storefront    | trade         | pub    | S   | func     | n   | n   | shop                                       | —                                                       |
| apothecary      | seed | arch | yes  | n    | retail (remedies) + practice              | storefront    | trade         | pub    | S   | mixed    | n   | n   | clinic, magic_shop, potion_shop            | health/retail boundary                                  |
| market          | seed | arch | yes  | semi | retail (many sellers)                     | hall          | civic+trade   | pub    | L   | func     | n   | n   | souk, market_stall                         | container of sellers                                    |
| bakery          | seed | spec | yes  | n    | retail + on-site production               | shop + oven   | trade         | pub    | S   | trade    | n   | n   | shop                                       | craft-retail: production+retail fused                   |
| butcher         | seed | spec | yes  | n    | retail + processing                       | shop          | trade         | pub    | S   | trade    | n   | n   | slaughterhouse, shop                       | —                                                       |
| tailor          | seed | spec | yes  | n    | craft service + retail                    | shop          | trade         | pub    | S   | trade    | n   | n   | workshop, shop                             | —                                                       |
| cobbler         | seed | spec | yes  | n    | craft service + retail                    | shop          | trade         | pub    | S   | trade    | n   | n   | workshop                                   | —                                                       |
| jeweler         | seed | spec | yes  | n    | fine craft + retail                       | shop          | trade+guild   | patron | S   | trade    | n   | n   | shop, artificer_atelier                    | security/value axis                                     |
| chandler        | seed | spec | yes  | n    | retail + production                       | shop          | trade         | pub    | S   | trade    | n   | n   | general_store                              | —                                                       |
| blacksmith      | seed | arch | yes  | n    | craft service + production                | smithy        | trade         | pub    | S   | trade    | y   | n   | forge, workshop                            | flagship trade-signal case; village vs castle smithy    |
| workshop        | seed | arch | ctx  | n    | craft production (generic)                | work floor    | trade         | priv   | S   | func     | y   | n   | blacksmith, factory                        | generic container concept                               |
| stable          | seed | arch | yes  | n    | animal boarding service                   | stalls        | —             | patron | M   | func     | y   | n   | livery, barn, byre                         | flagship context case: inn-yard vs standalone vs estate |
| livery          | seed | spec | yes  | n    | horse hire + boarding                     | stalls        | trade         | patron | M   | func     | n   | n   | stable                                     | —                                                       |
| kennel          | seed | spec | yes  | n    | animal boarding/breeding                  | sheds         | trade         | patron | S   | func     | n   | n   | stable                                     | —                                                       |
| bank            | seed | arch | yes  | n    | finance (deposit/lend)                    | hall + vault  | institution   | patron | M   | inst     | n   | y   | counting_house, treasury                   | overload: river bank                                    |
| counting_house  | seed | arch | yes  | n    | finance (merchant accounting)             | office        | trade         | priv   | S   | func     | y   | n   | bank, records_hall                         | often a merchant-house wing                             |
| moneylender     | seed | spec | yes  | n    | finance (petty lending)                   | shop          | trade         | pub    | S   | func     | n   | n   | pawnshop, bank                             | —                                                       |
| pawnshop        | seed | spec | yes  | n    | finance + secured-goods retail            | shop          | trade         | pub    | S   | mixed    | n   | n   | moneylender, shop                          | —                                                       |
| auction_house   | seed | arch | yes  | n    | sale-event venue                          | hall          | trade         | pub    | M   | func     | n   | n   | exchange, market                           | —                                                       |
| exchange        | seed | arch | yes  | n    | brokered trading                          | hall          | institution   | patron | M   | inst     | n   | y   | auction_house, market                      | overload: exchange = act/building                       |
| guildhall       | seed | arch | yes  | n    | association assembly + admin + ceremony   | hall          | guild         | restr  | M   | inst     | n   | n   | town_hall, meeting_hall, adventurers_guild | flagship affiliation-institution case (v0.2 addition)   |
| bathhouse       | seed | arch | yes  | n    | bathing service                           | baths         | civic+trade   | pub    | M   | func     | n   | n   | thermae, hammam, onsen, sweat_lodge        | anchor of cross-cultural bathing family                 |
| washhouse       | hist | arch | yes  | n    | laundry service                           | open hall     | civic         | pub    | S   | func     | n   | n   | bathhouse                                  | —                                                       |
| barber_surgeon  | hist | spec | yes  | n    | grooming + minor medicine                 | shop          | trade+guild   | pub    | S   | trade    | n   | n   | clinic, shop                               | health boundary again                                   |
| weigh_house     | hist | arch | yes  | n    | official weighing/verification            | hall          | civic         | pub    | S   | inst     | n   | n   | customs_house, market                      | —                                                       |
| trading_post    | hist | arch | yes  | semi | exchange + storage + lodging              | compound      | trade         | pub    | M   | mixed    | n   | n   | general_store, caravanserai                | frontier bundle                                         |
| trading_factory | hist | cult | yes  | semi | merchant station (office+store+residence) | compound      | trade company | restr  | L   | mixed    | n   | y   | trading_post, warehouse                    | flagship overload: factory                              |
| souk            | cult | cult | comp | y    | retail district (shop lanes)              | covered lanes | trade         | pub    | C   | cultarch | n   | n   | market                                     | building vs district boundary                           |

### 3. Governance (17)

| Id            | Src  | Lvl  | Bnd  | Cmp | Function                             | Form            | Affil          | Acc   | Scl | Sig       | Ctx | Ovl | Ambiguous                            | Notes                                                                    |
| ------------- | ---- | ---- | ---- | --- | ------------------------------------ | --------------- | -------------- | ----- | --- | --------- | --- | --- | ------------------------------------ | ------------------------------------------------------------------------ |
| town_hall     | seed | arch | yes  | n   | civic administration + assembly      | hall            | civic          | pub   | M   | inst      | n   | n   | meeting_hall, courthouse, guildhall  | easy control                                                             |
| courthouse    | seed | arch | yes  | n   | adjudication                         | hall            | civic          | pub   | M   | inst      | n   | n   | town_hall                            | easy control                                                             |
| prison        | seed | arch | yes  | n   | detention                            | secure block    | civic          | restr | M   | func      | n   | n   | mage_prison, workhouse               | —                                                                        |
| guard_post    | seed | arch | yes  | n   | watch/public order                   | post            | civic          | restr | S   | func      | y   | n   | checkpoint, watchtower, command_post | —                                                                        |
| meeting_hall  | seed | arch | yes  | n   | assembly (secular)                   | hall            | community      | pub   | M   | func      | n   | y   | town_hall, feast_hall, moot_hall     | hall overload                                                            |
| moot_hall     | seed | cult | yes  | n   | deliberative assembly                | hall            | community      | pub   | M   | cultarch  | n   | y   | meeting_hall, town_hall              | manifestation of meeting_hall                                            |
| embassy       | seed | arch | yes  | n   | diplomatic mission                   | house/compound  | foreign crown  | restr | M   | inst      | n   | n   | planar_embassy                       | affiliation defines the use                                              |
| customs_house | seed | arch | yes  | n   | trade inspection + duties            | hall            | crown          | pub   | M   | inst      | n   | n   | weigh_house, tollhouse               | —                                                                        |
| tollhouse     | seed | spec | yes  | n   | toll collection                      | small house     | crown+civic    | pub   | S   | func      | n   | n   | customs_house, gatehouse, checkpoint | keeper-house family                                                      |
| mint          | seed | arch | yes  | n   | coin production (state)              | works           | crown          | restr | M   | mixed     | n   | n   | treasury, foundry                    | production + institution blend                                           |
| treasury      | seed | arch | yes  | n   | wealth custody (state)               | vault hall      | crown          | restr | M   | inst      | n   | n   | warded_vault, bank                   | storage family, owner-differentiated                                     |
| records_hall  | seed | arch | yes  | n   | records custody (state)              | hall            | civic          | restr | M   | inst      | n   | n   | archive, library                     | knowledge boundary                                                       |
| tolbooth      | hist | cult | yes  | n   | administration + jail + toll         | tower/hall      | burgh          | mixed | M   | cultarch  | n   | n   | town_hall, prison                    | historical multi-use bundle                                              |
| yamen         | cult | cult | comp | y   | magistrate admin + residence + court | walled compound | imperial state | restr | L   | cultarch  | n   | n   | town_hall, courthouse, manor         | office-residence bundle                                                  |
| drum_tower    | cult | cult | yes  | n   | timekeeping/signal                   | tower           | civic          | pub   | M   | form+func | n   | n   | bell_tower, clock_tower              | tower family                                                             |
| gallows       | edge | —    | no   | —   | execution apparatus                  | frame           | civic          | pub   | S   | —         | n   | n   | —                                    | apparatus: below building granularity                                    |
| throne_room   | edge | —    | no   | —   | seat of rule                         | great chamber   | crown          | restr | —   | —         | y   | n   | feast_hall                           | interior ownership confirmed; freestanding counterexample: audience hall |

### 4. Religion (27)

| Id              | Src  | Lvl  | Bnd  | Cmp  | Function                                    | Form                           | Affil       | Acc    | Scl | Sig       | Ctx | Ovl | Ambiguous                              | Notes                                                         |
| --------------- | ---- | ---- | ---- | ---- | ------------------------------------------- | ------------------------------ | ----------- | ------ | --- | --------- | --- | --- | -------------------------------------- | ------------------------------------------------------------- |
| temple          | seed | arch | yes  | n    | congregational worship                      | —                              | faith       | pub    | M   | mixed     | n   | n   | cathedral, shrine, mosque              | umbrella archetype; easy control                              |
| shrine          | seed | arch | ctx  | n    | devotion (small/votive)                     | aedicule                       | faith       | pub    | S   | func      | y   | n   | open_air_shrine, chapel, oracle_shrine | boundary flagship: roadside vs in-temple vs building          |
| monastery       | seed | arch | comp | y    | religious community (worship+dwelling+work) | cloistered compound            | faith order | restr  | C   | inst      | n   | n   | abbey, lamasery, university_college    | composite flagship                                            |
| cathedral       | seed | spec | yes  | n    | worship (episcopal seat)                    | great church                   | faith       | pub    | L   | inst      | n   | n   | temple, basilica                       | institutional _rank_, not use — rank vs type                  |
| chapel          | seed | spec | ctx  | n    | worship (small)                             | small church/room              | faith       | mixed  | S   | func      | y   | n   | shrine, chantry                        | freestanding vs manor wing                                    |
| abbey           | seed | spec | comp | y    | monastic community (abbot-led)              | compound                       | faith       | restr  | C   | inst      | n   | n   | monastery                              | rank distinction again                                        |
| basilica        | cult | cult | yes  | n    | assembly hall → church                      | aisled hall                    | civic→faith | pub    | L   | form      | n   | y   | cathedral, stoa                        | function migrated over history; form persisted                |
| mosque          | cult | cult | yes  | semi | congregational worship                      | courtyard + hall               | faith       | pub    | M   | cultarch  | n   | n   | temple, madrasa                        | manifestation of congregational worship                       |
| synagogue       | cult | cult | yes  | n    | worship + study                             | hall                           | faith       | pub    | M   | cultarch  | n   | n   | temple, schoolhouse                    | study fusion                                                  |
| stupa           | cult | cult | no   | —    | relic veneration                            | solid mound                    | faith       | pub    | M   | form      | n   | n   | pagoda, cairn                          | worship structure that is not a building                      |
| wat             | cult | cult | comp | y    | temple-monastery complex                    | compound                       | faith       | mixed  | C   | cultarch  | n   | n   | monastery, temple                      | —                                                             |
| pagoda          | cult | cult | yes  | n    | relic/veneration tower                      | tiered tower                   | faith       | mixed  | M   | form      | n   | n   | stupa, tower                           | form-first                                                    |
| shinto_shrine   | cult | cult | comp | semi | kami veneration precinct                    | gates + halls                  | faith       | pub    | M   | cultarch  | n   | n   | shrine, marae                          | precinct = site + buildings                                   |
| stave_church    | cult | cult | yes  | n    | worship                                     | timber church                  | faith       | pub    | S   | cultarch  | n   | n   | chapel, temple                         | material/technique manifestation                              |
| hof             | cult | cult | yes  | n    | worship + feasting                          | hall                           | faith+kin   | patron | M   | cultarch  | n   | n   | feast_hall, temple, longhouse          | worship-feast fusion                                          |
| mithraeum       | cult | cult | yes  | n    | mystery worship (initiates)                 | sunken hall                    | cult-group  | restr  | S   | cultarch  | n   | n   | shrine, temple                         | access does classification work here                          |
| ziggurat        | cult | cult | ctx  | —    | temple platform                             | stepped mass + crowning shrine | faith+state | restr  | C   | form      | n   | n   | pyramid, temple                        | mostly solid; same form family as pyramid, different function |
| dzong           | cult | cult | comp | y    | fortress + monastery + administration       | walled compound                | faith+state | restr  | C   | mixed     | n   | n   | monastery, fortress, dwarven_forgehold | triple-use composite flagship                                 |
| lamasery        | cult | cult | comp | y    | monastic complex                            | compound                       | faith       | restr  | C   | cultarch  | n   | n   | monastery, dzong                       | —                                                             |
| hermitage       | hist | arch | yes  | n    | solitary devotion dwelling                  | cell/hut                       | faith       | priv   | S   | func      | n   | n   | anchorhold, cottage                    | —                                                             |
| anchorhold      | hist | spec | ctx  | n    | enclosed recluse devotion                   | attached cell                  | faith       | restr  | S   | func      | y   | n   | hermitage, crypt                       | attached-structure boundary test                              |
| chantry         | hist | spec | ctx  | n    | endowed prayer                              | chapel                         | endowment   | priv   | S   | inst      | y   | n   | chapel                                 | endowment _defines_ the building — inst signal                |
| chapter_house   | hist | —    | ctx  | —    | monastic assembly                           | polygonal hall                 | faith       | restr  | S   | —         | y   | n   | meeting_hall                           | distinct structure inside composite                           |
| cloister        | hist | —    | no   | —    | circulation + contemplation                 | walkway court                  | faith       | restr  | —   | —         | y   | n   | —                                      | component, not building                                       |
| baptistery      | hist | spec | yes  | n    | single rite (baptism)                       | centralized                    | faith       | pub    | S   | func+form | n   | n   | chapel                                 | single-purpose rite building                                  |
| bell_tower      | hist | arch | yes  | n    | bell housing/signal                         | tower                          | faith+civic | restr  | M   | form      | y   | y   | drum_tower, clock_tower, watchtower    | tower family; belfry overload                                 |
| open_air_shrine | edge | —    | no   | —    | devotion at sacred place                    | none                           | faith       | pub    | —   | —         | n   | n   | shrine                                 | site ownership confirmed (`sacred_ground`)                    |

### 5. Military (16)

| Id              | Src  | Lvl  | Bnd | Cmp  | Function                           | Form                | Affil             | Acc   | Scl | Sig       | Ctx | Ovl | Ambiguous                                   | Notes                                          |
| --------------- | ---- | ---- | --- | ---- | ---------------------------------- | ------------------- | ----------------- | ----- | --- | --------- | --- | --- | ------------------------------------------- | ---------------------------------------------- |
| barracks        | seed | arch | yes | n    | garrison housing                   | block               | military          | restr | M   | func      | y   | n   | dormitory, paladin_chapterhouse             | dormitory + military affiliation; easy control |
| armory          | seed | arch | yes | n    | arms storage/maintenance           | secure hall         | military          | restr | M   | func      | y   | n   | arsenal, warehouse, powder_magazine         | storage family, contents-differentiated        |
| command_post    | seed | arch | yes | n    | command/control                    | post/office         | military          | restr | S   | func      | y   | n   | guard_post, checkpoint                      | —                                              |
| training_hall   | seed | arch | yes | n    | martial drill                      | hall                | military          | restr | M   | func      | y   | n   | gymnasium, palaestra, gladiator_school      | training cluster crosses buckets               |
| checkpoint      | seed | arch | yes | n    | movement control                   | post/barrier        | military+civic    | pub   | S   | func      | y   | n   | guard_post, tollhouse, city_gate            | affiliation decides civic-vs-military          |
| arsenal         | hist | arch | yes | semi | arms manufacture + storage         | works               | state             | restr | L   | func      | n   | n   | armory, foundry, factory                    | —                                              |
| powder_magazine | hist | spec | yes | n    | explosive storage                  | isolated vault      | military          | restr | S   | func      | n   | n   | armory, warehouse                           | —                                              |
| blockhouse      | hist | arch | ctx | n    | standalone strongpoint             | small fort          | military          | restr | S   | form+func | n   | n   | keep, guard_post                            | fortification family → structureType boundary  |
| martello_tower  | hist | spec | ctx | n    | coastal gun platform               | round tower         | military          | restr | S   | form+func | n   | n   | watchtower, blockhouse                      | fortification family                           |
| watchtower      | hist | arch | ctx | n    | observation                        | tower               | military+civic    | restr | S   | form+func | y   | n   | bell_tower, beacon_tower, lighthouse        | tower family core member                       |
| beacon_tower    | hist | spec | ctx | n    | fire signaling                     | tower               | military          | restr | S   | form+func | n   | n   | watchtower, lighthouse                      | —                                              |
| gatehouse       | seed | arch | ctx | n    | entry control + defense            | gate building       | military          | restr | M   | form+func | y   | n   | city_gate, tollhouse, keep                  | fortification + passage                        |
| keep            | seed | arch | ctx | n    | last-refuge stronghold + residence | great tower         | military+nobility | restr | L   | mixed     | y   | n   | tower, castle, wizard_tower                 | component-archetype of castle composite        |
| wall_segment    | seed | —    | no  | —    | defense line                       | curtain wall        | military          | —     | —   | —         | n   | n   | —                                           | fortification element confirmed                |
| ribat           | cult | cult | yes | semi | frontier defense + devotion        | fortified convent   | faith+military    | restr | M   | cultarch  | n   | n   | monastery, blockhouse, paladin_chapterhouse | dual-affiliation fusion                        |
| pa              | cult | cult | no  | —    | fortified settlement               | terraced earthworks | kin               | restr | C   | —         | n   | n   | walled_town                                 | settlement, not building — confirmed           |

### 6. Production (29)

| Id             | Src  | Lvl  | Bnd  | Cmp  | Function                    | Form              | Affil      | Acc   | Scl | Sig       | Ctx | Ovl | Ambiguous                              | Notes                                                   |
| -------------- | ---- | ---- | ---- | ---- | --------------------------- | ----------------- | ---------- | ----- | --- | --------- | --- | --- | -------------------------------------- | ------------------------------------------------------- |
| forge          | seed | arch | yes  | n    | metal production            | works             | trade      | priv  | M   | func      | y   | y   | blacksmith, foundry                    | overload: forge = hearth/facility                       |
| foundry        | hist | spec | yes  | n    | metal casting               | works             | trade      | priv  | L   | func      | n   | n   | forge, arsenal                         | —                                                       |
| mill           | seed | arch | yes  | n    | mechanical processing       | mill              | trade      | priv  | M   | func      | n   | y   | windmill, watermill, factory           | overload: mill = machine/building                       |
| windmill       | hist | spec | yes  | n    | wind-powered processing     | tower + sails     | trade      | priv  | M   | form+func | n   | n   | mill, watermill                        | power source as specialization layer                    |
| watermill      | hist | spec | yes  | n    | water-powered processing    | wheel house       | trade      | priv  | M   | form+func | n   | n   | mill, windmill                         | site-bound (watercourse)                                |
| factory        | seed | arch | yes  | n    | mass manufacturing          | works             | trade      | priv  | L   | func      | n   | y   | workshop, mill, trading_factory        | era question; flagship overload                         |
| warehouse      | seed | arch | yes  | n    | goods storage/logistics     | shed/block        | trade      | priv  | L   | func      | y   | n   | granary, godown, armory, smugglers_den | storage family anchor                                   |
| brewery        | seed | arch | yes  | n    | beverage production         | works             | trade      | priv  | M   | func      | n   | n   | distillery, tavern                     | taproom blend known from prior plan                     |
| distillery     | hist | spec | yes  | n    | spirits production          | works             | trade      | priv  | M   | func      | n   | n   | brewery                                | —                                                       |
| slaughterhouse | seed | arch | yes  | n    | animal processing           | works             | trade      | priv  | M   | func      | n   | n   | butcher, tannery                       | —                                                       |
| tannery        | seed | arch | yes  | n    | hide processing             | works (noxious)   | trade      | priv  | M   | func      | n   | n   | dyeworks, slaughterhouse               | —                                                       |
| smokehouse     | seed | spec | yes  | n    | food preservation           | small house       | —          | priv  | S   | func      | y   | n   | icehouse                               | farm vs commercial                                      |
| kiln           | seed | arch | ctx  | n    | firing                      | oven structure    | trade      | priv  | S   | form+func | n   | y   | oast_house, brickworks, crematorium    | apparatus-scale boundary: kiln vs kiln-house            |
| glassworks     | seed | arch | yes  | n    | glass production            | works             | trade      | priv  | M   | func      | n   | n   | kiln, foundry                          | —                                                       |
| brickworks     | hist | arch | yes  | semi | brick production            | yard + kilns      | trade      | priv  | L   | func      | n   | n   | kiln                                   | yard family (works = buildings + ground)                |
| salt_works     | hist | arch | yes  | semi | salt extraction/evaporation | yard              | trade      | priv  | L   | func      | n   | n   | mine?                                  | yard family                                             |
| dyeworks       | hist | spec | yes  | n    | textile dyeing              | works             | trade      | priv  | M   | func      | n   | n   | tannery, fulling_mill                  | —                                                       |
| fulling_mill   | hist | spec | yes  | n    | cloth finishing             | mill              | trade      | priv  | M   | func      | n   | n   | mill, dyeworks                         | —                                                       |
| ropewalk       | hist | spec | yes  | n    | rope making                 | extreme-long shed | trade      | priv  | L   | form+func | n   | n   | sail_loft                              | form dictated by process                                |
| sail_loft      | hist | spec | ctx  | n    | sail making                 | loft floor        | trade      | priv  | M   | func      | y   | n   | ropewalk, workshop                     | loft = upper floor: interior pressure                   |
| cooperage      | hist | spec | yes  | n    | barrel making               | workshop          | trade      | priv  | S   | trade     | n   | n   | workshop, wheelwright                  | trade-named workshop family                             |
| wheelwright    | hist | spec | yes  | n    | wheel making                | workshop          | trade      | priv  | S   | trade     | n   | n   | workshop, cooperage                    | trade-named workshop family                             |
| oast_house     | hist | spec | yes  | n    | hop drying                  | kiln-house        | agri+trade | priv  | S   | form+func | n   | n   | kiln, malt_house                       | —                                                       |
| malt_house     | hist | spec | yes  | n    | grain malting               | works             | trade      | priv  | M   | func      | n   | n   | brewery, oast_house                    | —                                                       |
| printing_press | seed | arch | yes  | n    | print production            | works/shop        | trade      | priv  | S   | func      | n   | y   | scriptorium                            | overload: press = machine/building                      |
| scriptorium    | seed | —    | ctx  | —    | manuscript copying          | writing room      | faith      | restr | S   | —         | y   | n   | printing_press, library                | interior role in monastery; knowledge+production fusion |
| shipyard       | seed | arch | comp | y    | ship construction           | yard + sheds      | trade      | priv  | C   | func      | n   | n   | drydock, boathouse                     | yard family at composite scale                          |
| icehouse       | seed | spec | yes  | n    | cold storage                | earth-domed store | estate     | priv  | S   | func+form | y   | n   | smokehouse, root_cellar                | —                                                       |
| godown         | cult | cult | yes  | n    | trade warehouse             | shed              | trade      | priv  | L   | cultarch  | n   | n   | warehouse                              | pure manifestation case                                 |

### 7. Agriculture (16)

| Id                | Src  | Lvl  | Bnd  | Cmp | Function                              | Form           | Affil       | Acc  | Scl | Sig       | Ctx | Ovl | Ambiguous                       | Notes                                        |
| ----------------- | ---- | ---- | ---- | --- | ------------------------------------- | -------------- | ----------- | ---- | --- | --------- | --- | --- | ------------------------------- | -------------------------------------------- |
| barn              | seed | arch | yes  | n   | farm storage + animal shelter         | large shed     | agri        | priv | M   | func      | y   | n   | warehouse, byre, threshing_barn | farmstead child                              |
| threshing_barn    | hist | spec | yes  | n   | grain processing                      | barn           | agri        | priv | M   | func      | y   | n   | barn                            | —                                            |
| tithe_barn        | hist | spec | yes  | n   | levy grain storage                    | great barn     | faith       | priv | L   | inst      | n   | n   | barn, granary                   | affiliation-defined barn — inst signal       |
| granary           | seed | arch | yes  | n   | grain storage                         | store          | agri+civic  | priv | M   | func      | y   | n   | silo, warehouse, ksar           | civic granary = state storage: owner axis    |
| silo              | seed | spec | yes  | n   | bulk crop storage                     | tower/pit      | agri        | priv | M   | form+func | n   | n   | granary, water_tower            | tower family fringe                          |
| granary_on_stilts | cult | cult | yes  | n   | raised grain store                    | stilted hut    | agri        | priv | S   | cultarch  | n   | n   | granary                         | —                                            |
| byre              | hist | spec | yes  | n   | cattle shelter                        | shed           | agri        | priv | S   | func      | y   | n   | barn, stable                    | husbandry vs boarding-service split          |
| pigsty            | hist | spec | ctx  | n   | pig shelter                           | pen + hut      | agri        | priv | S   | func      | y   | n   | byre                            | apparatus-scale boundary (pen)               |
| sheepfold         | hist | —    | no   | —   | livestock enclosure                   | walled pen     | agri        | —    | —   | —         | y   | n   | pigsty                          | enclosure family = structures, not buildings |
| shearing_shed     | hist | spec | yes  | n   | wool harvest                          | shed           | agri        | priv | M   | func      | n   | n   | barn                            | —                                            |
| dovecote          | hist | spec | yes  | n   | pigeon husbandry                      | tower          | agri+estate | priv | S   | form+func | n   | n   | silo, tower                     | mini tower-family member                     |
| apiary            | seed | spec | ctx  | n   | beekeeping                            | hive stands    | agri        | priv | S   | func      | n   | n   | —                               | apparatus/yard boundary                      |
| greenhouse        | seed | arch | yes  | n   | protected cultivation                 | glazed house   | agri+estate | priv | M   | form+func | n   | n   | orangery                        | —                                            |
| orangery          | hist | spec | yes  | n   | citrus keeping + display              | glazed gallery | nobility    | priv | M   | mixed     | n   | n   | greenhouse, banqueting_house    | status display function — leisure blend      |
| root_cellar       | hist | —    | ctx  | —   | crop cold store                       | earth chamber  | —           | priv | S   | —         | y   | n   | icehouse                        | earthwork/interior pressure                  |
| farmstead         | seed | comp | comp | y   | farm operation (dwelling+barns+yards) | compound       | agri        | priv | C   | func      | n   | n   | manor                           | agriculture composite flagship               |

### 8. Education & knowledge (13)

| Id                 | Src  | Lvl  | Bnd  | Cmp  | Function                              | Form              | Affil             | Acc   | Scl | Sig       | Ctx | Ovl | Ambiguous                                     | Notes                                                                       |
| ------------------ | ---- | ---- | ---- | ---- | ------------------------------------- | ----------------- | ----------------- | ----- | --- | --------- | --- | --- | --------------------------------------------- | --------------------------------------------------------------------------- |
| academy            | seed | arch | yes  | semi | education (advanced)                  | hall/campus       | institution       | restr | L   | inst      | n   | n   | university_college, schoolhouse, mage_college | —                                                                           |
| schoolhouse        | seed | spec | yes  | n    | education (basic local)               | one-room house    | community         | pub   | S   | func      | n   | n   | academy, meeting_hall                         | —                                                                           |
| university_college | hist | spec | comp | y    | education + residence + worship       | quadrangle        | endowment         | restr | C   | inst      | n   | n   | academy, monastery                            | college ≈ secular monastery — structural rhyme                              |
| library            | seed | arch | yes  | n    | knowledge custody + access            | hall              | institution       | pub   | M   | inst      | y   | n   | archive, records_hall                         | flagship context case                                                       |
| archive            | seed | arch | yes  | n    | document custody (restricted)         | stacks            | institution+state | restr | M   | inst      | y   | n   | library, records_hall                         | access differentiates library/archive — counter-evidence to access eviction |
| museum             | seed | arch | yes  | n    | collection display                    | gallery hall      | institution       | pub   | M   | inst      | n   | n   | library, menagerie                            | menagerie = living museum rhyme                                             |
| observatory        | seed | arch | yes  | n    | sky observation                       | domed tower       | institution       | restr | M   | func+form | n   | n   | watchtower, laboratory                        | tower family fringe                                                         |
| madrasa            | cult | cult | yes  | semi | religious education + worship         | courtyard school  | faith             | restr | M   | cultarch  | n   | n   | academy, monastery, synagogue                 | —                                                                           |
| gymnasium          | cult | cult | comp | semi | athletics + education + baths         | palaestra + halls | civic             | pub   | L   | cultarch  | n   | y   | palaestra, academy, thermae                   | ancient multi-use bundle; modern overload                                   |
| palaestra          | cult | cult | ctx  | n    | wrestling/combat training             | colonnaded court  | civic             | pub   | M   | cultarch  | n   | n   | gymnasium, training_hall                      | open court: envelope pressure                                               |
| stoa               | cult | cult | ctx  | n    | sheltered walk + commerce + discourse | colonnade         | civic             | pub   | M   | form      | n   | n   | market, basilica                              | form-first flagship: one form, any function                                 |
| bardic_college     | fant | spec | yes  | n    | performance/lore education            | hall              | institution       | restr | M   | inst      | n   | n   | academy, festhall                             | —                                                                           |
| mage_college       | fant | spec | comp | y    | arcane education + research + housing | campus            | institution       | restr | C   | inst      | n   | n   | academy, university_college, wizard_tower     | —                                                                           |

### 9. Health & social care (12)

| Id               | Src  | Lvl  | Bnd  | Cmp  | Function                 | Form              | Affil             | Acc   | Scl | Sig   | Ctx | Ovl | Ambiguous                                 | Notes                                           |
| ---------------- | ---- | ---- | ---- | ---- | ------------------------ | ----------------- | ----------------- | ----- | --- | ----- | --- | --- | ----------------------------------------- | ----------------------------------------------- |
| hospital         | seed | arch | yes  | semi | inpatient care           | ward halls        | institution+faith | pub   | L   | inst  | n   | y   | hospice, asylum, temple_infirmary         | historical root = charity lodging (hospitality) |
| clinic           | seed | spec | yes  | n    | outpatient care          | practice house    | trade             | pub   | S   | func  | n   | n   | apothecary, barber_surgeon, healers_house | practice-shop family                            |
| hospice          | hist | arch | yes  | n    | terminal/traveler care   | house             | faith             | pub   | M   | inst  | n   | y   | hospital, inn                             | hospitality-health blur flagship                |
| almshouse        | hist | arch | yes  | n    | endowed poor housing     | cell row          | endowment         | restr | M   | inst  | n   | n   | poorhouse, tenement                       | endowment-defined (chantry pattern)             |
| orphanage        | seed | arch | yes  | n    | child custodial care     | house/block       | institution       | restr | M   | inst  | n   | n   | poorhouse, schoolhouse                    | —                                               |
| poorhouse        | seed | arch | yes  | n    | pauper relief housing    | block             | civic             | restr | M   | inst  | n   | n   | workhouse, almshouse                      | state vs endowed — affiliation differentiates   |
| workhouse        | seed | spec | yes  | n    | labor-for-relief         | block + workrooms | civic             | restr | L   | inst  | n   | n   | poorhouse, factory, prison                | carceral blur family                            |
| asylum           | seed | arch | yes  | n    | custodial mental care    | block             | civic+institution | restr | L   | inst  | n   | y   | hospital, prison                          | overload: asylum = refuge/institution           |
| lazaretto        | hist | spec | yes  | semi | quarantine isolation     | isolated compound | civic+port        | restr | M   | mixed | n   | n   | leprosarium, hospital                     | often island-sited: site fusion                 |
| leprosarium      | hist | spec | comp | y    | isolation care community | colony compound   | faith+civic       | restr | C   | inst  | n   | n   | lazaretto, monastery                      | colony = settlement boundary                    |
| temple_infirmary | fant | spec | ctx  | n    | healing within temple    | wing              | faith             | pub   | M   | func  | y   | n   | hospital, temple                          | defining context-sensitivity case               |
| healers_house    | seed | arch | ctx  | n    | dwelling + practice      | house             | —                 | mixed | S   | mixed | y   | n   | clinic, house                             | live/work plant                                 |

### 10. Leisure (20)

| Id               | Src  | Lvl  | Bnd  | Cmp  | Function                            | Form              | Affil          | Acc    | Scl | Sig       | Ctx | Ovl | Ambiguous                              | Notes                                                   |
| ---------------- | ---- | ---- | ---- | ---- | ----------------------------------- | ----------------- | -------------- | ------ | --- | --------- | --- | --- | -------------------------------------- | ------------------------------------------------------- |
| tavern           | seed | arch | yes  | n    | drink + social                      | common-room house | trade          | pub    | S   | func      | n   | n   | inn, festhall, gambling_hall           | easy control                                            |
| theater          | seed | arch | yes  | n    | staged performance                  | auditorium        | trade+civic    | pub    | L   | func      | n   | n   | odeon, amphitheater                    | easy control                                            |
| arena            | seed | arch | yes  | n    | spectacle games                     | oval bowl         | civic+trade    | pub    | L   | func+form | n   | n   | amphitheater, hippodrome, fighting_pit | —                                                       |
| amphitheater     | seed | spec | yes  | n    | open spectacle bowl                 | bowl              | civic          | pub    | L   | form      | n   | n   | arena                                  | near-synonym of arena — discrimination test pair        |
| odeon            | cult | spec | yes  | n    | small roofed performance            | hall              | civic          | pub    | M   | cultarch  | n   | n   | theater                                | —                                                       |
| hippodrome       | cult | spec | ctx  | semi | racing spectacle                    | track + stands    | civic          | pub    | C   | form+func | n   | n   | arena                                  | track is ground, stands are buildings                   |
| gambling_hall    | seed | arch | yes  | n    | gaming venue                        | hall              | trade          | pub    | M   | func      | n   | n   | tavern, festhall, fighting_pit         | —                                                       |
| fighting_pit     | fant | spec | yes  | n    | blood-sport venue                   | pit + gallery     | criminal+trade | patron | S   | func      | n   | n   | arena                                  | legality/affiliation axis                               |
| gladiator_school | seed | spec | yes  | semi | spectacle-combat training + housing | compound (ludus)  | trade          | restr  | M   | func      | n   | n   | training_hall, barracks, academy       | planted cross-bucket case                               |
| menagerie        | seed | arch | yes  | semi | living collection display           | cages + garden    | crown+trade    | pub    | M   | func      | n   | n   | museum, beast_stable                   | living museum rhyme                                     |
| brothel          | seed | arch | yes  | n    | commercial sex                      | house             | trade          | patron | M   | func      | n   | n   | tavern, bathhouse                      | historical stew: bathhouse-brothel drift                |
| opium_den        | seed | spec | yes  | n    | narcotic lounge                     | den               | criminal+trade | patron | S   | func      | n   | n   | gambling_hall, tavern                  | —                                                       |
| festhall         | fant | arch | yes  | n    | public feasting/revelry venue       | great hall        | trade+civic    | pub    | L   | func      | n   | n   | feast_hall, tavern                     | public-venue counterpart of feast_hall                  |
| feast_hall       | seed | arch | ctx  | n    | lordly feasting + court social      | great hall        | nobility       | restr  | L   | func+form | y   | y   | festhall, meeting_hall, longhouse      | hall polysemy flagship; often _the_ hall of a residence |
| banqueting_house | hist | spec | yes  | n    | estate entertainment pavilion       | pavilion          | nobility       | restr  | M   | func      | n   | n   | feast_hall, folly                      | pleasure-architecture family                            |
| teahouse         | cult | cult | yes  | n    | tea service + social ritual         | house             | trade          | pub    | S   | cultarch  | n   | n   | coffeehouse, tavern                    | social-drink triple member                              |
| coffeehouse      | hist | arch | yes  | n    | coffee + discourse                  | room-house        | trade          | pub    | S   | func      | n   | n   | teahouse, tavern                       | beverage as subtype? discrimination question            |
| thermae          | cult | cult | comp | y    | bathing + exercise + social         | vaulted complex   | civic          | pub    | C   | cultarch  | n   | n   | bathhouse, gymnasium                   | bathhouse at composite scale                            |
| hammam           | cult | cult | yes  | n    | steam bathing ritual                | domed baths       | civic+waqf     | pub    | M   | cultarch  | n   | n   | bathhouse, thermae                     | waqf endowment — inst axis again                        |
| onsen            | cult | cult | ctx  | n    | hot-spring bathing + lodging        | inn at spring     | trade          | patron | M   | cultarch  | y   | n   | bathhouse, inn, ryokan                 | site-bound building — location-dependence axis          |

### 11. Transport & travel (16)

| Id                   | Src  | Lvl  | Bnd  | Cmp  | Function                                 | Form              | Affil       | Acc    | Scl | Sig       | Ctx | Ovl | Ambiguous                         | Notes                                         |
| -------------------- | ---- | ---- | ---- | ---- | ---------------------------------------- | ----------------- | ----------- | ------ | --- | --------- | --- | --- | --------------------------------- | --------------------------------------------- |
| inn                  | seed | arch | yes  | n    | traveler lodging + food                  | house + yard      | trade       | pub    | M   | func      | n   | n   | tavern, boarding_house, hospice   | easy control                                  |
| coaching_inn         | seed | spec | yes  | semi | relay lodging + stabling + food          | inn + stable yard | trade       | pub    | M   | func      | n   | n   | inn, caravanserai, post_house     | multi-use flagship from prior planning        |
| caravanserai         | cult | cult | yes  | semi | caravan lodging + goods security + trade | fortified court   | trade+waqf  | pub    | L   | cultarch  | n   | n   | coaching_inn, trading_post, ribat | THE manifestation test case                   |
| ryokan               | cult | cult | yes  | n    | traveler inn (ritualized)                | house             | trade       | patron | M   | cultarch  | n   | n   | inn, onsen                        | manifestation of inn                          |
| post_house           | seed | arch | yes  | n    | courier relay (horses + riders)          | house + stable    | crown       | restr  | S   | mixed     | n   | n   | coaching_inn, waystation          | state courier — affiliation loads             |
| waystation           | seed | arch | yes  | n    | route rest/resupply                      | shelter + yard    | civic+trade | pub    | S   | func      | n   | n   | post_house, inn, portal_chamber   | —                                             |
| ferry_house          | hist | spec | yes  | n    | ferry keeping                            | house at crossing | trade+civic | pub    | S   | func      | y   | n   | tollhouse, bridge_house           | keeper-house family; site-bound               |
| coach_house          | hist | spec | yes  | n    | vehicle storage                          | shed              | estate      | priv   | S   | func      | y   | n   | barn, boathouse                   | vehicle-storage family                        |
| royal_mews           | hist | spec | comp | semi | state stabling + coach + falconry        | compound          | crown       | restr  | L   | inst      | y   | y   | stable, coach_house               | mews overload                                 |
| harbourmaster_office | hist | spec | yes  | n    | port administration                      | office            | civic+port  | pub    | S   | inst      | n   | n   | customs_house                     | —                                             |
| boathouse            | hist | spec | yes  | n    | small-craft shelter                      | shed over water   | —           | priv   | S   | func+form | n   | n   | coach_house                       | —                                             |
| drydock              | hist | —    | no   | —    | ship repair basin                        | basin             | trade       | —      | —   | —         | n   | n   | shipyard                          | infrastructure confirmed                      |
| lighthouse           | seed | arch | yes  | n    | navigation signal + keeper dwelling      | tower + house     | civic       | restr  | M   | form+func | y   | n   | watchtower, beacon_tower          | tower family + keeper-house family            |
| bridge_house         | seed | spec | ctx  | n    | bridge keeping/toll                      | house on bridge   | civic       | pub    | S   | func      | y   | n   | tollhouse, gatehouse              | attached to infrastructure                    |
| covered_bridge       | edge | —    | ctx  | —    | passage                                  | roofed span       | civic       | pub    | M   | form      | n   | n   | bridge, gatehouse                 | infrastructure-with-envelope hybrid confirmed |
| airship_dock         | fant | spec | ctx  | n    | mooring + embarkation                    | tower/platform    | civic+trade | pub    | L   | func+form | n   | n   | lighthouse, harbourmaster_office  | magical-infrastructure family                 |

### 12. Funerary (13)

| Id            | Src  | Lvl  | Bnd | Cmp | Function                    | Form                | Affil        | Acc   | Scl | Sig           | Ctx | Ovl | Ambiguous                  | Notes                                                                          |
| ------------- | ---- | ---- | --- | --- | --------------------------- | ------------------- | ------------ | ----- | --- | ------------- | --- | --- | -------------------------- | ------------------------------------------------------------------------------ |
| mausoleum     | seed | arch | yes | n   | monumental interment        | tomb-house          | family+crown | restr | M   | func+form     | n   | n   | tomb, memorial             | occupied by the dead — occupancy test bends                                    |
| tomb          | seed | arch | ctx | n   | interment chamber           | chamber             | family       | restr | S   | func          | y   | n   | mausoleum, crypt, barrow   | freestanding vs within church/necropolis                                       |
| crypt         | seed | —    | no  | —   | below-church interment      | vaulted undercroft  | faith        | restr | —   | —             | y   | n   | tomb                       | interior ownership confirmed                                                   |
| catacombs     | seed | —    | no  | —   | subterranean burial network | tunnel network      | faith+civic  | restr | —   | —             | n   | n   | tomb                       | interior-complex/site, not building                                            |
| ossuary       | hist | spec | ctx | n   | bone custody                | chamber/small house | faith        | restr | S   | func          | y   | n   | charnel_house, crypt       | chapel ossuary vs standalone                                                   |
| charnel_house | seed | arch | yes | n   | bone/corpse holding         | house               | faith+civic  | restr | S   | func          | n   | n   | ossuary, mortuary          | —                                                                              |
| mortuary      | seed | arch | yes | n   | body preparation            | service house       | trade+civic  | priv  | S   | func          | n   | n   | charnel_house, crematorium | death-care as trade                                                            |
| crematorium   | seed | arch | yes | n   | cremation                   | works + chapel      | civic+trade  | restr | M   | func          | n   | n   | mortuary, kiln             | production-form rhyme with kiln                                                |
| barrow        | edge | —    | no  | —   | burial mound                | earthwork mound     | kin          | —     | —   | —             | n   | n   | cairn, tomb                | earthwork confirmed                                                            |
| cairn         | edge | —    | no  | —   | memorial pile               | stone pile          | kin          | —     | —   | —             | n   | n   | barrow, memorial           | monument confirmed                                                             |
| mastaba       | cult | cult | yes | n   | tomb superstructure         | bench mass          | dynasty      | restr | M   | cultarch+form | n   | n   | tomb, mausoleum, pyramid   | —                                                                              |
| pyramid       | cult | cult | ctx | —   | monumental tomb             | pyramid mass        | crown        | restr | C   | form          | n   | n   | ziggurat, mausoleum        | ziggurat/pyramid: same form family, different function — independence evidence |
| tholos        | cult | cult | yes | n   | vaulted tomb chamber        | beehive vault       | dynasty      | restr | S   | cultarch+form | n   | n   | tomb                       | —                                                                              |

### 13. Magical & fantasy (28)

| Id                   | Src  | Lvl  | Bnd  | Cmp  | Function                           | Form              | Affil            | Acc    | Scl | Sig      | Ctx | Ovl | Ambiguous                            | Notes                                                          |
| -------------------- | ---- | ---- | ---- | ---- | ---------------------------------- | ----------------- | ---------------- | ------ | --- | -------- | --- | --- | ------------------------------------ | -------------------------------------------------------------- |
| wizard_tower         | fant | arch | yes  | n    | residence + research + defense     | tower             | individual       | restr  | M   | mixed    | n   | n   | keep, observatory, laboratory        | form-use conflict flagship                                     |
| laboratory           | fant | arch | ctx  | n    | experimental workspace             | workroom          | —                | restr  | S   | func     | y   | n   | workshop, golem_workshop             | wing-of-college vs standalone                                  |
| sanctum              | fant | arch | ctx  | n    | private retreat + warded work      | chamber/suite     | individual       | restr  | S   | func     | y   | n   | laboratory, ritual_chamber           | usually interior of tower/manor                                |
| summoning_hall       | fant | spec | yes  | n    | ritual venue (summoning)           | warded hall       | order            | restr  | M   | func     | n   | n   | ritual_chamber, temple               | —                                                              |
| ritual_chamber       | fant | —    | no   | —    | rite space                         | chamber           | —                | restr  | —   | —        | y   | n   | summoning_hall                       | interior ownership confirmed                                   |
| portal_chamber       | fant | spec | ctx  | n    | fixed gate housing                 | rotunda/chamber   | —                | restr  | S   | func     | y   | n   | waystation, gatehouse                | magical infrastructure — rhymes with keeper-house family       |
| divination_parlor    | fant | spec | yes  | n    | fortune-telling practice           | parlor shop       | trade            | pub    | S   | mixed    | n   | n   | clinic, shop, oracle_shrine          | commercial divination                                          |
| magic_shop           | fant | spec | yes  | n    | arcane retail                      | shop              | trade            | pub    | S   | trade    | n   | n   | shop, potion_shop                    | craft-retail family extension                                  |
| potion_shop          | fant | spec | yes  | n    | potion retail + brewing            | shop              | trade            | pub    | S   | trade    | n   | n   | apothecary, magic_shop               | fantasy manifestation of apothecary                            |
| golem_workshop       | fant | spec | yes  | n    | construct fabrication              | works             | trade+individual | restr  | M   | func     | n   | n   | workshop, foundry, artificer_atelier | —                                                              |
| artificer_atelier    | fant | spec | yes  | n    | magical device craft               | studio            | trade            | patron | S   | mixed    | n   | n   | golem_workshop, jeweler              | fine-craft rhyme with jeweler                                  |
| enchanting_hall      | fant | spec | yes  | n    | item enchantment service           | hall              | guild            | patron | M   | func     | n   | n   | workshop, summoning_hall             | —                                                              |
| adventurers_guild    | fant | arch | yes  | semi | quest brokerage + social + records | hall              | guild            | pub    | M   | inst     | n   | n   | guildhall, tavern, bounty_office     | manifestation of guildhall                                     |
| bounty_office        | fant | spec | yes  | n    | contract brokerage                 | office            | state+guild      | pub    | S   | func     | n   | n   | adventurers_guild, records_hall      | —                                                              |
| paladin_chapterhouse | fant | spec | yes  | semi | order housing + worship + training | house             | faith+military   | restr  | M   | inst     | n   | n   | monastery, barracks, ribat           | ribat rhyme across cultures                                    |
| ranger_station       | fant | spec | yes  | n    | wilderness watch + waypoint        | cabin/post        | order+state      | restr  | S   | func     | n   | n   | guard_post, waystation               | —                                                              |
| thieves_den          | fant | —    | ctx  | —    | covert base (varied uses)          | hidden space      | criminal         | restr  | S   | mixed    | n   | n   | smugglers_den, safe_house            | affiliation-first role overlay                                 |
| smugglers_den        | fant | spec | ctx  | n    | contraband storage + covert access | cellar/cove store | criminal         | restr  | S   | mixed    | n   | n   | thieves_den, warehouse               | criminal mirror of warehouse                                   |
| mage_prison          | fant | spec | yes  | n    | arcane containment                 | warded block      | state            | restr  | M   | func     | n   | n   | prison, warded_vault                 | —                                                              |
| warded_vault         | fant | spec | ctx  | n    | secured storage (magical)          | vault             | —                | restr  | S   | func     | y   | n   | treasury, mage_prison                | vault usually interior; storage family                         |
| planar_embassy       | fant | spec | yes  | n    | extraplanar diplomacy              | compound          | foreign plane    | restr  | M   | inst     | n   | n   | embassy                              | pure manifestation of embassy                                  |
| oracle_shrine        | fant | spec | yes  | n    | prophecy rite                      | shrine            | faith            | pub    | S   | func     | n   | n   | shrine, divination_parlor            | sacred vs commercial divination pair                           |
| dragon_roost         | fant | —    | ctx  | —    | creature lair                      | peak/cavern aerie | creature         | restr  | L   | —        | n   | n   | griffon_aerie                        | creature dwelling: site vs built                               |
| griffon_aerie        | fant | spec | yes  | n    | flying-mount stabling              | tower-top stalls  | military+trade   | restr  | M   | func     | n   | n   | stable, dragon_roost                 | vertical manifestation of stable                               |
| beast_stable         | fant | spec | yes  | n    | monster stabling                   | reinforced stalls | trade+military   | restr  | M   | func     | n   | n   | stable, kennel, menagerie            | —                                                              |
| dwarven_forgehold    | fant | cult | comp | y    | forge + fortress + settlement      | carved hold       | dwarven clan     | restr  | C   | cultarch | n   | n   | dzong, citadel, foundry              | dzong rhyme: fortress-institution composite                    |
| elven_tree_dwelling  | fant | cult | ctx  | n    | dwelling (grown)                   | living tree       | elven            | priv   | S   | cultarch | n   | n   | house                                | grown-vs-built boundary                                        |
| haunted_manor        | fant | —    | yes  | semi | dwelling (abandoned/haunted)       | great house       | —                | —      | L   | —        | n   | n   | manor                                | condition overlay confirmed: type = manor, haunted = condition |

### 14. Temporary & mobile (14)

| Id                 | Src  | Lvl  | Bnd | Cmp | Function                  | Form                    | Affil             | Acc   | Scl | Sig      | Ctx | Ovl | Ambiguous         | Notes                                                       |
| ------------------ | ---- | ---- | --- | --- | ------------------------- | ----------------------- | ----------------- | ----- | --- | -------- | --- | --- | ----------------- | ----------------------------------------------------------- |
| tent_pavilion      | edge | —    | ctx | —   | field assembly/court      | great tent              | nobility+military | restr | M   | —        | n   | n   | banqueting_house  | permanence axis plant; function rhymes with permanent forms |
| camp               | seed | —    | no  | —   | temporary occupation      | tent cluster            | —                 | —     | —   | —        | n   | n   | war_camp          | site ownership confirmed (`camp` siteType)                  |
| war_camp           | fant | —    | no  | —   | military field base       | fortified tent compound | military          | restr | C   | —        | n   | n   | camp, fortress    | temporary fortress — site composite                         |
| yurt               | cult | cult | ctx | n   | dwelling (portable)       | felt round tent         | nomad kin         | priv  | S   | cultarch | n   | n   | tipi, roundhouse  | portable dwelling family                                    |
| tipi               | cult | cult | ctx | n   | dwelling (portable)       | hide cone               | nomad kin         | priv  | S   | cultarch | n   | n   | yurt              | —                                                           |
| igloo              | cult | cult | ctx | n   | dwelling (seasonal, snow) | snow dome               | kin               | priv  | S   | cultarch | n   | n   | —                 | material/permanence axis                                    |
| sweat_lodge        | cult | cult | ctx | n   | ceremonial heat rite      | lodge hut               | kin+faith         | restr | S   | cultarch | n   | n   | bathhouse, hammam | bathing-rite family across permanence                       |
| vardo_wagon        | edge | —    | no  | —   | dwelling (vehicular)      | wagon                   | —                 | priv  | S   | —        | n   | n   | houseboat         | vehicle-dwelling confirmed                                  |
| houseboat          | edge | —    | ctx | —   | dwelling (floating)       | boat                    | —                 | priv  | S   | —        | n   | n   | ship, vardo_wagon | vessel-dwelling: `vessel` structureType pressure            |
| ship               | seed | —    | no  | —   | vessel                    | hull                    | —                 | —     | —   | —        | n   | n   | houseboat         | owned by `vessel` structureType — confirmed                 |
| airship            | seed | —    | no  | —   | flying vessel             | hull                    | —                 | —     | —   | —        | n   | n   | ship              | —                                                           |
| shipwreck_dwelling | edge | —    | ctx | —   | dwelling in wreck         | grounded hull           | —                 | priv  | S   | —        | n   | n   | houseboat         | conversion axis: buildings born from non-buildings          |
| market_stall       | edge | —    | no  | —   | retail micro-point        | booth                   | trade             | pub   | —   | —        | n   | n   | shop, market      | granularity floor confirmed                                 |
| siege_tower        | edge | —    | no  | —   | assault engine            | mobile tower            | military          | —     | —   | —        | n   | n   | watchtower        | vehicle/engine; form rhymes with tower family               |

### 15. Monumental & composite (24)

| Id             | Src  | Lvl  | Bnd  | Cmp  | Function                               | Form                   | Affil          | Acc   | Scl | Sig       | Ctx | Ovl | Ambiguous                                  | Notes                                                                     |
| -------------- | ---- | ---- | ---- | ---- | -------------------------------------- | ---------------------- | -------------- | ----- | --- | --------- | --- | --- | ------------------------------------------ | ------------------------------------------------------------------------- |
| fortress       | seed | comp | comp | y    | military stronghold complex            | walled complex         | military       | restr | C   | func      | n   | n   | castle, citadel                            | composite control                                                         |
| castle         | seed | comp | comp | y    | fortified residence + garrison + court | walled complex         | nobility       | restr | C   | mixed     | n   | n   | fortress, palace, keep                     | —                                                                         |
| citadel        | hist | comp | comp | y    | urban last-refuge stronghold           | walled height          | state          | restr | C   | func      | n   | n   | fortress, kasbah                           | —                                                                         |
| walled_town    | seed | —    | no   | —    | fortified settlement                   | walls + town           | civic          | —     | C   | —         | n   | n   | pa, castle                                 | settlement confirmed                                                      |
| tower          | seed | arch | ctx  | n    | (varies by occupant)                   | tower                  | —              | ?     | M   | form      | n   | n   | watchtower, bell_tower, keep, wizard_tower | pure-form flagship: form says nothing about use                           |
| clock_tower    | hist | spec | yes  | n    | public timekeeping                     | tower                  | civic          | pub   | M   | form+func | n   | n   | bell_tower, drum_tower                     | clock/bell/drum: three cultures, one slot                                 |
| obelisk        | seed | —    | no   | —    | commemoration                          | monolith               | state          | —     | —   | —         | n   | n   | statue, memorial                           | monument confirmed                                                        |
| statue         | seed | —    | no   | —    | commemoration/veneration               | figure                 | —              | —     | —   | —         | n   | n   | obelisk, moai                              | —                                                                         |
| memorial       | seed | —    | ctx  | —    | commemoration                          | varies                 | —              | pub   | —   | —         | n   | n   | statue, mausoleum                          | memorial _hall_ variant would be a building                               |
| triumphal_arch | cult | —    | no   | —    | victory commemoration                  | arch-gate              | state          | pub   | —   | —         | n   | n   | city_gate                                  | monument vs fortification pair                                            |
| sphinx         | cult | —    | no   | —    | guardian monument                      | figural colossus       | crown          | —     | —   | —         | n   | n   | statue                                     | —                                                                         |
| moai           | cult | cult | no   | —    | ancestor commemoration                 | figural monolith       | kin            | —     | —   | —         | n   | n   | statue                                     | —                                                                         |
| nuraghe        | cult | cult | ctx  | semi | contested (dwelling? fort? rite?)      | drystone tower complex | kin            | restr | M   | form      | n   | n   | broch, tower                               | purpose unknown → coded by form; archaeology's own classification problem |
| kasbah         | cult | cult | comp | y    | fortified residence quarter            | walled quarter         | ruler+kin      | restr | C   | cultarch  | n   | n   | citadel, castle                            | —                                                                         |
| ksar           | cult | cult | comp | y    | fortified collective granary village   | walled village         | kin collective | restr | C   | cultarch  | n   | n   | granary, walled_town                       | storage+defense+settlement fusion                                         |
| marae          | cult | cult | no   | —    | ceremonial court complex               | court + buildings      | kin+faith      | restr | C   | —         | n   | n   | shinto_shrine                              | site-complex; precinct rhyme                                              |
| folly          | hist | arch | yes  | n    | ornament/status display only           | sham ruin/tower        | nobility       | priv  | S   | form      | n   | n   | tower, banqueting_house                    | form-without-function flagship confirmed                                  |
| aqueduct       | seed | —    | no   | —    | water conveyance                       | arched channel         | civic          | —     | —   | —         | n   | n   | bridge                                     | infrastructure confirmed                                                  |
| bridge         | edge | —    | no   | —    | span crossing                          | span                   | civic          | pub   | —   | —         | n   | n   | covered_bridge, aqueduct                   | infrastructure confirmed                                                  |
| fountain       | edge | —    | no   | —    | water supply + display                 | basin monument         | civic          | pub   | —   | —         | n   | n   | well_house, memorial                       | —                                                                         |
| well_house     | hist | spec | yes  | n    | water access shelter                   | small house            | civic          | pub   | S   | func      | n   | n   | fountain                                   | keeper-house family fringe                                                |
| water_tower    | hist | spec | ctx  | n    | elevated water storage                 | tower + tank           | civic          | restr | M   | form+func | n   | n   | silo, tower                                | infrastructure tower — tower family again                                 |
| city_gate      | edge | —    | ctx  | —    | urban entry control                    | gate building          | civic+military | pub   | M   | form+func | n   | n   | gatehouse, triumphal_arch, tollhouse       | fortification + passage                                                   |
| palace_complex | edge | comp | comp | y    | court + residence + admin + ceremony   | compound of compounds  | crown          | restr | C   | mixed     | n   | n   | palace, citadel, yamen                     | granularity ceiling: composite of composites                              |

## Phase 2 observations (input to Phase 3)

Cross-cutting patterns that emerged during coding — candidate findings, to be
verified systematically in Phase 3:

1. **Tower family** — one form, a dozen functions: watchtower, bell_tower,
   drum_tower, clock_tower, lighthouse, beacon_tower, keep, wizard_tower,
   silo, dovecote, water_tower, observatory, pagoda. Strongest single piece of
   evidence that form and function are independent dimensions, and that form
   is likely owned by `structureType`/a facet, not by building classification.
2. **Storage family** — warehouse, granary, silo, treasury, armory,
   warded*vault, records_hall, archive, icehouse, godown, smugglers_den:
   function ("storage") is constant; the \_differentiators are contents, owner
   /affiliation, and access*. A single primary-use dimension under-determines
   this entire family.
3. **Manifestation clusters confirmed** — bathing (bathhouse / thermae /
   hammam / onsen / sweat*lodge), civic towers (clock/bell/drum), apothecary /
   potion_shop, embassy / planar_embassy, warehouse / godown, guildhall /
   adventurers_guild, inn / ryokan / caravanserai, monastery / ribat /
   paladin_chapterhouse / dzong / dwarven_forgehold. Cultural and fantasy
   forms are overwhelmingly \_manifestations of shared archetypes*, not new
   concepts — strong support for an archetype layer with cultural skinning.
4. **Institution = charter** — chantry, tithe_barn, almshouse (vs poorhouse),
   hammam (waqf), university_college, guildhall: the `inst` signal
   consistently means "an endowment/charter/office defines this building."
   Affiliation may not fully evict to organizations; a residue
   ("institutionally constituted") looks classification-relevant.
5. **Access is not pure occupancy policy** — library vs archive, festhall vs
   feast_hall, mithraeum: access differentiates otherwise-identical functions.
   Counter-evidence to blanket eviction; Phase 3 must weigh it seriously.
6. **Keeper-house family** — lighthouse, tollhouse, bridge*house, ferry_house,
   gatehouse, well_house (+ portal_chamber as its magical mirror): dwellings/
   posts \_bound to infrastructure*, inherently site-bound.
7. **Live/work is the historical norm** — machiya, insula, blacksmith, bakery,
   healers_house, farmhouse, counting_house. Any model assuming one use per
   building misfiles the majority of pre-modern commerce.
8. **Quality/era axes masquerading as types** — hovel/cottage/house,
   tenement/apartment_building, flophouse/boarding_house: value and era
   judgments, not categories.
9. **Role overlays, not types** — safe_house, thieves_den, haunted_manor
   (condition): any building can host these. Confirms the prior
   "condition/affiliation is not type" rules.
10. **Composite is a gradient** — semi (coaching_inn, trading_post) → comp
    (monastery, yamen) → composite-of-composites (palace_complex). A binary
    flag strains at `semi`; Phase 3 should test a three-value coding.
11. **Fortification family codes `ctx` wholesale** — blockhouse, martello,
    watchtower, gatehouse, keep, beacon_tower. The building-vs-`fortification`
    `structureType` boundary needs an explicit rule, not per-concept
    judgment.
12. **Synonym pairs for discrimination testing** — arena/amphitheater,
    festhall/feast_hall, moot_hall/meeting_hall, poorhouse/almshouse: if a
    model assigns them different classifications, it is over-discriminating.
13. **Form is the fallback when function is unknowable** — nuraghe, broch:
    archaeology classifies contested-purpose structures by form. The model
    must allow form-coded entries with unset function.
14. **Boundary tally** — `no`: 31, `ctx`: 55, `comp`: 23 — 109 of 300 (36%).
    Over a third of a deliberately adversarial corpus is not a plain single
    building; the boundary and composite reports (Phase 3) have real work to
    do.

## Phase 3 — Analysis reports (v0.3)

### Artifact 1: Dimension report

Verdicts per dimension, from the coverage / discrimination / independence /
stability / ownership tests applied to the v0.2 matrix:

**Stable dimensions (schema-relevant):**

| Dimension            | Verdict                                                                                                                                                    | Evidence                                                                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary function** | **Core dimension.** High coverage (~90% of `Bnd: yes/ctx` entries), high discrimination, independent of form (tower family), stable across coding batches. | Free-form values self-clustered into ~20 recurring **function families** (below) without a controlled vocabulary — the strongest possible stability signal.                                                                                       |
| **Concept level**    | Stable as _structure_, not as a field. The archetype / specialization / cultural-form layering held for all 300 entries.                                   | 41 `cult` entries resolved overwhelmingly as manifestations of archetypes (observation 3); `spec` entries consistently refine exactly one archetype. Implies an archetype layer with specializations — not a flat enum and not per-culture types. |
| **Composite**        | Stable with the 3-value coding (`n`/`semi`/`y`); binary would have failed.                                                                                 | `semi` (coaching_inn, trading_post, mosque) stays one authored location; `y` (monastery, yamen) decomposes via hierarchy children. Classification handles `semi`; hierarchy handles `y`.                                                          |
| **Boundary**         | Stable, full coverage; realized as _ownership rules_, not a stored field.                                                                                  | Feeds the boundary report rules below.                                                                                                                                                                                                            |

**Weak / redundant dimensions (evict or demote):**

| Dimension             | Verdict                                                                                                                                                 | Evidence                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scale**             | Evict. Derivable from function + composite in ~95% of rows; only does work at the granularity floor and ceiling, which the boundary rules cover.        | silo vs granary, odeon vs theater — scale never changes the classification, only the instance.                                                                |
| **Access**            | Demote, do not discard. Mostly derivable, **but** identity-bearing inside specific function families (library/archive, festhall/feast_hall, mithraeum). | Resolution: access survives as an **archetype-splitting criterion** (library and archive are distinct archetypes _because_ of access), not as a schema field. |
| **Term overloaded**   | Not schema. 13 confirmed overloads are authoring-copy work (labels/descriptions), exactly as hypothesized.                                              | factory, bank, hall, forge, mill, hospice…                                                                                                                    |
| **Context-sensitive** | Not schema. The ~50 `Ctx: y` rows resolve through parent context at authoring time, never through classification.                                       | stable-in-inn-yard vs standalone; chapel wing vs freestanding. Observed, not stored — consistent with the hierarchy-stays-out rule.                           |

**Dimensions owned elsewhere (eviction confirmed with one residue):**

| Dimension                     | Owner                                                                                           | Residue                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Form**                      | `structureType` (fortification, infrastructure, monument, vessel) + a possible finer form facet | One allowance required: **form-coded entries with unset function** (nuraghe, broch, tower) — form is the fallback when function is unknowable.                                                                                                                                                                           |
| **Affiliation**               | Organizations / future `organizationId` links                                                   | One residue: **charter-constitution** (chantry, tithe_barn, almshouse, waqf hammam, guildhall, university_college). "An endowment/charter/office defines this building" behaves like function, not like ownership. Candidate: an `institutional` quality inside the function dimension rather than an affiliation field. |
| **Condition / role overlays** | Location status / description / (future) org links                                              | haunted_manor, safe_house, thieves_den confirmed as overlays on base concepts.                                                                                                                                                                                                                                           |

**Emergent function families** (from free coding — the raw material for any
model's function axis; a curated pass should land 12–18):

```text
dwelling · lodging · food-drink social · retail · craft service ·
production/processing · storage · finance · bathing/body ritual ·
worship/rite · cloistered community · administration ·
adjudication/custody · assembly · education/knowledge · care ·
defense/watch · spectacle/performance · animal boarding/husbandry ·
transport support · funerary · display/ornament
```

### Artifact 2: Boundary report

**Not-building (31)** — every case resolved to an existing owner; no new kind
needed:

| Owner                            | Cases                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `siteType`                       | open_air_shrine (sacred_ground), camp, war_camp, marae                                                               |
| `structureType: fortification`   | wall_segment                                                                                                         |
| `structureType: vessel`          | ship, airship                                                                                                        |
| `structureType: infrastructure`  | aqueduct, bridge, fountain, drydock                                                                                  |
| `structureType: monument`        | stupa, obelisk, statue, sphinx, moai, triumphal_arch, barrow, cairn                                                  |
| Settlement kind                  | walled_town, pa                                                                                                      |
| Interior kind                    | throne_room, crypt, catacombs, cloister, ritual_chamber                                                              |
| **Granularity floor** (new rule) | gallows, market_stall, sheepfold, siege_tower, vardo_wagon — apparatus/furniture/vehicles below location granularity |

**Context-dependent (55)** — eight recurring patterns, each yielding a rule:

| Pattern                 | Cases (sample)                                                                                    | Rule                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fortification family    | blockhouse, martello_tower, watchtower, gatehouse, keep, beacon_tower                             | Defensive-form structures default to `structureType: fortification`; building classification applies only to clearly building-form members (barracks, armory) |
| Interior-default        | sanctum, warded_vault, feast_hall, laboratory, sail_loft, scriptorium, root_cellar, tomb, ossuary | Default to interior of a parent; freestanding instances classify as buildings                                                                                 |
| Infrastructure-attached | anchorhold, bridge_house, city_gate, covered_bridge, water_tower, airship_dock                    | Hybrid rule: the envelope classifies as building only when separately visitable; otherwise stays with the infrastructure                                      |
| Permanence/material     | yurt, tipi, igloo, tent_pavilion, sweat_lodge, hobbit_burrow, elven_tree_dwelling                 | **Permanence and material are orthogonal to classification** — a dwelling is a dwelling in felt, snow, or stone                                               |
| Conversion              | houseboat, shipwreck_dwelling                                                                     | Use-classification may attach to non-building shells; vessel/building boundary follows current use                                                            |
| Role overlays           | safe_house, thieves_den, smugglers_den, dragon_roost                                              | Not types — base concept + secrecy/occupant overlay                                                                                                           |
| Apparatus-scale         | kiln, pigsty, apiary                                                                              | Granularity floor: the _house_ around the apparatus is the building (kiln-house yes, kiln no)                                                                 |
| Open-court forms        | palaestra, stoa, hippodrome                                                                       | Partial envelope acceptable; classify by function, form facet carries "court/colonnade"                                                                       |
| Unknown function        | nuraghe, ziggurat, pyramid, tower, memorial                                                       | Form-coded with unset function is a legal state                                                                                                               |

**Composite (23)** — the gradient resolves cleanly:

- `semi` (coaching_inn, trading_post, mosque, shipyard, royal_mews,
  gladiator_school…): **one authored location**, blended function; multi-use
  strategy (children/secondary uses) applies.
- `y` (monastery, yamen, thermae, university*college, farmstead, castle,
  ksar…): **a location subtree** — the composite is the parent (structure or
  site), members are children. Classification of the composite itself should
  be \_allowed but light* (dzong: "fortress-monastery") with detail pushed to
  children.
- Ceiling case (palace_complex): composites of composites are plain hierarchy
  — no special schema.

### Artifact 3: Stress set (43 concepts — corpus FROZEN)

Census note: raw ambiguity degree overcounts difficulty — hub archetypes
(shop ~10 edges, temple ~10, workshop ~10) collect _specialization_ edges
that are hierarchy, not confusion. The stress stratum selects for
**cross-family confusion edges** instead.

**Stratum A — high ambiguity (26):**

```text
blacksmith · forge · workshop · stable · warehouse · granary · archive ·
library · guildhall · inn · coaching_inn · hospice · bathhouse · feast_hall ·
festhall · monastery · university_college · keep · watchtower · wizard_tower ·
palace · shrine · apothecary · gladiator_school · checkpoint · mint
```

**Stratum B — easy controls (8):** house · tavern · courthouse · barracks ·
temple · shop · theater · town_hall — a model that complicates these fails
regardless of stratum A performance.

**Stratum C — culturally diverse (9):** caravanserai · hammam · dzong ·
machiya · ksar · yamen · potion_shop · nuraghe · sweat_lodge — each carries a
manifestation-vs-distinct-concept question or a boundary axis (permanence,
unknown function, live/work).

**Corpus freeze:** v0.3 is frozen at 300 concepts. No additions or recoding
until the Phase 5 post-test gaps pass. Model testing (Phase 4) runs against
stratum A+B+C plus 20 random non-stress entries.

## Phase 4 — Model testing (v0.4)

### Test set

63 concepts: stress strata A (26) + B (8) + C (9), plus 20 random non-stress
entries spread across all buckets:

```text
cottage · tenement · siheyuan · bakery · jeweler · moneylender · tolbooth ·
drum_tower · synagogue · baptistery · powder_magazine · ropewalk · dovecote ·
farmstead · madrasa · poorhouse · menagerie · onsen · boathouse · crematorium
```

Reproducibility method note: a true recode-after-gap by the same author is
deferred to Phase 5 validation (before any schema commit). Scoring here uses
**judgment-call counts** as the proxy — concepts where the classifier wavered
between two placements during the pass.

### Model definitions as tested

- **A — primary use, two-level**: the shipped 10-type / 37-subtype nesting;
  every subtype belongs to exactly one type.
- **B — function + archetype + specialization**: author supplies a function
  family (~16 curated) _and_ an optional archetype id from a flat registry,
  plus optional specialization; archetype floats free of function nesting.
- **C — orthogonal facets**: function family × form facet; no archetype ids.
- **D — flat archetype enum**: single archetype field; function/form live as
  registry metadata on each entry.

### Head-to-head on the hardest cases

| Concept      | A                                                        | B                               | C                                               | D                                   |
| ------------ | -------------------------------------------------------- | ------------------------------- | ----------------------------------------------- | ----------------------------------- |
| blacksmith   | service/blacksmith                                       | craft-service + blacksmith      | craft-service × shop — **identity lost**        | blacksmith                          |
| forge        | industrial/forge                                         | production + forge              | production × works                              | forge                               |
| archive      | **no home** (not a Model A subtype; misfiled to library) | knowledge + archive             | knowledge × hall — **collapses into library**   | archive                             |
| guildhall    | institutional/guildhall (by fiat)                        | assembly + guildhall            | assembly × hall — collapses into meeting_hall   | guildhall                           |
| hospice      | institutional vs hospitality **coin flip**               | care + hospice (waver: lodging) | care × house                                    | hospice                             |
| feast_hall   | **no home** (entertainment? civic?)                      | assembly + feast_hall           | assembly × hall — third collapse into same cell | feast_hall                          |
| dzong        | religious OR military — **forced single choice**         | blend + dzong                   | **inexpressible blend**                         | dzong                               |
| keep         | outside model (fortification) — unset                    | defense + keep                  | defense × tower                                 | keep (fortification rule applies)   |
| wizard_tower | residential?? — misfile-prone                            | mixed + wizard_tower            | **fails** (no cell fits)                        | wizard_tower                        |
| machiya      | retail vs residential coin flip                          | dwelling+retail + machiya       | fails                                           | machiya                             |
| caravanserai | hospitality/inn — culture collapsed silently             | lodging + caravanserai          | lodging × court                                 | caravanserai (manifestationOf: inn) |
| checkpoint   | civic vs military by fiat                                | defense/watch + checkpoint      | defense/watch × post                            | checkpoint                          |
| nuraghe      | unset                                                    | archetype without function      | unset × tower                                   | nuraghe (function: unknown)         |

### Per-model results (63 concepts)

| Metric (weight order)                   | A                                   | B                                                                   | C                                                                         | D                                      |
| --------------------------------------- | ----------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| Misfiles / forced wrong placements      | **14**                              | 3                                                                   | 11 (mostly identity collapses)                                            | 5 (instance rigidity)                  |
| Unset rate                              | 5                                   | 2                                                                   | 2                                                                         | 2                                      |
| Authoring clarity (door test)           | two questions, weak type boundaries | function question is abstract                                       | **two abstract questions — worst**                                        | **one question: "what is it?" — best** |
| Judgment calls (reproducibility proxy)  | 17                                  | 6                                                                   | 12                                                                        | **4**                                  |
| Easy-controls regression                | none                                | none                                                                | **yes** — tavern requires "food-drink-social × house" instead of "tavern" | none                                   |
| Schema/UI complexity                    | low (shipped)                       | two enums + optional field                                          | low-moderate                                                              | registry-backed enum                   |
| Migration cost _(recorded, unweighted)_ | none                                | moderate — types→families, subtypes→archetypes is nearly mechanical | high                                                                      | moderate (same mapping as B)           |

**Model A** fails structurally, not incidentally: single-parent nesting is the
direct cause of the storage-family scatter (warehouse→industrial,
granary→industrial, treasury→civic, archive→nowhere, mint→civic — "all
storage" is unqueryable), the assembly gap (feast_hall/festhall homeless), and
every blend fiat (guildhall, checkpoint, hospice, machiya, dzong).

**Model C** fails discrimination and authoring: three distinct stress concepts
(library/archive; meeting*hall/guildhall/feast_hall) collapse into identical
cells, and it is the only model that made the easy controls \_harder*.

**Model B vs D** is the real contest, and the D clarification test resolved
it: for cross-family queries ("all lodging") D's registry function metadata
must be **authoritative — it is a semantic facet, not presentation grouping**.
That makes D equivalent to "B with function frozen to registry defaults."
D wins decisiveness and reproducibility; B wins instance-level nuance (a
specific temple operating as a hospital, a tavern that is primarily a
gambling den). Each model's weakness is the other's strength.

### Model E (emergent): archetype-primary, function-backed

The corpus demanded the synthesis, as permitted by the plan:

```text
classification:
  archetype: id from flat registry      ← the author's one question
  functionOverride?: function family    ← rare, instance-level deviation
  specialization?: free/curated refine  ← optional

archetype registry entry (authoritative):
  function: one or two of ~12–18 curated families (blends legal: dzong)
  manifestationOf?: archetype id        ← cultural forms (caravanserai → inn)
  formNote?: display metadata only      ← form remains owned by structureType
```

Constraint check against the Phase 3 dimension report: (a) function is core,
carried by the registry; (b) archetype layer absorbs cultural manifestations;
(c) form-coded, function-unknown entries legal (nuraghe); (d) `semi`
composites carried by blend-functioned archetypes (coaching_inn, dzong);
(e) no scale/access/affiliation fields — access differences live in distinct
archetypes (library vs archive), affiliation residue lives in
charter-constituted archetypes (guildhall, almshouse).

E scores: misfiles 3, unset 2, judgment calls **4** (D-level decisiveness),
one-question authoring, instance override preserved (B-level nuance),
controls untouched. Migration from the shipped vocab is the same nearly
mechanical mapping as B/D: current subtypes become archetypes; current types
dissolve into registry function families.

**Provisional selection: Model E.** Formal decision record, the
recode-after-gap reproducibility check, and the post-test gaps pass are
Phase 5.

## Phase 5 — Decision record (v0.5)

### Reproducibility check (recode-after-gap)

Method: the 43-concept stress set (strata A+B+C) was recoded under Model E
from the raw concept list — archetype answer first, then the expected
registry family set — without consulting the Phase 4 head-to-head table, and
the two passes were diffed. Honesty note: the "gap" here is a process gap
(independent re-derivation against the Model E rules), not a calendar gap;
same-author-same-session bias cannot be fully excluded and the result should
be read alongside the Phase 4 judgment-call proxy (E: 4), not as a
replacement for post-implementation authoring telemetry.

Results:

| Level                                 | Disagreements | Rate |
| ------------------------------------- | ------------- | ---- |
| Archetype (the author's one question) | **0 / 43**    | 0%   |
| Registry function-family set          | 3 / 43        | 7%   |

The three family-set disagreements, with both codings:

| Concept          | Pass 1                    | Recode                       | Cause                                                                   |
| ---------------- | ------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| feast_hall       | assembly                  | food-drink social + assembly | matrix records feasting _and_ court social; blend cap forces a pick     |
| wizard_tower     | dwelling + knowledge      | dwelling + defense/watch     | three co-functions (residence, research, defense), registry caps at two |
| gladiator_school | spectacle + defense/watch | spectacle + lodging          | training vs housing as the second family                                |

Reading: every disagreement is a **registry curation choice** — which two of
three co-functions are identity-bearing — not an authoring ambiguity. The
archetype answer, the only question authors face, was fully reproducible.
Resolution rule adopted for the registry: pick the two identity-bearing
families; the third lives in the archetype description. This is a one-time
editorial act per registry entry, decided at curation, never re-decided per
instance.

### Post-test gaps pass (corpus 300 → 308)

Entrants: the four concepts noted during model testing (audience_hall,
memorial_hall, hollowed_colossus, mimic_building) plus four concepts named in
the Phase 1 source lists that never entered the corpus (kiva, undercroft,
staithe, cave_dwelling). Each was coded and classified under Model E as-is —
the absorption test is whether E handles them **without restructuring**:

| Id                | Lvl  | Bnd | Function                 | Model E handling                                                                                                                                                 |
| ----------------- | ---- | --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| audience_hall     | arch | ctx | assembly + governance    | Interior-default rule (the throne_room freestanding counterexample); freestanding instances get a registry archetype. **New registry entry.**                    |
| memorial_hall     | spec | yes | commemoration + assembly | Enveloped, occupiable → building (the "memorial hall variant" the v0.2 memorial row predicted). **New registry entry.**                                          |
| kiva              | cult | ctx | worship (rite)           | Cultural archetype, mithraeum rhyme (sunken restricted rite chamber); `manifestationOf` unset; interior-default within a pueblo complex. **New registry entry.** |
| hollowed_colossus | —    | ctx | (by current use)         | Conversion rule (houseboat/shipwreck_dwelling precedent): monument shell, use-classification attaches to the occupied instance. No new archetype.                |
| mimic_building    | —    | no  | predation                | A creature, not a location. If authored as a place, the _apparent_ archetype + occupant overlay (haunted_manor precedent).                                       |
| undercroft        | —    | no  | storage                  | Interior ownership (crypt/root_cellar family).                                                                                                                   |
| staithe           | —    | no  | cargo landing            | `structureType: infrastructure` (wharf family).                                                                                                                  |
| cave_dwelling     | —    | ctx | dwelling                 | Permanence/material rule (a dwelling is a dwelling in stone or cave) + site ownership of the natural shell; hobbit_burrow already carries the envelope pressure. |

Verdict: **zero restructures.** Three entrants become ordinary registry
archetypes; five resolve through boundary/overlay rules that already existed
before the pass. The corpus is closed at 308.

### Decision

**Adopted: Model E — archetype-primary, function-backed classification.**
Date: 2026-08-03. Status: accepted; discovery concluded.

Alternatives and scores are recorded in Phase 4 above. The deciding evidence:

1. **Model A fails structurally** — single-parent nesting scatters the
   storage family, leaves archive/feast_hall homeless, and forces fiat
   choices on every blend (14 misfiles, 17 judgment calls).
2. **Model C fails discrimination** — library/archive and
   meeting_hall/guildhall/feast_hall collapse into identical cells, and it
   regresses the easy controls.
3. **Model D's registry metadata must be authoritative** to answer
   cross-family queries, which makes it Model B with function frozen —
   the B-vs-D contest dissolves into E.
4. **E keeps D's decisiveness** (one authoring question, 4 judgment calls,
   0/43 archetype self-disagreement in the Phase 5 recode) **and B's
   instance nuance** (rare `functionOverride` for the temple operating as a
   hospital).
5. **The gaps pass absorbed all 8 entrants without restructuring** — the
   model's coverage mechanism (registry entries + boundary rules) extends
   without schema change.

Constraints honored (from the Phase 3 dimension report): function is the
core dimension, carried by the registry; the archetype layer absorbs
cultural manifestations via `manifestationOf`; form-coded/function-unknown
entries are legal; `semi` composites are blend-functioned archetypes; no
scale/access/affiliation fields — access differences produce distinct
archetypes (library vs archive), the charter-constitution residue lives in
charter-constituted archetypes (guildhall, almshouse).

Consequences:

- `BUILDING_TYPE_DEFINITIONS` (8 types / 25 subtypes, two-level
  discriminated union) is replaced by a flat archetype registry backed by a
  curated function-family vocabulary. The 8 type ids dissolve into
  registry-level function families; the 25 subtypes become seed archetypes.
- Boundary rules carried into implementation as description/authoring
  guidance, not schema: granularity floor, fortification-default,
  interior-default, infrastructure-attached, conversion, role overlays,
  permanence/material orthogonality.
- Form stays owned by `structureType`; hierarchy stays owned by
  `LOCATION_KIND_DEFINITIONS`; affiliation stays owned by future
  organization links. Nothing in this decision creates containment policy.
- Registry curation is now the quality-bearing act: blend caps (max two
  families), manifestation edges, and access-split archetypes are editorial
  decisions made once, in the registry, with integrity tests.

### Implementation scope (handed to the implementation plan)

Scoped in full in the fresh implementation plan
([building_archetype_registry_a7e3d1c4.plan.md](../../.cursor/plans/building_archetype_registry_a7e3d1c4.plan.md)
— see Next step). Summary of the shape:

```text
classification (building):
  archetype: BuildingArchetype        ← flat registry id
  functionOverride?: FunctionFamily   ← rare instance-level deviation
  specialization?: string             ← optional refinement

registry entry:
  label / description
  function: [family] | [family, family]   ← authoritative, blends legal
  manifestationOf?: BuildingArchetype
  formNote?: string                       ← display only
```

Draft curated function families (18 — from the ~22 emergent; final merges
are an implementation todo): dwelling · lodging · food-drink social ·
retail · service · production · storage · finance · governance · worship ·
cloistered community · assembly · knowledge · care · defense/watch ·
spectacle · transport support · funerary. Merge notes: adjudication and
custody folded into governance (courthouse/prison archetypes keep the
precision); display/ornament folded into spectacle; bathing/body ritual
folded into care; animal boarding folded into service.

Seed migration mapping (25 shipped subtypes → archetypes; the 8 type ids
dissolve):

| Shipped `type/subtype` | Archetype                                                                           | Registry function           |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------- |
| business/tavern        | tavern                                                                              | food-drink social           |
| business/inn           | inn                                                                                 | lodging + food-drink social |
| business/shop          | shop                                                                                | retail                      |
| business/market        | market                                                                              | retail                      |
| business/warehouse     | warehouse                                                                           | storage                     |
| civic/guard_post       | guard_post                                                                          | defense/watch               |
| civic/town_hall        | town_hall                                                                           | governance + assembly       |
| civic/courthouse       | courthouse                                                                          | governance                  |
| civic/prison           | prison                                                                              | governance                  |
| religious/temple       | temple                                                                              | worship                     |
| religious/shrine       | shrine                                                                              | worship                     |
| religious/monastery    | monastery                                                                           | cloistered community        |
| religious/cathedral    | temple + `specialization: cathedral` _(recommended — rank, not use; open decision)_ | worship                     |
| residential/house      | house                                                                               | dwelling                    |
| residential/manor      | manor                                                                               | dwelling + governance       |
| residential/tenement   | tenement                                                                            | dwelling                    |
| guild/guildhall        | guildhall                                                                           | assembly + governance       |
| guild/workshop         | workshop                                                                            | service + production        |
| military/barracks      | barracks                                                                            | defense/watch + dwelling    |
| military/armory        | armory                                                                              | storage + defense/watch     |
| industrial/forge       | forge                                                                               | production                  |
| industrial/mill        | mill                                                                                | production                  |
| industrial/factory     | factory                                                                             | production                  |
| entertainment/theater  | theater                                                                             | spectacle                   |
| entertainment/arena    | arena                                                                               | spectacle                   |

Downstream surfaces (dev-only clean break, no migration scripts):
`building-type-definitions.ts` (replaced), `building-classification.ts`
(schema + label helpers), `location-classification.test.ts`, JSON schema
regen, API model derivation, dashboard
`location-classification-form-fields.ts` (two selects → one
family-grouped archetype select) and `location-form-sync.ts`, fixtures.

## Corpus log

| Batch              | Date       | Added | Total | Notes                                                                                                                                           |
| ------------------ | ---------- | ----- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 seed          | 2026-08-03 | ~110  | ~110  | Prior plan tables: Model A vocab, deferred, outliers, clusters                                                                                  |
| v0.1 expansion     | 2026-08-03 | ~189  | 299   | hist/cult/fant/edge passes against all 15 buckets                                                                                               |
| v0.2 coding        | 2026-08-03 | +1    | 300   | Added `guildhall` (Model A cross-check found it missing); full matrix coded, cult/hist/edge/fant before seed                                    |
| v0.3 analysis      | 2026-08-03 | 0     | 300   | Dimension/boundary reports, 43-concept stress set. **Corpus frozen.**                                                                           |
| v0.4 model testing | 2026-08-03 | 0     | 300   | 63-concept run over Models A–D; Model E formulated and provisionally selected                                                                   |
| v0.5 decision      | 2026-08-03 | +8    | 308   | Reproducibility recode (0/43 archetype disagreement); gaps pass absorbed all entrants without restructuring; **Model E adopted, corpus closed** |

Coverage check: all 15 buckets populated across eras (ancient: ziggurat,
mastaba, stoa; medieval: tithe_barn, tolbooth, chantry; early modern:
coffeehouse, martello_tower; fantasy: full bucket 13). Cross-cultural forms
appear in 12 of 15 buckets.

## Standing analysis questions (carried into Phase 3)

1. **Cultural manifestation vs distinct concept** — for every `cult` entry:
   is it a distinct schema concept or a culturally specific manifestation of a
   broader archetype? Phase 2 coding leans strongly toward manifestation (see
   observation 3); Phase 3 should formalize the test.
2. **Term overloads recorded** — factory, bank, hall, exchange, forge, mill,
   printing_press, asylum, hospice, hospital, mews, gymnasium, belfry: 13
   `Ovl: y` entries confirm polysemy is common enough to need explicit
   handling in authoring copy.
3. **Interior-role plants** — throne_room, crypt, chapter_house, scriptorium,
   ritual_chamber, root_cellar all coded `no`/`ctx` as expected; freestanding
   counterexamples noted where they exist (audience hall, print shop,
   standalone ossuary).
4. **Form-without-function** — folly confirmed as pure form; stoa and tower
   confirmed as form-first with interchangeable function.
5. **Condition plants** — haunted_manor and shipwreck_dwelling coded as base
   concept + overlay, validating "condition is not type."
6. **Live/work hybrids** — confirmed pervasive (observation 7).

## Next step

Discovery is concluded. Execute the implementation plan
([building_archetype_registry_a7e3d1c4.plan.md](../../.cursor/plans/building_archetype_registry_a7e3d1c4.plan.md)):
function-family vocabulary + archetype registry replacing
`BUILDING_TYPE_DEFINITIONS`, new classification schema
(`archetype` / `functionOverride?` / `specialization?`), and the downstream
contracts/API/dashboard updates, using the seed migration mapping in the
Phase 5 decision record. The discovery-era freeze on
`building-type-definitions.ts` lifts when that plan executes.

---

## Editorial appendix — Phase 5 function-family curation (2026-08-03)

Canonical function-family vocabulary landed in
[`building-function-family.ts`](../../packages/contracts/src/rpg/vocab/location/building-function-family.ts).
This section records editorial decisions; ids are **persisted vocabulary** after
this commit — future renames require deliberate migration.

### Merge decisions (from draft-18 in the Phase 5 decision record)

| Emergent cluster               | Disposition               | Rationale                                                                  |
| ------------------------------ | ------------------------- | -------------------------------------------------------------------------- |
| adjudication, custody          | **Merged → `governance`** | Courthouse/prison precision lives in archetypes, not a separate query axis |
| display, ornament              | **Merged → `spectacle`**  | Folly/ornament cases query as spectacle/leisure venues                     |
| bathing, body ritual           | **Merged → `care`**       | Hammam/bathhouse welfare and body-care share cross-archetype care queries  |
| animal boarding, craft service | **Merged → `service`**    | Stable/livery/blacksmith share “service facility” discovery                |
| production/processing          | **Kept → `production`**   | Distinct cross-archetype query: mills, forges, factories                   |

### Canonical families (18)

| Id                     | Label                | Cross-archetype query justification                                      |
| ---------------------- | -------------------- | ------------------------------------------------------------------------ |
| `dwelling`             | Dwelling             | Find primary residences (house, manor, tenement)                         |
| `lodging`              | Lodging              | Find guest accommodation (inn, hospice, boarding house)                  |
| `food_drink_social`    | Food & drink         | Find food/drink/social venues (tavern, coffeehouse, festhall)            |
| `retail`               | Retail               | Find shops and trade counters (shop, market, caravanserai retail facet)  |
| `service`              | Service              | Find craft/care/maintenance services (stable, blacksmith, livery)        |
| `production`           | Production           | Find manufacturing/processing sites (mill, forge, factory)               |
| `storage`              | Storage              | Find warehouses, granaries, armories (goods held)                        |
| `finance`              | Finance              | Find banks, mints, exchanges                                             |
| `governance`           | Governance           | Find civic authority sites (town hall, courthouse, prison, yamen)        |
| `worship`              | Worship              | Find temples, shrines, mosques                                           |
| `cloistered_community` | Cloistered community | Find monastic/enclosed communities (monastery, abbey)                    |
| `assembly`             | Assembly             | Find meeting/convocation halls (guildhall assembly facet, audience hall) |
| `knowledge`            | Knowledge            | Find libraries, archives, academies                                      |
| `care`                 | Care                 | Find hospitals, almshouses, bathhouses (welfare/body care)               |
| `defense_watch`        | Defense & watch      | Find barracks, guard posts, watchtowers                                  |
| `spectacle`            | Spectacle            | Find theaters, arenas, amphitheaters                                     |
| `transport_support`    | Transport support    | Find stables-as-travel, waystations, caravanserai relay facet            |
| `funerary`             | Funerary             | Find mausoleums, charnel houses, standalone ossuaries                    |

Working-set ids retained unchanged where they survived curation (`food_drink_social`,
`care`, etc.). Seven families added; zero working-set ids removed.
