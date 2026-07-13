import type { FieldConfig, FieldVisibility } from '@rpg/ui/form'

import { buildActiveDamageTypeFieldOptions } from '@/features/homebrew'

import type { ContentFormCtx } from '../content-form-registry'

const DAMAGE_TYPE_PLACEHOLDER = 'Choose…'

export type DamageTypeFieldOptions = {
  name: string
  ctx: ContentFormCtx
  label?: string
  visibility?: FieldVisibility
  required?: boolean
  width?: 'md' | 'lg' | 'auto'
}

/** Searchable damage-type select backed by campaign vocabulary. */
export function damageTypeField({
  name,
  ctx,
  label = 'Damage type',
  visibility,
  required,
  width = 'md',
}: DamageTypeFieldOptions): FieldConfig {
  return {
    type: 'select',
    name,
    label,
    options: buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary),
    placeholder: DAMAGE_TYPE_PLACEHOLDER,
    width,
    visibility,
    required,
  }
}
