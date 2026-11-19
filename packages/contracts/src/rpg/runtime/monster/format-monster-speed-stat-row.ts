import type { MovementSpeeds } from '../../vocab/movement-mode'
import {
  MOVEMENT_MODES,
  formatMovementDisplay,
  getMovementModeLabel,
  type MovementMode,
} from '../../vocab/movement-mode'
import { joinNaturalList } from '../../primitives/prose'
import {
  analyzeCreatureFormDifferences,
  type CreatureFormDifferenceInput,
} from '../creature/form-differences'
import { resolveCreatureFormsContext, resolveCreatureFormStatistics } from '../creature/forms'
import { resolveFormDifferencesPresentation } from './form-differences-presentation'

export type MonsterSpeedStatRowInput = CreatureFormDifferenceInput & {
  hasShapeShift: boolean
}

function formatFormOnlyQualifier(formNames: readonly string[]): string {
  const listed = joinNaturalList(formNames, { conjunction: 'or' })
  return ` (${listed} form only)`
}

// fallow-ignore-next-line complexity
function formatModeSpeedLine(
  mode: MovementMode,
  input: MonsterSpeedStatRowInput,
  unit: 'ft' | 'ft.',
): string | undefined {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete' || !context.trueForm) return undefined
  const base = { sizes: input.sizes, movement: input.movement, hover: input.hover }
  const resolved = context.eligibleForms.map((identity) => ({
    identity,
    stats: resolveCreatureFormStatistics(base, identity.form, {
      usesBaseStatistics: identity.usesBaseStatistics,
    }),
  }))
  const withMode = resolved.filter((entry) => entry.stats.movement.speeds[mode] !== undefined)
  if (withMode.length === 0) return undefined

  const valueGroups = new Map<number, string[]>()
  for (const entry of withMode) {
    const feet = entry.stats.movement.speeds[mode] as number
    const name = entry.identity.name.trim().toLocaleLowerCase()
    const names = valueGroups.get(feet) ?? []
    names.push(name)
    valueGroups.set(feet, names)
  }

  const modeLabel = getMovementModeLabel(mode)
  const uniqueValues = [...valueGroups.keys()].sort((left, right) => left - right)

  if (uniqueValues.length === 1) {
    const [feet] = uniqueValues
    const names = valueGroups.get(feet!) ?? []
    if (withMode.length < resolved.length) {
      return `${modeLabel} ${feet} ${unit}${formatFormOnlyQualifier(names)}`
    }
    return `${modeLabel} ${feet} ${unit}`
  }

  const trueFeet = resolveCreatureFormStatistics(base, context.trueForm.form, {
    usesBaseStatistics: context.trueForm.usesBaseStatistics,
  }).movement.speeds[mode]

  const parts: string[] = []
  for (const feet of uniqueValues) {
    const names = valueGroups.get(feet) ?? []
    if (feet === trueFeet) {
      parts.push(`${feet} ${unit}`)
      continue
    }
    parts.push(`${feet} ${unit}${formatFormOnlyQualifier(names)}`)
  }

  return `${modeLabel} ${parts.join(', ')}`
}

/** Speed row with optional per-form qualifiers when differences use stat rows. */
// fallow-ignore-next-line complexity
export function formatMonsterSpeedStatRow(
  input: MonsterSpeedStatRowInput,
  unit: 'ft' | 'ft.' = 'ft.',
): string | undefined {
  const movement = formatMovementDisplay(input.movement, unit)
  if (!input.forms.definedForms.length) {
    return input.hover && movement ? `${movement} (hover)` : movement || undefined
  }

  const presentation = resolveFormDifferencesPresentation(input.forms, input.hasShapeShift)
  const analysis = analyzeCreatureFormDifferences(input)
  if (presentation !== 'stat-rows' || !analysis?.movementDiffers) {
    return input.hover && movement ? `${movement} (hover)` : movement || undefined
  }

  const modeLines = MOVEMENT_MODES.map((mode) => formatModeSpeedLine(mode, input, unit)).filter(
    Boolean,
  ) as string[]
  const text = modeLines.join(', ')
  return input.hover ? `${text} (hover)` : text
}

export function formatMovementParenthetical(
  speeds: MovementSpeeds,
  hover: boolean,
  unit: 'ft' | 'ft.' = 'ft.',
): string | undefined {
  const movement = formatMovementDisplay(speeds, unit)
  if (!movement) return undefined
  return hover ? `${movement} [hover]` : movement
}
