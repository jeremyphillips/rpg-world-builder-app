'use client'

import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { resolveInvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'

export function navigateInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
): void {
  ui.markSubmitAttempted()

  const navigation = resolveInvalidSubmitNavigation({
    errors: form.formState.errors,
    fields,
    idPrefix: formId,
    getItemValues: (fullName, index) => {
      const value = form.getValues(`${fullName}.${index}` as never)
      return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : undefined
    },
  })

  if (!navigation) return

  ui.addValidationSessionExpandKeys(navigation.expandKeys)

  window.requestAnimationFrame(() => {
    if (navigation.focusControlId) {
      const element = document.getElementById(navigation.focusControlId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if ('focus' in element && typeof element.focus === 'function') {
          element.focus({ preventScroll: true })
        }
        return
      }
    }

    const rowElement = document.querySelector(
      `[data-array-item-prefix="${navigation.firstIssue.itemPrefix}"]`,
    )
    rowElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
