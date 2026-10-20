import { describe, expectTypeOf, it } from 'vitest'

import type {
  EntityCardDisclosureProps,
  EntityCardStaticProps,
} from '../surfaces/cards/content/entity-card'

import type { EntityAnatomyLeading } from './entity-anatomy-leading.types'
import type { EntityAnatomyHostProps } from './entity-anatomy'

type ConsumerPresentationKeys =
  | 'className'
  | 'style'
  | 'bodyClassName'
  | 'headerClassName'
  | 'dividerClassName'
  | 'padding'
  | 'inset'

type LegacyContentEntityCardKeys =
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

  it('EntityCard static rejects legacy slot and chrome props', () => {
    expectTypeOf<
      Extract<keyof EntityCardStaticProps, LegacyContentEntityCardKeys>
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
