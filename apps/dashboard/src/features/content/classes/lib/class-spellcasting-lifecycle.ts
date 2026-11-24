import {
  spellcastingGrantingFeatureDisplayName,
  usesPactMagicSlotProgression,
  type Ability,
  type Spellcasting,
} from '@rpg/contracts'

import type { ClassFormValues } from './class-form-fields'
import { featureToFormRow, type FeatureRowForm } from './class-feature-form-fields'
import { isSpellcastingFeatureRow } from './class-feature-authoring'
import { createSpellcastingFeature } from './class-spellcasting-features'

const DEFAULT_SPELLCASTING_ABILITY = 'int' satisfies Ability

export function isSpellcastingGrantingFeatureRow(
  row: Pick<FeatureRowForm, 'kind' | 'grants'> | undefined,
): boolean {
  return isSpellcastingFeatureRow(row)
}

export function findSpellcastingFeatureIndex(rows: FeatureRowForm[] | undefined): number {
  return (rows ?? []).findIndex((row) => isSpellcastingFeatureRow(row))
}

export function resolveSpellcastingFeatureRow(
  rows: FeatureRowForm[] | undefined,
): FeatureRowForm | undefined {
  const index = findSpellcastingFeatureIndex(rows)
  const list = rows ?? []
  return index === -1 ? undefined : list[index]
}

function defaultSlotProgressionId(existing: Spellcasting | undefined, usesPactMagic: boolean) {
  return existing?.slotProgressionId ?? (usesPactMagic ? 'pact-magic' : 'full-caster')
}

function spellcastingConfigFromExisting(
  existing: Spellcasting | undefined,
  usesPactMagic: boolean,
): NonNullable<ClassFormValues['spellcasting']> {
  const slotProgressionId = defaultSlotProgressionId(existing, usesPactMagic)
  const ability = existing?.ability ?? DEFAULT_SPELLCASTING_ABILITY
  if (!existing) return { slotProgressionId, ability }
  return {
    slotProgressionId,
    ability,
    progression: existing.progression,
    requiredGear: existing.requiredGear,
    focusKinds: existing.focusKinds,
    recommendedGear: existing.recommendedGear,
    recommendations: existing.recommendations,
  }
}

function defaultSpellcastingConfig(
  existing?: Spellcasting,
  usesPactMagic?: boolean,
): NonNullable<ClassFormValues['spellcasting']> {
  const pact =
    usesPactMagic ??
    usesPactMagicSlotProgression({ slotProgressionId: existing?.slotProgressionId })
  return spellcastingConfigFromExisting(existing, pact)
}

/** Four-way toggle ON reconciliation — never overwrites existing config or spellcasting feature. */
export function reconcileSpellcastingOnEnable(values: ClassFormValues): Partial<ClassFormValues> {
  const existingFeature = resolveSpellcastingFeatureRow(values.features)
  const existingConfig = values.spellcasting
  const usesPactMagic = existingConfig?.slotProgressionId
    ? usesPactMagicSlotProgression({ slotProgressionId: existingConfig.slotProgressionId })
    : existingFeature?.id === 'pact-magic'

  const nextFeatures = [...(values.features ?? [])]
  if (!existingFeature) {
    nextFeatures.push(
      featureToFormRow(
        createSpellcastingFeature({
          level: 1,
          slotProgressionId: existingConfig?.slotProgressionId,
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

/** Removes spellcasting config and the dedicated spellcasting feature from form values. */
export function removeSpellcastingFromFormValues(
  values: ClassFormValues,
): Partial<ClassFormValues> {
  const existingFeatures = values.features ?? []
  const featureIndex = findSpellcastingFeatureIndex(existingFeatures)
  const nextFeatures =
    featureIndex === -1
      ? existingFeatures
      : existingFeatures.filter((_, index) => index !== featureIndex)

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
  rows: FeatureRowForm[] | undefined,
): { name: string; level: number; index: number } | undefined {
  const list = rows ?? []
  const index = findSpellcastingFeatureIndex(list)
  if (index === -1) return undefined
  const row = list[index]!
  const level = typeof row.level === 'number' ? row.level : Number(row.level)
  if (!Number.isFinite(level)) return undefined
  return {
    name: spellcastingGrantingFeatureDisplayName({
      name: row.name,
      featureId: row.id,
    }),
    level,
    index,
  }
}

export function resolveSpellcastingGrantingFeatureRow(
  rows: FeatureRowForm[] | undefined,
): FeatureRowForm | undefined {
  return resolveSpellcastingFeatureRow(rows)
}
