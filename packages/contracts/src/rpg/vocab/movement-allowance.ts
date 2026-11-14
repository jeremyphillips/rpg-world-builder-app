import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const MOVEMENT_ALLOWANCE_TERM = {
  label: 'Movement Allowance',
  description: 'The maximum distance a creature can move relative to its Speed.',
  sentence: {
    singular: 'movement allowance',
    plural: 'movement allowances',
  },
} as const satisfies VocabularyTerm

export const MOVEMENT_ALLOWANCE_ENTRIES = {
  'half-speed': {
    label: 'Up to half its Speed',
    description: "Movement limited to half the creature's Speed.",
  },
  speed: {
    label: 'Up to its Speed',
    description: "Movement limited to the creature's full Speed.",
  },
} as const satisfies Record<string, GameTermEntry>

export type MovementAllowance = keyof typeof MOVEMENT_ALLOWANCE_ENTRIES

export const MOVEMENT_ALLOWANCES = keysFromEntries(MOVEMENT_ALLOWANCE_ENTRIES)

export const movementAllowanceSchema = vocabEnumFromEntries(MOVEMENT_ALLOWANCE_ENTRIES)
