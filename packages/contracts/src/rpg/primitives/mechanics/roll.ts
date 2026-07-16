import { z } from 'zod'

import { averageDiceRoll, diceSchema, formatDice, type Dice } from '../dice'
import { rollValidationMessages } from './roll-messages'

// ---------------------------------------------------------------------------
// Roll value — shared dice ± flat primitive for weapons, spell effects, and
// other mechanics. Allows dice-only, flat-only, or combined (e.g. 2d4+4).
// ---------------------------------------------------------------------------

export const rollSchema = z
  .object({
    dice: diceSchema.optional(),
    flat: z.number().int().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.dice === undefined && val.flat === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rollValidationMessages.atLeastOneRequired(),
      })
    }
  })

export type RollValue = z.infer<typeof rollSchema>

function formatSignedFlat(flat: number): string {
  return flat >= 0 ? `+${flat}` : String(flat)
}

/** Formats a roll for display (e.g. "2d4+4", "1d6-1", "1d10", "5"). */
export function formatRollValue(roll: RollValue): string {
  if (roll.dice === undefined) {
    return String(roll.flat)
  }

  const dicePart = formatDice(roll.dice)
  if (roll.flat === undefined) {
    return dicePart
  }

  return `${dicePart}${formatSignedFlat(roll.flat)}`
}

/**
 * Returns the average result of a roll value.
 * Combined rolls average dice and add flat.
 */
export function averageRollValue(roll: RollValue): number {
  const diceAverage = roll.dice !== undefined ? averageDiceRoll(roll.dice) : 0
  return diceAverage + (roll.flat ?? 0)
}

/** Returns dice from a roll when present; useful for dice-only weapon lines. */
export function rollDice(roll: RollValue): Dice | undefined {
  return roll.dice
}
