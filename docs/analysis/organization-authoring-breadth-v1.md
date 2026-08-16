# Organization authoring breadth v1 — Phases 1–7

> **Status:** Audit, corpus, and classification complete. Registry edits are **not** in this document.
> **Kind:** Working analysis for this pass, not a coverage KPI and not a second taxonomy project.
> **Corpus:** [organization-authoring-breadth-v1-corpus.md](./organization-authoring-breadth-v1-corpus.md) (evaluation worksheet only).
> **Do not** import the 250–300 corpus into product tests. Promote only durable semantic cases when Phases 8–12 implement.

Expected range: **~20–35 additional Practices** and **~15–30 additional Familiar types**. Ship fewer only when leftovers are explicitly `alias` / `defer` / `reject` (Practices) or `discoverable` / `defer` / `reject` (presets). Do not pad.

---

## 1. Corpus size and composition

**272** familiar organization concepts, built as an authoring-breadth worksheet (not the frozen 150 taxonomy corpus).

| Family                  |   Count |
| ----------------------- | ------: |
| Government & civic      |      35 |
| Military & security     |      32 |
| Religion & ritual       |      32 |
| Commerce & industry     |      40 |
| Guilds & occupational   |      36 |
| Scholarship & esoterica |      28 |
| Criminal & covert       |      32 |
| Community & social      |      22 |
| Culture & performance   |      15 |
| **Total**               | **272** |

Quality vs live picker (before this package): many `thin` / `poor` rows are generic-parent collisions (`army`, `church`, `craft_guild`, `trading_company`) or `no_start`. Strongest structural signal: **only 4 of 26 live Practices appear in any Familiar-type projection**.

No Domain / Form / Function blockers. Form `cooperative` is unused by every live preset (Farming cooperative currently discovers under Trading company). Deferred Function questions (`exploration`, `diplomacy`, `performance` as Function) stay closed: Explorers' society uses `research` + cartography/surveying; diplomatic corps stays `administration`; `performance` stays a Practice.

---

## 2–4. Practice classification

Admission rule: recognizable sustained specialty, trade, method, or operational mode. Niche is allowed. Rank includes Familiar-type unlock (`unlocks` / `improves` / `none`).

### Required candidates (must-report)

| Id              | Evidence                                                                                              | Overlap / boundary                                                                                                                                                                                                      | Search terms (proposed)                                                | Unlock                                                        | Outcome                         |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------- |
| `cobbling`      | Cobblers' guild, shoemakers' workshop — same craft grain as `blacksmithing` / `tailoring` / `brewing` | Activity noun (footwear making/repair), not the title “cobbler”. Distinct from `leatherworking` (hides/goods vs finished shoes)                                                                                         | cobbler, shoemaking, footwear                                          | improves (craft guild customize)                              | **admit**                       |
| `tracking`      | Rangers, bounty hunters, hunters' lodges that follow trails                                           | **Physical signs/trails**, not `scouting` (operational observation/ranging) and not `investigation` (evidence-based fact finding). Remove `tracking` from `hunting` searchTerms if admitted; hunting keeps game/harvest | trails, spoor, trailing                                                | unlocks bounty hunters; improves ranger / hunters' lodge      | **admit**                       |
| `investigation` | Detective guild, inquisitorial office, city watch investigators, intelligence bureau analysts         | Practice that **composes with** Function `policing` or `intelligence`. Not a synonym of either Function. City watch can stay policing-only; detective/inquisition/bureau add investigation                              | detective, inquiry, casework                                           | unlocks inquisition; improves city watch, intelligence bureau | **admit**                       |
| `fencing`       | Already live. Fencing network, stolen-goods brokers                                                   | **Stolen-goods dealing**, not swordsmanship. Keep the existing id. Disambiguate discovery: add stolen-goods fencing / fence network; never add sword, duel, blade                                                       | stolen goods, black market, fence, stolen-goods fencing, fence network | unlocks fencing network preset                                | **admit** (keep) + disambiguate |
| `potion_making` | Potion-makers, alchemists' guild, elixir shops                                                        | Alchemy already searches `potion` / `elixir`. Apothecary is medicinal compounding/dispensing, not bottled magical craft. Splitting would force a near-synonym choice                                                    | potion making, potions, elixir (on `alchemy`)                          | none as new id; potion-makers → `alchemy`                     | **alias** → `alchemy`           |

