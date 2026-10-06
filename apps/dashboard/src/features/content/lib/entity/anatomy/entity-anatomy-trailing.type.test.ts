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

  it('action and utility accept an optional meta string', () => {
    expectTypeOf<EntityAnatomyTrailingAction['meta']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Extract<EntityAnatomyTrailing, { kind: 'utility' }>['meta']>().toEqualTypeOf<
      string | undefined
    >()
  })

  it('quantity indicator format includes additional', () => {
    expectTypeOf<
      Extract<EntityAnatomyTrailing, { kind: 'indicator'; variant: 'quantity' }>['format']
    >().toEqualTypeOf<'compact' | 'label' | 'additional' | undefined>()
  })

  it('label indicator carries a string label', () => {
    expectTypeOf<
      Extract<EntityAnatomyTrailing, { kind: 'indicator'; variant: 'label' }>['label']
    >().toEqualTypeOf<string>()
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
