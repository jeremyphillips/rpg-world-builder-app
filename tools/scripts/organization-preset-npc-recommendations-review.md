# Preset-title NPC recommendation mapping review

Generated alongside `organization-preset-npc-recommendations.mjs` (374 pairs, all mapped).

## Template mappings changed (5b.1 audit)

| Preset:title                        | Previous          | Current                  | Rationale                                                           |
| ----------------------------------- | ----------------- | ------------------------ | ------------------------------------------------------------------- |
| `thieves_guild:guildmaster`         | civic_leader · 9  | covert_operator · 9      | Criminal guild head is a senior covert operator, not a civic leader |
| `adventurers_guild:guildmaster`     | civic_leader · 8  | martial_commander · 8    | Adventuring guild head commands field operators                     |
| `bounty_hunters:guildmaster`        | civic_leader · 8  | martial_officer · 8      | Law-enforcement guild head is a tactical field leader               |
| `intelligence_bureau:director`      | civic_leader · 10 | covert_operator · 10     | Intelligence director leads clandestine operations                  |
| `mage_college:rector`               | civic_leader · 10 | arcane_practitioner · 10 | Arcane college head is a senior practitioner                        |
| `church:elder`                      | civic_leader · 6  | divine_practitioner · 6  | Church elder is a religious practitioner                            |
| `religious_order:elder`             | civic_leader · 5  | divine_practitioner · 5  | Religious elder via preset-kind heuristic                           |
| `hospital_order:grand_master`       | civic_leader · 10 | divine_practitioner · 10 | Hospitaller grand master is a sacred medical leader                 |
| `private_security_company:director` | civic_leader · 8  | administrator · 8        | Corporate security director is administrative                       |
| `gang:boss`                         | civic_leader · 8  | covert_operator · 8      | Criminal boss via preset-kind heuristic                             |
| `protection_racket:boss`            | civic_leader · 8  | covert_operator · 8      | Criminal boss via preset-kind heuristic                             |
| `counterfeiting_ring:ringleader`    | civic_leader · 8  | covert_operator · 8      | Criminal ringleader via preset-kind heuristic                       |
| `fencing_network:ringleader`        | civic_leader · 8  | covert_operator · 8      | Criminal ringleader via preset-kind heuristic                       |
| `smuggling_ring:ringleader`         | civic_leader · 8  | covert_operator · 8      | Criminal ringleader via preset-kind heuristic                       |

## Newly introduced templates

None — existing 22-template vocabulary remained sufficient.

## Level recommendations changed

None — all corrected mappings retained their prior authored levels.

## Ambiguous / heuristic assumptions

| Preset:title                                 | Recommendation          | Note                                                                   |
| -------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `adventurers_guild:veteran`                  | martial_specialist · 5  | Title label implies tier; mapped to role archetype, not wealth tier    |
| `adventurers_guild:adventurer`               | martial_specialist · 3  | Generic contract-taker; level is conservative mid-tier                 |
| `government_ministry:officer`                | administrator · 2       | Could be investigator in customs contexts; kept administrative         |
| `merchant_house:patriarch` / `matriarch`     | civic_leader · 0        | Family head as social leader, not high-level combatant                 |
| `craft_guild:guildmaster`                    | civic_leader · 8        | Occupational trade guild head; civic/commercial leadership fits        |
| `fraternal_lodge:grand_master`               | civic_leader · 10       | Social fraternal lodge head; civic leadership fits                     |
| `knightly_order:initiate`                    | guard · 1               | Order uses Initiate label; mapped as novice combatant, not wealth tier |
| `religious_order:initiate` / `cult:initiate` | divine_practitioner · 1 | Shared Initiate label; preset kind drives practitioner mapping         |

## Template vs organization class affinity disagreement

| Preset:title                    | Build template affinities            | Organization class affinities | Note                                                                            |
| ------------------------------- | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------- |
| `thieves_guild:guildmaster`     | rogue (covert_operator)              | rogue                         | Aligned after audit                                                             |
| `church:elder`                  | cleric (divine_practitioner)         | cleric                        | Aligned after audit                                                             |
| `adventurers_guild:guildmaster` | fighter, paladin (martial_commander) | (none seeded)                 | Build now recommends martial classes; org has no class affinities               |
| `hospital_order:grand_master`   | cleric (divine_practitioner)         | cleric, paladin               | Build omits paladin conservatively; org may rank paladin via affinities in 5b.3 |

## Level 13+ recommendations (5)

| Preset:title             | Template            | Level |
| ------------------------ | ------------------- | ----- |
| `army:general`           | martial_commander   | 14    |
| `army:marshal`           | martial_commander   | 13    |
| `navy:admiral`           | martial_commander   | 14    |
| `mage_college:archmage`  | arcane_practitioner | 14    |
| `druid_circle:archdruid` | nature_practitioner | 14    |

## Priority-50 titles at level 0 (23 — intentional)

Commercial, academic, and civic heads where priority reflects roster ordering, not mechanical power: e.g. `brewery:proprietor`, `bank:proprietor`, `academy:chancellor`, `city_council:chair`, `merchant_house:patriarch`.

## Intentionally unresolved

None — all 374 preset-title pairs include a recommendation.

## Same title, different presets (examples)

| Title     | Army                | Shipping company     |
| --------- | ------------------- | -------------------- |
| `captain` | martial_officer · 6 | maritime_officer · 6 |

| Title | Thieves guild enforcer | Army soldier |
| ----- | ---------------------- | ------------ |
|       | martial_specialist · 5 | guard · 2    |
