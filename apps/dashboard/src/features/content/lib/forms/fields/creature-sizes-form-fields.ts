import type { ChipsFieldConfig, FieldOption } from '@rpg/ui/form'

export const CREATURE_SIZES_FIELD_LABEL = 'Sizes'

export const SPECIES_SIZES_FIELD_HINT =
  'Select every size this species permits. A character has one size, chosen from this list.'

export const MONSTER_SIZES_FIELD_HINT =
  'Select all sizes this monster can have. Hit Dice use the largest selected size.'

/** Shared sizes chips. Hosts supply hint and already rank-sorted options. */
export function createCreatureSizesFieldConfig(config: {
  hint: string
  options: FieldOption[]
}): ChipsFieldConfig {
  return {
    type: 'chips',
    name: 'sizes',
    multiple: true,
    label: CREATURE_SIZES_FIELD_LABEL,
    options: config.options,
    required: true,
    hint: config.hint,
  }
}
