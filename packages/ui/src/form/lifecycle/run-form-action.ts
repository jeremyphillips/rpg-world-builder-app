import type {
  FormActionStage,
  FormActionStageResult,
  RunFormActionBlocked,
  RunFormActionResult,
  RunFormActionSuccess,
} from './form-evaluation.types'

export type RunFormActionOptions = {
  stamp: number
  /** When set, abort before running stages if it does not match `stamp`. */
  requiredStamp?: number
  stages: readonly FormActionStage[]
  input: unknown
}

async function resolveStage<TInput, TOutput>(
  stage: FormActionStage<TInput, TOutput>,
  input: TInput,
): Promise<FormActionStageResult<TOutput>> {
  return await stage.run(input)
}

/**
 * Generic multi-stage form action runner. Content callers supply stage implementations;
 * this module does not know DTO shapes.
 */
export async function runFormAction<TFinal = unknown>(
  options: RunFormActionOptions,
): Promise<RunFormActionResult<TFinal>> {
  const { stamp, requiredStamp, stages, input } = options

  if (requiredStamp !== undefined && requiredStamp !== stamp) {
    const blocked: RunFormActionBlocked = {
      kind: 'blocked',
      stamp,
      stageId: 'stamp',
      message: 'This attempt is no longer current.',
    }
    return blocked
  }

  let cursor: unknown = input
  const stageOutputs: Record<string, unknown> = {}

  for (const stage of stages) {
    const result = await resolveStage(stage, cursor)

    if (result.kind === 'invalid') {
      const blocked: RunFormActionBlocked = {
        kind: 'blocked',
        stamp,
        stageId: stage.id,
        issues: result.issues,
      }
      return blocked
    }

    if (result.kind === 'operation-failure') {
      const blocked: RunFormActionBlocked = {
        kind: 'blocked',
        stamp,
        stageId: stage.id,
        message: result.message,
      }
      return blocked
    }

    stageOutputs[stage.id] = result.data
    cursor = result.data
  }

  const success: RunFormActionSuccess<TFinal> = {
    kind: 'success',
    stamp,
    data: cursor as TFinal,
    stageOutputs,
  }
  return success
}
