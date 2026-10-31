import {
  DAMAGE_TYPE_TERM,
  PHYSICAL_DAMAGE_TYPE_TERM,
  getPhysicalDamageTypeLabel,
  PHYSICAL_DAMAGE_TYPE_IDS,
  type PhysicalDamageType,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type FieldVisibility } from '@rpg/ui/form'

import { buildActiveDamageTypeFieldOptions, vocabularyFieldLabel } from '@/features/vocabulary'

import type { ContentFormCtx } from '../registry/content-form-registry'

const DAMAGE_TYPE_PLACEHOLDER = 'Choose…'

const PHYSICAL_DAMAGE_TYPE_LABELS = Object.fromEntries(
  PHYSICAL_DAMAGE_TYPE_IDS.map((id) => [id, getPhysicalDamageTypeLabel(id)]),
) as Record<PhysicalDamageType, string>

export type DamageTypeFieldScope = 'vocabulary' | 'physical' | 'physical-and-vocabulary'

export type DamageTypeFieldOptions = {
  name: string
  /** `physical` for weapons; `physical-and-vocabulary` for natural weapons; `vocabulary` (default) for spells. */
  scope?: DamageTypeFieldScope
  ctx: ContentFormCtx
  label?: string
  visibility?: FieldVisibility
  required?: boolean
  width?: 'md' | 'lg' | 'auto'
}

/** Closed SRD physical damage types (bludgeoning, piercing, slashing). */
export function buildPhysicalDamageTypeFieldOptions(): FieldOption[] {
  return toOptions(PHYSICAL_DAMAGE_TYPE_IDS, PHYSICAL_DAMAGE_TYPE_LABELS)
}

function mergeDamageTypeFieldOptions(...lists: readonly FieldOption[][]): FieldOption[] {
  const byValue = new Map<string, FieldOption>()
  for (const list of lists) {
    for (const option of list) {
      if (!byValue.has(option.value)) byValue.set(option.value, option)
    }
  }
  return [...byValue.values()]
}

/** Physical SRD types plus campaign vocabulary — natural weapons use both. */
export function buildPhysicalAndVocabularyDamageTypeFieldOptions(
  ctx: ContentFormCtx,
): FieldOption[] {
  return mergeDamageTypeFieldOptions(
    buildPhysicalDamageTypeFieldOptions(),
    buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary),
  )
}

function resolveDamageTypeFieldOptions(
  scope: DamageTypeFieldScope,
  ctx: ContentFormCtx,
): FieldOption[] {
  if (scope === 'physical') {
    return buildPhysicalDamageTypeFieldOptions()
  }

  if (scope === 'physical-and-vocabulary') {
    return buildPhysicalAndVocabularyDamageTypeFieldOptions(ctx)
  }

  return buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
}

/** Searchable damage-type select — physical (weapons) or campaign vocabulary (spells). */
export function damageTypeField({
  name,
  scope = 'vocabulary',
  ctx,
  label,
  visibility,
  required,
  width = 'md',
}: DamageTypeFieldOptions): FieldConfig {
  const defaultLabel =
    scope === 'physical'
      ? vocabularyFieldLabel(PHYSICAL_DAMAGE_TYPE_TERM)
      : vocabularyFieldLabel(DAMAGE_TYPE_TERM)

  return {
    type: 'select',
    name,
    label: label ?? defaultLabel,
    options: resolveDamageTypeFieldOptions(scope, ctx),
    placeholder: DAMAGE_TYPE_PLACEHOLDER,
    width,
    visibility,
    required,
  }
}
