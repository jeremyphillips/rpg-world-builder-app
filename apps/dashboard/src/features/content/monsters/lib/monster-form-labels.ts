import type { LegendaryActionCategory } from './actions/legendary/legendary-action-category'
import {
  ABILITY_ENTRIES,
  ABILITY_SCORE_TERM,
  type Ability,
  CHALLENGE_RATING_TERM,
  CREATURE_ARMOR_CLASS_KIND_TERM,
  getActionEconomySectionLabel,
  getMonsterActionKindLabel,
  getSpellAtomicEffectKindLabel,
  getArmorCategoryLabel,
  getArmorCategorySentenceForm,
  getAverageHitPointsLabel,
  getContentTypeSentenceForm,
  getCreatureArmorClassKindLabel,
  getCreatureLanguageFluencyLabel,
  getMonsterReactionFieldLabel,
  getMonsterTraitSectionLabel,
  getProficiencyDomainCollectionLabel,
  joinInlineMetadata,
  joinNaturalList,
  getProficiencyGrantCompactAddLabel,
  getTermLabelSingular,
  HIT_POINTS_TERM,
  LANGUAGE_TERM,
  PASSIVE_PERCEPTION_TERM,
  PROFICIENCY_TERM,
  RECHARGE_DIE_FACES,
  SAVING_THROW_SHORT_LABEL,
  SAVING_THROW_TERM,
  SENSE_TERM,
  type CreatureArmorSlot,
  multiattackPositiveInt,
} from '@rpg/contracts'

export { formatEquipmentCustomizationRemovalSummary } from './equipment/equipment-entry-customization.lib'

import { formatEquipmentRemovalInlineCount } from './equipment/equipment-entry-customization.lib'
import { masterDetailEmptySectionLabel } from '../../lib/master-detail/master-detail-constants'
import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'

