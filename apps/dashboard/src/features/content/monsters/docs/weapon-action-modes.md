# Weapon action modes

Monster weapon actions do not store a mode. One `kind: 'weapon'` row becomes one attack line. Mode, reach, and range come from the catalog item.

Natural-weapon presets from the add menu seed name, damage type, mode, and a default **1d6** damage roll (see `DEFAULT_NATURAL_DAMAGE` in `content/action/action-presets.ts`). Authors can change the roll in the detail panel.

| Source               | What the resolver uses                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog `mode`       | Melee or ranged. Melee lines include reach 5. Ranged lines do not.                                                                                |
| Catalog `range`      | Copied onto that same line when the item has a range, including a melee weapon with a thrown range.                                               |
| Catalog `properties` | Listed on the attack profile. They do not add a second line.                                                                                      |
| `versatileDamage`    | Not applied. The primary roll is the catalog damage roll (or the action's damage override). Versatile is reported unavailable.                    |
| Thrown               | Not a separate attack. Catalog range still appears on the one line. Thrown is reported unavailable so the summary does not invent a second bonus. |
| Reach property       | Not added to the 5-foot melee reach. The published line stays at 5 feet, matching the stat block.                                                 |

`kind: 'attack'` is different: `modes` can include melee and ranged together, and reach or range is kept only for the modes that are selected.

`kind: 'natural-weapon'` stores one authored `mode`. Melee reach uses the authored reach, or 5 when reach is omitted. That 5 is the same default the stat block already publishes.

The natural-weapon detail form edits name, description, damage dice, primary damage type, and on-hit damage. It does not edit mode, reach, range, properties, or limited use. Those values stay on the action and still feed this resolver. The attack summary shows mode, reach, range, damage type, and the governing ability. It does not show limited use, and it does not name Finesse unless that property changes the ability on the attack-bonus line. Finesse still chooses Strength or Dexterity in the resolver. Limited use still prefixes the read-view action heading.

Knight's Greatsword is the melee catalog fixture (reach 5, no range). Knight's Heavy Crossbow is the ranged fixture (catalog range, and the action's damage override replaces the catalog dice). Neither fixture adds a mode field to the action.
