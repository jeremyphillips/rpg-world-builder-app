import { z } from 'zod'

import { settlementTypeSchema } from '../../vocab/location/region/settlement-type'

/** Kind-specific fields for `kind: 'settlement'`. */
export const settlementLocationKindFields = {
  kind: z.literal('settlement'),
  settlementType: settlementTypeSchema.optional(),
} as const

export const settlementLocationKindSchema = z.object(settlementLocationKindFields)

export type SettlementLocationKindFields = z.infer<typeof settlementLocationKindSchema>
