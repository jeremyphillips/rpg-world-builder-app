import {
  CREATURE_SIZE_HIT_DIE,
  resolveMonsterHitPoints,
  type CreatureSize,
  type MonsterBody,
} from '@rpg/contracts'
import type { DiceFormulaValue, FormValueSync } from '@rpg/ui/form'

import type { MonsterFormValues } from './monster-form-values'
import { transitionHitPoints, type MonsterHitPointStash } from './monster-variant-transitions'

export const MONSTER_HIT_POINTS_USE_FIXED_FIELD = 'hitPointsUseFixed'
export const MONSTER_HIT_POINTS_DICE_FIELD = 'hitPointsDice'
export const MONSTER_HIT_POINTS_DICE_COUNT_FIELD = 'hitPointsDice.count'
export const MONSTER_HIT_POINTS_DICE_FACES_FIELD = 'hitPointsDice.faces'
export const MONSTER_HIT_POINTS_STASH_FIELD = '_hitPointsStash'
export const MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD = 'hitPointsFixedAverage'

export function defaultHitPointsDiceForSize(size: CreatureSize | undefined): DiceFormulaValue {
  const faces = CREATURE_SIZE_HIT_DIE[size ?? 'medium']
  return { count: 1, faces }
}

export function hitPointsDiceFromFormValues(
  values: Pick<MonsterFormValues, 'hitPoints' | 'size'> & {
    hitPointsDice?: DiceFormulaValue
    [MONSTER_HIT_POINTS_DICE_COUNT_FIELD]?: number
  },
): DiceFormulaValue {
  const faces = CREATURE_SIZE_HIT_DIE[(values.size ?? 'medium') as CreatureSize]
  if (values.hitPoints?.kind === 'hit-dice') {
    return { count: values.hitPoints.count, faces }
  }
  const draft = values.hitPointsDice
  if (draft && typeof draft.count === 'number') {
    return { count: draft.count, faces }
  }
  const dottedCount = values[MONSTER_HIT_POINTS_DICE_COUNT_FIELD]
  if (typeof dottedCount === 'number' && Number.isInteger(dottedCount) && dottedCount >= 1) {
    return { count: dottedCount, faces }
  }
  return { count: 1, faces }
}

export function formatMonsterHitPointsPreviewLine(
  values: Pick<MonsterFormValues, 'hitPoints' | 'size' | 'abilityScores'> & {
    hitPointsDice?: DiceFormulaValue
    [MONSTER_HIT_POINTS_DICE_COUNT_FIELD]?: number
  },
): string | undefined {
  const dice = hitPointsDiceFromFormValues(values)
  const hitPoints =
    values.hitPoints?.kind === 'hit-dice'
      ? values.hitPoints
      : { kind: 'hit-dice' as const, count: dice.count }
  const derived = resolveMonsterHitPoints({
    hitPoints,
    size: values.size as MonsterBody['size'],
    abilityScores: values.abilityScores,
  })
  if (derived.status !== 'resolved') return undefined
  const { hp, formula, clampedToMinimum } = derived.value
  const note = clampedToMinimum ? ' (minimum 1)' : ''
  return `HP ${hp} (${formula})${note}`
}

export function resolveHitPointsPrefillAverage(
  values: Pick<MonsterFormValues, 'hitPoints' | 'size' | 'abilityScores'>,
): number | undefined {
  if (!values.hitPoints || values.hitPoints.kind !== 'hit-dice') return undefined
  const derived = resolveMonsterHitPoints({
    hitPoints: values.hitPoints,
    size: values.size as MonsterBody['size'],
    abilityScores: values.abilityScores,
  })
  if (derived.status !== 'resolved') return undefined
  return derived.value.hp
}

export function applyHitPointsFixedToggle(
  values: MonsterFormValues,
  useFixed: boolean,
): Partial<MonsterFormValues> {
  const stash = (values[MONSTER_HIT_POINTS_STASH_FIELD] as MonsterHitPointStash | undefined) ?? {}
  const current = values.hitPoints
  const prefillAverage = useFixed ? resolveHitPointsPrefillAverage(values) : undefined
  const result = transitionHitPoints(
    current,
    useFixed ? 'fixed' : 'hit-dice',
    stash,
    prefillAverage !== undefined ? { average: prefillAverage } : undefined,
  )
  return {
    hitPoints: result.hitPoints,
    [MONSTER_HIT_POINTS_STASH_FIELD]: result.stash,
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: useFixed,
  }
}

