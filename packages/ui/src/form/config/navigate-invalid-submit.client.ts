'use client'

import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'

import { resolveInvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'

function scrollElementIntoView(element: Element): void {
  if ('scrollIntoView' in element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

export function navigateInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
  errors: FieldErrors<TFieldValues> = form.formState.errors,
): void {
  ui.markSubmitAttempted()

  const navigation = resolveInvalidSubmitNavigation({
    errors,
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
        scrollElementIntoView(element)
        if ('focus' in element && typeof element.focus === 'function') {
          element.focus({ preventScroll: true })
        }
        return
      }
    }

    const rowElement = document.querySelector(
      `[data-array-item-prefix="${navigation.firstIssue.itemPrefix}"]`,
    )
    if (rowElement) scrollElementIntoView(rowElement)
  })
}