### Recommended new Practice package (32)

Append after `performance`. Existing 26 ids keep order. `fencing` is already live (disambiguation only).

| Id               | Label          | Family                | Unlock                                            | Typical Functions        |
| ---------------- | -------------- | --------------------- | ------------------------------------------------- | ------------------------ |
| `masonry`        | Masonry        | Craft & industry      | improves masons' guild                            | production, standards    |
| `weaving`        | Weaving        | Craft & industry      | improves weavers' guild / textile works           | production               |
| `tailoring`      | Tailoring      | Craft & industry      | improves tailors' guild                           | production               |
| `leatherworking` | Leatherworking | Craft & industry      | improves leatherworkers' guild                    | production               |
| `cobbling`       | Cobbling       | Craft & industry      | improves cobblers' guild                          | production               |
| `mining`         | Mining         | Craft & industry      | **unlocks** Mining company                        | production               |
| `logging`        | Logging        | Craft & industry      | **unlocks** Logging company                       | production               |
| `milling`        | Milling        | Craft & industry      | improves millers' cooperative                     | production               |
| `distilling`     | Distilling     | Craft & industry      | improves distillery under Brewery                 | production               |
| `fishing`        | Fishing        | Craft & industry      | **unlocks** / improves fishing fleet              | production               |
| `printing`       | Printing       | Craft & industry      | improves printers' guild / publishing house       | production               |
| `warehousing`    | Warehousing    | Trade & logistics     | improves warehouse company                        | trade, transport         |
| `salvage`        | Salvage        | Trade & logistics     | improves wreckers                                 | trade                    |
| `brokerage`      | Brokerage      | Trade & logistics     | improves factors / auction house                  | trade                    |
| `surveying`      | Surveying      | Scholarly & technical | **unlocks** Explorers' society (with cartography) | research                 |
| `translation`    | Translation    | Scholarly & technical | improves translators' college / diplomatic corps  | research, administration |
| `archiving`      | Archiving      | Scholarly & technical | improves library / records office                 | stewardship              |
| `engineering`    | Engineering    | Scholarly & technical | improves public works / siege engineers           | production, warfare      |
| `divination`     | Divination     | Religious & esoteric  | **unlocks** / improves oracle cult                | research, worship        |
| `midwifery`      | Midwifery      | Medicine & care       | improves midwives' guild                          | care                     |
| `kidnapping`     | Kidnapping     | Criminal & covert     | **unlocks** kidnapping ring                       | —                        |
| `poisoning`      | Poisoning      | Criminal & covert     | **unlocks** poisoners' cabal                      | —                        |
| `gambling`       | Gambling       | Criminal & covert     | **unlocks** gambling den                          | —                        |
| `bounty_hunting` | Bounty hunting | Military & security   | **unlocks** Bounty hunters                        | —                        |
| `bodyguarding`   | Bodyguarding   | Military & security   | **unlocks** Private security company              | defense                  |
| `siegecraft`     | Siegecraft     | Military & security   | improves siege engineers                          | warfare                  |
| `tracking`       | Tracking       | Military & security   | **unlocks** bounty hunters; improves rangers      | —                        |
| `investigation`  | Investigation  | Scholarly & technical | **unlocks** Inquisition; improves watch / bureau  | policing, intelligence   |
| `exorcism`       | Exorcism       | Religious & esoteric  | improves exorcists' order                         | ministry                 |
| `pilgrimage`     | Pilgrimage     | Religious & esoteric  | improves pilgrimage society                       | ministry, worship        |
| `funerary_rites` | Funerary rites | Religious & esoteric  | improves funerary order / burial society          | ministry, care           |
| `publishing`     | Publishing     | Culture & performance | improves publishing house                         | —                        |

**32 new ids** is inside the expected 20–35 range. Not padded: each has corpus orgs that search the activity noun and/or unlock a Familiar type. Overflow crafts (pottery, jewelry-making) are deferred, not stuffed in to hit 35.

### Alias (not new ids)

**Safer (confirm; already live or near-duplicate):**

