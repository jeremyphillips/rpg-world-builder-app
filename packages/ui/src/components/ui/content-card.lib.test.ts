import { describe, expect, it } from 'vitest'

import { resolveContentCardHeadingRowRhythm } from './content-card.lib'

describe('resolveContentCardHeadingRowRhythm', () => {
  it('returns none when only a heading is present', () => {
    expect(resolveContentCardHeadingRowRhythm({ hasSecondaryText: false })).toBe('none')
  })

  it('returns secondary when secondary text exists', () => {
    expect(resolveContentCardHeadingRowRhythm({ hasSecondaryText: true })).toBe('secondary')
  })
})