export function stripMonsterHitPointsAuthoringFields(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const {
    [MONSTER_HIT_POINTS_DICE_FIELD]: _dice,
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: _useFixed,
    [MONSTER_HIT_POINTS_STASH_FIELD]: _stash,
    [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]: _fixedAverage,
    ...rest
  } = values
  return rest
}

function syncHitPointsFixedToggle(
  values: Record<string, unknown>,
  changedKeys: readonly string[],
): Partial<MonsterFormValues> | undefined {
  if (!changedKeys.includes(MONSTER_HIT_POINTS_USE_FIXED_FIELD)) return undefined
  const formValues = values as MonsterFormValues
  const useFixed = values[MONSTER_HIT_POINTS_USE_FIXED_FIELD] === true
  const patch = applyHitPointsFixedToggle(formValues, useFixed)
  const hitPoints = patch.hitPoints ?? formValues.hitPoints
  const fixedAverage =
    hitPoints.kind === 'fixed' && hitPoints.average !== undefined ? hitPoints.average : undefined
  return {
    ...patch,
    hitPointsDice: hitPointsDiceFromFormValues({ ...formValues, hitPoints }),
    ...(fixedAverage !== undefined
      ? { [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]: fixedAverage }
      : useFixed
        ? { [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]: undefined }
        : {}),
  }
}

function hitPointsDiceCountForSize(formValues: MonsterFormValues): {
  count: number
  faces: (typeof CREATURE_SIZE_HIT_DIE)[CreatureSize]
} {
  const faces = CREATURE_SIZE_HIT_DIE[(formValues.size ?? 'medium') as CreatureSize]
  const dice = hitPointsDiceFromFormValues(formValues)
  const count =
    typeof dice.count === 'number' && Number.isInteger(dice.count) && dice.count >= 1
      ? dice.count
      : 1
  return { count, faces }
}

function patchHitPointsDiceForSize(
  formValues: MonsterFormValues,
): Partial<MonsterFormValues> | undefined {
  const { count, faces } = hitPointsDiceCountForSize(formValues)
  const dice = hitPointsDiceFromFormValues(formValues)
  const patch: Partial<MonsterFormValues> = {}
  if (dice.faces !== faces || dice.count !== count) {
    patch.hitPointsDice = { count, faces }
  }
  if (formValues.hitPoints.kind !== 'hit-dice' || formValues.hitPoints.count !== count) {
    patch.hitPoints = { kind: 'hit-dice', count }
  }
  return Object.keys(patch).length > 0 ? patch : undefined
}

function syncHitPointsDiceWithSize(
  values: Record<string, unknown>,
  changedKeys: readonly string[],
): Partial<MonsterFormValues> | undefined {
  if (values[MONSTER_HIT_POINTS_USE_FIXED_FIELD] === true) return undefined
  const diceDeps = [
    MONSTER_HIT_POINTS_DICE_FIELD,
    MONSTER_HIT_POINTS_DICE_COUNT_FIELD,
    'size',
  ] as const
  if (!diceDeps.some((key) => changedKeys.includes(key))) return undefined
  return patchHitPointsDiceForSize(values as MonsterFormValues)
}

function syncHitPointsFixedAverage(
  values: Record<string, unknown>,
  changedKeys: readonly string[],
): Partial<MonsterFormValues> | undefined {
  if (values[MONSTER_HIT_POINTS_USE_FIXED_FIELD] !== true) return undefined
  if (
    !changedKeys.includes(MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD) &&
    !changedKeys.includes(MONSTER_HIT_POINTS_USE_FIXED_FIELD)
  ) {
    return undefined
  }
  const average = values[MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]
  if (average === undefined || average === '') {
    return { hitPoints: { kind: 'fixed' } }
  }
  const numeric = typeof average === 'number' ? average : Number(average)
  if (!Number.isFinite(numeric)) return { hitPoints: { kind: 'fixed' } }
  return { hitPoints: { kind: 'fixed', average: numeric } }
}

/** Monster form `valueSyncs` for hit-dice vs fixed HP authoring fields. */
export function buildMonsterHitPointsFormValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: [MONSTER_HIT_POINTS_USE_FIXED_FIELD],
      apply: syncHitPointsFixedToggle,
    },
    {
      dependsOn: [MONSTER_HIT_POINTS_DICE_FIELD, MONSTER_HIT_POINTS_DICE_COUNT_FIELD, 'size'],
      apply: syncHitPointsDiceWithSize,
    },
    {
      dependsOn: [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD, MONSTER_HIT_POINTS_USE_FIXED_FIELD],
      apply: syncHitPointsFixedAverage,
    },
  ]
}
