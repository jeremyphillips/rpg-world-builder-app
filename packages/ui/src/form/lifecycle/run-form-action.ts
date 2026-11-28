import type {
  FormActionStage,
  FormActionStageResult,
  RunFormActionBlocked,
  RunFormActionResult,
  RunFormActionSuccess,
} from './form-evaluation.types'

/** Identity of one explicit action: snapshot stamp plus a per-action attempt token. */
export type FormActionAttempt = {
  stamp: number
  attemptId: number
}

export type RunFormActionOptions = {
  /** Immutable record captured synchronously, before the first await. */
  attempt: FormActionAttempt
  /**
   * Reads the live stamp and the newest attempt id. The runner compares this to `attempt`
   * before each stage and again after every await; any mismatch supersedes the action.
   */
  readCurrent: () => FormActionAttempt
  stages: readonly FormActionStage[]
  input: unknown
}

export const FORM_ACTION_SUPERSEDED_STAGE_ID = 'superseded'

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
  const { attempt, readCurrent, stages, input } = options
  const { stamp } = attempt

  const isCurrent = () => {
    const current = readCurrent()
    return current.stamp === attempt.stamp && current.attemptId === attempt.attemptId
  }
  const superseded = (): RunFormActionBlocked => ({
    kind: 'blocked',
    stamp,
    stageId: FORM_ACTION_SUPERSEDED_STAGE_ID,
    message: 'This attempt is no longer current.',
  })

  if (!isCurrent()) return superseded()

  let cursor: unknown = input
  const stageOutputs: Record<string, unknown> = {}

  for (const stage of stages) {
    if (!isCurrent()) return superseded()
    const result = await resolveStage(stage, cursor)
    if (!isCurrent()) return superseded()

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
