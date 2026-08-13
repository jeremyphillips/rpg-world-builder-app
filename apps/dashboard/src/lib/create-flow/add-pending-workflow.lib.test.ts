import { describe, expect, it } from 'vitest'

import {
  resolveAddPendingMode,
  resolveDisclosureChoicePresentation,
} from './add-pending-workflow.lib'

describe('resolveAddPendingMode', () => {
  it('forces Add mode when the pending collection is empty', () => {
    expect(resolveAddPendingMode({ requestedMode: 'pending', hasPendingItems: false })).toBe('add')
  })

  it('honors the requested mode when pending items exist', () => {
    expect(resolveAddPendingMode({ requestedMode: 'add', hasPendingItems: true })).toBe('add')
    expect(resolveAddPendingMode({ requestedMode: 'pending', hasPendingItems: true })).toBe(
      'pending',
    )
  })
})

describe('resolveDisclosureChoicePresentation', () => {
  it('omits radios and resolves the value when exactly one choice is eligible', () => {
    expect(
      resolveDisclosureChoicePresentation(
        [
          { value: 'owns', label: 'Owner', disabled: true, disabledReason: 'Taken' },
          { value: 'operator', label: 'Operator' },
        ],
        null,
      ),
    ).toEqual({
      eligible: [{ value: 'operator', label: 'Operator' }],
      showRadios: false,
      resolvedValue: 'operator',
    })
  })

  it('shows radios and keeps the selected value when multiple choices are eligible', () => {
    const choices = [
      { value: 'owns', label: 'Owner' },
      { value: 'tenant', label: 'Tenant' },
    ]
    expect(resolveDisclosureChoicePresentation(choices, 'tenant')).toEqual({
      eligible: choices,
      showRadios: true,
      resolvedValue: 'tenant',
    })
  })
})
