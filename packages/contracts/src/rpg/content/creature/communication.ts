import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { SENSE_RANGES } from '../../vocab/sense'
import { creatureTelepathyMessages } from './communication-messages'

/** Stored feet for telepathy of 1 mile. Sense ranges never use this value. */
export const TELEPATHY_MILE_FEET = 5280

const SENSE_RANGE_PRESETS: readonly number[] = SENSE_RANGES

export const creatureCommunicationSchema = z
  .object({
    telepathy: z.number().int().min(0).optional(),
  })
  .strict()

export type CreatureCommunication = z.infer<typeof creatureCommunicationSchema>

export const EMPTY_CREATURE_COMMUNICATION: CreatureCommunication = {}

/** Display label for a stored telepathy range (`60 ft.`, `1 mile`). */
export function formatTelepathyRange(feet: number): string {
  if (feet === TELEPATHY_MILE_FEET) return '1 mile'
  return `${feet} ft.`
}

/** Publish validation — telepathy is a sense-range preset or one mile. */
export function refineCreatureTelepathyRange(
  telepathy: number | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (telepathy === undefined) return
  if (telepathy === TELEPATHY_MILE_FEET || SENSE_RANGE_PRESETS.includes(telepathy)) return
  addCustomRefinementIssue(ctx, creatureTelepathyMessages.chooseRange(), path)
}
