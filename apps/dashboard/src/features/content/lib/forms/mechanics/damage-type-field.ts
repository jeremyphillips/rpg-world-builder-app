import {
  getPhysicalDamageTypeLabel,
  PHYSICAL_DAMAGE_TYPE_IDS,
  type PhysicalDamageType,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type FieldVisibility } from '@rpg/ui/form'

import { buildActiveDamageTypeFieldOptions } from '@/features/homebrew'

import type { ContentFormCtx } from '../content-form-registry'

const DAMAGE_TYPE_PLACEHOLDER = 'Choose…'

const PHYSICAL_DAMAGE_TYPE_LABELS = Object.fromEntries(
  PHYSICAL_DAMAGE_TYPE_IDS.map((id) => [id, getPhysicalDamageTypeLabel(id)]),
) as Record<PhysicalDamageType, string>

export type DamageTypeFieldScope = 'vocabulary' | 'physical'

export type DamageTypeFieldOptions = {
  name: string
  /** `physical` for weapons; `vocabulary` (default) for spells, grants, and tags. */
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

function resolveDamageTypeFieldOptions(
  scope: DamageTypeFieldScope,
  ctx: ContentFormCtx,
): FieldOption[] {
  if (scope === 'physical') {
    return buildPhysicalDamageTypeFieldOptions()
  }

  return buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
}

/** Searchable damage-type select — physical (weapons) or campaign vocabulary (spells). */
export function damageTypeField({
  name,
  scope = 'vocabulary',
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
    options: resolveDamageTypeFieldOptions(scope, ctx),
    placeholder: DAMAGE_TYPE_PLACEHOLDER,
    width,
    visibility,
    required,
  }
}