| Terms                               | Target                            |
| ----------------------------------- | --------------------------------- |
| burglary, robbery, larceny          | `theft` (live)                    |
| forgery                             | `counterfeiting` (live)           |
| surgery, healing                    | `medicine` (live)                 |
| herbalism, pharmacy                 | `apothecary` (live)               |
| reconnaissance, ranging             | `scouting` (live)                 |
| theater, music, dance, storytelling | `performance` (live)              |
| husbandry, ranching                 | `farming` (live)                  |
| glassblowing                        | `glassmaking` (live)              |
| potion making, potions, elixir      | `alchemy`                         |
| bootlegging                         | `smuggling`                       |
| blackmail, racketeering             | `extortion`                       |
| monster hunting                     | `hunting`                         |
| fortification, military engineering | `siegecraft` (once admitted)      |
| bookbinding                         | `printing`                        |
| caravaning                          | `navigation`                      |
| missionary work                     | Function `ministry` (no Practice) |
| ritual                              | Function `worship` (no Practice)  |
| curation                            | Function `stewardship`            |
| relic keeping                       | Function `stewardship`            |
| hospice care                        | Function `care` / `aid`           |

**Open hypotheses resolved by corpus:**

| Hypothesis                              | Outcome                      | Why                                                                                                                            |
| --------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| metalworking vs `blacksmithing`         | **alias** → `blacksmithing`  | Foundry/smithing orgs are honest under production + blacksmithing; splitting forge vs foundry needs a hierarchy                |
| quarrying vs `mining`                   | **alias** → `mining`         | Extractive stone vs ore is name-level; quarry company customizes Mining company                                                |
| tanning vs `leatherworking`             | **alias** → `leatherworking` | Hide prep is part of the leather trade, not a second org specialty                                                             |
| bookbinding vs printing/scribing        | **alias** → `printing`       | Bindery orgs are rarer; printers' guild + publishing cover the authoring need                                                  |
| moneylending vs `banking`               | **alias** → `banking`        | Moneylenders remain a Bank discovery noun; lending is already a banking searchTerm. Distinct org noun, not a distinct Practice |
| racketeering / blackmail vs `extortion` | **alias** → `extortion`      | Same coercion enterprise; Protection racket is the Familiar type                                                               |
| glassblowing vs `glassmaking`           | **alias** (keep live)        | Method split, not org split                                                                                                    |

If `tracking` is admitted, drop `tracking` from `hunting.searchTerms` (hunting keeps game / hunters lodge).

### Defer (valid Practice, later pass)

pottery, jewelry-making, tanning-as-split (rejected as split; deferred only if leatherworking proves too coarse), auctioneering, insurance, astronomy, hospice-as-practice, drilling, naval operations, occult study, patronage, festival production, animal husbandry-as-split (already aliased).

### Reject

| Concept                              | Why                                                    |
| ------------------------------------ | ------------------------------------------------------ |
| ritual, missionary work as Practices | Functions `worship` / `ministry`                       |
| accounting, legislation              | Functions `finance` / `governance`                     |
| drilling                             | Function `training`                                    |
| naval operations                     | Navy preset + `warfare` / `navigation`                 |
| cobbler, shipwright, cartographer    | profession titles                                      |
| assassins guild as Practice          | organization noun                                      |
| fencing-the-sword                    | different word sense; do not create a second `fencing` |
| begging                              | not sustained organizational specialty                 |

---

## 5–7. Familiar type classification

A new Practice is **not** required. Form honesty and search ergonomics are enough (Farming cooperative / unused `cooperative`).

### Recommended preset package (30)

Existing 20 remain. Append these 29. After adds, **exclusive discovery ownership**: a live preset label must not remain in any other preset’s `discoveryTerms`.

