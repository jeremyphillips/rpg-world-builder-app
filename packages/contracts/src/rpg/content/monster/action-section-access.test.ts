import { describe, expect, it } from 'vitest'

import {
  mergeLegendaryActionsBlock,
  readLegendaryActionsBlockFromUnknown,
} from './action-section-access'

describe('readLegendaryActionsBlockFromUnknown', () => {
  it('returns undefined for legacy flat action arrays', () => {
    expect(readLegendaryActionsBlockFromUnknown([{ id: 'a' }])).toBeUndefined()
  })

  it('parses pool scalars and action rows from a block object', () => {
    expect(
      readLegendaryActionsBlockFromUnknown({
        uses: 3,
        usesInLair: 4,
        actions: [{ id: 'a' }],
      }),
    ).toEqual({ uses: 3, usesInLair: 4, actions: [{ id: 'a' }] })
  })
})

describe('mergeLegendaryActionsBlock', () => {
  it('preserves pool scalars when replacing rows', () => {
    expect(mergeLegendaryActionsBlock({ uses: 3, usesInLair: 5 }, [{ id: 'new' }])).toEqual({
      uses: 3,
      usesInLair: 5,
      actions: [{ id: 'new' }],
    })
  })
})
