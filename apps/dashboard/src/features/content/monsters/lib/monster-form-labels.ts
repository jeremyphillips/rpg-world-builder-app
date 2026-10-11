import { getContentTypeSentenceForm, getContentTypeTerm, joinInlineMetadata } from '@rpg/contracts'

import { CREATURE_FLY_HOVER_LABEL } from '../../lib/forms/fields/content-movement-form-fields'

/** Shown beside a clamped hit-point formula. Owned here and reused by the detail display. */
export const MONSTER_HP_MINIMUM_NOTE = '(minimum 1)'

export const MONSTER_ABILITY_SCORES_HEADING = 'Ability scores'
export const MONSTER_ARMOR_CLASS_HEADING = 'Armor Class'
export const MONSTER_HIT_POINTS_HEADING = 'Hit points'
export const MONSTER_MOVEMENT_HEADING = 'Movement'
export const MONSTER_CHALLENGE_HEADING = 'Challenge rating'
export const MONSTER_SAVE_LABEL = 'Save'
export const MONSTER_HOVER_LABEL = CREATURE_FLY_HOVER_LABEL
export const MONSTER_AWARDS_ZERO_XP_LABEL = 'Awards 0 XP'
export const MONSTER_AWARDS_ZERO_XP_HINT =
  'Some CR 0 creatures award no XP. When checked, XP shows as 0.'
export const MONSTER_HIT_DICE_LABEL = 'Hit dice'
export const MONSTER_FIXED_AVERAGE_LABEL = 'Average HP'
export const MONSTER_FIXED_FORMULA_LABEL = 'Formula'
export const MONSTER_FIXED_FORMULA_HINT = 'Optional. Shown as written.'
export const MONSTER_NATURAL_BONUS_LABEL = 'Natural armor bonus'
export const MONSTER_FIXED_AC_LABEL = 'Armor Class value'
export const MONSTER_FIXED_AC_HINT = 'Ignores ability scores and equipment.'
export const MONSTER_HIT_DICE_MINIMUM_ERROR = 'Enter at least 1 hit die'
export const MONSTER_TELEPATHY_LABEL = 'Telepathy'
export const MONSTER_TELEPATHY_HINT = 'Leave empty for no telepathy'
export const MONSTER_LANGUAGE_NOTE_LABEL = 'Language note'
export const MONSTER_SPEAKS_LABEL = 'Speaks'
export const MONSTER_UNDERSTANDS_ONLY_LABEL = 'Understands only'
export const MONSTER_ADD_SKILL_LABEL = 'Add skill'
export const MONSTER_ADD_WEAPON_LABEL = 'Add weapon'
export const MONSTER_ADD_LANGUAGE_LABEL = 'Add language'
export const MONSTER_ADD_SENSE_LABEL = 'Add sense'
export const MONSTER_ADD_ITEM_LABEL = 'Add item'
export const MONSTER_EQUIPPED_LABEL = 'Equipped'
export const MONSTER_CUSTOMIZATION_LABEL = 'Customization'
export const MONSTER_CUSTOM_NAME_LABEL = 'Custom name'
export const MONSTER_CUSTOM_DESCRIPTION_LABEL = 'Custom description'
export const MONSTER_AC_ADJUSTMENT_LABEL = 'Armor Class adjustment'
export const MONSTER_REMOVE_LABEL = 'Remove'
export const MONSTER_CANCEL_LABEL = 'Cancel'
export const MONSTER_WALK_LABEL = 'Walk'
export const MONSTER_FEET_SUFFIX = 'ft'
export const MONSTER_LOADING_EQUIPMENT = 'Loading equipment…'
export const MONSTER_EQUIPMENT_CATALOG_ERROR = 'Equipment could not be loaded.'
export const MONSTER_RETRY_LABEL = 'Retry'
export const MONSTER_SKILL_LOADING = 'Loading skills…'
export const MONSTER_SKILL_ERROR = 'Skills could not be loaded.'
export const MONSTER_BLANK_CHALLENGE_HINT =
  'Required to publish. Values that use proficiency bonus show "—" until set.'

export function monsterGoToEquipmentLabel(): string {
  return `Go to ${getContentTypeTerm('equipment').label}`
}

export function monsterChooseBodyArmorMessage(): string {
  return `Choose and equip body armor in ${getContentTypeTerm('equipment').label} to calculate Armor Class.`
}

export function monsterBodyArmorConflictMessage(names: readonly string[]): string {
  return `Two body armors are equipped: ${names.join(', ')}. Unequip one in ${getContentTypeTerm('equipment').label} to calculate Armor Class.`
}

export function monsterBodyArmorIgnoredMessage(name: string): string {
  return `Equipped ${name} does not contribute to Armor Class.`
}

export function monsterSkillSectionLabel(): string {
  return getContentTypeTerm('skill-proficiencies').label
}

export const MONSTER_WEAPON_PROFICIENCIES_HEADING = 'Weapon proficiencies'

export function monsterEquipmentSectionLabel(): string {
  return getContentTypeTerm('equipment').label
}

export const MONSTER_TRAITS_HEADING = 'Traits'
export const MONSTER_ACTIONS_HEADING = 'Actions'
export const MONSTER_BONUS_ACTIONS_HEADING = 'Bonus actions'
export const MONSTER_REACTIONS_HEADING = 'Reactions'
export const MONSTER_ACTIONS_EMPTY = 'No actions yet.'
export const MONSTER_SECTION_EMPTY = 'None'
export const MONSTER_ACTION_DETAIL_EMPTY = 'Select or add an action to edit it.'
export const MONSTER_ADD_LABEL = 'Add'
export const MONSTER_KIND_LABEL = 'Kind'
export const MONSTER_ACTION_NAME_LABEL = 'Name'
export const MONSTER_TRIGGER_LABEL = 'Trigger'
export const MONSTER_MOVE_TO_LABEL = 'Move to'
export const MONSTER_MOVE_UP_LABEL = 'Move up'
export const MONSTER_MOVE_DOWN_LABEL = 'Move down'
export const MONSTER_WEAPON_PRESET_HINT = 'Uses an equipped weapon'
export const MONSTER_SPECIAL_PRESET_HINT = 'Prose-based action'
export const MONSTER_KIND_SWITCH_KEEP = 'The name and description are kept.'

export function monsterAddWeaponShortcut(): string {
  return `Add a weapon to ${getContentTypeTerm('equipment').label}`
}

export function formatAddedEquipmentNotice(name: string): string {
  return `${name} was added to ${getContentTypeTerm('equipment').label}.`
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
  return 'Moving this reaction out of Reactions drops its trigger.'
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

export function formatWeaponRetargetNotice(
  nextName: string,
  actionNames: readonly string[],
): string {
  return `Linked actions now use ${nextName}: ${actionNames.join(', ')}.`
}

export function formatClearAdjustmentConfirmBody(): string {
  return `This change removes the Armor Class adjustment because the new ${getContentTypeSentenceForm('equipment', 1)} cannot use it.`
}

export const MONSTER_CLEAR_ADJUSTMENT_CONFIRM = 'Change item'
