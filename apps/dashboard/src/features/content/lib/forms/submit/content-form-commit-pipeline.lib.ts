import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  runFormAction,
  type FormActionAttempt,
  type FormActionStage,
  type FormActionStageResult,
  type FormIssue,
  type FormItem,
  type FormValidationProducerSlot,
  formIssuesFromZodIssues,
  type RunFormActionResult,
} from '@rpg/ui/form'

import {
  buildIdentityPreparedWrite,
  type ContentPreparedWrite,
} from './content-prepared-write.types'
import {
  CONTENT_FORM_VALIDATION_OPERATION_MESSAGE,
  ContentFormValidationOperationFailure,
  evaluateContentFormSchema,
} from '../validation/normalize-content-form-issues.lib'

export const CONTENT_FORM_COMMIT_STAGE_FORM = 'form-evaluate'
const CONTENT_FORM_COMMIT_STAGE_PREPARE = 'prepare'
const CONTENT_FORM_COMMIT_STAGE_WRITE = 'write-validate'

export type ContentFormCommitPipelineInput<TValues extends FieldValues> = {
  values: TValues
  form: UseFormReturn<TValues>
}

export type ContentFormCommitPipelineOptions<TValues extends FieldValues> = {
  attempt: FormActionAttempt
  readCurrent: () => FormActionAttempt
  formSchema: ZodType<TValues>
  writeSchema?: ZodType<unknown>
  resolverFields: FormItem[]
  producerSlot: FormValidationProducerSlot
  prepareCommitValues?: (values: TValues) => TValues
  prepareWrite?: (values: TValues, form: UseFormReturn<TValues>) => ContentPreparedWrite<unknown>
}

export type ContentFormCommitPipelineSuccess<TValues extends FieldValues> = {
  kind: 'success'
  prepared: ContentPreparedWrite<TValues>
  action: RunFormActionResult<ContentPreparedWrite<TValues>>
}

export type ContentFormCommitPipelineBlocked = {
  kind: 'blocked'
  stageId: string
  issues?: FormIssue[]
  message?: string
}

export type ContentFormCommitPipelineResult<TValues extends FieldValues> =
  | ContentFormCommitPipelineSuccess<TValues>
  | ContentFormCommitPipelineBlocked

function createFormEvaluateStage<TValues extends FieldValues>(
  formSchema: ZodType<TValues>,
  resolverFields: FormItem[],
): FormActionStage<
  ContentFormCommitPipelineInput<TValues>,
  ContentFormCommitPipelineInput<TValues>
> {
  return {
    id: CONTENT_FORM_COMMIT_STAGE_FORM,
    intent: 'form-evaluate',
    run: (input) => {
      const evaluated = evaluateContentFormSchema(formSchema, input.values, resolverFields)
      if (evaluated.kind === 'invalid') return { kind: 'invalid', issues: evaluated.issues }
      return { kind: 'parsed', data: { ...input, values: evaluated.data } }
    },
  }
}

type ZodIssueLike = { path: PropertyKey[]; message: string }

function zodIssuesOf(error: unknown): ZodIssueLike[] | null {
  if (typeof error !== 'object' || error === null) return null
  const candidate = error as { name?: unknown; issues?: unknown }
  if (candidate.name !== 'ZodError' || !Array.isArray(candidate.issues)) return null
  return candidate.issues as ZodIssueLike[]
}

/**
 * Author-correctable serialization failures (a Zod parse inside prepare) become issues for the
 * serialization slot. Invariants and unexpected throws become the safe operation copy, never
 * `Error.message` or Zod JSON.
 */
function classifyPrepareFailure(error: unknown): FormActionStageResult<never> {
  const issues = zodIssuesOf(error)
  if (issues && issues.length > 0) {
    return { kind: 'invalid', issues: formIssuesFromZodIssues(issues) }
  }
  return {
    kind: 'operation-failure',
    message: CONTENT_FORM_VALIDATION_OPERATION_MESSAGE,
    cause: error,
  }
}

function createPrepareStage<TValues extends FieldValues>(
  prepareCommitValues?: (values: TValues) => TValues,
  prepareWrite?: (values: TValues, form: UseFormReturn<TValues>) => ContentPreparedWrite<unknown>,
): FormActionStage<ContentFormCommitPipelineInput<TValues>, ContentPreparedWrite<TValues>> {
  return {
    id: CONTENT_FORM_COMMIT_STAGE_PREPARE,
    intent: 'prepare',
    run: ({ values, form }) => {
      try {
        const preparedValues = prepareCommitValues?.(values) ?? values
        if (prepareWrite) {
          const prepared = prepareWrite(preparedValues, form)
          return { kind: 'parsed', data: prepared as ContentPreparedWrite<TValues> }
        }
        return { kind: 'parsed', data: buildIdentityPreparedWrite(preparedValues) }
      } catch (error) {
        return classifyPrepareFailure(error)
      }
    },
  }
}

function createWriteValidateStage<TValues extends FieldValues>(
  writeSchema: ZodType<unknown>,
  resolverFields: FormItem[],
): FormActionStage<ContentPreparedWrite<TValues>, ContentPreparedWrite<TValues>> {
  return {
    id: CONTENT_FORM_COMMIT_STAGE_WRITE,
    intent: 'serialization',
    run: (prepared) => {
      const evaluated = evaluateContentFormSchema(writeSchema, prepared.payload, resolverFields)
      if (evaluated.kind === 'invalid') return { kind: 'invalid', issues: evaluated.issues }
      // The write-schema parse is the payload persist receives.
      return { kind: 'parsed', data: { ...prepared, payload: evaluated.data as TValues } }
    },
  }
}

export async function runContentFormCommitPipeline<TValues extends FieldValues>(
  input: ContentFormCommitPipelineInput<TValues>,
  options: ContentFormCommitPipelineOptions<TValues>,
): Promise<ContentFormCommitPipelineResult<TValues>> {
  const stages: FormActionStage[] = [
    createFormEvaluateStage(options.formSchema, options.resolverFields),
    createPrepareStage(options.prepareCommitValues, options.prepareWrite),
  ]

  if (options.writeSchema) {
    stages.push(createWriteValidateStage(options.writeSchema, options.resolverFields))
  }

  let action: RunFormActionResult<ContentPreparedWrite<TValues>>
  try {
    action = await runFormAction<ContentPreparedWrite<TValues>>({
      attempt: options.attempt,
      readCurrent: options.readCurrent,
      input,
      stages,
    })
  } catch (error) {
    if (error instanceof ContentFormValidationOperationFailure) {
      return { kind: 'blocked', stageId: CONTENT_FORM_COMMIT_STAGE_FORM, message: error.message }
    }
    throw error
  }

  if (action.kind === 'blocked') {
    return {
      kind: 'blocked',
      stageId: action.stageId,
      issues: action.issues,
      message: action.message,
    }
  }

  return { kind: 'success', prepared: action.data, action }
}
