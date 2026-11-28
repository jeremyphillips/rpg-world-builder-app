'use client'

import type { FieldError, FieldValues, UseFormReturn } from 'react-hook-form'

import type { FormSchemaEvaluationInvalid } from './form-evaluation.types'
import { projectIssuesToFieldErrors } from './project-issues-to-field-errors.lib'

function isFieldErrorNode(value: unknown): value is FieldError {
  return typeof value === 'object' && value !== null && 'message' in value
}

function setFormPathError<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  path: string,
  message: string,
): void {
  form.setError(path as never, { type: 'validation', message })
}

/** Passive RHF compatibility projection — not the canonical issue store. */
export function projectInvalidEvaluationToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  invalid: FormSchemaEvaluationInvalid,
): void {
  form.clearErrors()
  projectInvalidEvaluationToFieldErrors(form, projectIssuesToFieldErrors(invalid.issues))
}

function projectInvalidEvaluationToFieldErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: ReturnType<typeof projectIssuesToFieldErrors>,
  prefix?: string,
): void {
  for (const [key, value] of Object.entries(errors)) {
    if (key === 'root' && isFieldErrorNode(value)) {
      setFormPathError(form, 'root', String(value.message))
      continue
    }

    const path = prefix ? `${prefix}.${key}` : key

    if (isFieldErrorNode(value)) {
      setFormPathError(form, path, String(value.message))
      continue
    }

    if (typeof value === 'object' && value !== null) {
      projectInvalidEvaluationToFieldErrors(
        form,
        value as ReturnType<typeof projectIssuesToFieldErrors>,
        path,
      )
    }
  }
}
