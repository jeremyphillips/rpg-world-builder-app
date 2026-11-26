/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import {
  cancelPendingInvalidSubmitFocus,
  isInvalidSubmitFocusRequestCurrent,
} from './invalid-submit-focus-generation.lib'
import { navigateInvalidSubmit } from './navigate-invalid-submit.client'
import type { FormItem } from '../field-config'

const ui = { markSubmitAttempted: vi.fn(), addValidationSessionExpandKeys: vi.fn() }

describe('invalid submit focus generation', () => {
  it('does not focus when a newer attempt cancels the pending request', () => {
    vi.useFakeTimers()
    const focus = vi.fn()
    const element = document.createElement('input')
    element.id = 'form-name'
    element.focus = focus
    document.body.append(element)

    const form = {
      formState: { errors: { name: { type: 'validation', message: 'Required' } } },
      getValues: vi.fn(),
      setError: vi.fn(),
    } as unknown as UseFormReturn<{ name: string }>

    const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]

    navigateInvalidSubmit(form, fields, 'form', ui)
    cancelPendingInvalidSubmitFocus()
    vi.runAllTimers()

    expect(focus).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('tracks generation monotonically', () => {
    const first = isInvalidSubmitFocusRequestCurrent(0)
    expect(first).toBe(false)
    cancelPendingInvalidSubmitFocus()
    expect(isInvalidSubmitFocusRequestCurrent(0)).toBe(false)
  })
})
