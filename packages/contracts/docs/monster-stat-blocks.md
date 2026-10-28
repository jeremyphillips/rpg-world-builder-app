# Monster stat blocks

Monster records in `@rpg/contracts` store authored stat-block inputs. **`deriveMonsterStatBlock`** in `runtime/monster/stat-block.ts` turns a parsed `MonsterBody` plus equipment and skill catalogs into display-ready numbers (AC, HP, attacks, saves, skills, passive Perception, XP).

## Fidelity principle

Derived values follow SRD 5.2.1 table math unless the body explicitly overrides a field (for example CR 0 `experiencePointsOverride`). Hit dice averages use the shared `averageStatBlockHitPoints` helper (full dice pool average plus Constitution per die, floored).

## Resolver policies

- **Natural weapons** are always treated as proficient for attack bonus.
- **Weapon actions** use equipment catalog rows; names fall back from action → instance custom name → equipment name.
- **Armor class** is `{ naturalArmorBonus?, fixedValue? }`. Natural armor and worn body armor are both candidates; the higher total wins, and a tie uses the armor. An equipped shield and its enhancement always apply once. `fixedValue` replaces the displayed total and keeps `calculatedAc` on the resolution. `resolveMonsterArmorClass` in `runtime/monster/armor-class.ts` is the only monster AC resolver. `deriveMonsterStatBlock` requires `acBase` and a magic-property provider.
- **Armor proficiency** is derived at read time from owned body armor and shields. It is not stored.
- **`armor_class` equipment modifiers** on instances adjust the armor candidate (or the shield, for shield enhancements) through `toEquippedArmorPiece` (shared with character inventory). Magic armor enhancement applies only when that armor wins.

## Campaign access

System monsters default to **DM-only** campaign visibility via `CONTENT_ACCESS_CAPABILITIES.monsters.defaultVisibilityMode`.

See also `docs/runtime-resolution-boundaries.md` and `apps/api/docs/campaign-access-enforcement.md`.
