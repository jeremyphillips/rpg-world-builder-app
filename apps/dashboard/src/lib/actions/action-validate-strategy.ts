import {
  createActionValidationResult,
  getErrorMessage,
  type ActionBatchValidationResult,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionTargetResult,
  type ActionValidationResult,
} from '@rpg/contracts'

import { ACTION_VALIDATE_CONCURRENCY } from './fan-out-validate'

export type ActionValidateStrategy<
  TTarget,
  TBlocker,
  TFailure extends ActionTargetFailure = ActionTargetFailure,
> = {
  validate: (
    targets: readonly TTarget[],
  ) => Promise<ActionBatchValidationResult<TBlocker, TFailure>>
}

export function createFanOutValidateStrategy<
  TTarget,
  TBlocker,
  TFailure extends ActionTargetFailure = ActionTargetFailure,
>({
  getTargetIdentity,
  validateTarget,
  concurrency = ACTION_VALIDATE_CONCURRENCY,
}: {
  getTargetIdentity: (target: TTarget) => ActionTargetIdentity
  validateTarget: (target: TTarget) => Promise<ActionTargetResult<TBlocker>>
  concurrency?: number
}): ActionValidateStrategy<TTarget, TBlocker, TFailure> {
  return {
    async validate(targets) {
      if (targets.length === 0) {
        return { validation: { targets: [] }, failures: [] }
      }

      const validationTargets: ActionTargetResult<TBlocker>[] = []
      const failures: Array<{ targetId: string; failure: TFailure }> = []

      for (let index = 0; index < targets.length; index += concurrency) {
        const batch = targets.slice(index, index + concurrency)
        const batchResults = await Promise.allSettled(
          batch.map(async (target) => ({
            target,
            result: await validateTarget(target),
          })),
        )

        for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
          const settled = batchResults[batchIndex]!
          const target = batch[batchIndex]!
          const identity = getTargetIdentity(target)

          if (settled.status === 'fulfilled') {
            validationTargets.push(settled.value.result)
            continue
          }

          failures.push({
            targetId: identity.targetId,
            failure: {
              code: 'request_error',
              message: getErrorMessage(settled.reason, 'Availability could not be checked.'),
            } as TFailure,
          })
        }
      }

      return {
        validation: createActionValidationResult(validationTargets),
        failures,
      }
    },
  }
}

export function createBatchValidateStrategy<
  TTarget,
  TResponse,
  TBlocker,
  TFailure extends ActionTargetFailure = ActionTargetFailure,
>({
  getTargetId,
  fetchBatch,
  mapResponse,
  batchFailureMessage = 'Could not validate the action.',
}: {
  getTargetId: (target: TTarget) => string
  fetchBatch: (targets: readonly TTarget[]) => Promise<TResponse>
  mapResponse: (
    requestedIds: readonly string[],
    response: TResponse,
  ) => ActionBatchValidationResult<TBlocker, TFailure>
  batchFailureMessage?: string
}): ActionValidateStrategy<TTarget, TBlocker, TFailure> {
  return {
    async validate(targets) {
      if (targets.length === 0) {
        return { validation: { targets: [] }, failures: [] }
      }

      const requestedIds = targets.map(getTargetId)

      try {
        const response = await fetchBatch(targets)
        return mapResponse(requestedIds, response)
      } catch (error) {
        const message = getErrorMessage(error, batchFailureMessage)
        return {
          validation: { targets: [] },
          failures: requestedIds.map((targetId) => ({
            targetId,
            failure: {
              code: 'request_error',
              message,
            } as TFailure,
          })),
        }
      }
    },
  }
}

export function resolveActionBatchValidationForLifecycle<
  TBlocker,
  TFailure extends ActionTargetFailure,
>(
  batchResult: ActionBatchValidationResult<TBlocker, TFailure>,
  targetNamesById: ReadonlyMap<string, string>,
): ActionValidationResult<TBlocker> {
  if (batchResult.failures.length === 0) {
    return batchResult.validation
  }

  const failureLines = batchResult.failures.map(({ targetId, failure }) => {
    const targetName = targetNamesById.get(targetId) ?? targetId
    return `${targetName}: ${failure.message}`
  })

  throw new Error(failureLines.join('\n'))
}

/** Merge pre-eligible targets with batch-validated targets in original row order. */
export function mergeBatchValidationTargets<TBlocker>(
  rows: readonly { targetId: string }[],
  preEligibleById: ReadonlyMap<string, ActionTargetResult<TBlocker>>,
  batchValidation: ActionValidationResult<TBlocker>,
): ActionValidationResult<TBlocker> {
  const batchTargetsById = new Map(
    batchValidation.targets.map((target) => [target.targetId, target] as const),
  )

  const targets = rows.map((row) => {
    const preEligible = preEligibleById.get(row.targetId)
    if (preEligible) {
      return preEligible
    }

    const batchTarget = batchTargetsById.get(row.targetId)
    if (!batchTarget) {
      throw new Error(`Missing batch validation result for "${row.targetId}".`)
    }

    return batchTarget
  })

  return createActionValidationResult(targets)
}
