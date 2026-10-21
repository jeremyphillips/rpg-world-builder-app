import { describe, expectTypeOf, it } from 'vitest'

import type { EntityAnatomyLeading } from '../../anatomy/entity-anatomy-leading.types'
import type { EntityAnatomyHostProps } from '../../anatomy/entity-anatomy'
import type {
  EntityCardDisclosureProps,
  EntityCardStaticNavigableProps,
  EntityCardStaticProps,
} from '../cards/content/entity-card'

type ConsumerPresentationKeys =
  | 'className'
  | 'style'
  | 'bodyClassName'
  | 'headerClassName'
  | 'dividerClassName'
  | 'padding'
  | 'inset'

type LegacyEntityCardStaticKeys =
  | 'heading'
  | 'classification'
  | 'subheading'
  | 'metadata'
  | 'fallback'
  | 'displayImage'
  | 'headingEndSlot'
  | 'endSlot'
  | 'footer'
  | 'chrome'

describe('entity surface closed API', () => {
  it('EntityAnatomyHost rejects consumer styling props', () => {
    expectTypeOf<
      Extract<keyof EntityAnatomyHostProps, ConsumerPresentationKeys>
    >().toEqualTypeOf<never>()
  })

  it('EntityCard static rejects consumer styling props', () => {
    expectTypeOf<
      Extract<keyof EntityCardStaticProps, ConsumerPresentationKeys>
    >().toEqualTypeOf<never>()
  })

  it('EntityCard static navigable rejects interactive slots', () => {
    expectTypeOf<EntityCardStaticNavigableProps['leading']>().toEqualTypeOf<undefined>()
    expectTypeOf<EntityCardStaticNavigableProps['trailing']>().toEqualTypeOf<undefined>()
    expectTypeOf<EntityCardStaticNavigableProps['headingInline']>().toEqualTypeOf<undefined>()
    expectTypeOf<EntityCardStaticNavigableProps['disabled']>().toEqualTypeOf<undefined>()
  })

  it('EntityCard disclosure rejects link', () => {
    expectTypeOf<Extract<keyof EntityCardDisclosureProps, 'link'>>().toEqualTypeOf<never>()
  })

  it('EntityCard static rejects legacy slot and chrome props', () => {
    expectTypeOf<
      Extract<keyof EntityCardStaticProps, LegacyEntityCardStaticKeys>
    >().toEqualTypeOf<never>()
  })

  it('EntityCard disclosure rejects consumer styling props', () => {
    expectTypeOf<
      Extract<keyof EntityCardDisclosureProps, ConsumerPresentationKeys>
    >().toEqualTypeOf<never>()
  })

  it('EntityCard disclosure rejects consumer body alignment props', () => {
    expectTypeOf<
      Extract<keyof EntityCardDisclosureProps, 'bodyPadding' | 'bodyInset' | 'alignBody'>
    >().toEqualTypeOf<never>()
  })

  it('EntityAnatomyHost accepts semantic seams', () => {
    expectTypeOf<EntityAnatomyHostProps>().toMatchTypeOf<{
      entity: EntityAnatomyHostProps['entity']
      headingHref?: string
      leading?: EntityAnatomyLeading
      trailing?: EntityAnatomyHostProps['trailing']
      density?: EntityAnatomyHostProps['density']
    }>()
  })

  it('entity surfaces expose no vertical alignment knobs — trailing kind selects the cell', () => {
    type AlignKeys = 'trailingAlign' | 'actionsAlign' | 'rowAlign' | 'headingBand'
    expectTypeOf<Extract<keyof EntityAnatomyHostProps, AlignKeys>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof EntityCardStaticProps, AlignKeys>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof EntityCardDisclosureProps, AlignKeys>>().toEqualTypeOf<never>()
  })
})
