import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Equipment mechanical effect targets — numeric bonuses on instances.
// ---------------------------------------------------------------------------

export const EQUIPMENT_EFFECT_TARGET_TERM = {
  label: 'Equipment Effect Target',
  description: 'Which roll or value an equipment mechanical effect modifies.',
  sentence: {
    singular: 'equipment effect target',
    plural: 'equipment effect targets',
  },
} as const satisfies VocabularyTerm

export const EQUIPMENT_EFFECT_TARGET_ENTRIES = {
  attack_roll: {
    label: 'Attack rolls',
    description: 'Modify attack rolls made with this equipment.',
    sentence: {
      singular: 'attack roll',
      plural: 'attack rolls',
    },
  },
  damage_roll: {
    label: 'Damage rolls',
    description: 'Modify damage rolls made with this equipment.',
    sentence: {
      singular: 'damage roll',
      plural: 'damage rolls',
    },
  },
  armor_class: {
    label: 'Armor Class',
    description: 'Increase or decrease Armor Class.',
    sentence: {
      singular: 'Armor Class',
      plural: 'Armor Class',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type EquipmentEffectTarget = keyof typeof EQUIPMENT_EFFECT_TARGET_ENTRIES

export const EQUIPMENT_EFFECT_TARGETS = keysFromEntries(EQUIPMENT_EFFECT_TARGET_ENTRIES)

export const equipmentEffectTargetSchema = vocabEnumFromEntries(EQUIPMENT_EFFECT_TARGET_ENTRIES)
