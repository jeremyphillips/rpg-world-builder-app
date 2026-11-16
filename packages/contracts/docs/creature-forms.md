# Creature forms

Alternate forms live on the monster body as `forms`. The shared value object is `content/creature/forms.ts`. The monster host is `content/monster/forms.ts`.

The true form uses the monster’s base statistics. Each alternate may replace `sizes`. Movement, speech, and `onlyInFormIds` are later phases. Hit points keep reading base `sizes` (`resolveMonsterHitPoints`).

When no Shape-Shift row exists, the stat block appends a derived Alternate Forms trait from `formatMonsterAlternateForms`. A Shape-Shift row replaces that entry with `formatMonsterShapeShift`. Removing the forms block deletes that row through `planMonsterActionRemoval`.

Authoring notes stay plain text and render as “While in {name} form, {notes}”.
