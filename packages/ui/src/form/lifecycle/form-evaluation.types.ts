import type { FormIssue } from '../errors/form-issue.types'

/** Producer scope for batch replacement (pilot subset). */
export type FormValidationProducerSlot =
  | 'interactive'
  | 'draft-action'
  | 'publish-readiness'
  | 'publish-action'
  | 'serialization'
  | 'api'

export type FormSchemaEvaluationParsed<T> = {
  kind: 'parsed'
  data: T
}

export type FormSchemaEvaluationInvalid = {
  kind: 'invalid'
  /** Full issue list — not reduced to RHF projection. */
  issues: FormIssue[]
  /** Issues with an empty path (form-level / root refinements). */
  rootIssues: FormIssue[]
}

export type FormSchemaEvaluationOperationFailure = {
  kind: 'operation-failure'
  message: string
  cause?: unknown
}

export type FormSchemaEvaluationResult<T> =
  | FormSchemaEvaluationParsed<T>
  | FormSchemaEvaluationInvalid
  | FormSchemaEvaluationOperationFailure

export type FormActionStageResult<T = unknown> =
  | { kind: 'parsed'; data: T }
  | { kind: 'invalid'; issues: FormIssue[] }
  | { kind: 'operation-failure'; message: string; cause?: unknown }

export type FormActionStage<TInput = unknown, TOutput = unknown> = {
  id: string
  intent: string
  run: (input: TInput) => FormActionStageResult<TOutput> | Promise<FormActionStageResult<TOutput>>
}

export type RunFormActionSuccess<T> = {
  kind: 'success'
  data: T
  stamp: number
  stageOutputs: Record<string, unknown>
}

export type RunFormActionBlocked = {
  kind: 'blocked'
  stamp: number
  stageId: string
  issues?: FormIssue[]
  message?: string
}

export type RunFormActionResult<T> = RunFormActionSuccess<T> | RunFormActionBlocked

/**
 * Recorded after Phase 1 bridge prototype. Switch only if mounted criteria fail —
 * see `packages/ui/docs/form-validation-lifecycle.md`.
 */
export const FORM_RHF_INTEGRATION_STRATEGY = 'evaluator-bridge' as const

export type FormRhfIntegrationStrategy = typeof FORM_RHF_INTEGRATION_STRATEGY | 'passive-projection'
