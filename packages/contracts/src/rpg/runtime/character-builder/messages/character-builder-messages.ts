import { defineMessage } from '../../../../validation/define-message'
import { getContentTypeSentenceForm } from '../../../content/lib/content-type-terms'
import { getProficiencyDomainCompactLabel } from '../../../vocab/proficiency'

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
    () => `Choose a ${getContentTypeSentenceForm('species')}.`,
  ),
  classRequired: defineMessage(
    'validation.characterBuilder.classRequired',
    () => `Choose a ${getContentTypeSentenceForm('classes')}.`,
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
  choiceSetsLoading: defineMessage(
    'validation.characterBuilder.choiceSetsLoading',
    () => 'Character options are still loading. Try again in a moment.',
  ),
  classNotInCatalog: defineMessage(
    'validation.characterBuilder.classNotInCatalog',
    () => `Selected ${getContentTypeSentenceForm('classes')} is no longer available.`,
  ),
  speciesNotInCatalog: defineMessage(
    'validation.characterBuilder.speciesNotInCatalog',
    () => `Selected ${getContentTypeSentenceForm('species')} is no longer available.`,
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
    ({ spellLabel }) =>
      `${spellLabel} is no longer available for this ${getContentTypeSentenceForm('classes')}.`,
  ),
  spellNotSelectableAtLevel: defineMessage<{ spellLabel: string; maxLevel: number }>(
    'validation.characterBuilder.spellNotSelectableAtLevel',
    ({ spellLabel, maxLevel }) =>
      maxLevel === 1
        ? `${spellLabel} is not a level 1 spell.`
        : `${spellLabel} is above the highest spell level you can select.`,
  ),
  proficiencyNoLongerAvailable: defineMessage<{ proficiencyLabel: string }>(
    'validation.characterBuilder.proficiencyNoLongerAvailable',
    ({ proficiencyLabel }) => `${proficiencyLabel} is no longer available.`,
  ),
  levelBelowAllowedMinimum: defineMessage(
    'validation.characterBuilder.levelBelowAllowedMinimum',
    () => 'Character level must be at least 1.',
  ),
  levelExceedsCampaignMaximum: defineMessage<{ maxLevel: number }>(
    'validation.characterBuilder.levelExceedsCampaignMaximum',
    ({ maxLevel }) => `Character level cannot exceed ${maxLevel}.`,
  ),
  levelMustMatchStartingLevel: defineMessage<{ startingLevel: number }>(
    'validation.characterBuilder.levelMustMatchStartingLevel',
    ({ startingLevel }) => `Campaign characters must be created at level ${startingLevel}.`,
  ),
  speciesRequiredForLanguageRecommendations: defineMessage(
    'validation.characterBuilder.speciesRequiredForLanguageRecommendations',
    () =>
      `Choose a ${getContentTypeSentenceForm('species')} to see recommended languages for your ancestry.`,
  ),
  finalizationFailed: defineMessage(
    'validation.characterBuilder.finalizationFailed',
    () => 'Fix the highlighted issues before creating your character.',
  ),
  automaticResolutionStalled: defineMessage(
    'validation.characterBuilder.automaticResolutionStalled',
    () => 'Could not automatically complete this character build.',
  ),
  magicItemGrantIncomplete: defineMessage<{ rarityLabel: string; remaining: number }>(
    'validation.characterBuilder.magicItemGrantIncomplete',
    ({ rarityLabel, remaining }) =>
      remaining === 1
        ? `Choose 1 ${rarityLabel} magic item grant.`
        : `Choose ${remaining} ${rarityLabel} magic item grants.`,
  ),
}

// ---------------------------------------------------------------------------
// Builder step readiness messages — empty/default/blocked copy for advanced
// steps (Equipment, Spells, Proficiencies). Distinct from validation messages.
// ---------------------------------------------------------------------------

