import { describe, expectTypeOf, it } from 'vitest'

import type { ContentEntityCardProps } from '../content-entity-card.client'
import type { DisclosureEntityCardProps } from './disclosure-entity-card.client'
import type { EntityItemProps } from './entity-item.client'

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
  | 'headingSuffix'
  | 'subheading'
  | 'metadata'
  | 'imageKey'
  | 'headingEndSlot'
  | 'endSlot'
  | 'footer'
  | 'chrome'

describe('entity surface closed API', () => {
  it('EntityItem rejects consumer styling props', () => {
    expectTypeOf<Extract<keyof EntityItemProps, ConsumerPresentationKeys>>().toEqualTypeOf<never>()
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

  it('EntityItem accepts semantic seams', () => {
    expectTypeOf<EntityItemProps>().toMatchTypeOf<{
      entity: EntityItemProps['entity']
      headingHref?: string
      leading?: React.ReactNode
      trailing?: EntityItemProps['trailing']
      density?: EntityItemProps['density']
    }>()
  })
})
