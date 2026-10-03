import { describe, expectTypeOf, it } from 'vitest'

import type { RowAnatomyCellProps } from './row-anatomy-cell'
import type { RowAnatomyCellSpec } from './row-anatomy.types'

type HostColumn = 'leading' | 'media' | 'content' | 'trailing'

describe('RowAnatomyCellSpec', () => {
  it('accepts host-declared columns for band and full cells', () => {
    expectTypeOf<{ slot: 'band'; column: 'media' }>().toMatchTypeOf<
      RowAnatomyCellSpec<HostColumn>
    >()
    expectTypeOf<{ slot: 'full'; column: 'leading' }>().toMatchTypeOf<
      RowAnatomyCellSpec<HostColumn>
    >()
  })

  it('rejects impossible combinations', () => {
    // @ts-expect-error meta rows never hold leading rails
    const metaLeading: RowAnatomyCellSpec = { slot: 'meta', column: 'leading' }
    // @ts-expect-error status rows never hold leading rails
    const statusLeading: RowAnatomyCellSpec = { slot: 'status', column: 'leading' }
    // @ts-expect-error stretch is trailing-only
    const stretchContent: RowAnatomyCellSpec = { slot: 'stretch', column: 'content' }
    // @ts-expect-error columns outside the host union are rejected
    const unknownColumn: RowAnatomyCellSpec = { slot: 'band', column: 'media' }
    // @ts-expect-error unknown slots are rejected
    const unknownSlot: RowAnatomyCellSpec = { slot: 'center', column: 'content' }

    void [metaLeading, statusLeading, stretchContent, unknownColumn, unknownSlot]
  })

  it('RowAnatomyCell has no className or style seam', () => {
    expectTypeOf<Extract<keyof RowAnatomyCellProps, 'className' | 'style'>>().toEqualTypeOf<never>()
  })
})
