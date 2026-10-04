import { describe, expect, it, vi } from 'vitest'

import { resolveNumberStepperActions } from './number-stepper-min-action.lib'

describe('resolveNumberStepperActions', () => {
  it('disables left at min in default mode', () => {
    const result = resolveNumberStepperActions({
      minAction: undefined,
      min: 1,
      max: 5,
      value: 1,
      disabled: false,
    })

    expect(result.canDecrement).toBe(false)
    expect(result.canRemoveAtMin).toBe(false)
    expect(result.leftDisabled).toBe(true)
    expect(result.canIncrement).toBe(true)
    expect(result.stepperLocked).toBe(false)
  })

  it('allows remove at min in remove mode', () => {
    const result = resolveNumberStepperActions({
      minAction: { mode: 'remove', onRemove: vi.fn(), removeAriaLabel: 'Remove item' },
      min: 1,
      max: 5,
      value: 1,
      disabled: false,
    })

    expect(result.canRemoveAtMin).toBe(true)
    expect(result.leftDisabled).toBe(false)
    expect(result.stepperLocked).toBe(false)
  })

  it('allows removal when min equals max', () => {
    const result = resolveNumberStepperActions({
      minAction: { mode: 'remove', onRemove: vi.fn(), removeAriaLabel: 'Remove item' },
      min: 1,
      max: 1,
      value: 1,
      disabled: false,
    })

    expect(result.canRemoveAtMin).toBe(true)
    expect(result.canIncrement).toBe(false)
    expect(result.leftDisabled).toBe(false)
    expect(result.stepperLocked).toBe(false)
  })

  it('locks the stepper when fully disabled', () => {
    const result = resolveNumberStepperActions({
      minAction: { mode: 'remove', onRemove: vi.fn(), removeAriaLabel: 'Remove item' },
      min: 1,
      max: 1,
      value: 1,
      disabled: true,
    })

    expect(result.canRemoveAtMin).toBe(false)
    expect(result.leftDisabled).toBe(true)
    expect(result.stepperLocked).toBe(true)
  })
})
