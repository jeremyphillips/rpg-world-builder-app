import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'

import { INLINE_METADATA_SEPARATOR } from '@rpg/contracts/primitives'

import { cn } from '../../lib/utils'

import {
  inlineMetadataItemVariants,
  inlineMetadataRootVariants,
  inlineMetadataSeparatorVariants,
  type InlineMetadataDensity,
  type InlineMetadataRole,
} from './inline-metadata.variants'

export type { InlineMetadataDensity, InlineMetadataRole } from './inline-metadata.variants'

export type InlineMetadataItemProps = {
  truncate?: boolean
  className?: string
  children: ReactNode
}

type InlineMetadataChild =
  | ReactElement<InlineMetadataItemProps, typeof InlineMetadataItem>
  | readonly ReactElement<InlineMetadataItemProps, typeof InlineMetadataItem>[]
  | boolean
  | null
  | undefined

export type InlineMetadataProps = {
  role: InlineMetadataRole
  density: InlineMetadataDensity
  wrap?: boolean
  className?: string
  children: InlineMetadataChild | readonly InlineMetadataChild[]
}

function assertInlineMetadataChildren(children: ReactNode): void {
  if (process.env.NODE_ENV !== 'development') return

  Children.forEach(children, (child) => {
    if (child == null || child === false) return
    if (!isValidElement(child) || child.type !== InlineMetadataItem) {
      console.error(
        'InlineMetadata only accepts InlineMetadata.Item elements as children (plus null, false, or undefined).',
        child,
      )
    }
  })
}

function InlineMetadataSeparator({
  density,
  wrap,
}: {
  density: InlineMetadataDensity
  wrap: boolean
}) {
  const className = inlineMetadataSeparatorVariants({ density, wrap })

  if (wrap) {
    return (
      <span aria-hidden="true" data-inline-metadata-separator className={className}>
        {'\u00A0'}
        {INLINE_METADATA_SEPARATOR}
        {' '}
      </span>
    )
  }

  return (
    <>
      {' '}
      <span aria-hidden="true" data-inline-metadata-separator className={className}>
        {INLINE_METADATA_SEPARATOR}
      </span>
      {' '}
    </>
  )
}

function collectInlineMetadataItems(children: ReactNode): ReactElement<InlineMetadataItemProps>[] {
  const items: ReactElement<InlineMetadataItemProps>[] = []

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child) || child.type !== InlineMetadataItem) continue
    items.push(child as ReactElement<InlineMetadataItemProps, typeof InlineMetadataItem>)
  }

  return items
}

function InlineMetadataRoot({ role, density, wrap: wrapProp, className, children }: InlineMetadataProps) {
  const wrap = wrapProp ?? role === 'supporting'

  assertInlineMetadataChildren(children)

  const items = collectInlineMetadataItems(children)
  if (items.length === 0) {
    return null
  }

  return (
    <span className={cn(inlineMetadataRootVariants({ wrap }), className)}>
      {items.map((item, index) => {
        const { truncate = false, className: itemClassName, children: itemChildren } = item.props

        return (
          <span
            key={item.key ?? index}
            className={cn(
              inlineMetadataItemVariants({ role, wrap, truncate }),
              itemClassName,
            )}
          >
            {index > 0 ? <InlineMetadataSeparator density={density} wrap={wrap} /> : null}
            {itemChildren}
          </span>
        )
      })}
    </span>
  )
}

export function InlineMetadataItem(_props: InlineMetadataItemProps) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error('InlineMetadata.Item must be rendered as a child of InlineMetadata.')
  }
  return null
}

export const InlineMetadata = Object.assign(InlineMetadataRoot, {
  Item: InlineMetadataItem,
})
