import { z } from 'zod'

import { REST_KIND_ENTRIES, REST_KINDS, restKindSchema, type RestKind } from '../vocab/rest'

export const restRecoverySchema = z.object({
  minimumRest: restKindSchema,
})

export type RestRecovery = z.infer<typeof restRecoverySchema>

/** Whether `rest` is at least as complete as the recovery threshold. */
export function restMeetsRecovery(rest: RestKind, recovery: RestRecovery): boolean {
  return REST_KINDS.indexOf(rest) >= REST_KINDS.indexOf(recovery.minimumRest)
}

/** Player-facing label for a slot-progression recovery threshold. */
export function formatRestRecoveryLabel(recovery: RestRecovery): string {
  if (recovery.minimumRest === 'long') {
    return REST_KIND_ENTRIES.long.label
  }
  return 'Short or Long Rest'
}

/** Rules sentence clause: when expended slots are restored. */
export function formatRestRecoveryClause(recovery: RestRecovery): string {
  if (recovery.minimumRest === 'long') {
    return 'when you finish a Long Rest'
  }
  return 'when you finish a Short or Long Rest'
}