import {
  formatContentListLoadErrorMessage,
  formatContentLoadErrorMessage,
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { vocabularyFieldLabel } from '@/features/vocabulary'

import type { MonsterActionSection } from './actions/references/monster-action-equipment-references'

const armorClassLabel = CREATURE_ARMOR_CLASS_KIND_TERM.label

/** Shown beside a clamped hit-point formula. Owned here and reused by the detail display. */
export const MONSTER_HP_MINIMUM_NOTE = '(minimum 1)'

export const MONSTER_ABILITY_SCORES_HEADING = vocabularyFieldLabel(ABILITY_SCORE_TERM, {
  plural: true,
})
export const MONSTER_ARMOR_CLASS_HEADING = armorClassLabel

export const MONSTER_BODY_ARMOR_SLOT_HEADING = getCreatureArmorClassKindLabel('armor')
export const MONSTER_SHIELD_SLOT_HEADING = getArmorCategoryLabel('shields')

export const MONSTER_HIT_POINTS_HEADING = vocabularyFieldLabel(HIT_POINTS_TERM, { plural: true })
export const MONSTER_CHALLENGE_SECTION_HEADING = 'Challenge'
export const MONSTER_CHALLENGE_SECTION_HINT =
  "A monster's Challenge Rating represents its intended challenge and determines its XP and proficiency bonus."
export const MONSTER_CHALLENGE_HEADING = vocabularyFieldLabel(CHALLENGE_RATING_TERM)
export const MONSTER_LAIR_SECTION_HINT =
  'Configure benefits the creature gains when encountered in its lair.'
export const MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL = 'Has lair enhancements'
export const MONSTER_HAS_LAIR_ENHANCEMENTS_HINT =
  'Enables optional in-lair XP and use-count overrides. These apply only when the creature is in its lair.'
export const MONSTER_ADD_IN_LAIR_XP_LABEL = 'Add in-lair XP'
export const MONSTER_LAIR_EXPERIENCE_ADD_HINT = 'Leave unset to use the normal XP award.'
export const MONSTER_LAIR_XP_GROUP_HEADING = 'XP in lair'
export const MONSTER_LAIR_GROUP_HINT = ''
export const MONSTER_LAIR_EXPERIENCE_MODE_LABEL = 'XP method'
export const MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED = 'Suggested'
export const MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM = 'Custom'
export const MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION =
  'Based on the XP for the next Challenge Rating.'
export const MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL = 'XP amount'
export const MONSTER_LAIR_EXPERIENCE_CUSTOM_HINT_PREFIX = 'Suggested: '
export const MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL = 'Remove in-lair XP'
export const MONSTER_LAIR_EXPERIENCE_UNAVAILABLE =
  'No suggested in-lair XP is available at this CR.'
export const MONSTER_LAIR_EXPERIENCE_UNAVAILABLE_STORED =
  'No suggested in-lair XP is available at this CR. Enter a custom amount or remove in-lair XP.'
export const MONSTER_LEGENDARY_LAIR_USES_HINT =
  "Total uses while in the creature's lair. Leave empty to use the normal count."
export const MONSTER_LEGENDARY_RESISTANCE_USES_HINT = 'Uses per day. Recovered after a long rest.'
export const MONSTER_LEGENDARY_RESISTANCE_LAIR_USES_HINT =
  "Total daily uses while in the creature's lair."
export const MONSTER_MULTIATTACK_USE_LABEL = 'Use Multiattack'
export { LEGENDARY_RESISTANCE_CLEAR_NAME_CONTROL_LABEL as MONSTER_CLEAR_LEGENDARY_RESISTANCE_NAME_LABEL } from '@rpg/contracts'
export const MONSTER_SAVE_LABEL = SAVING_THROW_SHORT_LABEL
export const MONSTER_SAVE_PROF_LABEL = 'Save prof.'

export function monsterSavingThrowProficiencyAriaLabel(ability: Ability): string {
  const abilityLabel = ABILITY_ENTRIES[ability].label
  return `${abilityLabel} ${SAVING_THROW_TERM.sentence.singular} ${PROFICIENCY_TERM.sentence.singular}`
}
export const MONSTER_AWARDS_ZERO_XP_LABEL = 'Awards 0 XP'
export const MONSTER_AWARDS_ZERO_XP_HINT =
  'Some CR 0 creatures award no XP. When checked, XP shows as 0.'
export const MONSTER_FIXED_AVERAGE_LABEL = getAverageHitPointsLabel()
export const MONSTER_FIXED_FORMULA_LABEL = 'Formula'
export const MONSTER_FIXED_FORMULA_HINT = 'Optional. Shown as written.'
export const MONSTER_SENSES_HINT = 'Add special senses and their ranges.'
export const MONSTER_TELEPATHY_HINT =
  "Specify the range of this creature's telepathic communication."
export const MONSTER_DAMAGE_DEFENSES_HINT =
  'Choose damage types this creature is vulnerable, resistant, or immune to.'
export const MONSTER_CONDITION_IMMUNITIES_HINT =
  'Choose conditions that cannot affect this creature, such as Charmed or Poisoned.'
export const MONSTER_SPEAKS_LABEL = getCreatureLanguageFluencyLabel('speaks')
export const MONSTER_UNDERSTANDS_ONLY_LABEL = getCreatureLanguageFluencyLabel('understands-only')
export const MONSTER_ADD_SKILL_LABEL = getProficiencyGrantCompactAddLabel('skill')
export const MONSTER_LANGUAGES_FIELD_LABEL = vocabularyFieldLabel(LANGUAGE_TERM, { plural: true })
export const MONSTER_LANGUAGES_FIELD_HINT = 'Choose languages this monster understands.'
export const MONSTER_ADD_LANGUAGE_LABEL = `Add ${vocabularyFieldLabel(LANGUAGE_TERM)}`
export const MONSTER_ADD_SENSE_LABEL = `Add ${vocabularyFieldLabel(SENSE_TERM)}`
export const MONSTER_SPECIAL_SENSE_SUPPORTING_LABEL = `Special ${vocabularyFieldLabel(SENSE_TERM)}`
export const MONSTER_PASSIVE_PERCEPTION_LABEL = vocabularyFieldLabel(PASSIVE_PERCEPTION_TERM)
export const MONSTER_ADD_ITEM_LABEL = 'Add item'
export const MONSTER_EQUIP_TOGGLE_EQUIP_LABEL = 'Equip'
export const MONSTER_EQUIP_TOGGLE_UNEQUIP_LABEL = 'Unequip'

export function formatMonsterEquipmentEquippedAriaLabel(displayName: string): string {
  return `Equipped: ${displayName}`
}

export const MONSTER_EQUIPPED_LABEL = 'Equipped'
export const MONSTER_CUSTOMIZATION_LABEL = 'Customization'
export const MONSTER_CUSTOM_NAME_LABEL = 'Custom name'
export const MONSTER_USE_DEFAULT_NAME_LABEL = 'Use default name'
export const MONSTER_CUSTOM_DESCRIPTION_LABEL = 'Additional details'
export const MONSTER_CUSTOM_DESCRIPTION_HINT =
  'Narrative detail shown with the generated rules. It does not change them.'
export const MONSTER_RULES_TEXT_LABEL = 'Rules text'
export const MONSTER_CUSTOM_NAME_ADD_LABEL = 'Add custom name'
export const MONSTER_NATURAL_WEAPON_DAMAGE_HINT = 'Ability modifiers are applied automatically.'
export const MONSTER_BASE_DAMAGE_OVERRIDE_LABEL = 'Damage'
export const MONSTER_DAMAGE_OVERRIDE_REMOVE_LABEL = 'Use weapon default'
export const MONSTER_WEAPON_DAMAGE_USING_LABEL = 'Using weapon base damage'
export const MONSTER_WEAPON_DAMAGE_REPLACING_LABEL = 'Replacing weapon base roll'
export const MONSTER_WEAPON_DAMAGE_UNAVAILABLE_LABEL = 'Weapon unavailable'
export const MONSTER_WEAPON_DAMAGE_NONE_LABEL = 'This weapon has no base damage.'
export const MONSTER_WEAPON_DAMAGE_SOURCE_PREVIEW_LABEL = 'Weapon base damage'
export const MONSTER_FORM_BASE_MOVEMENT_PREVIEW_LABEL = 'Base'
export const MONSTER_ON_HIT_LEGEND = 'On hit'
export const MONSTER_ON_HIT_HINT =
  'Effects that apply when this attack hits, beyond its primary damage.'
export const MONSTER_ON_HIT_ADD_LABEL = 'Add effect'
export const MONSTER_ON_HIT_KIND_LABEL = 'Effect'
export const MONSTER_ON_HIT_NOTE_LABEL = 'Note'
export const MONSTER_ON_HIT_DETAILS_LABEL = 'Details'
export const MONSTER_ON_HIT_DETAILS_ADD_LABEL = 'Add details'
export const MONSTER_ON_HIT_CONDITION_DETAILS_HINT =
  'Additional rules or restrictions that apply to this effect.'
export const MONSTER_ON_HIT_CONDITION_DETAILS_PLACEHOLDER = 'E.g. (escape DC 15), from both claws'
export const MONSTER_ACTION_ATTACK_PREVIEW_LABEL = 'Attack preview'
export const MONSTER_ACTION_SPELL_PREVIEW_LABEL = 'Spellcasting preview'
export const MONSTER_REACTION_PREVIEW_LABEL = 'Reaction preview'
export const MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL = 'Multiattack preview'
export const MONSTER_MULTIATTACK_STEPS_LABEL = 'Sequence'
export const MONSTER_MULTIATTACK_ATTACKS_LABEL = 'Attacks'
export const MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL = 'Primary sequence'
export const MONSTER_MULTIATTACK_ATTACKS_HINT =
  'Add the attacks and other actions the creature uses as part of one Multiattack.'
export const MONSTER_MULTIATTACK_COMBINATION_HINT = 'These attacks can be used in any combination.'
export const MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL = 'Attack group'
export const MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL = 'Other actions'
export const MONSTER_MULTIATTACK_STEP_CONJUNCTION = 'and'
export const MONSTER_MULTIATTACK_IN_ANY_COMBINATION_LABEL = 'in any combination'
export const MONSTER_MULTIATTACK_CHOOSE_ATTACKS_LABEL = 'Choose attacks'
export const MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL = 'Choose an action'
export const MONSTER_MULTIATTACK_CHOOSE_BETWEEN_ACTIONS_LABEL = 'Choose between actions'
export const MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL = 'Add to sequence'
export const MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL = 'Add action choice'
export const MONSTER_MULTIATTACK_ADD_REPETITION_LABEL = 'Add repetition'
export const MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL = 'Remove repetition'
export const MONSTER_MULTIATTACK_COUNT_LABEL = 'Count'
export const MONSTER_MULTIATTACK_ATTACKS_PICKER_LABEL = 'Attacks'
export const MONSTER_MULTIATTACK_SEQUENCE_LABEL = 'Sequence'
export const MONSTER_MULTIATTACK_REPLACEMENT_LABEL = 'Action replacement'
export const MONSTER_MULTIATTACK_ADD_REPLACEMENT_LABEL = 'Add action replacement'
export const MONSTER_MULTIATTACK_REPLACEMENT_HINT =
  'Replace attacks with one of the selected actions.'
export const MONSTER_MULTIATTACK_ATTACKS_REPLACED_LABEL = 'Attacks replaced'
export const MONSTER_MULTIATTACK_ATTACKS_REPLACED_HINT =
  'Number of attacks used up by this replacement.'
export const MONSTER_MULTIATTACK_CHOICES_LABEL = 'Choices'
export const MONSTER_MULTIATTACK_CHOICES_HINT =
  'Choose one of these actions when making the replacement.'
export const MONSTER_MULTIATTACK_ADD_CHOICE_LABEL = 'Add choice'
export const MONSTER_MULTIATTACK_CHOICE_ACTION_LABEL = 'Action'
export const MONSTER_MULTIATTACK_SPELL_LABEL = 'Spell'
export const MONSTER_MULTIATTACK_SPELL_PLACEHOLDER = 'No specific spell'
export const MONSTER_MULTIATTACK_PIN_SPELL_LABEL = 'Pin specific spell'
export const MONSTER_MULTIATTACK_CLEAR_SPELL_LABEL = 'Clear spell'
export const MONSTER_MULTIATTACK_SPELL_HINT =
  'Optional. Choose a specific spell or leave unspecified.'
export const MONSTER_MULTIATTACK_ALTERNATIVE_LABEL = 'Alternative sequence'
export const MONSTER_MULTIATTACK_ADD_ALTERNATIVE_LABEL = 'Add alternative sequence'
export const MONSTER_MULTIATTACK_REMOVE_ALTERNATIVE_LABEL = 'Remove alternative sequence'
export const MONSTER_MULTIATTACK_ALTERNATIVE_HINT = 'The creature uses this sequence instead.'
export const MONSTER_MULTIATTACK_ONLY_AFTER_USING_LABEL = 'Only after using'
export const MONSTER_MULTIATTACK_NO_PREREQUISITE = 'No action can be required first.'
export const MONSTER_MULTIATTACK_OPTIONAL_LABEL = 'Optional'
export const MONSTER_MULTIATTACK_OPTIONAL_HINT =
  'The creature can choose whether to use this action.'
export const MONSTER_MULTIATTACK_TIMES_LABEL = 'Times'
export const MONSTER_MULTIATTACK_USE_STYLE_LABEL = 'Use'
export const MONSTER_MULTIATTACK_USE_SINGLE_LABEL = 'Single action'
export const MONSTER_MULTIATTACK_USE_CHOICE_LABEL = 'Choose between actions'
export const MONSTER_MULTIATTACK_ANY_ATTACK_LABEL = 'Allow repeated replacements'
export const MONSTER_MULTIATTACK_ANY_ATTACK_HINT =
  "Each eligible attack can be replaced separately with one use of the selected action, up to the available attack slots. The action's usage limits still apply."
export const MONSTER_MULTIATTACK_REPLACES_ONE_ATTACK = 'Replaces 1 attack'
export const MONSTER_MULTIATTACK_ADD_TARGET_ATTACK_LABEL = 'Add target attack'
export const MONSTER_MULTIATTACK_TARGET_ATTACK_LABEL = 'Target attack'
export const MONSTER_MULTIATTACK_EMPTY_ATTACKS_HEADING = 'No attack actions available'
export const MONSTER_MULTIATTACK_EMPTY_ATTACKS_BODY =
  'Add an attack action before configuring Multiattack.'
export const MONSTER_MULTIATTACK_ADD_ATTACK_ACTION_LABEL = 'Add attack action'
export const MONSTER_MULTIATTACK_REPLACEMENT_DISABLED_HINT =
  'Add another action before configuring a replacement.'
export const MONSTER_MULTIATTACK_REMOVE_ALTERNATIVE_FIRST = 'Remove the alternative sequence first.'
export const MONSTER_MULTIATTACK_REMOVE_REPLACEMENT_FIRST = 'Remove the action replacement first.'
export const MONSTER_MULTIATTACK_NO_SPELLS_IN_SPELLCASTING = 'No spells configured in Spellcasting.'

export function multiattackStepAttackCountLabel(count: number): string {
  return count === 1 ? '1 attack' : `${count} attacks`
}

export function multiattackUseOneOfActionsLabel(count: number): string {
  return `Use one of ${count} actions`
}

export function multiattackStepUseRepetitionSuffix(count: unknown): string | undefined {
  const parsed = multiattackPositiveInt(count)
  if (parsed === 2) return 'twice'
  if (parsed !== undefined && parsed > 2) return `${parsed} times`
  return undefined
}
export const MONSTER_TRAIT_PREVIEW_LABEL = 'Trait preview'
export const MONSTER_TRAIT_PREVIEW_UNAVAILABLE_GUIDANCE =
  'Complete required trait fields to show the stat-block preview.'
/** Stat-block preview row — not action-economy {@link getActionEconomyLabel} “Action”. */
export const MONSTER_ACTION_ATTACK_PREVIEW_ATTACK_LABEL = 'Attack'
export const MONSTER_ACTION_DAMAGE_FIELD_LABEL = getSpellAtomicEffectKindLabel('damage')
export const MONSTER_ACTION_ATTACK_PREVIEW_DAMAGE_LABEL = MONSTER_ACTION_DAMAGE_FIELD_LABEL
export const MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL = 'Extra'
export const MONSTER_ACTION_DISTANCE_SECTION_LEGEND = 'Distance'
export const MONSTER_ACTION_REACH_FIELD_LABEL = 'Melee reach'
export const MONSTER_ACTION_ATTACK_PREVIEW_REACH_LABEL = 'Reach'
export const MONSTER_ACTION_ATTACK_PREVIEW_RANGE_LABEL = 'Range'
export const MONSTER_ACTION_ATTACK_PREVIEW_PROPERTIES_LABEL = 'Properties'
export const MONSTER_DAMAGE_TYPE_CHANGE_LABEL = 'Change'
export const MONSTER_REMOVE_LABEL = 'Remove'
export const MONSTER_CANCEL_LABEL = 'Cancel'
export const MONSTER_LOADING_EQUIPMENT = `Loading ${getContentTypeMidSentenceLabel('equipment')}…`
export const MONSTER_LOADING_SPELLS = `Loading ${getContentTypeMidSentenceLabel('spells')}…`
export const MONSTER_EQUIPMENT_CATALOG_ERROR = formatContentLoadErrorMessage('equipment')
export const MONSTER_SPELL_CATALOG_ERROR = formatContentLoadErrorMessage('spells')
export const MONSTER_RETRY_LABEL = 'Retry'
export const MONSTER_SKILL_LOADING = `Loading ${getContentTypeMidSentenceLabel('skill-proficiencies', { plural: true })}…`
export const MONSTER_SKILL_ERROR = formatContentListLoadErrorMessage('skill-proficiencies')
export const MONSTER_BLANK_CHALLENGE_HINT =
  'Required to publish. Values that use proficiency bonus show "—" until set.'
export const MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP =
  'Set a Challenge Rating to determine the proficiency bonus.'

export function monsterSkillSectionLabel(): string {
  return getContentTypeItemLabel('skill-proficiencies')
}

export const MONSTER_WEAPON_PROFICIENCIES_HEADING = getProficiencyDomainCollectionLabel('weapon')

export const MONSTER_WEAPON_PROFICIENCY_MODE_HINT =
  'Most monsters are proficient with specific weapons. Use categories for broader weapon proficiencies.'

export const MONSTER_WEAPON_PROFICIENCY_CATEGORIES_HINT =
  'Categories include all weapons in that group.'

export function monsterEquipmentSectionLabel(): string {
  return getContentTypeItemLabel('equipment')
}

export const MONSTER_EQUIPMENT_EMPTY_MESSAGE = 'No equipment added yet.'

export const MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE =
  'Weapons from selected proficiencies'

export const MONSTER_EQUIPMENT_RECOMMENDATION_ADD_LABEL = '+ Add'

export function formatMonsterEquipmentBulkAddAriaLabel(count: number): string {
  return `Add all ${count} recommended weapons`
}

export const MONSTER_WEAPON_OWNED_PROFICIENCY_RECOMMENDATIONS_SOURCE =
  'Owned weapons without proficiency'

export const MONSTER_WEAPON_PROFICIENCY_RECOMMENDATION_ADD_LABEL = '+ Add'

export function formatMonsterWeaponProficiencyBulkAddAriaLabel(count: number): string {
  return `Add all ${count} weapon proficiencies`
}

export const MONSTER_ACTION_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Action',
  singular: 'action',
  plural: 'actions',
})

