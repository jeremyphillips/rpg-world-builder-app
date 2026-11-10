# Spellcasting authoring

Spellcasting ability stays on the spell action. There is no creature-level casting profile.

- **Actions, and the name is unused:** the new row is named Spellcasting and the ability is left unset.
- **Bonus Actions or Reactions:** the new row is unnamed. A standalone spell such as Invisibility does not become Spellcasting.
- **Exactly one row named Spellcasting that already has an ability:** a new spell row shares that row. Several such rows, or only a standalone ability such as Hellfire Spellcasting, leave the ability unset. The author can still pick a source in the ability control.
- The ability control groups the six abilities and, when another spell row defines an ability, “Use another action”. A shared option shows the source name and the resolved ability. An unfinished row is not a source.
- Deleting that source, or switching it off a direct ability, is refused while a spell, attack, or save in any section still shares it. The detail notice names those actions. Changing Intelligence to Wisdom updates the labels and leaves the references on the same id.

A spell action and each spell in its list can add a limit. The control stays collapsed until the row has one. At Will is that empty state. A spell action cannot limit both itself and one of its spells.

Coven Magic is trait text, not a spell action. Legendary spell rows wait on a legendary section. Both can reuse this ability shape later. They do not need a new one.
