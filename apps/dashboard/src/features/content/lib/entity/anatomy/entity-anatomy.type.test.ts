import { describe, expectTypeOf, it } from 'vitest'

import type { ContentEntityCardProps, DisclosureEntityCardProps } from '@/features/content'

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

  it('ContentEntityCard rejects consumer styling props', () => {
    expectTypeOf<
      Extract<keyof ContentEntityCardProps, ConsumerPresentationKeys>
    >().toEqualTypeOf<never>()
  })

  it('ContentEntityCard rejects legacy slot and chrome props', () => {
    expectTypeOf<
      Extract<keyof ContentEntityCardProps, LegacyContentEntityCardKeys>
    >().toEqualTypeOf<never>()
  })

  it('DisclosureEntityCard rejects consumer styling props', () => {
    expectTypeOf<
      Extract<keyof DisclosureEntityCardProps, ConsumerPresentationKeys>
    >().toEqualTypeOf<never>()
  })

  it('DisclosureEntityCard rejects consumer body alignment props', () => {
    expectTypeOf<
      Extract<keyof DisclosureEntityCardProps, 'bodyPadding' | 'bodyInset' | 'alignBody'>
    >().toEqualTypeOf<never>()
  })

  it('EntityAnatomyHost accepts semantic seams', () => {
    expectTypeOf<EntityAnatomyHostProps>().toMatchTypeOf<{
      entity: EntityAnatomyHostProps['entity']
      headingHref?: string
      leading?: React.ReactNode
      trailing?: EntityAnatomyHostProps['trailing']
      density?: EntityAnatomyHostProps['density']
    }>()
  })

  it('entity surfaces expose no vertical alignment knobs — trailing kind selects the cell', () => {
    type AlignKeys = 'trailingAlign' | 'actionsAlign' | 'rowAlign' | 'headingBand'
    expectTypeOf<Extract<keyof EntityAnatomyHostProps, AlignKeys>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof ContentEntityCardProps, AlignKeys>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DisclosureEntityCardProps, AlignKeys>>().toEqualTypeOf<never>()
  })
})