export const MONSTER_TRAITS_HEADING = getMonsterTraitSectionLabel()
export const MONSTER_ACTIONS_HEADING = getActionEconomySectionLabel('action')
export const MONSTER_BONUS_ACTIONS_HEADING = getActionEconomySectionLabel('bonus-action')
export const MONSTER_REACTIONS_HEADING = getActionEconomySectionLabel('reaction')
export const MONSTER_LEGENDARY_ACTIONS_HEADING = 'Legendary Actions'
export const MONSTER_LEGENDARY_USES_LABEL = 'Uses'
export const MONSTER_LEGENDARY_LAIR_USES_LABEL = 'Uses in lair'
export const MONSTER_TURN_LIMIT_LABEL = 'Turn limit'
export const MONSTER_TURN_LIMIT_EMPTY_LABEL = 'No turn limit'
export const MONSTER_TURN_LIMIT_OPTION_LABEL =
  "Can't take this action again until the start of its next turn"

const MONSTER_ACTION_SECTION_HEADINGS = {
  actions: MONSTER_ACTIONS_HEADING,
  bonusActions: MONSTER_BONUS_ACTIONS_HEADING,
  reactions: MONSTER_REACTIONS_HEADING,
  legendaryActions: MONSTER_LEGENDARY_ACTIONS_HEADING,
} as const satisfies Record<MonsterActionSection, string>

