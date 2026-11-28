'use client'

import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'

import {
  performInvalidSubmitFocus,
  type InvalidSubmitFocusFallbacks,
} from './navigate-invalid-submit-focus.lib'
import {
  beginInvalidSubmitFocusRequest,
  isInvalidSubmitFocusRequestCurrent,
} from './invalid-submit-focus-generation.lib'
import { scheduleInvalidSubmitFocusWithRevealBudget } from './navigate-invalid-submit-reveal.lib'
import { resolveInvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import type { FormIssue } from '../errors/form-issue.types'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'
import { resolveInvalidSubmitNavigationFromIssues } from '../errors/resolve-invalid-submit-navigation'

export const FORM_BRIDGE_MISMATCH_MESSAGE =
  'Something went wrong while checking this form. Try again or refresh the page.'

function hasAnyErrorMessage(errors: unknown): boolean {
  if (typeof errors !== 'object' || errors === null) return false
  if ('message' in errors && typeof (errors as { message?: unknown }).message === 'string') {
    return (errors as { message: string }).message.length > 0
  }
  return Object.values(errors).some(hasAnyErrorMessage)
}

export type NavigateInvalidSubmitOptions = {
  /** Overrides the id prefix used when resolving the focus target. */
  idPrefix?: string
  /** Runs after submit is marked, before expand keys — e.g. activate an invalid tab. */
  onBeforeFocus?: () => void
  /** Waits two animation frames before focusing so layout (tab switch) can commit. */
  waitForLayout?: boolean
  /** When set with `waitForLayout`, polls for the target within the pilot reveal budget. */
  usePilotRevealBudget?: boolean
  focusFallbacks?: InvalidSubmitFocusFallbacks
  /** When set, navigation and Review read the producer projection instead of re-flattening RHF. */
  canonicalIssues?: readonly FormIssue[]
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

  const navigation = options?.canonicalIssues
    ? resolveInvalidSubmitNavigationFromIssues(options.canonicalIssues, {
        fields,
        idPrefix,
        getItemValues: (fullName, index) => {
          const value = form.getValues(`${fullName}.${index}` as never)
          return typeof value === 'object' && value !== null
            ? (value as Record<string, unknown>)
            : undefined
        },
      })
    : resolveInvalidSubmitNavigation({
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

  if (!navigation) {
    // RHF blocked submit but no canonical issue is resolvable: bridge failure, never silent.
    if (!hasAnyErrorMessage(errors)) {
      console.error('[form-validation] RHF blocked submit without a canonical issue', errors)
      form.setError('root', { type: 'bridge', message: FORM_BRIDGE_MISMATCH_MESSAGE })
    }
    return
  }

  options?.onBeforeFocus?.()
  ui.addValidationSessionExpandKeys(navigation.expandKeys)

  const generation = beginInvalidSubmitFocusRequest()
  const focus = () => {
    if (!isInvalidSubmitFocusRequestCurrent(generation)) return
    performInvalidSubmitFocus(navigation, idPrefix, options?.focusFallbacks)
  }

  if (options?.waitForLayout && options?.usePilotRevealBudget) {
    scheduleInvalidSubmitFocusWithRevealBudget(navigation, idPrefix, focus, options.focusFallbacks)
    return
  }

  if (options?.waitForLayout) {
    window.requestAnimationFrame(() => {
      if (!isInvalidSubmitFocusRequestCurrent(generation)) return
      window.requestAnimationFrame(focus)
    })
    return
  }

  window.requestAnimationFrame(focus)
}
