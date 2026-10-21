import { describe, expectTypeOf, it } from 'vitest'

import type {
  EntityCardDisclosureProps,
  EntityCardProps,
  EntityCardStaticProps,
} from '../entity-card'

describe('EntityCard discriminated props', () => {
  it('static props omit disclosure-only keys', () => {
    expectTypeOf<
      Extract<keyof EntityCardStaticProps, 'itemId' | 'toolbarAriaLabel' | 'children'>
    >().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof EntityCardStaticProps, 'dragHandleProps'>>().toEqualTypeOf<never>()
  })

  it('disclosure props omit static-only keys', () => {
    expectTypeOf<
      Extract<keyof EntityCardDisclosureProps, 'leading' | 'headingEndValue' | 'headingInline'>
    >().toEqualTypeOf<never>()
  })

  it('union accepts static usage without variant', () => {
    expectTypeOf<{ entity: EntityCardProps['entity'] }>().toMatchTypeOf<EntityCardStaticProps>()
  })

  it('disclosure requires variant literal', () => {
    expectTypeOf<EntityCardDisclosureProps['variant']>().toEqualTypeOf<'disclosure'>()
  })
})
