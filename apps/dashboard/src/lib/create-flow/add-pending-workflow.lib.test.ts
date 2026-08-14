import { describe, expect, it } from 'vitest'

import { resolveAddPendingMode } from './add-pending-workflow.lib'

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
