import { z } from 'zod'

import type { ActionBatchValidationResult, ActionTargetFailure } from './action-validation'

/** Max targets per batch request — mirrors overview selection caps (50). */
export const ACTION_VALIDATE_BATCH_TARGET_LIMIT = 50

export const ACTION_BATCH_VALIDATE_FAILURE_MESSAGES = {
  notFound: 'This item could not be found.',
  validateError: 'Availability could not be checked.',
  malformedResponse: 'Validation results were incomplete. Try again.',
} as const

export const actionTargetFailureSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
})

export type ActionTargetFailureWire = z.infer<typeof actionTargetFailureSchema>

const batchTargetIdentitySchema = {
  targetId: z.string().min(1),
  targetName: z.string(),
} as const

/** Reject duplicate IDs in batch requests — overview selection is already unique. */
export function uniqueTargetIdsRefinement(idKey: string) {
  return (data: { targets: Array<Record<string, string>> }, ctx: z.RefinementCtx) => {
    const seen = new Set<string>()

    for (let index = 0; index < data.targets.length; index += 1) {
      const id = data.targets[index]?.[idKey]
      if (id === undefined) {
        continue
      }

      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate ${idKey} "${id}" in batch targets.`,
          path: ['targets', index, idKey],
        })
      }

      seen.add(id)
    }
  }
}

export function createBatchTargetOutcomeSchema<TAvailability extends z.ZodTypeAny>(
  availabilitySchema: TAvailability,
) {
  return z.union([
    z.object({
      ...batchTargetIdentitySchema,
      availability: availabilitySchema,
    }),
    z.object({
      ...batchTargetIdentitySchema,
      failure: actionTargetFailureSchema,
    }),
  ])
}

export function createBatchTargetsRequestSchema<TTarget extends z.ZodTypeAny>(
  targetSchema: TTarget,
) {
  return z
    .object({
      targets: z.array(targetSchema).min(1).max(ACTION_VALIDATE_BATCH_TARGET_LIMIT),
    })
    .strict()
}

export type BatchResponseCorrespondenceError = {
  kind: 'malformed_batch_response'
  reason: string
}

export function assertBatchResponseCorrespondence(
  requestedIds: readonly string[],
  responseTargets: readonly { targetId: string }[],
): BatchResponseCorrespondenceError | null {
  if (responseTargets.length !== requestedIds.length) {
    return {
      kind: 'malformed_batch_response',
      reason: 'Response target count does not match request.',
    }
  }

  const seen = new Set<string>()

  for (let index = 0; index < requestedIds.length; index += 1) {
    const requestedId = requestedIds[index]!
    const responseTarget = responseTargets[index]

    if (!responseTarget) {
      return {
        kind: 'malformed_batch_response',
        reason: `Missing response entry at index ${index}.`,
      }
    }

    if (responseTarget.targetId !== requestedId) {
      return {
        kind: 'malformed_batch_response',
        reason: `Response order mismatch at index ${index}.`,
      }
    }

    if (seen.has(responseTarget.targetId)) {
      return {
        kind: 'malformed_batch_response',
        reason: `Duplicate targetId "${responseTarget.targetId}" in response.`,
      }
    }

    seen.add(responseTarget.targetId)
  }

  return null
}

export function createMalformedBatchValidationResult<TBlocker>(
  requestedIds: readonly string[],
): ActionBatchValidationResult<TBlocker> {
  return {
    validation: { targets: [] },
    failures: requestedIds.map((targetId) => ({
      targetId,
      failure: {
        code: 'malformed_response',
        message: ACTION_BATCH_VALIDATE_FAILURE_MESSAGES.malformedResponse,
      },
    })),
  }
}

export function isBatchTargetFailureOutcome<TAvailability>(outcome: {
  availability?: TAvailability
  failure?: ActionTargetFailure
}): outcome is { targetId: string; targetName: string; failure: ActionTargetFailure } {
  return outcome.failure !== undefined
}