export function monsterActionSectionHeading(section: MonsterActionSection): string {
  return MONSTER_ACTION_SECTION_HEADINGS[section]
}

export function monsterActionSectionEmptyLabel(section: MonsterActionSection): string {
  return masterDetailEmptySectionLabel(monsterActionSectionHeading(section).toLowerCase())
}

export const MONSTER_ADD_LABEL = 'Add'

export const MONSTER_SHAPE_SHIFTING_HEADING = 'Shape-shifting'
export const MONSTER_SHAPE_SHIFTING_DESCRIPTION =
  "Define the creature's forms and identify its true form."
export const MONSTER_DEFINED_FORMS_LIST_HEADING = 'Defined forms'
/** Display-only label for an unnamed defined form row or selector option — not persisted. */
export const MONSTER_DEFINED_FORM_DISPLAY_FALLBACK = 'New form'
export const MONSTER_TRUE_FORM_HEADING = 'True form'
export const MONSTER_TRUE_FORM_KIND_PROFILE_LABEL = 'Creature profile'
export const MONSTER_TRUE_FORM_KIND_DEFINED_LABEL = 'Defined form'
export const MONSTER_TRUE_FORM_SELECT_LABEL = 'Select form'
export const MONSTER_TRUE_FORM_SELECT_PLACEHOLDER = 'Select a form'
export const MONSTER_TRUE_FORM_SELECT_HINT =
  "The selected form uses the creature's base statistics."
/** Shown on the true-form kind radio when Creature profile is selected. */
export const MONSTER_TRUE_FORM_PROFILE_HINT =
  "Uses the creature's main statistics as its true form."
/** Shown on the true-form kind radio when Defined form is selected and the list is empty. */
export const MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT =
  'Add a form below to designate it as the true form.'
export const MONSTER_FORMS_ADD_LABEL = 'Add forms'
export const MONSTER_FORMS_ADD_FORM_LABEL = 'Add form'
export const MONSTER_FORMS_REMOVE_LABEL = 'Remove forms'
export const MONSTER_FORMS_REMOVE_HEADLINE = 'Remove forms?'
export const MONSTER_FORMS_REMOVE_CONFIRM_LABEL = 'Remove forms'
export const MONSTER_FORMS_CANCEL_LABEL = 'Cancel'
export const MONSTER_FORM_ITEM_NOUN_LABEL = 'Form'
export const MONSTER_FORM_ITEM_NOUN_PLURAL = 'forms'
export const MONSTER_FORM_NAME_LABEL = 'Form name'
export const MONSTER_FORM_USE_BASE_MOVEMENT_LABEL = 'Use base movement'
export const MONSTER_FORM_USE_BASE_SIZES_LABEL = 'Use base sizes'
export const MONSTER_FORM_SPEECH_LABEL = "Can't speak in this form"
export const MONSTER_FORM_DIFFERENCES_LABEL = 'Show form differences in'
export const MONSTER_FORM_DIFFERENCES_FALLBACK_NOTE =
  'Shown in Speed and Languages rows: there is no Shape-Shift action'
export const MONSTER_FORM_AVAILABILITY_LABEL = 'Available in'
export const MONSTER_FORM_AVAILABILITY_ALL = 'All forms'
export const MONSTER_FORM_AVAILABILITY_SELECTED = 'Selected forms'
export const MONSTER_FORM_AVAILABILITY_FORMS_LABEL = 'Select forms'
export const MONSTER_FORM_AVAILABILITY_ALL_HINT = 'Includes forms added later.'
export const MONSTER_FORM_AVAILABILITY_SELECTED_HINT =
  "Choose forms below. New forms won't be included automatically."

export type MonsterFormAvailabilityRowKind = 'action' | 'trait'
export type MonsterFormAvailabilityHintPhase = 'intro' | 'all' | 'selected'

