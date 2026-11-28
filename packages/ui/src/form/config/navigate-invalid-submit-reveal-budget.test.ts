/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS } from '../lifecycle/form-validation-pilot-budgets.lib'
import { scheduleInvalidSubmitFocusWithRevealBudget } from './navigate-invalid-submit-reveal.lib'
import type { InvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('scheduleInvalidSubmitFocusWithRevealBudget', () => {
  it('focuses after the target mounts within the pilot reveal budget', async () => {
    vi.useFakeTimers()

    const focus = vi.fn()
    const navigation = {
      firstIssue: { path: 'name', message: 'Required', severity: 'field' as const },
      expandKeys: [],
      focusControlId: 'form-name',
    } satisfies InvalidSubmitNavigation

    scheduleInvalidSubmitFocusWithRevealBudget(navigation, 'form', focus)

    const input = document.createElement('input')
    input.id = 'form-name'
    input.focus = vi.fn()
    document.body.append(input)

    await vi.advanceTimersByTimeAsync(FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS)

    expect(focus).toHaveBeenCalled()
  })

  it('still attempts focus when the budget elapses without a mounted target', async () => {
    vi.useFakeTimers()

    const focus = vi.fn()
    const navigation = {
      firstIssue: { path: 'notes', message: 'Required', severity: 'field' as const },
      expandKeys: [],
    } satisfies InvalidSubmitNavigation

    scheduleInvalidSubmitFocusWithRevealBudget(navigation, 'form', focus)

    await vi.advanceTimersByTimeAsync(FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS + 64)

    expect(focus).toHaveBeenCalled()
  })
})
