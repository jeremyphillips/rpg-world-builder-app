import type { AttackResolutionModeId } from './attack-resolution-mode'
import type { EditionPresetId } from './edition-preset'

export const ARMOR_CLASS_MODES = ['ascending', 'descending'] as const

export type ArmorClassMode = (typeof ARMOR_CLASS_MODES)[number]

export const ARMOR_CLASS_BASES = [9, 10] as const

export type ArmorClassBase = (typeof ARMOR_CLASS_BASES)[number]

export type EditionPresetMechanicsKnobs = {
  readonly armorClass: {
    readonly mode: ArmorClassMode
    readonly base: ArmorClassBase
  }
  readonly attackResolution: {
    readonly mode: AttackResolutionModeId
  }
}

/** Knob bundles applied when a campaign selects an edition preset. */
export const EDITION_PRESET_MECHANICS = {
  becmi: {
    armorClass: { mode: 'descending', base: 9 },
    attackResolution: { mode: 'attack_matrix' },
  },
  '1e': {
    armorClass: { mode: 'descending', base: 10 },
    attackResolution: { mode: 'combat_tables' },
  },
  '2e': {
    armorClass: { mode: 'descending', base: 10 },
    attackResolution: { mode: 'thac0' },
  },
  '3e': {
    armorClass: { mode: 'ascending', base: 10 },
    attackResolution: { mode: 'attack_bonus_vs_target_ac' },
  },
  '5e': {
    armorClass: { mode: 'ascending', base: 10 },
    attackResolution: { mode: 'proficiency_attack_vs_ac' },
  },
} as const satisfies Record<EditionPresetId, EditionPresetMechanicsKnobs>

/** Returns the mechanics knob bundle for an edition preset id. */
export function getEditionPresetMechanics(id: EditionPresetId): EditionPresetMechanicsKnobs {
  return EDITION_PRESET_MECHANICS[id]
}