export function monsterFormAvailabilityRowKind(namePrefix: string): MonsterFormAvailabilityRowKind {
  return namePrefix.startsWith('traits.') ? 'trait' : 'action'
}

export function monsterFormAvailabilityIntroHint(rowKind: MonsterFormAvailabilityRowKind): string {
  return `Choose which forms can use this ${rowKind}.`
}

export function monsterFormAvailabilityHintPhase(
  restrictionKeyPresent: boolean,
  availabilityEngaged: boolean,
): MonsterFormAvailabilityHintPhase {
  if (restrictionKeyPresent) return 'selected'
  if (!availabilityEngaged) return 'intro'
  return 'all'
}

export function resolveMonsterFormAvailabilityHint(
  phase: MonsterFormAvailabilityHintPhase,
  rowKind: MonsterFormAvailabilityRowKind,
): {
  hint: string
  hintPosition: 'below-label' | 'below-control'
} {
  switch (phase) {
    case 'intro':
      return {
        hint: monsterFormAvailabilityIntroHint(rowKind),
        hintPosition: 'below-label',
      }
    case 'all':
      return {
        hint: MONSTER_FORM_AVAILABILITY_ALL_HINT,
        hintPosition: 'below-control',
      }
    case 'selected':
      return {
        hint: MONSTER_FORM_AVAILABILITY_SELECTED_HINT,
        hintPosition: 'below-control',
      }
  }
}

export { formatMonsterMissingFormLabel } from '@rpg/contracts'

export const MONSTER_FORM_NOTES_LABEL = 'Notes'
export const MONSTER_FORM_NOTES_HINT = 'Completes the sentence: While in this form, …'
export const MONSTER_SHAPE_SHIFT_EQUIPMENT_LABEL = 'Equipment'
export const MONSTER_SHAPE_SHIFT_PREREQUISITE_LABEL = 'Prerequisite'
export const MONSTER_SHAPE_SHIFT_PREREQUISITE_HINT =
  'Completes the sentence: If …, it shape-shifts.'
export const MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL = 'Destinations'
export const MONSTER_SHAPE_SHIFT_ACQUISITION_DESCRIPTION =
  'Changes among this creature’s alternate forms.'
export const MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE =
  'Add a form other than the true form before adding Shape-Shift.'

export function formatMonsterFormsRemovalSummary(summary: {
  unrestricted: readonly { name?: string }[]
  deletedShapeShifts: readonly { hadPrerequisite: boolean; hadDescription: boolean }[]
  strippedReferences: readonly { name?: string }[]
  indirectlyAffectedReferences: readonly { name?: string }[]
  deletedNotes: readonly string[]
}): string {
  const sentences: string[] = []
  if (summary.unrestricted.length > 0) {
    sentences.push(
      `Become unrestricted: ${summary.unrestricted.map((row) => row.name || 'Untitled row').join(', ')}.`,
    )
  }
  if (summary.deletedShapeShifts.length > 0) {
    sentences.push(
      `Deleted Shape-Shift action${summary.deletedShapeShifts.length === 1 ? '' : 's'}: ${summary.deletedShapeShifts.length}.`,
    )
  }
  if (summary.strippedReferences.length > 0) {
    sentences.push(`References removed: ${summary.strippedReferences.length}.`)
  }
  if (summary.indirectlyAffectedReferences.length > 0) {
    sentences.push(`Also affected: ${summary.indirectlyAffectedReferences.length} referenced rows.`)
  }
  if (summary.deletedNotes.length > 0) {
    sentences.push(`Deleted notes: ${summary.deletedNotes.join(', ')}.`)
  }
  return sentences.join(' ') || 'This removes the forms configuration.'
}

export function formatMonsterDefinedFormRemovalSummary(summary: {
  removedForm: { name?: string }
  wasTrueForm: boolean
  deletedNote: boolean
  rowsLosingForm: readonly { name?: string; remainingFormNames: readonly string[] }[]
  indirectlyAffectedReferences: readonly { name?: string }[]
}): string {
  const formName = summary.removedForm.name?.trim() || 'Untitled form'
  const rowName = (name?: string) => name?.trim() || 'Untitled row'
  const sentences: string[] = []
  if (summary.wasTrueForm) sentences.push('The creature profile will become the true form.')
  if (summary.rowsLosingForm.length > 0) {
    const names = summary.rowsLosingForm.map((row) => rowName(row.name))
    const verb = names.length === 1 ? 'loses' : 'lose'
    sentences.push(`${joinNaturalList(names)} ${verb} ${formName}.`)
    for (const row of summary.rowsLosingForm) {
      const label = rowName(row.name)
      sentences.push(
        row.remainingFormNames.length === 0
          ? `${label} will have no forms selected.`
          : `${label} will then be available only in ${joinNaturalList(row.remainingFormNames, { conjunction: 'or' })} form.`,
      )
    }
    sentences.push('No row becomes unrestricted.')
  }
  if (summary.indirectlyAffectedReferences.length > 0) {
    sentences.push(
      `Also affected: ${joinNaturalList(summary.indirectlyAffectedReferences.map((row) => rowName(row.name)))}.`,
    )
  }
  if (summary.deletedNote) sentences.push(`${formName}'s notes will be deleted.`)
  return sentences.join(' ') || 'This removes the defined form.'
}

export const MONSTER_ACQUISITION_SAVE_DESCRIPTION = 'Saving throw effect'
export const MONSTER_ACQUISITION_ATTACK_DESCRIPTION = 'Custom attack'
export const MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION =
  'Create a spell list whose casting ability other actions can reuse.'
export const MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION =
  'Create a separate spell action with its own spell choices.'
export const MONSTER_ACQUISITION_SPELL_DESCRIPTION = MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION
export const MONSTER_CAST_SPELL_LABEL = 'Cast a spell'

/**
 * Master-detail list titles when a row has no authored name. `special` and `save`
 * intentionally differ from `getMonsterActionKindLabel` presentation copy.
 */
export const MONSTER_ACTION_EDITOR_FALLBACK_TITLES = {
  special: 'Special Ability',
  save: 'Saving Throw',
} as const

export const MONSTER_ACQUISITION_SPECIAL_DESCRIPTION = 'Custom rules or effects'
export const MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION =
  'Combine multiple attacks into one action'

export const LEGENDARY_REFERENCE_DESCRIPTION = 'Use an action already defined for this creature.'
export const LEGENDARY_REFERENCE_DISABLED_NOTE = 'No attacks or abilities in Actions'
export const LEGENDARY_SPELLCASTING_DEFAULT_NAME = 'Use Spellcasting'
export const LEGENDARY_SPELLCASTING_DESCRIPTION =
  'Cast a spell from an existing action that already lists spells.'
