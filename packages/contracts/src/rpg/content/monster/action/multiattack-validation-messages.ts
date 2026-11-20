import { defineMessage } from '../../../../validation/define-message'

export const multiattackValidationMessages = {
  addAttackGroup: defineMessage(
    'validation.multiattack.add-attack-group',
    () => 'Add an attack group.',
  ),
  countWholeNumber: defineMessage(
    'validation.multiattack.count-whole-number',
    () => 'Enter a whole number of attacks.',
  ),
  countAtLeastOne: defineMessage(
    'validation.multiattack.count-at-least-one',
    () => 'Enter at least 1 attack.',
  ),
  selectAtLeastOneAttack: defineMessage(
    'validation.multiattack.select-at-least-one-attack',
    () => 'Select at least one attack.',
  ),
  attackUnavailable: defineMessage(
    'validation.multiattack.attack-unavailable',
    () => 'This attack is no longer available. Select another.',
  ),
  attackIneligible: defineMessage(
    'validation.multiattack.attack-ineligible',
    () => 'Select an action that can be used as an attack.',
  ),
  attackDuplicateInGroup: defineMessage(
    'validation.multiattack.attack-duplicate-in-group',
    () => 'This attack is already selected.',
  ),
  replacementCountMissing: defineMessage(
    'validation.multiattack.replacement-count-missing',
    () => 'Enter the number of attacks replaced.',
  ),
  replacementCountWholeNumber: defineMessage(
    'validation.multiattack.replacement-count-whole-number',
    () => 'Enter a whole number of attacks.',
  ),
  replacementCountAtLeastOne: defineMessage(
    'validation.multiattack.replacement-count-at-least-one',
    () => 'Replace at least 1 attack.',
  ),
  replacementCountExceedsTotal: defineMessage<{ total: number }>(
    'validation.multiattack.replacement-count-exceeds-total',
    ({ total }) =>
      total === 1
        ? 'Cannot replace more than 1 attack.'
        : `Cannot replace more than ${total} attacks.`,
  ),
  replacementNoChoices: defineMessage(
    'validation.multiattack.replacement-no-choices',
    () => 'Select at least one replacement action.',
  ),
  replacementActionUnavailable: defineMessage(
    'validation.multiattack.replacement-action-unavailable',
    () => 'This action is no longer available. Select another.',
  ),
  replacementActionIneligible: defineMessage(
    'validation.multiattack.replacement-action-ineligible',
    () => 'Select an action that can replace an attack.',
  ),
  replacementChoiceDuplicate: defineMessage(
    'validation.multiattack.replacement-choice-duplicate',
    () => 'This replacement choice is already selected.',
  ),
  replacementChoiceRedundant: defineMessage(
    'validation.multiattack.replacement-choice-redundant',
    () => 'This action is already part of the attacks being replaced.',
  ),
  spellUnavailable: defineMessage(
    'validation.multiattack.spell-unavailable',
    () => 'This spell is no longer available in Spellcasting.',
  ),
  spellcastingUnavailable: defineMessage(
    'validation.multiattack.spellcasting-unavailable',
    () => 'The referenced Spellcasting action is no longer available.',
  ),
  replacesActionIneligible: defineMessage(
    'validation.multiattack.replaces-action-ineligible',
    () => 'Select an attack from this Multiattack.',
  ),
  attackWordWithTarget: defineMessage(
    'validation.multiattack.attack-word-with-target',
    () => 'Choose any attack, or choose one attack by name.',
  ),
  attackWordRequiresCountOne: defineMessage(
    'validation.multiattack.attack-word-requires-count-one',
    () => 'Use "any attack" wording only when replacing 1 attack.',
  ),
  useModeContradiction: defineMessage(
    'validation.multiattack.use-mode-contradiction',
    () => 'Choose one action, or list choices.',
  ),
  useSpellOnClause: defineMessage(
    'validation.multiattack.use-spell-on-clause',
    () => 'Choose the spell on the Spellcasting choice.',
  ),
  replacementAndAlternative: defineMessage(
    'validation.multiattack.replacement-and-alternative',
    () => 'Remove the action replacement or the alternative sequence.',
  ),
  alternativeEmpty: defineMessage(
    'validation.multiattack.alternative-empty',
    () => 'Add an attack group or an action.',
  ),
  primaryNeedsAttackGroup: defineMessage(
    'validation.multiattack.primary-needs-attack-group',
    () => 'Add an attack group.',
  ),
  prerequisiteMissing: defineMessage(
    'validation.multiattack.prerequisite-missing',
    () => 'Select an action that must be used first.',
  ),
  prerequisiteUnavailable: defineMessage(
    'validation.multiattack.prerequisite-unavailable',
    () => 'This action is no longer available. Select another.',
  ),
  targetedReplacementExceeds: defineMessage<{ total: number; name: string }>(
    'validation.multiattack.targeted-replacement-exceeds',
    ({ total, name }) => `Cannot replace more than ${total} ${name} attacks.`,
  ),
  useActionUnavailable: defineMessage(
    'validation.multiattack.use-action-unavailable',
    () => 'This action is no longer available. Select another.',
  ),
  useActionIneligible: defineMessage(
    'validation.multiattack.use-action-ineligible',
    () => 'Select an action that can be used during Multiattack.',
  ),
  useSpellRepetitionForbidden: defineMessage(
    'validation.multiattack.use-spell-repetition-forbidden',
    () => 'Spellcasting cannot repeat during Multiattack. Set Times to 1 or remove repetition.',
  ),
} as const
