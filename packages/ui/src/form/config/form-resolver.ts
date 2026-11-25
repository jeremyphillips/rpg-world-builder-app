import type {
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form'
import type { ZodType } from 'zod'

import type { FormItem } from '../field-config'
import { evaluateFormSchema } from '../lifecycle/form-schema-evaluator'
import { projectIssuesToFieldErrors } from '../lifecycle/project-issues-to-field-errors.lib'

export interface SilentValidationResult {
  valid: boolean
}

const SILENT_RESOLVER_OPTIONS: ResolverOptions<FieldValues> = {
  fields: {},
  shouldUseNativeValidation: false,
}

/**
 * RHF resolver backed by the pure {@link evaluateFormSchema} evaluator.
 * Parsed output types (coercion, defaults, omit) match submit `values`.
 */
export function makeResolver<TFieldValues extends FieldValues>(
  schema: ZodType,
  items: FormItem[],
): Resolver<TFieldValues> {
  return async (values, _context, _options) => {
    const result = evaluateFormSchema(schema, values, {
      items,
      formValues: values as Record<string, unknown>,
    })

    if (result.kind === 'parsed') {
      return {
        values: result.data as TFieldValues,
        errors: {},
      } as ResolverResult<TFieldValues, TFieldValues>
    }

    if (result.kind === 'invalid') {
      return {
        values: {},
        errors: projectIssuesToFieldErrors(result.issues) as FieldErrors<TFieldValues>,
      } as ResolverResult<TFieldValues, TFieldValues>
    }

    return {
      values: {},
      errors: {
        root: { type: 'server', message: result.message },
      } as FieldErrors<TFieldValues>,
    } as ResolverResult<TFieldValues, TFieldValues>
  }
}

/**
 * Quiet validity via the pure evaluator — does not invoke the interactive resolver
 * or populate RHF `errors`.
 */
export function createValidateSilently<TFieldValues extends FieldValues>(
  schemaOrResolver: ZodType | Resolver<TFieldValues>,
  items?: FormItem[],
): (values: TFieldValues) => Promise<SilentValidationResult> {
  if (items && 'safeParse' in (schemaOrResolver as ZodType)) {
    const schema = schemaOrResolver as ZodType
    return async (values) => {
      const result = evaluateFormSchema(schema, values, {
        items,
        formValues: values as Record<string, unknown>,
      })
      return { valid: result.kind === 'parsed' }
    }
  }

  const resolver = schemaOrResolver as Resolver<TFieldValues>
  return async (values) => {
    const result = await resolver(
      values,
      undefined,
      SILENT_RESOLVER_OPTIONS as ResolverOptions<TFieldValues>,
    )
    return { valid: Object.keys(result.errors).length === 0 }
  }
}
