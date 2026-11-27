import type { ZodType } from 'zod'

import type { FormItem } from '../field-config'
import { makeFieldErrorMap } from '../config/field-error-map'
import { formIssuesFromZodIssues } from '../errors/flatten-form-issues'
import type {
  FormSchemaEvaluationInvalid,
  FormSchemaEvaluationOperationFailure,
  FormSchemaEvaluationResult,
} from './form-evaluation.types'

import { omitHiddenSchema, hiddenFieldNamesForValues } from './omit-hidden-schema.lib'

const SAFE_OPERATION_MESSAGE =
  'Something went wrong while checking this form. Try again or refresh the page.'

export type EvaluateFormSchemaOptions = {
  items: FormItem[]
  /** Immutable authoring snapshot — drives hidden-field omission and labels. */
  formValues?: Record<string, unknown>
}

function splitRootIssues(
  issues: FormSchemaEvaluationInvalid['issues'],
): Pick<FormSchemaEvaluationInvalid, 'issues' | 'rootIssues'> {
  const rootIssues = issues.filter((issue) => issue.path.trim().length === 0)
  const fieldIssues = issues.filter((issue) => issue.path.trim().length > 0)
  return { issues: fieldIssues, rootIssues }
}

/**
 * Pure schema evaluation — no RHF, focus, or mutation side effects.
 */
export function evaluateFormSchema<T>(
  schema: ZodType<T>,
  input: unknown,
  options: EvaluateFormSchemaOptions,
): FormSchemaEvaluationResult<T> {
  try {
    const formValues =
      typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : undefined
    const hidden = hiddenFieldNamesForValues(options.items, formValues ?? options.formValues)
    const effectiveSchema = omitHiddenSchema(schema, hidden)
    const errorMap = makeFieldErrorMap(options.items, formValues ?? options.formValues)

    const result = effectiveSchema.safeParse(input, { error: errorMap })

    if (result.success) {
      return { kind: 'parsed', data: result.data as T }
    }

    const allIssues = formIssuesFromZodIssues(
      result.error.issues.map((issue) => ({
        path: issue.path,
        message: typeof issue.message === 'string' ? issue.message : String(issue.message),
      })),
    )

    const { rootIssues } = splitRootIssues(allIssues)
    return {
      kind: 'invalid',
      issues: allIssues,
      rootIssues,
    }
  } catch (error) {
    const failure: FormSchemaEvaluationOperationFailure = {
      kind: 'operation-failure',
      message: SAFE_OPERATION_MESSAGE,
      cause: error,
    }
    return failure
  }
}
