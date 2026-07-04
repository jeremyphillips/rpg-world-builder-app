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
  finalizationFailed: defineMessage(
    'validation.characterBuilder.finalizationFailed',
    () => 'Fix the highlighted issues before creating your character.',
  ),
}
