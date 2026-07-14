import type { NumberInputDigits } from '@rpg/ui'
import type { FieldConfig, InlineSentenceFieldConfig, RowConfig } from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'

type GroupField = FieldConfig | RowConfig

/** Digit width for walk-speed inline count fields (values such as 30 or 35). */
export const WALK_SPEED_INLINE_COUNT_DIGITS = 2 satisfies NumberInputDigits

/** Digit width for spell range distance inline count fields (values such as 120). */
export const SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS = 3 satisfies NumberInputDigits

/** Grouped scalar number + `ft.` label — walk speed, weapon range, spell distance, etc. */
export function feetInputUnitField(
  name: string,
  label: string,
  overrides?: Partial<InlineSentenceFieldConfig> & {
    valueDigits?: NumberInputDigits
    defaultValue?: number
  },
): InlineSentenceFieldConfig {
  const { valueDigits, defaultValue, ...fieldOverrides } = overrides ?? {}
  const digits = valueDigits ?? WALK_SPEED_INLINE_COUNT_DIGITS

  return {
    type: 'inlineSentence',
    name,
    label,
    segments: [
      {
        kind: 'number',
        name,
        min: 0,
        digits,
        defaultValue,
        ariaLabel: `${label} value`,
      },
      { kind: 'text', value: 'ft.', tone: 'label' },
    ],
    ...fieldOverrides,
  }
}

/** Catalog content name field (slug is derived, not authored). */
export function nameField(): FieldConfig {
  return { type: 'text', name: 'name', label: 'Name', required: true }
}

/** Catalog content description field with rich-text internal linking. */
export function descriptionField(ctx?: ContentFormCtx): FieldConfig {
  return {
    type: 'richtext',
    name: 'description',
    label: 'Description',
    linkable: true,
    internalLinkOptions: ctx?.options?.richTextInternalLinkOptions,
    contentTypeOptions: ctx?.options?.richTextContentTypeOptions,
  }
}

/** Name + description pair for forms that keep both fields together without a group legend. */
export function identityFields(ctx?: ContentFormCtx): GroupField[] {
  return [nameField(), descriptionField(ctx)]
}
