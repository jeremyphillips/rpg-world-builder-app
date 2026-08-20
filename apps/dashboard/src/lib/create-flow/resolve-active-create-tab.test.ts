import { describe, expect, it } from 'vitest'

import { resolveActiveCreateTabId } from './resolve-active-create-tab'

describe('resolveActiveCreateTabId', () => {
  it('keeps the active tab when it remains available', () => {
    expect(resolveActiveCreateTabId(['details', 'organizations'], 'organizations')).toBe(
      'organizations',
    )
  })

  it('falls back to the default tab when active tab was suppressed', () => {
    expect(resolveActiveCreateTabId(['details'], 'organizations', 'details')).toBe('details')
  })

  it('falls back to the first available tab when active and default are unavailable', () => {
    expect(resolveActiveCreateTabId(['details'], 'organizations')).toBe('details')
  })

  it('returns an empty string when no tabs are available and no default is provided', () => {
    expect(resolveActiveCreateTabId([], 'organizations')).toBe('')
  })
})
