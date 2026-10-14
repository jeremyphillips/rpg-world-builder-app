import {
  EQUIPMENT_EFFECT_TARGET_ENTRIES,
  EQUIPMENT_EFFECT_TARGETS,
  formatSignedModifier,
  getContentTypeTerm,
  MAGIC_PROPERTY_CATEGORY_ENTRIES,
  vocabularyTermLabel,
  type EquipmentEffectTarget,
  type MagicPropertyCategory,
} from '@rpg/contracts'

import type { EquipmentEditorState } from './equipment-editor-types'

export const EQUIPMENT_INSTANCE_EDITOR_DONE_LABEL = 'Done'
export const EQUIPMENT_INSTANCE_EDITOR_CANCEL_LABEL = 'Cancel'
export const EQUIPMENT_INSTANCE_EDITOR_CONTINUE_LABEL = 'Continue'

export const EQUIPMENT_INSTANCE_EDITOR_SCOPE_TITLE = 'Customize item'
export const EQUIPMENT_INSTANCE_EDITOR_MAIN_FALLBACK_TITLE = 'Edit item'
export const EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_TITLE = 'Add adjustment'
export const EQUIPMENT_INSTANCE_EDITOR_EDIT_ADJUSTMENT_TITLE = 'Edit adjustment'
export const EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_TITLE = 'Add magic property'
export const EQUIPMENT_INSTANCE_EDITOR_EDIT_CUSTOM_PROPERTY_TITLE = 'Edit custom property'
export const EQUIPMENT_INSTANCE_EDITOR_CREATE_CUSTOM_PROPERTY_TITLE = 'Create custom property'

export const EQUIPMENT_INSTANCE_EDITOR_SAVE_ADJUSTMENT_LABEL = 'Save adjustment'
export const EQUIPMENT_INSTANCE_EDITOR_REMOVE_ADJUSTMENT_LABEL = 'Remove adjustment'
export const EQUIPMENT_INSTANCE_EDITOR_CREATE_CUSTOM_PROPERTY_ACTION_LABEL =
  'Create custom property'
export const EQUIPMENT_INSTANCE_EDITOR_REMOVE_PROPERTY_LABEL = 'Remove property'
export const EQUIPMENT_INSTANCE_EDITOR_SAVE_PROPERTY_LABEL = 'Save property'
export const EQUIPMENT_INSTANCE_EDITOR_CREATE_PROPERTY_LABEL = 'Create property'

export const EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_LABEL = 'Equipped'
export const EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_HINT =
  'Show this item as equipped on the stat block.'
export const EQUIPMENT_INSTANCE_EDITOR_MAGICAL_LABEL = 'Magical'
export const EQUIPMENT_INSTANCE_EDITOR_MAGICAL_HINT =
  'Treat this item as magical. Properties are optional.'

export const EQUIPMENT_ADJUSTMENT_SINGULAR = 'adjustment'
export const EQUIPMENT_ADJUSTMENTS_SECTION_HEADING = 'Adjustments'

export const EQUIPMENT_MAGIC_PROPERTY_SINGULAR = 'magic property'
export const EQUIPMENT_MAGIC_PROPERTY_PLURAL = 'magic properties'
export const EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_STATUS_LABEL = 'Custom property'
export const EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_ACTION_LABEL = 'Add magic property'
export const EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_ACTION_LABEL = 'Add adjustment'

export const EQUIPMENT_INSTANCE_EDITOR_SEPARATED_QUANTITY_LABEL = '×1 (separated on save)'
export const EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_LABEL = 'One copy'
export const EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_DESCRIPTION =
  'Separate one copy for customization. Other copies remain unchanged.'
export const EQUIPMENT_INSTANCE_EDITOR_SCOPE_ALL_COPIES_DESCRIPTION =
  'Apply the same customization to every copy in this stack.'

export const EQUIPMENT_INSTANCE_EDITOR_EFFECT_TARGET_FIELD_LABEL = 'Effect target'
export const EQUIPMENT_INSTANCE_EDITOR_MODIFIER_LABEL = 'Modifier'
export const EQUIPMENT_INSTANCE_EDITOR_NOTES_LABEL = 'Notes'
export const EQUIPMENT_INSTANCE_EDITOR_NOTES_HINT = 'Optional. Shown with this effect.'
export const EQUIPMENT_INSTANCE_EDITOR_EFFECT_ALREADY_ADDED_DESCRIPTION =
  'Already added. Edit it from the item.'

export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_PLACEHOLDER = 'Search properties'
export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_ARIA_LABEL = 'Search properties'
export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADDED_LABEL = 'Added'
export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_REPLACE_LABEL = 'Replace'
export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADD_LABEL = 'Add'