| Id                         | Label                    | Domain / Form              | Functions                     | Practices                | Why (not just a new Practice)                | Strip from          |
| -------------------------- | ------------------------ | -------------------------- | ----------------------------- | ------------------------ | -------------------------------------------- | ------------------- |
| `navy`                     | Navy                     | military / force           | warfare, defense              | navigation               | misleading Army parent; sea host             | `army`              |
| `militia`                  | Militia                  | military / force           | defense, training             | —                        | local levy ≠ standing army                   | `army`              |
| `pirate_crew`              | Pirate crew              | criminal / force           | warfare, transport            | piracy, navigation       | Army is wrong domain                         | `army`              |
| `assassins_order`          | Assassins' order         | criminal / order           | —                             | assassination            | `no_start`; practice already live            | —                   |
| `spy_ring`                 | Spy ring                 | criminal / network         | intelligence                  | espionage                | `no_start`                                   | —                   |
| `protection_racket`        | Protection racket        | criminal / network         | —                             | extortion                | Gang has no extortion                        | `gang`              |
| `counterfeiting_ring`      | Counterfeiting ring      | criminal / network         | —                             | counterfeiting           | Smuggling ring is wrong practice             | `smuggling_ring`    |
| `fencing_network`          | Fencing network          | criminal / network         | —                             | fencing                  | Smuggling ring is wrong practice             | `smuggling_ring`    |
| `intelligence_bureau`      | Intelligence bureau      | government / office        | intelligence                  | espionage, investigation | `no_start`                                   | —                   |
| `hospital_order`           | Hospital order           | religious / order          | care, ministry                | medicine                 | weak Religious order                         | —                   |
| `brewery`                  | Brewery                  | commercial / company       | production                    | brewing                  | weak Trading company                         | `trading_company`   |
| `shipyard`                 | Shipyard                 | commercial / company       | production                    | shipbuilding             | Trading company is trade not production      | `trading_company`   |
| `mining_company`           | Mining company           | commercial / company       | production                    | mining                   | unlocks `mining`                             | `trading_company`   |
| `logging_company`          | Logging company          | commercial / company       | production                    | logging                  | unlocks `logging`                            | `trading_company`   |
| `farming_cooperative`      | Farming cooperative      | commercial / cooperative   | production                    | farming                  | **Form honesty**: unused `cooperative`       | `trading_company`   |
| `explorers_society`        | Explorers' society       | academic / association     | research                      | cartography, surveying   | Scholarly society is generic research        | `scholarly_society` |
| `theater_troupe`           | Theater troupe           | occupational / company     | —                             | performance              | Craft guild is wrong grain                   | `craft_guild`       |
| `private_security_company` | Private security company | commercial / company       | defense                       | bodyguarding             | `no_start`                                   | —                   |
| `bounty_hunters`           | Bounty hunters           | occupational / company     | —                             | bounty_hunting, tracking | Adventurers' guild is a weak parent          | `adventurers_guild` |
| `charitable_foundation`    | Charitable foundation    | community / association    | aid                           | —                        | `no_start`; one-way aid vs mutual aid        | —                   |
| `labor_union`              | Labor union              | occupational / association | advocacy, standards           | —                        | Craft guild is training/apprenticeship       | `craft_guild`       |
| `inquisition`              | Inquisition              | religious / office         | policing                      | investigation            | Church congregation is wrong form            | `church`            |
| `university`               | University               | academic / association     | education, training, research | —                        | noun ergonomics; may share Academy tuple     | `academy`           |
| `mage_college`             | Mage college             | academic / association     | education, training, research | alchemy                  | RPG-familiar; alchemy unlock                 | `academy`           |
| `merchant_house`           | Merchant house           | commercial / company       | trade                         | —                        | noun ergonomics vs Trading company           | `trading_company`   |
| `caravan_company`          | Caravan company          | commercial / company       | transport                     | navigation               | land convoy vs shipping                      | `shipping_company`  |
| `cult`                     | Cult                     | religious / congregation   | worship, ministry             | —                        | Church search is awkward; same tuple allowed | `church`            |
| `druid_circle`             | Druid circle             | religious / order          | worship, stewardship          | —                        | Church is congregation, not nature order     | `church`            |
| `fraternal_lodge`          | Fraternal lodge          | community / association    | —                             | —                        | `no_start`; fellowship noun                  | —                   |
| `missionary_society`       | Missionary society       | religious / association    | ministry                      | —                        | gathered church ≠ sending society            | `church`            |

**30 new presets** is the top of the expected 15–30 range. Bounty hunters is included because `bounty_hunting` + `tracking` is a first-class Practice unlock, not padding.

### Existing preset patches (not new types)

