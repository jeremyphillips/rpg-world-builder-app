import { describe, expect, it } from 'vitest'

import { resolveContextualCount } from './resolve-contextual-count'

describe('resolveContextualCount', () => {
  it('returns normal when inLair override is absent', () => {
    expect(resolveContextualCount({ normal: 3 }, { inLair: true, lairEnabled: true })).toBe(3)
  })

  it('returns inLair total when lair is active', () => {
    expect(
      resolveContextualCount({ normal: 3, inLair: 4 }, { inLair: true, lairEnabled: true }),
    ).toBe(4)
  })

  it('ignores inLair when lair is disabled or encounter is not in lair', () => {
    expect(
      resolveContextualCount({ normal: 3, inLair: 4 }, { inLair: true, lairEnabled: false }),
    ).toBe(3)
    expect(
      resolveContextualCount({ normal: 3, inLair: 4 }, { inLair: false, lairEnabled: true }),
    ).toBe(3)
  })

  it('allows inLair equal to or below normal', () => {
    expect(
      resolveContextualCount({ normal: 4, inLair: 4 }, { inLair: true, lairEnabled: true }),
    ).toBe(4)
    expect(
      resolveContextualCount({ normal: 4, inLair: 3 }, { inLair: true, lairEnabled: true }),
    ).toBe(3)
  })
})
