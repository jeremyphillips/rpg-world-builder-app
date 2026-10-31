import { z } from 'zod'

import { REST_KINDS, restKindSchema, type RestKind } from '../vocab/rest'

export const restRecoverySchema = z.object({
  minimumRest: restKindSchema,
})

export type RestRecovery = z.infer<typeof restRecoverySchema>

/** Whether `rest` is at least as complete as the recovery threshold. */
export function restMeetsRecovery(rest: RestKind, recovery: RestRecovery): boolean {
  return REST_KINDS.indexOf(rest) >= REST_KINDS.indexOf(recovery.minimumRest)
}
