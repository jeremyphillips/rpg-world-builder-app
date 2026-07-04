'use client'

import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'

import {
  performInvalidSubmitFocus,
  type InvalidSubmitFocusFallbacks,
} from './navigate-invalid-submit-focus.lib'
import { resolveInvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'

export type NavigateInvalidSubmitOptions = {
  /** Overrides the id prefix used when resolving the focus target. */
  idPrefix?: string
  /** Runs after submit is marked, before expand keys — e.g. activate an invalid tab. */
  onBeforeFocus?: () => void
  /** Waits two animation frames before focusing so layout (tab switch) can commit. */
  waitForLayout?: boolean
  focusFallbacks?: InvalidSubmitFocusFallbacks
}

export function navigateInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
  errors: FieldErrors<TFieldValues> = form.formState.errors,
  options?: NavigateInvalidSubmitOptions,
): void {
  ui.markSubmitAttempted()

  const idPrefix = options?.idPrefix ?? formId

  const navigation = resolveInvalidSubmitNavigation({
    errors,
    fields,
    idPrefix,
    getItemValues: (fullName, index) => {
      const value = form.getValues(`${fullName}.${index}` as never)
      return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : undefined
    },
  })

  if (!navigation) return

  options?.onBeforeFocus?.()
  ui.addValidationSessionExpandKeys(navigation.expandKeys)

  const focus = () => performInvalidSubmitFocus(navigation, idPrefix, options?.focusFallbacks)

  if (options?.waitForLayout) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(focus)
    })
    return
  }

  window.requestAnimationFrame(focus)
}
