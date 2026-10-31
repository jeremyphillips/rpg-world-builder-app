import { z } from 'zod'

import { restRecoverySchema } from '../rest-recovery'

export const RECHARGE_DIE_FACES = 6

export const RECHARGE_REST_RECOVERY = { minimumRest: 'short' } as const

const publishedUseCountSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed'), value: z.number().int().min(1) }),
  z.object({ kind: z.literal('proficiency-bonus') }),
])

const draftUseCountSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed'), value: z.number().int().min(1).optional() }),
  z.object({ kind: z.literal('proficiency-bonus') }),
])

const publishedUsesSchema = z.object({
  kind: z.literal('uses'),
  count: publishedUseCountSchema,
  recovery: restRecoverySchema,
})

const draftUsesSchema = z.object({
  kind: z.literal('uses'),
  count: draftUseCountSchema.optional(),
  recovery: restRecoverySchema.optional(),
})

const publishedRechargeSchema = z.object({
  kind: z.literal('recharge'),
  minRoll: z.number().int().min(2).max(RECHARGE_DIE_FACES),
})

const draftRechargeSchema = z.object({
  kind: z.literal('recharge'),
  minRoll: z.number().int().min(2).max(RECHARGE_DIE_FACES).optional(),
})

export const limitedUseSchema = z.discriminatedUnion('kind', [
  publishedUsesSchema,
  publishedRechargeSchema,
])
export const limitedUseDraftSchema = z.discriminatedUnion('kind', [
  draftUsesSchema,
  draftRechargeSchema,
])

/** Rest-based uses limit. Recharge is not a valid grant cadence. */
export const restLimitedUseSchema = publishedUsesSchema

export type LimitedUse = z.infer<typeof limitedUseSchema>
export type LimitedUseDraft = z.infer<typeof limitedUseDraftSchema>
export type RestLimitedUse = z.infer<typeof restLimitedUseSchema>
export type UseCount = NonNullable<RestLimitedUse['count']>
export type UseCountKind = UseCount['kind']
