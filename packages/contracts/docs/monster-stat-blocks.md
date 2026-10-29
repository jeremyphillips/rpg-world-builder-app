# Monster stat blocks

Monster records in `@rpg/contracts` store authored stat-block inputs. **`deriveMonsterStatBlock`** in `runtime/monster/stat-block.ts` turns a parsed `MonsterBody` plus equipment and skill catalogs into display-ready numbers (AC, HP, attacks, saves, skills, passive Perception, XP).

## Fidelity principle

Derived values follow SRD 5.2.1 table math unless the body explicitly overrides a field (for example CR 0 `experiencePointsOverride`). Hit dice averages use the shared `averageStatBlockHitPoints` helper (full dice pool average plus Constitution per die, floored).

## Resolver policies

- **Natural weapons** are always treated as proficient for attack bonus.
- **Weapon actions** use equipment catalog rows; names fall back from action → instance custom name → equipment name.
- **Armor class** is `{ naturalArmorBonus?, fixedAcOffset? }`. Offsets are protection magnitudes; displayed AC comes from required `armorClassRules` (`mode` and `base`). Natural armor and worn body armor are both candidates; the higher protection wins, and a tie uses the armor. An equipped shield and its enhancement always apply once. `fixedAcOffset` replaces the displayed total and keeps `calculatedAc` on the resolution, unless ownership is already invalid. Body-armor DEX comes from `resolveArmorDexterityRule` (light adds the full modifier, medium caps it at +2, heavy adds none) and is not stored on the armor record. A second owned body armor or shield, or a quantity other than 1, makes Armor Class unavailable even when the extra piece is unequipped and even when a fixed offset is set. The monster adapter in `runtime/monster/armor-class.ts` calls the shared `resolveCreatureArmorClass`. `deriveMonsterStatBlock` requires `armorClassRules` and a magic-property provider.
- **Armor proficiency** is derived at read time from owned body armor and shields. It is not stored.
- **`armor_class` equipment modifiers** on instances adjust the armor candidate (or the shield, for shield enhancements) through `toEquippedArmorPiece` (shared with character inventory). Magic armor enhancement applies only when that armor wins.

## Campaign access

System monsters default to **DM-only** campaign visibility via `CONTENT_ACCESS_CAPABILITIES.monsters.defaultVisibilityMode`.

See also `docs/runtime-resolution-boundaries.md` and `apps/api/docs/campaign-access-enforcement.md`.