export const LEGENDARY_SPELLCASTING_DISABLED_NOTE = 'No Spellcasting action with spells'
export const LEGENDARY_CAST_SPELL_LABEL = 'Cast a spell'
export const LEGENDARY_CAST_SPELL_DEFAULT_NAME = 'Cast a spell'
export const LEGENDARY_CAST_SPELL_DESCRIPTION = 'Choose a spell from the catalog.'
export const LEGENDARY_CAST_SPELL_DISABLED_NOTE = 'Spell catalog is not ready'
export const LEGENDARY_CUSTOM_LABEL = 'Custom ability'
export const LEGENDARY_CUSTOM_DESCRIPTION = 'Write a standalone legendary ability.'

export const LEGENDARY_ACTION_CATEGORY_LABELS = {
  reference: getMonsterActionKindLabel('action-reference'),
  spellcasting: LEGENDARY_SPELLCASTING_DEFAULT_NAME,
  'cast-spell': LEGENDARY_CAST_SPELL_LABEL,
  custom: LEGENDARY_CUSTOM_LABEL,
} as const satisfies Record<LegendaryActionCategory, string>

export const LEGENDARY_ACTION_DEFAULT_NAMES = {
  spellcasting: LEGENDARY_SPELLCASTING_DEFAULT_NAME,
  'cast-spell': LEGENDARY_CAST_SPELL_DEFAULT_NAME,
  custom: LEGENDARY_CUSTOM_LABEL,
} as const

export const MONSTER_REFERENCE_ACTION_LABEL = 'Source action'
export const MONSTER_REFERENCE_ACTION_HINT =
  'Choose an attack or ability from Actions. If you select several attacks, the creature makes one of them.'
export const MONSTER_MOVEMENT_LABEL = 'Movement'
export const MONSTER_MOVEMENT_PLACEHOLDER = 'No movement'
export const MONSTER_MOVEMENT_HINT = 'Optional movement before the action.'
export const MONSTER_MOVEMENT_OPPORTUNITY_LABEL = 'Without provoking Opportunity Attacks'
export const MONSTER_LEGENDARY_SPELLCASTING_FIELD_LABEL = 'Source action'
export const MONSTER_LEGENDARY_SPELLCASTING_FIELD_HINT =
  'Choose an existing action from Actions. Its spells and casting ability are reused.'
export const MONSTER_SPELLCASTING_SPELL_HINT = 'Choose a spell from this Spellcasting action.'
export const MONSTER_CAST_SPELL_HINT = 'Choose a spell from the catalog.'
export const MONSTER_CAST_AT_LEVEL_HINT = 'Set only to cast a higher-level version.'
export const MONSTER_SPELL_CAST_LEVEL_SET_LABEL = 'Set cast level'
export const MONSTER_SPELL_CAST_LEVEL_USE_DEFAULT_LABEL = 'Use default level'
export const MONSTER_SPELL_FREQUENCY_LABEL = 'Frequency'
export const MONSTER_SPELL_COMPONENT_OMISSION_LABEL = 'Omit components'
export const MONSTER_SPELL_COMPONENT_OMISSION_REMOVE_LABEL = 'Restore components'
export const MONSTER_SPELL_COMPONENT_OMISSION_HINT = "Select components that aren't required."
export const MONSTER_SPELL_CAST_LEVEL_PLACEHOLDER = 'Select level'
export const MONSTER_SPELL_CHANGE_LABEL = 'Change spell'
export const MONSTER_SPELL_ALREADY_USED_LABEL = 'Already used'
export const MONSTER_SPELL_PICKER_SEARCH_PLACEHOLDER = 'Search spells'
export const MONSTER_SPELL_PICKER_NO_RESULTS = 'No spells match this search.'
export const MONSTER_SPELL_PICKER_NO_ITEMS = 'No spells are available.'
export const MONSTER_REMOVE_REFERENCED_ACTION_HEADLINE = 'Remove referenced action'
export const MONSTER_MOVE_REFERENCED_ACTION_HEADLINE = 'Move referenced action'

export function formatRemoveReferencedActionBody(names: string): string {
  return `This action is used by ${names}. Removing it drops that reference.`
}

export function formatMoveReferencedActionBody(names: string): string {
  return `${names} will be invalid until this action is moved back to Actions.`
}

function monsterArmorSlotMidSentenceNoun(slot: CreatureArmorSlot): string {
  if (slot === 'shield') return getArmorCategorySentenceForm('shields', 1)
  return getTermLabelSingular(getCreatureArmorClassKindLabel('armor'))
}

export function formatMonsterArmorSlotAddLabel(slot: CreatureArmorSlot): string {
  return `${MONSTER_ADD_LABEL} ${monsterArmorSlotMidSentenceNoun(slot)}`
}

export function formatMonsterArmorSlotChangeLabel(slot: CreatureArmorSlot): string {
  return `Change ${monsterArmorSlotMidSentenceNoun(slot)}`
}

export function formatMonsterArmorSlotSelectLabel(slot: CreatureArmorSlot): string {
  return `Select ${monsterArmorSlotMidSentenceNoun(slot)}`
}

export const MONSTER_ARMOR_SLOT_EMPTY_LABEL = 'None selected'

export function getMonsterArmorSlotUiCopy(slot: CreatureArmorSlot): {
  add: string
  change: string
  select: string
} {
  return {
    add: formatMonsterArmorSlotAddLabel(slot),
    change: formatMonsterArmorSlotChangeLabel(slot),
    select: formatMonsterArmorSlotSelectLabel(slot),
  }
}

export const MONSTER_ACTION_NAME_LABEL = 'Name'
export const MONSTER_ATTACK_BONUS_LABEL = 'Attack bonus'

export function formatMonsterActionAttackPreviewConfigureHint(fieldLabel: string): string {
  return `Configure ${fieldLabel} to calculate this attack.`
}

export function formatMonsterActionSpellPreviewConfigureHint(fieldLabel: string): string {
  return `Configure ${fieldLabel} to preview this spellcasting action.`
}

