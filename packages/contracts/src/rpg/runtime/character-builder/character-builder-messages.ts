import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Character builder validation messages (surface catalog).
// Wizard workflow/state copy only — incomplete steps, pending draft choices.
// Rules describing valid character data stay in characterValidationMessages
// (validation.character.*); this catalog may reuse that one but never the
// reverse. See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderValidationMessages = {
  stepIncomplete: defineMessage(
    'validation.characterBuilder.stepIncomplete',
    () => 'Complete this step before continuing.',
  ),
  nameRequired: defineMessage(
    'validation.characterBuilder.nameRequired',
    () => 'Enter a character name.',
  ),
  alignmentRequired: defineMessage(
    'validation.characterBuilder.alignmentRequired',
    () => 'Choose an alignment.',
  ),
  speciesRequired: defineMessage(
    'validation.characterBuilder.speciesRequired',
    () => 'Choose a species.',
  ),
  classRequired: defineMessage(
    'validation.characterBuilder.classRequired',
    () => 'Choose a class.',
  ),
  abilityMethodRequired: defineMessage(
    'validation.characterBuilder.abilityMethodRequired',
    () => 'Choose how to generate ability scores.',
  ),
  abilitiesIncomplete: defineMessage(
    'validation.characterBuilder.abilitiesIncomplete',
    () => 'Assign a score to every ability.',
  ),
  standardArrayExactAssignment: defineMessage(
    'validation.characterBuilder.standardArrayExactAssignment',
    () => 'Assign each standard array value to exactly one ability.',
  ),
  choiceSetUnsatisfied: defineMessage<{ label: string; min: number }>(
    'validation.characterBuilder.choiceSetUnsatisfied',
    ({ label, min }) =>
      min === 1 ? `Choose an option for ${label}.` : `Choose at least ${min} options for ${label}.`,
  ),
  choiceSetTooMany: defineMessage<{ label: string; max: number }>(
    'validation.characterBuilder.choiceSetTooMany',
    ({ label, max }) =>
      max === 1
        ? `Choose only one option for ${label}.`
        : `Choose at most ${max} options for ${label}.`,
  ),
  chooseCantrips: defineMessage<{ count: number }>(
    'validation.characterBuilder.chooseCantrips',
    ({ count }) => (count === 1 ? 'Choose 1 more cantrip.' : `Choose ${count} more cantrips.`),
  ),
  chooseSpells: defineMessage<{ count: number }>(
    'validation.characterBuilder.chooseSpells',
    ({ count }) =>
      count === 1 ? 'Choose 1 more prepared spell.' : `Choose ${count} more prepared spells.`,
  ),
  removeCantrips: defineMessage<{ count: number }>(
    'validation.characterBuilder.removeCantrips',
    ({ count }) => (count === 1 ? 'Remove 1 cantrip.' : `Remove ${count} cantrips.`),
  ),
  removeSpells: defineMessage<{ count: number }>(
    'validation.characterBuilder.removeSpells',
    ({ count }) => (count === 1 ? 'Remove 1 prepared spell.' : `Remove ${count} prepared spells.`),
  ),
  spellNoLongerAvailable: defineMessage<{ spellLabel: string }>(
    'validation.characterBuilder.spellNoLongerAvailable',
    ({ spellLabel }) => `${spellLabel} is no longer available for this class.`,
  ),
  spellNotSelectableAtLevel: defineMessage<{ spellLabel: string; maxLevel: number }>(
    'validation.characterBuilder.spellNotSelectableAtLevel',
    ({ spellLabel, maxLevel }) =>
      maxLevel === 1
        ? `${spellLabel} is not a level 1 spell.`
        : `${spellLabel} is above the highest spell level you can select.`,
  ),
  finalizationFailed: defineMessage(
    'validation.characterBuilder.finalizationFailed',
    () => 'Fix the highlighted issues before creating your character.',
  ),
}
