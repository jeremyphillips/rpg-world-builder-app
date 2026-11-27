/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import { FormUiProvider } from '../context/form-ui.context'
import {
  cancelPendingInvalidSubmitFocus,
  isInvalidSubmitFocusRequestCurrent,
} from './invalid-submit-focus-generation.lib'
import { navigateInvalidSubmit } from './navigate-invalid-submit.client'
import type { FormItem } from '../field-config'

const ui = { markSubmitAttempted: vi.fn(), addValidationSessionExpandKeys: vi.fn() }

describe('invalid submit focus generation', () => {
  it('polls for focus targets when pilot reveal budget is enabled', async () => {
    vi.useFakeTimers()
    const focus = vi.fn()
    const element = document.createElement('input')
    element.id = 'form-notes'
    element.focus = focus
    document.body.append(element)

    const form = {
      formState: { errors: { notes: { type: 'validation', message: 'Required' } } },
      getValues: vi.fn(),
      setError: vi.fn(),
    } as unknown as UseFormReturn<{ notes: string }>

    const fields: FormItem[] = [{ type: 'text', name: 'notes', label: 'Notes' }]

    navigateInvalidSubmit(form, fields, 'form', ui, undefined, {
      waitForLayout: true,
      usePilotRevealBudget: true,
    })
    await vi.advanceTimersByTimeAsync(32)
    expect(focus).toHaveBeenCalled()
    vi.useRealTimers()
  })

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

  it('does not focus when a newer invalid submit navigation starts first', () => {
    vi.useFakeTimers()
    const focus = vi.fn()
    const first = document.createElement('input')
    first.id = 'form-name'
    first.focus = focus
    const second = document.createElement('input')
    second.id = 'form-notes'
    second.focus = vi.fn()
    document.body.append(first, second)

    const form = {
      formState: {
        errors: {
          name: { type: 'validation', message: 'Name required' },
          notes: { type: 'validation', message: 'Notes required' },
        },
      },
      getValues: vi.fn(),
      setError: vi.fn(),
    } as unknown as UseFormReturn<{ name: string; notes: string }>

    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'text', name: 'notes', label: 'Notes' },
    ]

    navigateInvalidSubmit(form, fields, 'form', ui)
    navigateInvalidSubmit(form, fields, 'form', ui)
    vi.runAllTimers()

    expect(focus).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('does not focus after the form provider unmounts before the scheduled focus', () => {
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

    const fields = [{ type: 'text', name: 'name', label: 'Name' }]

    const { unmount } = render(
      React.createElement(
        FormUiProvider,
        { fields },
        React.createElement('div', { 'data-form-mount': true }),
      ),
    )
    navigateInvalidSubmit(form, fields, 'form', ui)
    unmount()
    vi.runAllTimers()

    expect(focus).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
