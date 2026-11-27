'use client'

import { useCallback, useRef, useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  evaluateFormSchema,
  runFormAction,
  type FormItem,
  type FormSubmitHandler,
  type MapFormError,
} from '@rpg/ui/form'

export type UseAuthFormSubmitOptions<TValues extends FieldValues> = {
  schema: ZodType<TValues>
  fields: FormItem[]
  fallbackMessage: string
  mapError?: MapFormError
  submit: FormSubmitHandler<TValues>
}

function toFormError(
  error: unknown,
  fallback: string,
  mapError?: MapFormError,
): string | undefined {
  if (!error) return undefined
  const mapped = mapError?.(error)
  if (mapped === null) return undefined
  if (mapped !== undefined) return mapped
  return error instanceof Error ? error.message : fallback
}

/**
 * Login and signup: one evaluator pass per submit, then runFormAction before dispatch.
 */
export function useAuthFormSubmit<TValues extends FieldValues>(
  options: UseAuthFormSubmitOptions<TValues>,
) {
  const { schema, fields, fallbackMessage, mapError, submit } = options
  const attemptCounterRef = useRef(0)
  const stampRef = useRef(0)
  const [error, setError] = useState<unknown>(null)

  const onSubmit = useCallback<FormSubmitHandler<TValues>>(
    async (values, form) => {
      setError(null)
      try {
        const attemptId = ++attemptCounterRef.current
        const attempt = { stamp: stampRef.current, attemptId }
        const readCurrent = () => ({
          stamp: stampRef.current,
          attemptId: attemptCounterRef.current,
        })

        const formValues =
          typeof values === 'object' && values !== null ? (values as Record<string, unknown>) : {}

        const action = await runFormAction({
          attempt,
          readCurrent,
          input: { values, form },
          stages: [
            {
              id: 'form-evaluate',
              intent: 'form-evaluate',
              run: (input) => {
                const evaluated = evaluateFormSchema(schema, input.values, {
                  items: fields,
                  formValues,
                })
                if (evaluated.kind === 'invalid') {
                  return { kind: 'invalid', issues: evaluated.issues }
                }
                if (evaluated.kind === 'operation-failure') {
                  return { kind: 'operation-failure', message: evaluated.message }
                }
                return { kind: 'parsed', data: { values: evaluated.data, form: input.form } }
              },
            },
          ],
        })

        if (action.kind === 'blocked') {
          if (action.issues?.length) {
            for (const issue of action.issues) {
              if (issue.path) {
                form.setError(issue.path as never, { type: 'validate', message: issue.message })
              }
            }
          }
          throw new AuthFormSubmitValidationFailed()
        }

        await submit(action.data.values, action.data.form)
      } catch (err) {
        if (!(err instanceof AuthFormSubmitValidationFailed)) {
          setError(err)
          throw err
        }
      }
    },
    [fields, mapError, schema, submit],
  )

  return {
    onSubmit,
    formError: toFormError(error, fallbackMessage, (err) => {
      if (err instanceof AuthFormSubmitValidationFailed) return null
      return mapError?.(err)
    }),
  }
}

class AuthFormSubmitValidationFailed extends Error {
  constructor() {
    super('Auth form validation failed.')
    this.name = 'AuthFormSubmitValidationFailed'
  }
}
