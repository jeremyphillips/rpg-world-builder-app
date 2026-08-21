import { describe, expectTypeOf, it } from 'vitest'
import type { ReactElement } from 'react'

import type {
  EntityAnatomyTrailing,
  EntityAnatomyTrailingAction,
  EntityAnatomyTrailingGroup,
} from './entity-anatomy-trailing.types'

describe('entity item trailing closed API', () => {
  it('action content requires ReactElement', () => {
    expectTypeOf<EntityAnatomyTrailingAction['content']>().toEqualTypeOf<ReactElement>()
    expectTypeOf<EntityAnatomyTrailingAction['content']>().not.toEqualTypeOf<string>()
  })

  it('group primary requires ReactElement', () => {
    expectTypeOf<EntityAnatomyTrailingGroup['primary']>().toEqualTypeOf<ReactElement>()
  })

  it('indicator has no free-form content field', () => {
    type IndicatorKeys = keyof Extract<EntityAnatomyTrailing, { kind: 'indicator' }>
    expectTypeOf<IndicatorKeys>().not.toEqualTypeOf<'content'>()
  })

  it('group secondary accepts only closed metadata variants', () => {
    expectTypeOf<Extract<EntityAnatomyTrailing, { kind: 'group' }>['secondary']>().toEqualTypeOf<
      | { kind: 'price'; label: string }
      | { kind: 'quantity'; quantity: number }
      | { kind: 'grantPreview'; label: string }
      | undefined
    >()
  })
})
