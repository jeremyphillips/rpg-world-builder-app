import {
  ABILITY_ENTRIES,
  ABILITY_SCORE_TERM,
  type Ability,
  CHALLENGE_RATING_TERM,
  CREATURE_ARMOR_CLASS_KIND_TERM,
  getActionEconomyLabel,
  getAverageHitPointsLabel,
  getContentTypeSentenceForm,
  getCreatureLanguageFluencyLabel,
  getMonsterActionKindFieldLabel,
  getMonsterReactionFieldLabel,
  getMonsterTraitSectionLabel,
  getNaturalArmorBonusFieldLabel,
  getProficiencyDomainCollectionLabel,
  joinInlineMetadata,
  getProficiencyGrantCompactAddLabel,
  HIT_POINTS_TERM,
  LANGUAGE_TERM,
  PASSIVE_PERCEPTION_TERM,
  PROFICIENCY_TERM,
  SAVING_THROW_SHORT_LABEL,
  SAVING_THROW_TERM,
  SENSE_TERM,
} from '@rpg/contracts'

export { formatEquipmentCustomizationRemovalSummary } from './equipment/equipment-entry-customization.lib'

import { formatEquipmentRemovalInlineCount } from './equipment/equipment-entry-customization.lib'

import {
  formatContentListLoadErrorMessage,
  formatContentLoadErrorMessage,
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { vocabularyFieldLabel } from '@/features/vocabulary/lib/term-labels'

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
export const MONSTER_NATURAL_BONUS_LABEL = getNaturalArmorBonusFieldLabel()
export const MONSTER_FIXED_AC_LABEL = `${armorClassLabel} value`
export const MONSTER_FIXED_AC_HINT = 'Ignores ability scores and equipment.'
export const MONSTER_TELEPATHY_HINT = 'Leave empty for no telepathy'
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
export const MONSTER_EQUIPPED_LABEL = 'Equipped'
export const MONSTER_CUSTOMIZATION_LABEL = 'Customization'
export const MONSTER_CUSTOM_NAME_LABEL = 'Custom name'
export const MONSTER_CUSTOM_DESCRIPTION_LABEL = 'Custom description'
export const MONSTER_AC_ADJUSTMENT_LABEL = `${armorClassLabel} adjustment`
export const MONSTER_REMOVE_LABEL = 'Remove'
export const MONSTER_CANCEL_LABEL = 'Cancel'
export const MONSTER_LOADING_EQUIPMENT = `Loading ${getContentTypeMidSentenceLabel('equipment')}…`
export const MONSTER_EQUIPMENT_CATALOG_ERROR = formatContentLoadErrorMessage('equipment')
export const MONSTER_RETRY_LABEL = 'Retry'
export const MONSTER_SKILL_LOADING = `Loading ${getContentTypeMidSentenceLabel('skill-proficiencies', { plural: true })}…`
export const MONSTER_SKILL_ERROR = formatContentListLoadErrorMessage('skill-proficiencies')
export const MONSTER_BLANK_CHALLENGE_HINT =
  'Required to publish. Values that use proficiency bonus show "—" until set.'

export function monsterGoToEquipmentLabel(): string {
  return `Go to ${getContentTypeItemLabel('equipment')}`
}

export function monsterChooseBodyArmorMessage(): string {
  return `Choose and equip body armor in ${getContentTypeItemLabel('equipment')} to calculate ${armorClassLabel}.`
}

export function monsterBodyArmorConflictMessage(names: readonly string[]): string {
  return `Two body armors are equipped: ${names.join(', ')}. Unequip one in ${getContentTypeItemLabel('equipment')} to calculate ${armorClassLabel}.`
}

export function monsterBodyArmorIgnoredMessage(name: string): string {
  return `Equipped ${name} does not contribute to ${armorClassLabel}.`
}

export function monsterSkillSectionLabel(): string {
  return getContentTypeItemLabel('skill-proficiencies')
}

export const MONSTER_WEAPON_PROFICIENCIES_HEADING = getProficiencyDomainCollectionLabel('weapon')

export function monsterEquipmentSectionLabel(): string {
  return getContentTypeItemLabel('equipment')
}

export const MONSTER_TRAITS_HEADING = getMonsterTraitSectionLabel()
export const MONSTER_ACTIONS_HEADING = actionEconomySectionHeading('action')
export const MONSTER_BONUS_ACTIONS_HEADING = actionEconomySectionHeading('bonus-action')
export const MONSTER_REACTIONS_HEADING = actionEconomySectionHeading('reaction')
export const MONSTER_ACTIONS_EMPTY = 'No actions yet.'
export const MONSTER_SECTION_EMPTY = 'None'
export const MONSTER_ACTION_DETAIL_EMPTY = 'Select or add an action to edit it.'
export const MONSTER_ADD_LABEL = 'Add'
export const MONSTER_KIND_LABEL = getMonsterActionKindFieldLabel()
export const MONSTER_ACTION_NAME_LABEL = 'Name'
export const MONSTER_TRIGGER_LABEL = getMonsterReactionFieldLabel('trigger')
export const MONSTER_MOVE_TO_LABEL = 'Move to'
export const MONSTER_MOVE_UP_LABEL = 'Move up'
export const MONSTER_MOVE_DOWN_LABEL = 'Move down'
export const MONSTER_WEAPON_PRESET_HINT = 'Uses an equipped weapon'
export const MONSTER_SPECIAL_PRESET_HINT = 'Prose-based action'
export const MONSTER_KIND_SWITCH_KEEP = 'The name and description are kept.'

export function monsterAddWeaponShortcut(): string {
  return `Add a weapon to ${getContentTypeItemLabel('equipment')}`
}

export function formatAddedEquipmentNotice(name: string): string {
  return `${name} was added to ${getContentTypeItemLabel('equipment')}.`
}

export function formatWeaponSwapNotice(name: string): string {
  return `Now uses ${name}. Attack bonus, range, and damage come from ${name}.`
}

export function formatKindSwitchTitle(name: string, nextKindLabel: string): string {
  return `Change ${name} to a ${nextKindLabel.toLowerCase()}?`
}

export function formatKindSwitchConfirm(nextKindLabel: string): string {
  return `Change to ${nextKindLabel.toLowerCase()}`
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
