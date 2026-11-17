import { describe, expect, it } from 'vitest'

import { resolveOptionalDisclosureActions } from './optional-disclosure-actions.lib'

describe('resolveOptionalDisclosureActions', () => {
  it('keeps the subject casing in action-only add defaults', () => {
    expect(resolveOptionalDisclosureActions({ intent: 'add', subject: 'Notes' })).toMatchObject({
      collapsedLabel: 'Add Notes',
      collapsedAccessibleName: 'Add Notes',
      openLabel: 'Remove Notes',
      openAccessibleName: 'Remove Notes',
      collapsedAction: 'add',
      openAction: 'clear',
    })
  })

  it('uses a compact visible verb when the label is already shown', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'override',
        subject: 'Damage',
        labeled: true,
      }),
    ).toMatchObject({
      collapsedLabel: 'Override',
      collapsedAccessibleName: 'Override Damage',
      openLabel: 'Clear override',
      openAccessibleName: 'Clear Damage override',
      collapsedAction: 'edit',
      openAction: 'clear',
    })
  })

  it('uses an explicit phrase as the accessible name without appending the subject', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'add',
        subject: 'Long',
        addLabel: 'Add long range',
      }),
    ).toMatchObject({
      collapsedLabel: 'Add long range',
      collapsedAccessibleName: 'Add long range',
    })

    expect(
      resolveOptionalDisclosureActions({
        intent: 'override',
        subject: 'Damage',
        labeled: true,
        removeLabel: 'Use weapon default',
      }),
    ).toMatchObject({
      collapsedLabel: 'Override',
      collapsedAccessibleName: 'Override Damage',
      openLabel: 'Use weapon default',
      openAccessibleName: 'Use weapon default',
      collapsedAction: 'edit',
    })
  })
})