export const characterBuilderStepReadinessMessages = {
  equipmentBlockedNoClass: defineMessage(
    'validation.characterBuilder.readiness.equipmentBlockedNoClass',
    () =>
      `Choose a ${getContentTypeSentenceForm('classes')} to see ${getContentTypeSentenceForm('equipment')} options.`,
  ),
  equipmentNoOptions: defineMessage(
    'validation.characterBuilder.readiness.equipmentNoOptions',
    () =>
      `No starting ${getContentTypeSentenceForm('equipment')} options are available for this ${getContentTypeSentenceForm('classes')}.`,
  ),
  equipmentReviewComplete: defineMessage(
    'validation.characterBuilder.readiness.equipmentReviewComplete',
    () => `Review your starting ${getContentTypeSentenceForm('equipment')}.`,
  ),
  equipmentContinuingWithout: defineMessage(
    'validation.characterBuilder.readiness.equipmentContinuingWithout',
    () => `Continuing without starting ${getContentTypeSentenceForm('equipment')}.`,
  ),
  equipmentPendingProficiencyLinked: defineMessage(
    'validation.characterBuilder.readiness.equipmentPendingProficiencyLinked',
    () => 'Complete Tool Proficiencies to resolve your included tool.',
  ),
  equipmentPendingIncludedTool: defineMessage(
    'validation.characterBuilder.readiness.equipmentPendingIncludedTool',
    () =>
      'Choose the tool included with this equipment package. This selection also completes your Tool Proficiency choice.',
  ),
  equipmentMagicItemGrantIncomplete: defineMessage<{ rarityLabel: string; remaining: number }>(
    'validation.characterBuilder.readiness.equipmentMagicItemGrantIncomplete',
    ({ rarityLabel, remaining }) =>
      remaining === 1
        ? `Choose 1 ${rarityLabel} magic item.`
        : `Choose ${remaining} ${rarityLabel} magic items.`,
  ),
  spellsBlockedNoClass: defineMessage(
    'validation.characterBuilder.readiness.spellsBlockedNoClass',
    () =>
      `Choose a ${getContentTypeSentenceForm('classes')} to see ${getContentTypeSentenceForm('spells')} options.`,
  ),
  spellsNotApplicableNoSpellcasting: defineMessage<{ className: string }>(
    'validation.characterBuilder.readiness.spellsNotApplicableNoSpellcasting',
    ({ className }) => `${className} does not have spellcasting.`,
  ),
  spellsNotApplicableInactiveAtLevel: defineMessage<{ className: string; level: number }>(
    'validation.characterBuilder.readiness.spellsNotApplicableInactiveAtLevel',
    ({ className, level }) => `${className} does not have spellcasting at level ${level}.`,
  ),
  spellsReviewComplete: defineMessage(
    'validation.characterBuilder.readiness.spellsReviewComplete',
    () => `Review your starting ${getContentTypeSentenceForm('spells', 2)}.`,
  ),
  proficienciesBlockedNoClass: defineMessage(
    'validation.characterBuilder.readiness.proficienciesBlockedNoClass',
    () => `Choose a ${getContentTypeSentenceForm('classes')} to see class proficiencies.`,
  ),
  proficienciesBlockedNoClassHelper: defineMessage(
    'validation.characterBuilder.readiness.proficienciesBlockedNoClassHelper',
    () => 'Class selection determines saving throws, skill choices, armor, weapons, and tools.',
  ),
  proficienciesNoChoicesRequired: defineMessage(
    'validation.characterBuilder.readiness.proficienciesNoChoicesRequired',
    () => 'No proficiency choices are required for this character.',
  ),
  proficienciesReviewComplete: defineMessage(
    'validation.characterBuilder.readiness.proficienciesReviewComplete',
    () => 'Review your starting proficiencies.',
  ),
}

export const characterBuilderProficiencyChoiceEmptyMessages = {
  language: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.language',
    () => 'No languages chosen yet.',
  ),
  skillProficiency: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.skillProficiency',
    () => `No ${getProficiencyDomainCompactLabel('skill').toLowerCase()} chosen yet.`,
  ),
  toolProficiency: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.toolProficiency',
    () => 'No tools chosen yet.',
  ),
  weaponProficiency: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.weaponProficiency',
    () => 'No weapons chosen yet.',
  ),
  armorTraining: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.armorTraining',
    () => 'No armor chosen yet.',
  ),
  fallback: defineMessage(
    'validation.characterBuilder.proficiencyChoiceEmpty.fallback',
    () => 'No choices chosen yet.',
  ),
}
