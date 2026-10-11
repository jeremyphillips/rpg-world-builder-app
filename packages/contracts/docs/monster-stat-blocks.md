# Monster stat blocks

Monster records in `@rpg/contracts` store authored stat-block inputs. **`deriveMonsterStatBlock`** in `runtime/monster/stat-block.ts` turns a parsed `MonsterBody` plus equipment and skill catalogs into display-ready numbers (AC, HP, attacks, saves, skills, passive Perception, XP).

## Fidelity principle

Derived values follow SRD 5.2.1 table math unless the body explicitly overrides a field (for example CR 0 `experiencePointsOverride`). Hit dice averages use the shared `averageStatBlockHitPoints` helper (full dice pool average plus Constitution per die, floored).

## Resolver policies

- **Natural weapons** are always treated as proficient for attack bonus.
- **Weapon actions** use equipment catalog rows; names fall back from action → instance custom name → equipment name.
- **Armor class** modes: unarmored (optional shield equipment), natural (AC base + Dex + bonus), equipment (equipped armor instances), fixed.
- **`armor_class` equipment modifiers** on instances adjust equipped armor through `toEquippedArmorPiece` (shared with character inventory).

## Campaign access

System monsters default to **DM-only** campaign visibility via `CONTENT_ACCESS_CAPABILITIES.monsters.defaultVisibilityMode`.

See also `docs/runtime-resolution-boundaries.md` and `apps/api/docs/campaign-access-enforcement.md`.
