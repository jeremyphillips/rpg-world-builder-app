import { describe, expect, it } from 'vitest'

import { resolveOwnedLabelPolicy, shouldShowVisibleRequiredMarker } from './field-required.lib'

describe('resolveOwnedLabelPolicy', () => {
  it('shows a marker for visible required fields', () => {
    expect(resolveOwnedLabelPolicy(true, 'visible')).toEqual({
      showRequiredMarker: true,
      nameClassName: undefined,
    })
  })

  it('hides the marker and applies sr-only for srOnly visibility', () => {
    expect(resolveOwnedLabelPolicy(true, 'srOnly')).toEqual({
      showRequiredMarker: false,
      nameClassName: 'sr-only',
    })
  })

  it('matches shouldShowVisibleRequiredMarker for the marker flag', () => {
    expect(resolveOwnedLabelPolicy(true, 'visible').showRequiredMarker).toBe(
      shouldShowVisibleRequiredMarker(true, 'visible'),
    )
  })
})
