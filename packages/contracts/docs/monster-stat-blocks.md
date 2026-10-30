# Monster stat blocks

Monster records in `@rpg/contracts` store authored stat-block inputs. **`deriveMonsterStatBlock`** in `runtime/monster/stat-block.ts` turns a parsed `MonsterBody` plus equipment and skill catalogs into display-ready numbers (AC, HP, attacks, saves, skills, passive Perception, XP).

## Fidelity principle

Derived values follow SRD 5.2.1 table math unless the body explicitly overrides a field (for example CR 0 `experiencePointsOverride`). Hit dice averages use the shared `averageStatBlockHitPoints` helper (full dice pool average plus Constitution per die, floored).

## Resolver policies

- **Natural weapons** are always treated as proficient for attack bonus.
- **Weapon actions** use equipment catalog rows; names fall back from action → instance custom name → equipment name.
- **Limited use** on any kind is optional. An absent limit is at will. A present limit is rendered in the heading from `formatLimitedUseNotation` (`stat-block` style), for example `(Recharge 5–6)` or `(Recharges after a Short or Long Rest)`.
- **Spell actions** do not store the printed spell list. `formatMonsterSpellEntry` generates it from `spells`, each spell's limit, the entry limit, and catalog spell names. Unresolved ids render as "Unavailable spell". `deriveMonsterStatBlock` adds save DC and attack bonus for each spell entry, following `castingAbility.shared` to the target entry's ability. Spell save DC and attack bonus live in `runtime/creature/spell-dc.ts`.
- **Reactions** with an authored `trigger.text` render `Trigger:` and then `Response:`. A spell reaction's authored trigger is an additional condition. `resolveMonsterReactionTrigger` still returns each referenced reaction spell's own trigger.
- **Armor class** is `{ naturalArmorBonus?, fixedAcOffset? }`. Offsets are protection magnitudes; displayed AC comes from required `armorClassRules` (`mode` and `base`). Natural armor and worn body armor are both candidates; the higher protection wins, and a tie uses the armor. An equipped shield and its enhancement always apply once. `fixedAcOffset` replaces the displayed total and keeps `calculatedAc` on the resolution, unless ownership is already invalid. Body-armor DEX comes from `resolveArmorDexterityRule` (light adds the full modifier, medium caps it at +2, heavy adds none) and is not stored on the armor record. A second owned body armor or shield, or a quantity other than 1, makes Armor Class unavailable even when the extra piece is unequipped and even when a fixed offset is set. The monster adapter in `runtime/monster/armor-class.ts` calls the shared `resolveCreatureArmorClass`. `deriveMonsterStatBlock` requires `armorClassRules` and a magic-property provider.
- **Comparing Armor Class** uses `compareArmorClass` in `vocab/mechanics/armor-class-scale.ts`. It returns a positive number when the first AC is better protection than the second, in both ascending and descending modes. Future hit resolution must take `ArmorClassRules` and call this comparator. Do not compare Armor Class numbers with `<` or `>`. Display copy follows the same direction: ascending plate is `18 (no Dex)` and a shield is `+2`; descending base 10 plate is `2 (no Dex)`, leather at base 9 is `8 - Dex`, and a shield is `-2`. The scale module is the only place a sign is applied.
- **Unarmored base** is campaign mechanics (`armorClass.base`, with `mode`). Preset bundles live in `EDITION_PRESET_MECHANICS`. `resolveMechanicsPatch` fills a sparse patch, and `systemDefaultArmorClassRules` is the only default selection. Changing the base or direction rewrites no stored offsets. Base 9 ascending shows plate (offset 8) as 17. Numeric bases outside the scale module and the preset bundles are rejected by `armor-class-base-guard.test.ts`.
- **Armor proficiency** is derived at read time from owned body armor and shields. It is not stored.
- **`armor_class` equipment modifiers** on instances adjust the armor candidate (or the shield, for shield enhancements) through `toEquippedArmorPiece` (shared with character inventory). Magic armor enhancement applies only when that armor wins.

## Campaign access

System monsters default to **DM-only** campaign visibility via `CONTENT_ACCESS_CAPABILITIES.monsters.defaultVisibilityMode`.

See also `docs/runtime-resolution-boundaries.md` and `apps/api/docs/campaign-access-enforcement.md`.