export function formatMonsterActionMultiattackPreviewConfigureHint(fieldLabel: string): string {
  return `Configure ${fieldLabel} to preview this multiattack.`
}
export const MONSTER_ATTACK_BONUS_ABILITY_LABEL = 'Ability'
export const MONSTER_ATTACK_BONUS_PROFICIENCY_LABEL = 'Proficient'
export const MONSTER_SAVE_SUCCESS_AMOUNT_LABEL = 'On successful save'
export const MONSTER_SAVE_USE_EXISTING_EFFECT_LABEL = 'Use existing effect'
export const MONSTER_SAVE_SHARED_EFFECT_LABEL = 'Shared with another outcome'
export const MONSTER_SAVE_DELETE_UNUSED_EFFECT_LABEL = 'Delete unused effect'
export const MONSTER_SAVE_EFFECT_AMOUNT_LABEL = 'Amount'
export const MONSTER_SAVE_FAILED_LEGEND = 'Failed save'
export const MONSTER_SAVE_SUCCESSFUL_LEGEND = 'Successful save'
export const MONSTER_SAVE_FIRST_FAILURE_LEGEND = 'First failure'
export const MONSTER_SAVE_SECOND_FAILURE_LEGEND = 'Second failure'
export const MONSTER_SAVE_EFFECTS_LEGEND = 'Effects'
export const MONSTER_SAVE_REPEAT_ADD_LABEL = 'Repeat save'
export const MONSTER_SAVE_REPEAT_ELIGIBILITY_LABEL = 'Eligibility note'
export const MONSTER_SAVE_OUTCOME_DISCLOSURE_LABEL = 'Save outcome'
export const MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL = 'Rules text'
export const MONSTER_ORDERED_EFFECT_REPLACE_CONDITION_ADD_LABEL = 'Replace condition'
export const MONSTER_SAVE_THROW_SECTION_DESCRIPTION =
  'Set the saving throw target and how difficult it is to succeed.'
export const MONSTER_SAVE_TARGETING_LEGEND = 'Targeting'
export const MONSTER_SAVE_TARGETING_DESCRIPTION = 'Who makes the savings throw?'
export const MONSTER_SAVE_TARGETING_MODE_LABEL = 'Targeting mode'
export const MONSTER_SAVE_TARGETING_MODE_SELECTED_TARGETS = 'Selected targets'
export const MONSTER_SAVE_TARGETING_MODE_AREA_FROM_SELF = 'Area from self'
export const MONSTER_SAVE_AREA_OCCUPANT_REQUIREMENTS_HINT =
  'Optional restrictions on which creatures in the area are affected.'
export const MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL = 'Ability-based'
export const MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL = 'Spellcasting-based'
export const MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL = 'Use an ability score'
export const MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL = 'Use a spellcasting ability'
export const MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT =
  'Uses the selected ability modifier, with optional proficiency.'
export const MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT =
  'Uses the selected spellcasting ability and proficiency bonus.'
export const MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL = 'Include proficiency bonus'
export const MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_HINT =
  "Adds the creature's proficiency bonus to the attack roll. Normally enabled for custom attacks."
export const MONSTER_ATTACK_BONUS_ADVANCED_LEGEND = 'Advanced options'
export const MONSTER_SAVE_DC_ABILITY_LABEL = 'DC ability'
export const MONSTER_SAVE_DC_PROFICIENCY_LABEL = 'Include proficiency bonus'
export const MONSTER_LIMIT_RECHARGES_ON_LABEL = 'Recharges on'

/** Authoring hint for recharge threshold — matches stat-block recharge roll notation. */
export function monsterLimitRechargesOnHint(minRoll: unknown): string {
  const roll = normalizeRechargeMinRoll(minRoll)
  const rechargesOn =
    roll === undefined
      ? `Recharges on …–${RECHARGE_DIE_FACES}`
      : roll >= RECHARGE_DIE_FACES
        ? `Recharges on ${RECHARGE_DIE_FACES}`
        : `Recharges on ${roll}–${RECHARGE_DIE_FACES}`
  return `Roll a d6 at the start of each turn. ${rechargesOn}.`
}

function normalizeRechargeMinRoll(minRoll: unknown): number | undefined {
  if (minRoll === null || minRoll === undefined || minRoll === '') return undefined
  const value = typeof minRoll === 'number' ? minRoll : Number(minRoll)
  if (!Number.isFinite(value) || !Number.isInteger(value)) return undefined
  if (value < 2 || value > RECHARGE_DIE_FACES) return undefined
  return value
}
export const MONSTER_TRIGGER_LABEL = getMonsterReactionFieldLabel('trigger')
export const MONSTER_TRIGGER_PLACEHOLDER = 'When this reaction can be used'
export const MONSTER_PARRY_AC_BONUS_LABEL = 'AC bonus'
export const MONSTER_PARRY_AC_BONUS_HINT = 'Added against the triggering attack.'
export const MONSTER_PARRY_FOLLOW_UP_LABEL = 'Attack'
export const MONSTER_PARRY_FOLLOW_UP_HINT = 'Choose an existing attack from Actions.'
export const MONSTER_PARRY_DESCRIPTION = 'Add a bonus to AC against the triggering attack.'
export const MONSTER_LEAP_DESCRIPTION = 'Jump by spending movement.'
export const MONSTER_LEAP_DISTANCE_LABEL = 'Jump distance'
export const MONSTER_LEAP_DISTANCE_HINT = 'How far the creature jumps.'
export const MONSTER_LEAP_MOVEMENT_LABEL = 'Movement spent'
export const MONSTER_LEAP_MOVEMENT_HINT = 'Movement required to make the jump.'
export function formatLeapWalkSpeedHint(walkFeet: number): string {
  return `${MONSTER_LEAP_MOVEMENT_HINT} Walk Speed: ${walkFeet} ft.`
}
export const MONSTER_TELEPORT_DESCRIPTION = 'Teleport to an unoccupied space it can see.'
export const MONSTER_TELEPORT_DISTANCE_LABEL = 'Distance'
export const MONSTER_TELEPORT_DISTANCE_HINT = 'How far it teleports.'
export const MONSTER_TELEPORT_PASSENGER_LEGEND = 'Another creature'
export const MONSTER_TELEPORT_PASSENGER_HINT =
  'Optional restrictions on the other creature. The sentence begins with "itself or a …".'
export const MONSTER_TELEPORT_WITHIN_LABEL = 'Within'
export const MONSTER_TELEPORT_WITHIN_HINT = 'How close that creature must be.'
export const MONSTER_TAKE_ACTIONS_DESCRIPTION = 'Take Dash, Disengage, or Hide.'
export const MONSTER_TAKE_ACTIONS_ACTIONS_LABEL = 'Actions'
export const MONSTER_TAKE_ACTIONS_CHOICE_LABEL = 'Action behavior'
export const MONSTER_TAKE_ACTIONS_BEHAVIOR_HINT_DISABLED =
  'Choose at least two actions to configure behavior.'
export const MONSTER_TAKE_ACTIONS_CHOICE_ONE = 'Chooses one'
export const MONSTER_TAKE_ACTIONS_CHOICE_EACH = 'Uses each'
export const MONSTER_TAKE_ACTIONS_RESTRICTION_LABEL = 'Restriction'
export const MONSTER_TAKE_ACTIONS_RESTRICTION_HINT = 'Leading clause, without a final period.'
export const MONSTER_TAKE_ACTIONS_RESTRICTION_PLACEHOLDER = 'While in Dim Light or darkness'
export const MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL = 'Use existing action'
export const MONSTER_ACTION_REFERENCE_UNNAMED_TITLE = 'Use action'
export const MONSTER_ACTION_REFERENCE_CHOOSE_SOURCE = 'Choose a source action'
export const MONSTER_ACTION_REFERENCE_SOURCE_UNAVAILABLE = 'Source action unavailable'

