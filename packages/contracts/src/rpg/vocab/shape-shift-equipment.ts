import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const SHAPE_SHIFT_EQUIPMENT_TERM = {
  label: 'Shape-Shift equipment',
  description: 'What happens to equipment when a creature shape-shifts.',
  sentence: {
    singular: 'shape-shift equipment rule',
    plural: 'shape-shift equipment rules',
  },
} as const satisfies VocabularyTerm

export const SHAPE_SHIFT_EQUIPMENT_ENTRIES = {
  unchanged: {
    label: "Isn't transformed",
    description: 'Any equipment it is wearing or carrying is not transformed.',
  },
  'worn-transforms': {
    label: 'Worn equipment transforms',
    description: 'Anything it is wearing transforms with it.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ShapeShiftEquipment = keyof typeof SHAPE_SHIFT_EQUIPMENT_ENTRIES

export const SHAPE_SHIFT_EQUIPMENT = keysFromEntries(SHAPE_SHIFT_EQUIPMENT_ENTRIES)

export const shapeShiftEquipmentSchema = vocabEnumFromEntries(SHAPE_SHIFT_EQUIPMENT_ENTRIES)

export const SHAPE_SHIFT_EQUIPMENT_SENTENCES = {
  unchanged: "Any equipment it is wearing or carrying isn't transformed.",
  'worn-transforms': 'Anything it is wearing transforms with it.',
} as const satisfies Record<ShapeShiftEquipment, string>
