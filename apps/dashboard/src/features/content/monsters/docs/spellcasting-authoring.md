# Spellcasting authoring

Spellcasting ability stays on the spell action. There is no creature-level casting profile.

## Acquisition matrix

| Section           | Menu choice      | Result                                                       |
| ----------------- | ---------------- | ------------------------------------------------------------ |
| Actions           | Spellcasting     | Primary profile: fixed name, spell list other rows can share |
| Actions           | Cast a spell     | Standalone spell action with its own list and ability        |
| Bonus Actions     | Cast a spell     | Standalone (never primary)                                   |
| Reactions         | Cast a spell     | Standalone; default name Cast a spell                        |
| Legendary Actions | Cast a spell     | Single-spell legendary row                                   |
| Legendary Actions | Use Spellcasting | Casts from an existing spell list via source action          |

The add menu encodes intent with `spellAcquisition` (`primary` vs `standalone`). Draft creation does not infer primary from section alone.

## Untitled list titles

Until the author sets a name, the master-detail list uses numbered fallbacks:

- Primary Actions Spellcasting → **Spellcasting**
- All other spell rows (standalone, bonus, reaction, legendary cast) → **Cast a spell** / Cast a spell 2, …

Authored names such as Hellfire Spellcasting are unchanged and are not primary unless `profile: primary` is set.

## Shared casting ability

- **Actions, primary Spellcasting:** ability is set on that row; other spell rows can share it.
- **Bonus Actions or Reactions:** new standalone rows are unnamed. A standalone spell such as Invisibility does not become Spellcasting.
- **Exactly one row named Spellcasting that already has an ability:** a new spell row shares that row. Several such rows, or only a standalone ability such as Hellfire Spellcasting, leave the ability unset. The author can still pick a source in the ability control.
- The ability control groups the six abilities and, when another spell row defines an ability, “Use another action”. A shared option shows the source name and the resolved ability. An unfinished row is not a source.
- Deleting that source, or switching it off a direct ability, is refused while a spell, attack, or save in any section still shares it. The detail notice names those actions. Changing Intelligence to Wisdom updates the labels and leaves the references on the same id.

A spell action and each spell in its list can add a limit. The control stays collapsed until the row has one. At Will is that empty state. A spell action cannot limit both itself and one of its spells.

Coven Magic is trait text, not a spell action. Legendary spell rows live in the legendary section. Both can reuse this ability shape later. They do not need a new one.
