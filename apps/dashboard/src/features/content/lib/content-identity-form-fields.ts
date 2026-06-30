import type { InputUnitFieldConfig } from '@rpg/ui/form'
import type { NumberInputDigits } from '@rpg/ui'
import type { FieldConfig, RowConfig } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'

type GroupField = FieldConfig | RowConfig

/** Digit width for walk-speed inline count fields (values such as 30 or 35). */
export const WALK_SPEED_INLINE_COUNT_DIGITS = 2 satisfies NumberInputDigits

/** Digit width for spell range distance inline count fields (values such as 120). */
export const SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS = 3 satisfies NumberInputDigits

/** Grouped scalar number + `ft.` label — walk speed, weapon range, spell distance, etc. */
export function feetInputUnitField(
  name: string,
  label: string,
  overrides?: Partial<InputUnitFieldConfig>,
): InputUnitFieldConfig {
  return {
    type: 'inputUnit',
    name,
    label,
    inputType: 'number',
    unit: 'ft.',
    min: 0,
    valueDigits: WALK_SPEED_INLINE_COUNT_DIGITS,
    ...overrides,
  }
}

/** Identity fields shared by every catalog content type (slug is derived, not authored). */
export function identityFields(ctx?: ContentFormCtx): GroupField[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx?.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx?.options?.richTextContentTypeOptions,
    },
  ]
}