export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_NAME_LABEL = 'Property name'
export const EQUIPMENT_INSTANCE_EDITOR_PROPERTY_DESCRIPTION_LABEL = 'Description'
export const EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_DESCRIPTION_HINT =
  "Custom properties describe rules or behavior but don't automatically apply mechanical effects."

const equipmentTypeLabel = getContentTypeTerm('equipment').label

export const EQUIPMENT_INSTANCE_EDITOR_MODIFIERS_HEADING = `${equipmentTypeLabel} modifiers`

export function magicPropertyCategoryLabel(category: MagicPropertyCategory): string {
  return MAGIC_PROPERTY_CATEGORY_ENTRIES[category].label
}

export function formatEquipmentAdjustmentBonusLabel(bonus: number): string {
  return `${formatSignedModifier(bonus)} ${EQUIPMENT_ADJUSTMENT_SINGULAR}`
}

export function formatEquipmentInstanceEditorBackAriaLabel(backTarget: string): string {
  return `Back to ${backTarget}`
}

export function formatMagicalPropertiesRemovalWarning(count: number): string {
  const noun = count === 1 ? EQUIPMENT_MAGIC_PROPERTY_SINGULAR : EQUIPMENT_MAGIC_PROPERTY_PLURAL
  return `${count} ${noun} will be removed when you click ${EQUIPMENT_INSTANCE_EDITOR_DONE_LABEL}.`
}

export function formatScopeCustomizeHeading(entryName: string): string {
  return `Customize ${entryName}`
}

export function formatScopeSubjectIntro(
  subjectNoun: 'creature' | 'character',
  quantity: number,
  entryName: string,
): string {
  return subjectNoun === 'creature'
    ? `This creature has ${quantity} ${entryName}.`
    : `You have ${quantity} ${entryName}.`
}

export function formatScopeAllCopiesLabel(quantity: number): string {
  return `All ${quantity} copies`
}

export function formatScopeChooseCustomizationCopy(subjectIntro: string): string {
  return `${subjectIntro} Choose which to customize.`
}

export function formatQuantityStepperAriaLabel(itemName: string): string {
  return `Quantity of ${itemName}`
}

export function formatRemoveMagicPropertyAriaLabel(propertyName: string): string {
  return `Remove ${propertyName}`
}

export function formatEditRowAriaLabel(label: string): string {
  return `Edit ${label}`
}

export function equipmentAdjustmentsSectionDescription(): string {
  const labels = EQUIPMENT_EFFECT_TARGETS.map(
    (target) => EQUIPMENT_EFFECT_TARGET_ENTRIES[target].label,
  )
  if (labels.length === 1) {
    return `Apply manual modifiers to ${labels[0]}.`
  }
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1).join(', ')
  return `Apply manual modifiers to ${rest}, or ${last}.`
}

export function equipmentInstanceEditorModeTitle(state: EquipmentEditorState): string {
  switch (state.mode.kind) {
    case 'scope':
      return EQUIPMENT_INSTANCE_EDITOR_SCOPE_TITLE
    case 'main':
      return EQUIPMENT_INSTANCE_EDITOR_MAIN_FALLBACK_TITLE
    case 'effectChoose':
      return EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_TITLE
    case 'effectForm':
      return state.mode.origin === 'existing'
        ? EQUIPMENT_INSTANCE_EDITOR_EDIT_ADJUSTMENT_TITLE
        : EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_TITLE
    case 'propertyBrowse':
      return EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_TITLE
    case 'propertyCreate':
      return state.mode.draft.customId
        ? EQUIPMENT_INSTANCE_EDITOR_EDIT_CUSTOM_PROPERTY_TITLE
        : EQUIPMENT_INSTANCE_EDITOR_CREATE_CUSTOM_PROPERTY_TITLE
    default:
      return EQUIPMENT_INSTANCE_EDITOR_MAIN_FALLBACK_TITLE
  }
}

export function equipmentInstanceEditorBackTargetLabel(state: EquipmentEditorState): string | null {
  switch (state.mode.kind) {
    case 'effectChoose':
    case 'effectForm':
      return EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_TITLE
    case 'propertyBrowse':
      return EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_TITLE
    case 'propertyCreate':
      return state.mode.origin === 'browse'
        ? EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_TITLE
        : EQUIPMENT_INSTANCE_EDITOR_MAIN_FALLBACK_TITLE
    case 'main':
    case 'scope':
      return null
    default:
      return EQUIPMENT_INSTANCE_EDITOR_MAIN_FALLBACK_TITLE
  }
}

export function effectTargetSentenceLabel(target: EquipmentEffectTarget): string {
  return vocabularyTermLabel(EQUIPMENT_EFFECT_TARGET_ENTRIES[target], {
    number: 'singular',
    casing: 'sentence',
  })
}
