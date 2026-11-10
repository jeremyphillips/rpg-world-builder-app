import {
  DAMAGE_TYPE_TERM,
  getTermSentenceForm,
  SENSE_RANGES,
  standardFeet,
  TIME_UNIT_ENTRIES,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  buildActiveDamageTypeFieldOptions,
  vocabularyComboboxFieldForTerm,
} from '@/features/vocabulary'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  distanceAmountOptions,
  distanceJoinedPairField,
} from '../../lib/forms/fields/content-distance-form-fields'

const LEGENDARY_RESISTANCE_USES = standardFeet(1, 6, 1)
const HOLD_BREATH_MINUTES = [1, 5, 10, 15, 30] as const
const HOLD_BREATH_HOURS = [1, 2, 4, 8, 12, 24] as const
const STANDING_LEAP_FEET = standardFeet(10, 60, 10)
const REGENERATION_HIT_POINTS = standardFeet(5, 30, 5)
const STENCH_RADIUS_FEET = [5, 10, 15, 20, 30] as const

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
export function monsterTraitPresetFields(
  preset: string,
  ctx: Pick<ContentFormCtx, 'damageTypeVocabulary'> = {},
): FormItem[] {
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
      return [
        distanceJoinedPairField({
          amountName: 'hitPoints',
          label: 'Hit Points regained per turn',
          presets: REGENERATION_HIT_POINTS,
          fixedUnitLabel: 'HP',
          allowCustom: true,
          customMin: 1,
          customMax: 30,
          digits: 2,
        }),
        {
          type: 'checkbox',
          name: 'regeneratesAtZeroHp',
          label: 'Regenerates at 0 HP',
          defaultValue: false,
        },
        vocabularyComboboxFieldForTerm(DAMAGE_TYPE_TERM, {
          name: 'interruptedByDamageTypes',
          label: 'Damage types that interrupt regeneration',
          multiple: true,
          options: buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary),
        }),
      ]
    case 'water-breathing':
      return [durationPair('outsideWaterBreathAmount')]
    default:
      return waveTwoTraitFields(preset)
  }
}

function waveTwoTraitFields(preset: string): FormItem[] {
  switch (preset) {
    case 'bloodied-fury':
      return [
        {
          type: 'select',
          name: 'attackScope',
          label: 'Attack rolls',
          required: true,
          defaultValue: 'any',
          options: [
            { value: 'any', label: 'Any attack roll' },
            { value: 'melee', label: 'Melee attack rolls' },
          ],
        },
      ]
    case 'ethereal-sight':
      return [
        {
          type: 'select',
          name: 'direction',
          label: 'Sight direction',
          required: true,
          options: [
            { value: 'material-to-ethereal', label: 'Material to Ethereal' },
            { value: 'both', label: 'Both directions' },
          ],
        },
      ]
    case 'mimicry':
      return [
        {
          type: 'select',
          name: 'sounds',
          label: 'Sounds mimicked',
          required: true,
          options: [
            { value: 'animal-and-humanoid', label: 'Animal sounds and humanoid voices' },
            { value: 'simple-heard', label: 'Previously heard simple sounds' },
          ],
        },
        {
          type: 'number',
          name: 'insightDc',
          label: 'Insight DC',
          required: true,
          min: 1,
          max: 30,
          digits: 2,
        },
      ]
    case 'air-form':
      return [
        {
          type: 'select',
          name: 'space',
          label: 'Can enter',
          required: true,
          defaultValue: 'creature',
          options: [
            { value: 'creature', label: "Any creature's space" },
            { value: 'enemy', label: "An enemy's space" },
          ],
        },
      ]
    case 'berserk':
      return [
        {
          type: 'checkbox',
          name: 'canBeCalmed',
          label: 'Creator can calm it',
          defaultValue: false,
        },
      ]
    case 'elemental-restoration':
      return [
        {
          type: 'select',
          name: 'element',
          label: 'Element',
          required: true,
          options: [
            { value: 'air', label: 'Air' },
            { value: 'fire', label: 'Fire' },
          ],
        },
      ]
    case 'stench':
      return [
        {
          type: 'number',
          name: 'dc',
          label: 'Save DC',
          required: true,
          min: 1,
          max: 30,
          digits: 2,
        },
        distanceJoinedPairField({
          amountName: 'radius',
          label: 'Emanation radius',
          presets: STENCH_RADIUS_FEET,
          allowCustom: true,
          customMin: 5,
          customMax: 120,
          required: true,
          digits: 2,
        }),
        {
          type: 'checkbox',
          name: 'successImmunity',
          label: 'Immunity on success',
          defaultValue: false,
        },
      ]
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
      return { hitPoints: 10, regeneratesAtZeroHp: false, interruptedByDamageTypes: [] }
    case 'bloodied-fury':
      return { attackScope: 'any' }
    case 'air-form':
      return { space: 'creature' }
    case 'berserk':
      return { canBeCalmed: false }
    case 'stench':
      return { successImmunity: false }
    default:
      return {}
  }
}
