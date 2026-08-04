import { ACTION_BATCH_VALIDATE_FAILURE_MESSAGES } from '@rpg/contracts'

import { HttpError } from './http-error'

/** Server-side concurrency for batch validate target evaluation. */
export const BATCH_VALIDATE_CONCURRENCY = 5

export type BatchTargetFailureOutcome = {
  targetId: string
  targetName: string
  failure: {
    code: string
    message: string
  }
}

export function mapBatchTargetError(
  err: unknown,
  targetId: string,
  targetName: string,
): BatchTargetFailureOutcome {
  if (err instanceof HttpError && err.status === 404) {
    return {
      targetId,
      targetName,
      failure: {
        code: 'not_found',
        message: ACTION_BATCH_VALIDATE_FAILURE_MESSAGES.notFound,
      },
    }
  }

  return {
    targetId,
    targetName,
    failure: {
      code: 'validate_error',
      message: ACTION_BATCH_VALIDATE_FAILURE_MESSAGES.validateError,
    },
  }
}

export async function mapBatchTargetsWithConcurrency<TTarget, TOutcome>({
  targets,
  evaluateTarget,
  concurrency = BATCH_VALIDATE_CONCURRENCY,
}: {
  targets: readonly TTarget[]
  evaluateTarget: (target: TTarget) => Promise<TOutcome>
  concurrency?: number
}): Promise<TOutcome[]> {
  const results: TOutcome[] = []

  for (let index = 0; index < targets.length; index += concurrency) {
    const batch = targets.slice(index, index + concurrency)
    const batchResults = await Promise.all(batch.map((target) => evaluateTarget(target)))
    results.push(...batchResults)
  }

  return results
}

export function resolveContentEntityDisplayName(entity: {
  id: string
  [key: string]: unknown
}): string {
  return typeof entity.name === 'string' && entity.name.length > 0 ? entity.name : entity.id
}
