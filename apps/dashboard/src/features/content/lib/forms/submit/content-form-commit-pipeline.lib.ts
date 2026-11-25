import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  runFormAction,
  type FormActionStage,
  type FormIssue,
  type FormItem,
  type FormValidationProducerSlot,
  type RunFormActionResult,
} from '@rpg/ui/form'

import {
  buildIdentityPreparedWrite,
  type ContentPreparedWrite,
} from './content-prepared-write.types'
import {
  ContentFormValidationOperationFailure,
  normalizeContentFormIssues,
} from '../validation/normalize-content-form-issues.lib'

const CONTENT_FORM_COMMIT_STAGE_FORM = 'form-evaluate'
const CONTENT_FORM_COMMIT_STAGE_PREPARE = 'prepare'
const CONTENT_FORM_COMMIT_STAGE_WRITE = 'write-validate'

export type ContentFormCommitPipelineInput<TValues extends FieldValues> = {
  values: TValues
  form: UseFormReturn<TValues>
}

export type ContentFormCommitPipelineOptions<TValues extends FieldValues> = {
  stamp: number
  requiredStamp?: number
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
      const issues = normalizeContentFormIssues(formSchema, input.values, resolverFields)
      if (issues) return { kind: 'invalid', issues }
      return { kind: 'parsed', data: input }
    },
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
      const preparedValues = prepareCommitValues?.(values) ?? values
      if (prepareWrite) {
        const prepared = prepareWrite(preparedValues, form)
        return { kind: 'parsed', data: prepared as ContentPreparedWrite<TValues> }
      }
      return { kind: 'parsed', data: buildIdentityPreparedWrite(preparedValues) }
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
      const issues = normalizeContentFormIssues(writeSchema, prepared.payload, resolverFields)
      if (issues) return { kind: 'invalid', issues }
      return { kind: 'parsed', data: prepared }
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
      stamp: options.stamp,
      requiredStamp: options.requiredStamp,
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
