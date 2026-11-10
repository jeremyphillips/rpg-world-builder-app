import { getTermSentenceForm, SENSE_RANGES, standardFeet, TIME_UNIT_ENTRIES } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  distanceAmountOptions,
  distanceJoinedPairField,
} from '../../lib/forms/fields/content-distance-form-fields'

const LEGENDARY_RESISTANCE_USES = standardFeet(1, 6, 1)
const HOLD_BREATH_MINUTES = [1, 5, 10, 15, 30] as const
const HOLD_BREATH_HOURS = [1, 2, 4, 8, 12, 24] as const
const STANDING_LEAP_FEET = standardFeet(10, 60, 10)
const REGENERATION_HIT_POINTS = standardFeet(5, 30, 5)

const DURATION_UNITS = (['hour', 'minute'] as const).map((unit) => ({
  value: unit,
  label: getTermSentenceForm(TIME_UNIT_ENTRIES[unit], 1),
}))

function durationPair(amountName: string): FormItem {
  return distanceJoinedPairField({
    amountName,
    label: 'Duration',
    presets: HOLD_BREATH_HOURS,
    unitName: amountName === 'count' ? 'unit' : 'outsideWaterBreathUnit',
    unitOptions: DURATION_UNITS,
    presetsByUnit: {
      hour: distanceAmountOptions(HOLD_BREATH_HOURS),
      minute: distanceAmountOptions(HOLD_BREATH_MINUTES),
    },
    allowCustom: true,
    customMin: 1,
    customMax: 1440,
    clearAmountWhenUnitChanges: true,
    digits: 2,
  })
}

export function waterBreathingDurationEnabled(row: object): boolean {
  const record = row as {
    outsideWaterBreathAmount?: unknown
    outsideWaterBreathUnit?: unknown
  }
  return record.outsideWaterBreathAmount != null || record.outsideWaterBreathUnit != null
}

/** Parameter fields for a configurable trait. Fixed presets return none. */
export function monsterTraitPresetFields(preset: string): FormItem[] {
  switch (preset) {
    case 'legendary-resistance':
      return [
        distanceJoinedPairField({
          amountName: 'uses',
          label: 'Uses',
          presets: LEGENDARY_RESISTANCE_USES,
          fixedUnitLabel: '/Day',
          allowCustom: true,
          customMin: 1,
          customMax: 12,
          digits: 2,
        }),
        { type: 'switch', name: 'lair', label: 'In lair' },
      ]
    case 'hold-breath':
      return [durationPair('count')]
    case 'illumination':
      return [
        distanceJoinedPairField({
          amountName: 'radius',
          label: 'Bright radius',
          presets: SENSE_RANGES,
          allowCustom: true,
          customMin: 5,
          customMax: 120,
        }),
      ]
    case 'standing-leap':
      return [
        distanceJoinedPairField({
          amountName: 'longJump',
          label: 'Long Jump',
          presets: STANDING_LEAP_FEET,
          allowCustom: true,
          customMin: 5,
          customMax: 60,
        }),
      ]
    case 'swarm':
      return [{ type: 'text', name: 'noun', label: 'Tiny creature' }]
    case 'regeneration':
    case 'regeneration-halt':
      return [
        distanceJoinedPairField({
          amountName: 'hitPoints',
          label: 'Hit points',
          presets: REGENERATION_HIT_POINTS,
          fixedUnitLabel: 'HP',
          allowCustom: true,
          customMin: 1,
          customMax: 30,
          digits: 2,
        }),
      ]
    case 'water-breathing':
      return [durationPair('outsideWaterBreathAmount')]
    default:
      return []
  }
}

export function monsterTraitPresetDefaults(preset: string): Record<string, unknown> {
  switch (preset) {
    case 'legendary-resistance':
      return { uses: 3, lair: false }
    case 'hold-breath':
      return { count: 1, unit: 'hour' }
    case 'illumination':
      return { radius: 10 }
    case 'standing-leap':
      return { longJump: 10 }
    case 'regeneration':
      return { hitPoints: 10 }
    case 'regeneration-halt':
      return { hitPoints: 15 }
    default:
      return {}
  }
}
