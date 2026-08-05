import { describe, expect, it } from 'vitest'

import { resolveContentCardHeadingRowRhythm } from './content-card.lib'

describe('resolveContentCardHeadingRowRhythm', () => {
  it('returns none when only a heading is present', () => {
    expect(
      resolveContentCardHeadingRowRhythm({
        hasSecondaryText: false,
        hasHeadingEndSlot: false,
      }),
    ).toBe('none')
  })

  it('returns secondary when secondary text exists without a heading-end slot', () => {
    expect(
      resolveContentCardHeadingRowRhythm({
        hasSecondaryText: true,
        hasHeadingEndSlot: false,
      }),
    ).toBe('secondary')
  })

  it('returns withHeadingEndSlot when secondary text and a heading-end slot coexist', () => {
    expect(
      resolveContentCardHeadingRowRhythm({
        hasSecondaryText: true,
        hasHeadingEndSlot: true,
      }),
    ).toBe('withHeadingEndSlot')
  })
})
