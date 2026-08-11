import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  MAX_CHARACTER_LEVEL,
  buildLevelOptions,
  maxLevelSelectable,
  minLevelSelectable,
  type LevelRangeRow,
} from '@rpg/contracts'
import type {
  ArrayItemConfig,
  ArrayItemHeaderConfig,
  FormItem,
  SelectFieldOptionListItem,
} from '@rpg/ui/form'

import type { LevelRangeArrayConfig } from '../array-patterns'
import { levelRangeArrayPattern } from '../array-patterns'

const LEVEL_RANGE_FILTER_DEPENDS_ON = [
  'maxCharacterLevel',
  'extendedProgressionEnabled',
  'extendedMaxLevel',
] as const

function resolveEffectiveMax(watched: Record<string, unknown>): number {
  const maxCharacterLevel =
    typeof watched.maxCharacterLevel === 'number' ? watched.maxCharacterLevel : MAX_CHARACTER_LEVEL
  if (watched.extendedProgressionEnabled === true) {
    return typeof watched.extendedMaxLevel === 'number'
      ? watched.extendedMaxLevel
      : maxCharacterLevel
  }
  return maxCharacterLevel
}

function levelOptionsForEffectiveMax(effectiveMax: number): SelectFieldOptionListItem[] {
  return buildLevelOptions(effectiveMax)
}

export type BuildLevelRangeTiersArrayFieldOptions = {
  name: string
  legend: string
  min?: number
  max?: number
  density?: LevelRangeArrayConfig['density']
  itemHeader?: ArrayItemHeaderConfig
  itemVariant?: ArrayItemConfig['variant']
  itemSurface?: ArrayItemConfig['surface']
  itemCollapsible?: ArrayItemConfig['collapsible']
  addActionLabel?: string
  /** Row fields after the level range control. */
  fields: FormItem[]
  levelRangeLabel?: string
  /** Static fallback options; cross-row filtering rebuilds from watched effective max. */
  levelOptions?: SelectFieldOptionListItem[]
}

/** Repeatable level-range tier array with progression-aware select filtering. */
export function buildLevelRangeTiersArrayField(
  options: BuildLevelRangeTiersArrayFieldOptions,
): LevelRangeArrayConfig {
  const levelOptions =
    options.levelOptions ?? levelOptionsForEffectiveMax(ABSOLUTE_MAX_CHARACTER_LEVEL)

  return {
    kind: 'array',
    name: options.name,
    legend: options.legend,
    min: options.min,
    max: options.max,
    density: options.density,
    item: {
      header: options.itemHeader,
      variant: options.itemVariant,
      surface: options.itemSurface,
      collapsible: options.itemCollapsible ?? true,
      reorder: false,
    },
    addAction: options.addActionLabel ? { label: options.addActionLabel } : undefined,
    arrayPattern: levelRangeArrayPattern({ min: 'minLevel', max: 'maxLevel' }),
    filterSelect: {
      dependsOn: [...LEVEL_RANGE_FILTER_DEPENDS_ON],
      filter: ({ arrayItems, rowIndex, fieldName, watchedValues }) => {
        const effectiveMax = resolveEffectiveMax(watchedValues)
        const rows = arrayItems as LevelRangeRow[]
        const row = rows[rowIndex]
        const rowMin = row?.minLevel ?? 1

        return buildLevelOptions(effectiveMax).map((option) => {
          const level = Number(option.value)
          const selectable =
            fieldName === 'minLevel'
              ? minLevelSelectable(rows, rowIndex, level, effectiveMax)
              : maxLevelSelectable(rows, rowIndex, level, rowMin, effectiveMax)

          return { ...option, disabled: !selectable }
        })
      },
    },
    fields: [
      {
        type: 'levelRange',
        name: 'minLevel',
        label: options.levelRangeLabel ?? 'Level range',
        required: true,
        digits: 2,
        width: 'full',
        options: levelOptions,
      },
      ...options.fields,
    ],
  }
}

export { LEVEL_RANGE_FILTER_DEPENDS_ON, resolveEffectiveMax }
