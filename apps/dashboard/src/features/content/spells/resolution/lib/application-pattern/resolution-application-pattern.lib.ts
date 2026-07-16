import type { SpellApplicationPattern } from '@rpg/contracts'

import type { ResolutionFormValues } from '../form/resolution-form-schema'

export const RESOLUTION_APPLICATION_PATTERN_FORM_KINDS = ['none', 'projectiles'] as const

export type ResolutionApplicationPatternFormKind =
  (typeof RESOLUTION_APPLICATION_PATTERN_FORM_KINDS)[number]

export const DEFAULT_PROJECTILE_COUNT = 3

export const DEFAULT_PROJECTILE_UNIT_LABEL = {
  singular: 'projectile',
  plural: 'projectiles',
} as const

export function createDefaultProjectilesFormFields(): Pick<
  ResolutionFormValues,
  'projectileCount' | 'projectileUnitLabelSingular' | 'projectileUnitLabelPlural'
> {
  return {
    projectileCount: DEFAULT_PROJECTILE_COUNT,
    projectileUnitLabelSingular: DEFAULT_PROJECTILE_UNIT_LABEL.singular,
    projectileUnitLabelPlural: DEFAULT_PROJECTILE_UNIT_LABEL.plural,
  }
}

export function applicationPatternToForm(
  pattern: SpellApplicationPattern | undefined,
): Pick<
  ResolutionFormValues,
  | 'applicationPatternKind'
  | 'projectileCount'
  | 'projectileUnitLabelSingular'
  | 'projectileUnitLabelPlural'
> {
  if (pattern?.kind === 'projectiles') {
    return {
      applicationPatternKind: 'projectiles',
      projectileCount: pattern.count.value,
      ...(pattern.unitLabel
        ? {
            projectileUnitLabelSingular: pattern.unitLabel.singular,
            projectileUnitLabelPlural: pattern.unitLabel.plural,
          }
        : {
            projectileUnitLabelSingular: DEFAULT_PROJECTILE_UNIT_LABEL.singular,
            projectileUnitLabelPlural: DEFAULT_PROJECTILE_UNIT_LABEL.plural,
          }),
    }
  }

  return { applicationPatternKind: 'none' }
}

export function applicationPatternFromForm(
  values: ResolutionFormValues,
): SpellApplicationPattern | undefined {
  if (values.applicationPatternKind !== 'projectiles') return undefined

  const count = values.projectileCount ?? DEFAULT_PROJECTILE_COUNT
  const singular = values.projectileUnitLabelSingular?.trim()
  const plural = values.projectileUnitLabelPlural?.trim()

  return {
    kind: 'projectiles',
    count: { type: 'fixed', value: count },
    applicationMode: 'per-projectile',
    ...(singular && plural ? { unitLabel: { singular, plural } } : {}),
  }
}
