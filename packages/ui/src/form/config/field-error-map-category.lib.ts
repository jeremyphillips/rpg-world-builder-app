/**
 * Maps form field config types to validation-message categories used by the
 * field-aware Zod error map.
 */

import type {
  ChipsFieldConfig,
  ComboboxFieldConfig,
  FieldConfig,
  InputSelectFieldConfig,
} from '../field-config'

/** How a field's values behave for message selection, independent of widget chrome. */
export type FieldMessageCategory = 'text' | 'number' | 'choice' | 'multi' | 'boolean' | 'array'

function isMultiChoice(field: ChipsFieldConfig | ComboboxFieldConfig): boolean {
  return field.multiple !== false
}

/** Static category per field type; chips/combobox/inputSelect refine on config below. */
const TYPE_CATEGORIES: Record<FieldConfig['type'], FieldMessageCategory> = {
  text: 'text',
  textarea: 'text',
  markdown: 'text',
  richtext: 'text',
  json: 'text',
  number: 'number',
  inputUnit: 'number',
  inlineChooseCount: 'number',
  inlineSentence: 'number',
  editableGrid: 'number',
  diceFormula: 'number',
  levelRange: 'number',
  select: 'choice',
  radio: 'choice',
  radioCard: 'choice',
  chips: 'multi',
  combobox: 'multi',
  chooseFromChips: 'multi',
  file: 'multi',
  checkbox: 'boolean',
  switch: 'boolean',
  inputSelect: 'text',
}

export function fieldCategory(field: FieldConfig): FieldMessageCategory {
  if (field.type === 'chips' || field.type === 'combobox') {
    return isMultiChoice(field) ? 'multi' : 'choice'
  }
  if (field.type === 'inputSelect') {
    return (field as InputSelectFieldConfig).inputType === 'number' ? 'number' : 'text'
  }
  return TYPE_CATEGORIES[field.type]
}
