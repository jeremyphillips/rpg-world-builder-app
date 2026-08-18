# Preset-title NPC recommendation mapping review

Generated alongside `organization-preset-npc-recommendations.mjs` (374 pairs, all mapped).

## Ambiguous / heuristic assumptions

| Preset:title                                 | Recommendation          | Note                                                                   |
| -------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `adventurers_guild:veteran`                  | martial_specialist · 5  | Title label implies tier; mapped to role archetype, not wealth tier    |
| `adventurers_guild:adventurer`               | martial_specialist · 3  | Generic contract-taker; level is conservative mid-tier                 |
| `government_ministry:officer`                | administrator · 2       | Could be investigator in customs contexts; kept administrative         |
| `merchant_house:patriarch` / `matriarch`     | civic_leader · 0        | Family head as social leader, not high-level combatant                 |
| `knightly_order:initiate`                    | guard · 1               | Order uses Initiate label; mapped as novice combatant, not wealth tier |
| `religious_order:initiate` / `cult:initiate` | divine_practitioner · 1 | Shared Initiate label; preset kind drives practitioner mapping         |

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
