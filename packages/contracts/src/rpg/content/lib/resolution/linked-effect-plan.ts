import type {
  ResolutionApplicationAmount,
  ResolutionOutcomeResult,
} from '../../../vocab/resolution'
import { stripEffectFromOutcomes } from './outcome-change-plan'
import { nextResolutionEffectId } from './resolution-effect-id-alloc'
import type { ResolutionEffectId } from './resolution-effect-id'
import type { ResolutionOutcomeRef } from './selection-types'

export type LinkedEffectPlacement = {
  result: ResolutionOutcomeResult
  amount: ResolutionApplicationAmount
}

export type LinkedEffectReference = {
  kind: 'effect-reference'
  effectId: ResolutionEffectId
  amount: ResolutionApplicationAmount
}

export type LinkedEffectAddPlan<T extends object> = {
  effectId: ResolutionEffectId
  definition: T & { id: ResolutionEffectId }
  references: Array<{ result: ResolutionOutcomeResult; reference: LinkedEffectReference }>
}

/** One definition plus the owner reference and any automatically linked references. */
export function planLinkedEffectAdd<T extends object>(args: {
  existingIds?: readonly string[]
  definition: T
  owner: LinkedEffectPlacement
  linked?: readonly LinkedEffectPlacement[]
  createId?: () => string
}): LinkedEffectAddPlan<T> {
  const effectId = nextResolutionEffectId(args.existingIds ?? [], args.createId)
  const placements = [args.owner, ...(args.linked ?? [])]
  return {
    effectId,
    definition: { ...args.definition, id: effectId },
    references: placements.map((placement) => ({
      result: placement.result,
      reference: { kind: 'effect-reference', effectId, amount: placement.amount },
    })),
  }
}

export type LinkedEffectRemovePlan<T extends { id?: string }> = {
  library: T[]
  outcomes: ResolutionOutcomeRef[]
}

/** Drops one library definition and every outcome reference to it, including second failure. */
export function planLinkedEffectRemove<T extends { id?: string }>(args: {
  library: readonly T[]
  outcomes: readonly ResolutionOutcomeRef[]
  effectId: string
}): LinkedEffectRemovePlan<T> {
  return {
    library: args.library.filter((effect) => effect.id !== args.effectId),
    outcomes: stripEffectFromOutcomes(args.outcomes, args.effectId),
  }
}