| Preset              | Change                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `shipping_company`  | practices: `navigation`                                                                  |
| `city_watch`        | practices: `investigation`                                                               |
| `army`              | strip navy, militia, pirate crew (and royal guard stays discovery)                       |
| `church`            | strip cult, druid circle, missionary society, inquisitorial office                       |
| `scholarly_society` | strip explorers' society                                                                 |
| `trading_company`   | strip shipyard, farming/millers cooperative, logging company, brewery-related if present |
| `gang`              | strip protection racket                                                                  |
| `smuggling_ring`    | strip fencing network, counterfeiting ring                                               |
| `craft_guild`       | strip theater troupe, labor union                                                        |
| `adventurers_guild` | keep adventuring company and monster hunters; bounty hunters becomes its own preset      |
| `academy`           | strip university, mage college                                                           |
| `fencing` Practice  | disambiguate searchTerms (stolen-goods fencing); no sword terms                          |
| `hunting` Practice  | drop `tracking` searchTerm                                                               |

Do **not** pile specialty Practices onto generic parents (`craft_guild`, `trading_company`, `army`).

### Discoverable (honest parent after package)

Monastery → Religious order. Temple → Church. Secret police → Intelligence bureau. Royal guard → Army. Marines / garrison / legion / warband / sky fleet → Army or Navy as appropriate (marines/sky fleet stay Army discovery unless later pass). Distillery → Brewery (`distilling` as customize). Millers' cooperative → Farming cooperative. Witches' coven → Cult. Seminary / bardic college / wizard circle → Academy. Research institute / museum society / guild of scholars → Scholarly society. Moneylenders / pawnbrokers → Bank. Parliament / senate / privy council → City council. Courier service / coach line → Shipping company. Individual craft guilds (blacksmiths', cobblers', masons') → Craft guild + the matching Practice.

### Defer

Revolutionary cell, succession cabal, conspiracy cabal, secret society, royal court (governance vs administration tension, not worth a Domain/Function reopen), diplomatic corps, temple-as-preset, witches' coven as its own preset, criminal syndicate as empty generic, distillery as first-class (Brewery + distilling), pottery/jewelry guilds.

### Reject / inappropriate as authoring targets

Bureaucracy-as-noun, diocese, pantheon clergy, shrine keepers as org type, spice consortium, slave-trading company, clan, populist movement, independence front, noble faction, survey expedition as ephemeral party (Explorers' society covers standing bodies).

---

## 8. Domain / Form / Function blockers

**None.**

- Form `cooperative` already exists; Farming cooperative uses it.
- Function `exploration` not required: Explorers' society = `research` + `cartography` + `surveying`.
- Function `diplomacy` not required: diplomatic corps stays ministry `administration`.
- Function `performance` not required: Theater troupe = Practice `performance`.
- Pirate crew uses existing Form `force` (crewed host) with Domain `criminal`.

---

## 9. UI grouping / scaling

**Practices:** add a UI-only family map (one family per Practice, not persisted, not eligibility). Search and aliases stay global. **Do not** extend `@rpg/ui` combobox grouping this pass.

**Familiar types (~50 after package):** keep a flat search-first combobox. Light UI groups (Faith, Arms & security, Government & civic, Commerce & industry, Learning & esoterica, Underworld, Community & culture) are a **follow-up** if empty-query browse is painful. Search remains primary.

---

## 10. Still thin after the package

- **Per-craft guilds** (blacksmiths' vs cobblers' vs masons') still share Craft guild; authors add the Practice. That is the intended generic parent, not a failure.
- **Royal court** still starts from Government ministry (`administration` vs `governance`). Honest enough; do not reopen Functions.
- **Distillery** customizes Brewery with `distilling`.
- **Secret police** customizes Intelligence bureau (add `policing`).
- **Temple / monastery / coven** remain discoverable under Church / Religious order / Cult.
- Individual crimes not listed (burglary crew) customize Thieves' guild or Gang + `theft`.

---

## Implementation handoff (Phases 8–12, not this commit)

1. Append 32 Practices + fencing searchTerm disambiguation + hunting `tracking` cleanup.
2. Add 30 presets; patch existing recipes; exclusive label ownership guard.
3. Family map UI-only; coverage fixture outcome flips; durable semantic-flow tests only.
4. Pause only if a Domain/Form/Function change is required (not expected).
