import { describe, expectTypeOf, it } from 'vitest'
import type { ReactElement } from 'react'

import type {
  EntityItemTrailing,
  EntityItemTrailingAction,
  EntityItemTrailingGroup,
} from './entity-item-trailing.types'

describe('entity item trailing closed API', () => {
  it('action content requires ReactElement', () => {
    expectTypeOf<EntityItemTrailingAction['content']>().toEqualTypeOf<ReactElement>()
    expectTypeOf<EntityItemTrailingAction['content']>().not.toEqualTypeOf<string>()
  })

  it('group primary requires ReactElement', () => {
    expectTypeOf<EntityItemTrailingGroup['primary']>().toEqualTypeOf<ReactElement>()
  })

  it('indicator has no free-form content field', () => {
    type IndicatorKeys = keyof Extract<EntityItemTrailing, { kind: 'indicator' }>
    expectTypeOf<IndicatorKeys>().not.toEqualTypeOf<'content'>()
  })

  it('group secondary accepts only closed metadata variants', () => {
    expectTypeOf<Extract<EntityItemTrailing, { kind: 'group' }>['secondary']>().toEqualTypeOf<
      | { kind: 'price'; label: string }
      | { kind: 'quantity'; quantity: number }
      | { kind: 'grantPreview'; label: string }
      | undefined
    >()
  })
})
