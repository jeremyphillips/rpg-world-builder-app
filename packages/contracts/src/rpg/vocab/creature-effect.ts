import { z } from 'zod'

import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { effectConditionSchema } from './effect-condition'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Creature effect circumstances — typed situations that limit when a creature
// effect applies. Not the Conditions vocabulary and not an expression engine.
// ---------------------------------------------------------------------------

export const CREATURE_EFFECT_CIRCUMSTANCE_TERM = {
  label: 'Circumstance',
  description: 'A typed situation that limits when a creature effect applies.',
  sentence: {
    singular: 'circumstance',
    plural: 'circumstances',
  },
} as const satisfies VocabularyTerm

export const CREATURE_EFFECT_CIRCUMSTANCE_ENTRIES = {
  'vs-magic': {
    label: 'Against Magic',
    description: 'The effect applies to spells and other magical effects.',
    sentence: {
      singular: 'against magic',
      plural: 'against magic',
    },
  },
  'vs-condition': {
    label: 'Against a Condition',
    description: 'The effect applies when avoiding or ending one condition.',
    sentence: {
      singular: 'against a condition',
      plural: 'against conditions',
    },
  },
  'ally-adjacent-to-target': {
    label: 'Ally Adjacent to Target',
    description:
      'The effect applies when an ally is within 5 feet of the target and is not incapacitated.',
    sentence: {
      singular: 'while an ally is adjacent to the target',
      plural: 'while an ally is adjacent to the target',
    },
  },
  'in-sunlight': {
    label: 'In Sunlight',
    description: 'The effect applies while the creature is in sunlight.',
    sentence: {
      singular: 'in sunlight',
      plural: 'in sunlight',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureEffectCircumstanceKind = keyof typeof CREATURE_EFFECT_CIRCUMSTANCE_ENTRIES

export const CREATURE_EFFECT_CIRCUMSTANCE_IDS = keysFromEntries(
  CREATURE_EFFECT_CIRCUMSTANCE_ENTRIES,
)

export const creatureEffectCircumstanceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('vs-magic') }),
  z.object({ kind: z.literal('vs-condition'), conditionId: effectConditionSchema }),
  z.object({ kind: z.literal('ally-adjacent-to-target') }),
  z.object({ kind: z.literal('in-sunlight') }),
])

export type CreatureEffectCircumstance = z.infer<typeof creatureEffectCircumstanceSchema>

export function getCreatureEffectCircumstanceEntry(id: string): GameTermEntry | undefined {
  return CREATURE_EFFECT_CIRCUMSTANCE_ENTRIES[id as CreatureEffectCircumstanceKind]
}

export const CREATURE_ROLL_ADJUSTMENT_MODE_TERM = {
  label: 'Roll Adjustment',
  description: 'Whether a creature effect grants advantage or disadvantage.',
  sentence: {
    singular: 'roll adjustment',
    plural: 'roll adjustments',
  },
} as const satisfies VocabularyTerm

export const CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES = {
  advantage: {
    label: 'Advantage',
    description: 'Roll a second d20 and use the higher result.',
    sentence: {
      singular: 'advantage',
      plural: 'advantage',
    },
  },
  disadvantage: {
    label: 'Disadvantage',
    description: 'Roll a second d20 and use the lower result.',
    sentence: {
      singular: 'disadvantage',
      plural: 'disadvantage',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureRollAdjustmentMode = keyof typeof CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES

export const creatureRollAdjustmentModeSchema = vocabEnumFromEntries(
  CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES,
)

export const CREATURE_ROLL_TARGET_TERM = {
  label: 'Roll Target',
  description: 'The kind of roll a creature effect adjusts.',
  sentence: {
    singular: 'roll',
    plural: 'rolls',
  },
} as const satisfies VocabularyTerm

export const CREATURE_ROLL_TARGET_ENTRIES = {
  attack: {
    label: 'Attack Roll',
    description: 'An attack roll made by the creature.',
    sentence: {
      singular: 'attack roll',
      plural: 'attack rolls',
    },
  },
  'saving-throw': {
    label: 'Saving Throw',
    description: 'A saving throw made by the creature.',
    sentence: {
      singular: 'saving throw',
      plural: 'saving throws',
    },
  },
  'ability-check': {
    label: 'Ability Check',
    description: 'An ability check, optionally limited to one skill.',
    sentence: {
      singular: 'ability check',
      plural: 'ability checks',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureRollTargetKind = keyof typeof CREATURE_ROLL_TARGET_ENTRIES

export function getCreatureRollTargetEntry(id: string): GameTermEntry | undefined {
  return CREATURE_ROLL_TARGET_ENTRIES[id as CreatureRollTargetKind]
}
