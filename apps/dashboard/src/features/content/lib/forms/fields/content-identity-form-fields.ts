import type { NumberInputDigits } from '@rpg/ui'
import {
  type FieldConfig,
  type FieldWidth,
  type FormItem,
  type InlineSentenceFieldConfig,
  type RowConfig,
  type RowFieldItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../registry/content-form-registry'

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

export type ContentIdentityLayout = 'inline' | 'stacked'

/** Slot name for the campaign availability control beside Name. */
export const CONTENT_IDENTITY_AVAILABILITY_SLOT_NAME = 'campaignAvailability'

/** Name grows; availability is the supporting column inside the shared identity row. */
export const CONTENT_IDENTITY_NAME_ROW_WIDTH = 'full' satisfies FieldWidth
export const CONTENT_IDENTITY_AVAILABILITY_ROW_WIDTH = '1/3' satisfies FieldWidth

function asIdentityRowField(item: FormItem, width: FieldWidth): RowFieldItem {
  if (!('kind' in item)) {
    return { ...item, width }
  }
  if (item.kind === 'slot') {
    return { ...item, width }
  }

  throw new Error('Identity row fields must be a leaf field or slot.')
}

/** Pairs Name with Campaign availability — one shared field container on full routes, stacked in overlays. */
export function buildContentIdentityFields(input: {
  layout: ContentIdentityLayout
  nameItem: FormItem
  availabilityItem: FormItem
}): FormItem[] {
  if (input.layout === 'stacked') {
    return [input.nameItem, input.availabilityItem]
  }

  return [
    {
      kind: 'row',
      align: 'start',
      fields: [
        asIdentityRowField(input.nameItem, CONTENT_IDENTITY_NAME_ROW_WIDTH),
        asIdentityRowField(input.availabilityItem, CONTENT_IDENTITY_AVAILABILITY_ROW_WIDTH),
      ],
    },
  ]
}