export function formatMonsterActionReferenceUseTitle(names: string): string {
  return `Use ${names}`
}

export function formatMonsterActionReferenceUsesSummary(names: string): string {
  return `Uses ${names}`
}
export const MONSTER_REACTION_REFERENCE_HINT =
  'The reaction uses this action. The action stays in Actions.'
export const MONSTER_REACTION_ADDITIONAL_RULES_LABEL = 'Additional rules'
export const MONSTER_REACTION_ADDITIONAL_RULES_HINT =
  'Additional restrictions or effects when using the referenced action.'
export const MONSTER_REACTION_CAST_SPELL_DESCRIPTION =
  'Cast one or more spells in response to their triggers.'
export const MONSTER_REACTION_CUSTOM_LABEL = 'Custom reaction'
export const MONSTER_REACTION_CUSTOM_DESCRIPTION = 'Write the trigger and the response.'
export const MONSTER_ADDITIONAL_CONDITION_LABEL =
  getMonsterReactionFieldLabel('additionalCondition')
export const MONSTER_ADDITIONAL_CONDITION_HINT = "Each spell's own trigger always applies."
export const MONSTER_MOVE_TO_LABEL = 'Move to'
export function monsterAddWeaponShortcut(): string {
  return `Add a weapon to ${getContentTypeItemLabel('equipment')}`
}

export function formatAddedEquipmentNotice(name: string): string {
  return `${name} was added to ${getContentTypeItemLabel('equipment')}.`
}

export function formatCastingSourceDeleteNotice(names: readonly string[]): string {
  return `This action's spellcasting ability is used by ${names.join(', ')}.`
}

export function formatCastingSourceChangeNotice(names: readonly string[]): string {
  return `This spellcasting ability is used by ${names.join(', ')}.`
}

export function formatDropTriggerBody(): string {
  return `Moving this reaction out of ${MONSTER_REACTIONS_HEADING} drops its trigger.`
}

export const MONSTER_DROP_TRIGGER_CONFIRM = 'Move and drop trigger'

export function formatEquipmentQuantityLabel(quantity: number, equipped: boolean): string {
  if (equipped && quantity > 1) {
    return joinInlineMetadata([`Qty ${quantity}`, '1 equipped'])
  }
  return `Qty ${quantity}`
}

export function formatRemoveEquipmentConfirmTitle(name: string): string {
  return `Remove ${name}?`
}

export function formatRemoveEquipmentConfirmBody(actionSummary: string): string {
  return `This ${getContentTypeSentenceForm('equipment', 1)} is used by ${actionSummary}. Those actions keep a missing weapon until you choose another or delete them.`
}

export function formatRemoveEquipmentConfirmLabel(_actionCount: number): string {
  return MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL
}

export const MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME = getContentTypeMidSentenceLabel('equipment')

export const MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL = `Remove ${getContentTypeMidSentenceLabel('equipment')}`

const EQUIPMENT_REMOVAL_CUSTOMIZED_BODY = `This ${getContentTypeSentenceForm('equipment', 1)} has customizations that will be discarded.`

export type EquipmentRemovalConfirmCopyInput = {
  displayName: string
  reasons: readonly ('customized' | 'referenced')[]
  referencedActionCount: number
  referencedActionSummary?: string
  customizationSummary?: string
}

export const MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE = 'This replaces every piece in the slot.'

export function formatArmorSlotReplacementConfirmCopy(input: {
  flagged: readonly EquipmentRemovalConfirmCopyInput[]
}): {
  headline: string
  description: string
  confirmLabel: string
} {
  const flagged = input.flagged[0]
  if (input.flagged.length === 1 && flagged) {
    const copy = formatEquipmentRemovalConfirmCopy(flagged)
    return {
      headline: copy.headline,
      description: `${MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE} ${copy.description}`,
      confirmLabel: copy.confirmLabel,
    }
  }

  const details = input.flagged
    .map((entry) => {
      const copy = formatEquipmentRemovalConfirmCopy(entry)
      return `${entry.displayName}: ${copy.description}`
    })
    .join(' ')
  return {
    headline: 'Replace this slot?',
    description: `${MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE} ${details}`,
    confirmLabel: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL,
  }
}

export function formatEquipmentRemovalConfirmCopy({
  displayName,
  reasons,
  referencedActionCount,
  referencedActionSummary,
  customizationSummary,
}: EquipmentRemovalConfirmCopyInput): {
  headline: string
  description: string
  confirmLabel: string
} {
  const referencedOnly = reasons.includes('referenced') && !reasons.includes('customized')
  if (referencedOnly) {
    return {
      headline: formatRemoveEquipmentConfirmTitle(displayName),
      description: formatRemoveEquipmentConfirmBody(referencedActionSummary ?? ''),
      confirmLabel: formatRemoveEquipmentConfirmLabel(referencedActionCount),
    }
  }

  const customizedOnly = reasons.includes('customized') && !reasons.includes('referenced')
  const summarySuffix = customizationSummary ? ` ${customizationSummary}.` : ''

  if (customizedOnly) {
    return {
      headline: formatRemoveEquipmentConfirmTitle(displayName),
      description: `${EQUIPMENT_REMOVAL_CUSTOMIZED_BODY}${summarySuffix}`,
      confirmLabel: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL,
    }
  }

  const actionPhrase = formatEquipmentRemovalInlineCount(
    referencedActionCount,
    'linked action',
    'linked actions',
  )
  const equipmentPhrase = getContentTypeSentenceForm('equipment', 1)
  return {
    headline: formatRemoveEquipmentConfirmTitle(displayName),
    description: `This ${equipmentPhrase} has customizations and is used by ${actionPhrase}. Removing it discards those customizations. The actions keep a missing weapon until you choose another or delete them.${summarySuffix}`,
    confirmLabel: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL,
  }
}

export function formatWeaponRetargetNotice(
  nextName: string,
  actionNames: readonly string[],
): string {
  return `Linked actions now use ${nextName}: ${actionNames.join(', ')}.`
}

export function formatClearAdjustmentConfirmBody(): string {
  return `This change removes the ${armorClassLabel} adjustment because the new ${getContentTypeSentenceForm('equipment', 1)} cannot use it.`
}

export const MONSTER_CLEAR_ADJUSTMENT_CONFIRM = 'Change item'
