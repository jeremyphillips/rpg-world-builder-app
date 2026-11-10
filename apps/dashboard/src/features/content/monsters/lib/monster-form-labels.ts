import {
  ABILITY_ENTRIES,
  ABILITY_SCORE_TERM,
  type Ability,
  CHALLENGE_RATING_TERM,
  CREATURE_ARMOR_CLASS_KIND_TERM,
  getActionEconomyLabel,
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
} from '@rpg/contracts'

export { formatEquipmentCustomizationRemovalSummary } from './equipment/equipment-entry-customization.lib'

import { formatEquipmentRemovalInlineCount } from './equipment/equipment-entry-customization.lib'
import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'

import {
  formatContentListLoadErrorMessage,
  formatContentLoadErrorMessage,
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { vocabularyFieldLabel } from '@/features/vocabulary'

import type { MonsterActionSection } from './actions/monster-action-equipment-references'

const armorClassLabel = CREATURE_ARMOR_CLASS_KIND_TERM.label

function actionEconomySectionHeading(id: 'action' | 'bonus-action' | 'reaction'): string {
  return `${getActionEconomyLabel(id)}s`
}

/** Shown beside a clamped hit-point formula. Owned here and reused by the detail display. */
export const MONSTER_HP_MINIMUM_NOTE = '(minimum 1)'

export const MONSTER_ABILITY_SCORES_HEADING = vocabularyFieldLabel(ABILITY_SCORE_TERM, {
  plural: true,
})
export const MONSTER_ARMOR_CLASS_HEADING = armorClassLabel

export const MONSTER_BODY_ARMOR_SLOT_HEADING = getCreatureArmorClassKindLabel('armor')
export const MONSTER_SHIELD_SLOT_HEADING = getArmorCategoryLabel('shields')

export const MONSTER_HIT_POINTS_HEADING = vocabularyFieldLabel(HIT_POINTS_TERM, { plural: true })
export const MONSTER_CHALLENGE_HEADING = vocabularyFieldLabel(CHALLENGE_RATING_TERM)
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
export const MONSTER_CUSTOM_DESCRIPTION_LABEL = 'Custom description'
export const MONSTER_CUSTOM_DESCRIPTION_HINT = 'Optional text shown with this action.'
export const MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL = 'Add custom description'
export const MONSTER_NATURAL_WEAPON_DAMAGE_HINT = 'Ability modifiers are applied automatically.'
export const MONSTER_ON_HIT_LEGEND = 'On hit'
export const MONSTER_ON_HIT_HINT =
  'Additional damage dealt when this attack hits, beyond its primary damage.'
export const MONSTER_ACTION_ATTACK_PREVIEW_LABEL = 'Attack preview'
/** Stat-block preview row — not action-economy {@link getActionEconomyLabel} “Action”. */
export const MONSTER_ACTION_ATTACK_PREVIEW_ATTACK_LABEL = 'Attack'
export const MONSTER_ACTION_DAMAGE_FIELD_LABEL = getSpellAtomicEffectKindLabel('damage')
export const MONSTER_ACTION_ATTACK_PREVIEW_DAMAGE_LABEL = MONSTER_ACTION_DAMAGE_FIELD_LABEL
export const MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL = 'Extra'
export const MONSTER_ACTION_REACH_FIELD_LABEL = 'Reach'
export const MONSTER_ACTION_ATTACK_PREVIEW_REACH_LABEL = MONSTER_ACTION_REACH_FIELD_LABEL
export const MONSTER_ACTION_ATTACK_PREVIEW_RANGE_LABEL = 'Range'
export const MONSTER_ACTION_ATTACK_PREVIEW_PROPERTIES_LABEL = 'Properties'
export const MONSTER_DAMAGE_TYPE_CHANGE_LABEL = 'Change'
export const MONSTER_REMOVE_LABEL = 'Remove'
export const MONSTER_CANCEL_LABEL = 'Cancel'
export const MONSTER_LOADING_EQUIPMENT = `Loading ${getContentTypeMidSentenceLabel('equipment')}…`
export const MONSTER_EQUIPMENT_CATALOG_ERROR = formatContentLoadErrorMessage('equipment')
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
export const MONSTER_ACTIONS_HEADING = actionEconomySectionHeading('action')
export const MONSTER_BONUS_ACTIONS_HEADING = actionEconomySectionHeading('bonus-action')
export const MONSTER_REACTIONS_HEADING = actionEconomySectionHeading('reaction')

const MONSTER_ACTION_SECTION_HEADINGS = {
  actions: MONSTER_ACTIONS_HEADING,
  bonusActions: MONSTER_BONUS_ACTIONS_HEADING,
  reactions: MONSTER_REACTIONS_HEADING,
} as const satisfies Record<MonsterActionSection, string>

export function monsterActionSectionHeading(section: MonsterActionSection): string {
  return MONSTER_ACTION_SECTION_HEADINGS[section]
}

export const MONSTER_ADD_LABEL = 'Add'

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
export const MONSTER_ATTACK_BONUS_KIND_ABILITY_LABEL = 'Ability'
export const MONSTER_ATTACK_BONUS_KIND_SPELL_LABEL = 'Spellcasting'
export const MONSTER_ATTACK_BONUS_ABILITY_LABEL = 'Ability'
export const MONSTER_ATTACK_BONUS_PROFICIENCY_LABEL = 'Proficient'
export const MONSTER_SAVE_FAILURE_NOTE_LABEL = 'Failure note'
export const MONSTER_SAVE_SUCCESS_AMOUNT_LABEL = 'On successful save'
export const MONSTER_SAVE_THROW_SECTION_LEGEND = 'Saving throw'
export const MONSTER_SAVE_THROW_SECTION_DESCRIPTION =
  'Set the saving throw target and how difficult it is to succeed.'
export const MONSTER_SAVE_ABILITY_LABEL = 'Save ability'
export const MONSTER_SAVE_DC_LABEL = 'Save DC'
export const MONSTER_SAVE_DC_KIND_ABILITY_LABEL = 'Ability-based'
export const MONSTER_SAVE_DC_KIND_SPELL_LABEL = 'Spellcasting-based'
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
  return `This ${getContentTypeSentenceForm('equipment', 1)} is used by ${actionSummary}. Removing it will also remove that action.`
}

export function formatRemoveEquipmentConfirmLabel(actionCount: number): string {
  if (actionCount === 1) return 'Remove weapon and action'
  return `Remove weapon and ${actionCount} actions`
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
    description: `This ${equipmentPhrase} has customizations and is used by ${actionPhrase}. Removing it will discard those customizations and remove the linked actions.${summarySuffix}`,
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
