import { nounFromLabel, type FieldNoun } from '@rpg/contracts'

import type { FieldConfig } from '../field-config'
import { fieldCategory, type FieldMessageCategory } from './field-error-map-category.lib'

export type FieldCopyContext = {
  category: FieldMessageCategory
  label: string
  noun: FieldNoun
  required?: boolean
  min?: number
  max?: number
}

function resolveChoiceBounds(field: FieldConfig): { min?: number; max?: number } {
  if (field.type === 'chips' || field.type === 'combobox') {
    if (field.multiple === false) return {}
    return { min: field.min, max: field.max }
  }

  if (field.type === 'number' || field.type === 'inputUnit') {
    return { min: field.min, max: field.max }
  }

  return {}
}

/** Semantic copy inputs for a leaf field — category, noun, and constraint bounds. */
export function resolveFieldCopyContext(field: FieldConfig): FieldCopyContext {
  const bounds = resolveChoiceBounds(field)

  return {
    category: fieldCategory(field),
    label: field.label,
    noun: field.noun ?? nounFromLabel(field.label),
    required: field.required,
    ...bounds,
  }
}
