import * as React from 'react'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import { NavigationChevron } from './card.lib'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'
import { renderNavigableLinkRoot } from './navigable-link-root.lib'
import { listShellClasses } from './list-density.lib'
import {
  destinationListVariants,
  type DestinationListAppearance,
  type DestinationListDensity,
  type DestinationListElevation,
  type DestinationListTone,
} from './destination-list.variants'

export type {
  DestinationListAppearance,
  DestinationListDensity,
  DestinationListElevation,
  DestinationListTone,
} from './destination-list.variants'

export type DestinationListProps = Omit<React.ComponentPropsWithoutRef<'ul'>, 'children'> & {
  appearance?: DestinationListAppearance
  density?: DestinationListDensity
  /** Rest chrome when `appearance="filled"` (ignored for panel and embedded). */
  tone?: DestinationListTone
  /** Depth when `appearance="filled"` (ignored for panel and embedded). Default flat. */
  elevation?: DestinationListElevation
  children?: React.ReactNode
}

export function DestinationList({
  appearance = 'panel',
  density = 'comfortable',
  tone,
  elevation = 'flat',
  className,
  children,
  ...props
}: DestinationListProps) {
  const resolvedTone = appearance === 'filled' ? (tone ?? 'strong') : undefined
  const resolvedElevation = appearance === 'filled' && elevation !== 'flat' ? elevation : undefined

  return (
    <ul
      className={cn(
        listShellClasses(density),
        destinationListVariants({
          appearance,
          tone: resolvedTone,
          elevation: resolvedElevation,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  )
}

type DestinationItemShared = {
  link: React.ReactElement
  showNavigationChevron?: boolean
}

export type DestinationItemSimpleProps = DestinationItemShared & {
  title: string
  description?: string
  metadata?: React.ReactNode
  content?: never
  startSlot?: never
  trailingInfo?: never
}

export type DestinationItemRichProps = DestinationItemShared & {
  content: React.ReactNode
  startSlot?: React.ReactNode
  trailingInfo?: React.ReactNode
  title?: never
  description?: never
  metadata?: never
}

export type DestinationItemProps = DestinationItemSimpleProps | DestinationItemRichProps

function isDestinationItemRich(props: DestinationItemProps): props is DestinationItemRichProps {
  return 'content' in props && props.content != null
}

function warnInvalidLink(link: React.ReactElement | undefined) {
  if (process.env.NODE_ENV !== 'development' || link == null) {
    return
  }
  if (!React.isValidElement(link)) {
    console.warn('DestinationItem: `link` must be a single React element.')
  }
}

function DestinationItemSimpleContent({
  title,
  description,
  metadata,
}: DestinationItemSimpleProps) {
  return (
    <span className="ui-destination-item__main">
      <span className="ui-destination-item__title">{title}</span>
      {description ? <span className="ui-destination-item__description">{description}</span> : null}
      {metadata ? <span className="ui-destination-item__metadata">{metadata}</span> : null}
    </span>
  )
}

function DestinationItemRichContent({
  startSlot,
  content,
  trailingInfo,
}: DestinationItemRichProps) {
  return (
    <>
      <div className="ui-destination-item__identity-cluster">
        {startSlot ? <div className="shrink-0">{startSlot}</div> : null}
        <div className="min-w-0 flex-1">{content}</div>
      </div>
      {trailingInfo ? (
        <div className="ui-destination-item__trailing-info">{trailingInfo}</div>
      ) : null}
    </>
  )
}

export function DestinationItem(props: DestinationItemProps) {
  const { link, showNavigationChevron = true } = props
  warnInvalidLink(link)

  const content = isDestinationItemRich(props) ? (
    <DestinationItemRichContent {...props} />
  ) : (
    <DestinationItemSimpleContent {...props} />
  )

  const interior = (
    <>
      {content}
      {showNavigationChevron ? (
        <NavigationChevron className="ui-destination-item__chevron" />
      ) : null}
    </>
  )

  const navigableLink = renderNavigableLinkRoot(
    link,
    cn(
      'ui-destination-item__link',
      interactiveRowVariants({
        interaction: 'hoverable',
        hitTarget: 'pointer',
      }),
      interactiveFocusVariants({ context: 'embedded' }),
    ),
    interior,
    {},
    null,
  )

  return <li className={cn('ui-destination-item', borderStrength('subtle'))}>{navigableLink}</li>
}
