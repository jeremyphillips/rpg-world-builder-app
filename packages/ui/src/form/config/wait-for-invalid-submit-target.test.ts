import { describe, expect, it, vi } from 'vitest'

import { FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS } from '../lifecycle/form-validation-pilot-budgets.lib'
import { waitForInvalidSubmitTarget } from './wait-for-invalid-submit-target.lib'

describe('waitForInvalidSubmitTarget', () => {
  it('resolves immediately when the target is already ready', async () => {
    const delay = vi.fn(async () => undefined)
    await expect(waitForInvalidSubmitTarget(() => true, { delay })).resolves.toBe(true)
    expect(delay).not.toHaveBeenCalled()
  })

  it('polls until ready within the pilot reveal budget', async () => {
    let ready = false
    let clock = 0
    const delay = vi.fn(async (ms: number) => {
      clock += ms
      if (clock >= 32) ready = true
    })

    await expect(
      waitForInvalidSubmitTarget(() => ready, {
        now: () => clock,
        delay,
        pollIntervalMs: 16,
        budgetMs: FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS,
      }),
    ).resolves.toBe(true)

    expect(delay).toHaveBeenCalled()
  })

  it('returns false when the budget elapses without a ready target', async () => {
    let clock = 0
    const delay = vi.fn(async (ms: number) => {
      clock += ms
    })

    await expect(
      waitForInvalidSubmitTarget(() => false, {
        now: () => clock,
        delay,
        pollIntervalMs: 50,
        budgetMs: 100,
      }),
    ).resolves.toBe(false)
  })
})
