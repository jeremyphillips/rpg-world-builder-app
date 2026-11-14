import { describe, expect, it } from 'vitest'

import { resolveLevelRangeKeys } from './resolve-level-range-keys.lib'

describe('resolve-level-range-keys.lib', () => {
  it('returns default keys when pattern is missing or not levelRange', () => {
    expect(resolveLevelRangeKeys(undefined)).toEqual({ min: 'minLevel', max: 'maxLevel' })
    expect(resolveLevelRangeKeys({ kind: 'movement' } as never)).toEqual({
      min: 'minLevel',
      max: 'maxLevel',
    })
  })

  it('reads custom levelKeys from levelRange pattern', () => {
    expect(
      resolveLevelRangeKeys({
        kind: 'levelRange',
        levelKeys: { min: 'fromLevel', max: 'toLevel' },
      }),
    ).toEqual({ min: 'fromLevel', max: 'toLevel' })
  })
})
