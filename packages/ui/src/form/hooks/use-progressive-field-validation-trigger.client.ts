'use client'

import * as React from 'react'
import type { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

/** Option A — per-field `trigger` after touch on blur and value change. */
export function useProgressiveFieldValidationTrigger<TFieldValues extends FieldValues>(
  fieldPath: FieldPath<TFieldValues>,
  boundPaths: readonly FieldPath<TFieldValues>[] = [fieldPath],
) {
  const { trigger } = useFormContext<TFieldValues>()
  const boundKey = boundPaths.join('\0')

  const runTrigger = React.useCallback(() => {
    void trigger(boundPaths.length === 1 ? boundPaths[0]! : ([...boundPaths] as const), {
      shouldFocus: false,
    })
  }, [boundKey, boundPaths, trigger])

  const bindProgressiveValidation = React.useCallback(
    <TName extends FieldPath<TFieldValues>>(
      field: ControllerRenderProps<TFieldValues, TName>,
      isTouched: boolean,
    ): ControllerRenderProps<TFieldValues, TName> => ({
      ...field,
      onBlur: () => {
        field.onBlur()
        queueMicrotask(() => {
          runTrigger()
        })
      },
      onChange: (value) => {
        field.onChange(value)
        if (isTouched) {
          runTrigger()
        }
      },
    }),
    [runTrigger],
  )

  return { bindProgressiveValidation, runTrigger }
}
