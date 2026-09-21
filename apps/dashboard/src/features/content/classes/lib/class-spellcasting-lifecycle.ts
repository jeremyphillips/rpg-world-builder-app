import {
  type Ability,
  type ClassBodyFeature,
  type Spellcasting,
  isClassSpellcastingGrantingFeature,
  resolveClassSpellcastingFeature,
} from '@rpg/contracts'

import type { ClassFormValues } from './class-form-fields'
import {
  featureFromFormRow,
  featureToFormRow,
  type FeatureRowForm,
} from './class-feature-form-fields'
import {
  createSpellcastingFeature,
  usesPactMagicFromSlotProgression,
} from './class-spellcasting-features'

const DEFAULT_SPELLCASTING_ABILITY = 'int' satisfies Ability

export function isSpellcastingGrantingFeatureRow(
  row: Pick<FeatureRowForm, 'grants'> | undefined,
): boolean {
  if (!row?.grants?.length) return false
  const feature = featureFromFormRow({
    id: 'spellcasting-check',
    kind: 'custom',
    name: 'Spellcasting',
    level: 1,
    grants: row.grants,
    available: true,
    tables: [],
  })
  return isClassSpellcastingGrantingFeature(feature)
}

export function findSpellcastingGrantingFeatureIndex(rows: FeatureRowForm[]): number {
  return rows.findIndex((row) => isSpellcastingGrantingFeatureRow(row))
}

export function resolveSpellcastingGrantingFeatureRow(
  rows: FeatureRowForm[],
): FeatureRowForm | undefined {
  const index = findSpellcastingGrantingFeatureIndex(rows)
  return index === -1 ? undefined : rows[index]
}

// fallow-ignore-next-line complexity
function defaultSpellcastingConfig(
  existing?: Spellcasting,
  usesPactMagic?: boolean,
): NonNullable<ClassFormValues['spellcasting']> {
  const pact = usesPactMagic ?? usesPactMagicFromSlotProgression(existing?.slotProgressionId)
  return {
    slotProgressionId: existing?.slotProgressionId ?? (pact ? 'pact-magic' : 'full-caster'),
    ability: existing?.ability ?? DEFAULT_SPELLCASTING_ABILITY,
    progression: existing?.progression,
    requiredGear: existing?.requiredGear,
    focusKinds: existing?.focusKinds,
    recommendedGear: existing?.recommendedGear,
    recommendations: existing?.recommendations,
  }
}

/** Four-way toggle ON reconciliation — never overwrites existing config or granting feature. */
export function reconcileSpellcastingOnEnable(values: ClassFormValues): Partial<ClassFormValues> {
  const existingFeature = resolveSpellcastingGrantingFeatureRow(values.features)
  const existingConfig = values.spellcasting
  const usesPactMagic = existingConfig?.slotProgressionId
    ? usesPactMagicFromSlotProgression(existingConfig.slotProgressionId)
    : existingFeature?.id === 'pact-magic'

  const nextFeatures = [...values.features]
  if (!existingFeature) {
    nextFeatures.push(
      featureToFormRow(
        createSpellcastingFeature({
          level: 1,
          usesPactMagic,
        }),
      ),
    )
  }

  const nextSpellcasting = existingConfig ?? defaultSpellcastingConfig(undefined, usesPactMagic)

  return {
    hasSpellcasting: true,
    features: nextFeatures,
    spellcasting: nextSpellcasting,
    grantsCantrips: nextSpellcasting.progression?.cantrips !== undefined,
    spellSelectionModel: values.spellSelectionModel ?? 'limitedRepertoire',
    spellSelectionChangePackage: values.spellSelectionChangePackage ?? 'levelUp:1',
  }
}

/** Removes spellcasting config and the dedicated granting feature from form values. */
export function removeSpellcastingFromFormValues(
  values: ClassFormValues,
): Partial<ClassFormValues> {
  const featureIndex = findSpellcastingGrantingFeatureIndex(values.features)
  const nextFeatures =
    featureIndex === -1
      ? values.features
      : values.features.filter((_, index) => index !== featureIndex)

  return {
    hasSpellcasting: false,
    features: nextFeatures,
    spellcasting: undefined,
    grantsCantrips: false,
    spellSelectionModel: undefined,
    spellSelectionChangePackage: undefined,
    spellbookAcquisitionIrregular: false,
    spellbookAcquisitionStarting: undefined,
    spellbookAcquisitionPerLevel: undefined,
    spellbookAcquisitionThroughLevel: undefined,
    spellbookAcquisitionCurve: undefined,
  }
}

export function spellcastingFeatureSummaryFromRows(
  rows: FeatureRowForm[],
): { name: string; level: number; index: number } | undefined {
  const index = findSpellcastingGrantingFeatureIndex(rows)
  if (index === -1) return undefined
  const row = rows[index]!
  const level = typeof row.level === 'number' ? row.level : Number(row.level)
  if (!Number.isFinite(level)) return undefined
  return {
    name: row.name.trim() || 'Spellcasting',
    level,
    index,
  }
}

export function resolveManagedSpellcastingGrantingFeature(
  features: readonly ClassBodyFeature[],
): ClassBodyFeature | undefined {
  return resolveClassSpellcastingFeature({ features })
}
