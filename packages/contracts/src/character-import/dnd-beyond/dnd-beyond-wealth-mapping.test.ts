import { describe, expect, it } from 'vitest'

import { mapDndBeyondCurrenciesToWealth } from './dnd-beyond-wealth-mapping'

describe('dnd-beyond-wealth-mapping', () => {
  it('maps D&D Beyond currencies to local wealth', () => {
    expect(mapDndBeyondCurrenciesToWealth({ cp: 0, sp: 0, gp: 38, ep: 0, pp: 0 })).toEqual({
      cp: 0,
      sp: 0,
      gp: 38,
      pp: 0,
    })
  })

  it('folds electrum into copper before normalizing wealth', () => {
    expect(mapDndBeyondCurrenciesToWealth({ cp: 0, sp: 0, gp: 0, ep: 2, pp: 0 })).toEqual({
      cp: 0,
      sp: 0,
      gp: 1,
      pp: 0,
    })
  })
})
