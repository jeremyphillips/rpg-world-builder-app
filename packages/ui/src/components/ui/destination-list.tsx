import * as React from 'react'

import { cn } from '../../lib/utils'
import { NavigationChevron } from './card.lib'
import { renderNavigableLinkRoot } from './navigable-link-root.lib'
import {
  destinationListVariants,
  destinationRowLinkVariants,
  UI_DESTINATION_ITEM_CLASS,
  UI_DESTINATION_ROW_CHEVRON_CLASS,
  UI_DESTINATION_ROW_DESCRIPTION_CLASS,
  UI_DESTINATION_ROW_IDENTITY_CLUSTER_CLASS,
  UI_DESTINATION_ROW_MAIN_CLASS,
  UI_DESTINATION_ROW_METADATA_CLASS,
  UI_DESTINATION_ROW_TITLE_CLASS,
  UI_DESTINATION_ROW_TRAILING_INFO_CLASS,
  type DestinationListAppearance,
  type DestinationListDensity,
  type DestinationListTone,
} from './destination-list.variants'

export type {
  DestinationListAppearance,
  DestinationListDensity,
  DestinationListTone,
} from './destination-list.variants'

export type DestinationListProps = Omit<React.ComponentPropsWithoutRef<'ul'>, 'children'> & {
  appearance?: DestinationListAppearance
  density?: DestinationListDensity
  /** Rest chrome when `appearance="filled"` (ignored for panel and embedded). */
  tone?: DestinationListTone
  children?: React.ReactNode
}

export function DestinationList({
  appearance = 'panel',
  density = 'comfortable',
  tone,
  className,
  children,
  ...props
}: DestinationListProps) {
  const resolvedTone = appearance === 'filled' ? tone : undefined

  return (
    <ul
      className={cn(
        destinationListVariants({ appearance, density, tone: resolvedTone }),
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  )
}

type DestinationRowShared = {
  link: React.ReactElement
  showNavigationChevron?: boolean
}

export type DestinationRowSimpleProps = DestinationRowShared & {
  title: string
  description?: string
  metadata?: React.ReactNode
  content?: never
  startSlot?: never
  trailingInfo?: never
}

export type DestinationRowRichProps = DestinationRowShared & {
  content: React.ReactNode
  startSlot?: React.ReactNode
  trailingInfo?: React.ReactNode
  title?: never
  description?: never
  metadata?: never
}

export type DestinationRowProps = DestinationRowSimpleProps | DestinationRowRichProps

function isDestinationRowRich(props: DestinationRowProps): props is DestinationRowRichProps {
  return 'content' in props && props.content != null
}

function warnInvalidLink(link: React.ReactElement | undefined) {
  if (process.env.NODE_ENV !== 'development' || link == null) {
    return
  }
  if (!React.isValidElement(link)) {
    console.warn('DestinationRow: `link` must be a single React element.')
  }
}

function DestinationRowChevron({ show }: { show: boolean }) {
  if (!show) {
    return null
  }
  return <NavigationChevron className={UI_DESTINATION_ROW_CHEVRON_CLASS} />
}

function DestinationRowSimpleInterior({
  title,
  description,
  metadata,
  showNavigationChevron,
}: DestinationRowSimpleProps & { showNavigationChevron: boolean }) {
  return (
    <>
      <span className={UI_DESTINATION_ROW_MAIN_CLASS}>
        <span className={UI_DESTINATION_ROW_TITLE_CLASS}>{title}</span>
        {description ? (
          <span className={UI_DESTINATION_ROW_DESCRIPTION_CLASS}>{description}</span>
        ) : null}
        {metadata ? <span className={UI_DESTINATION_ROW_METADATA_CLASS}>{metadata}</span> : null}
      </span>
      <DestinationRowChevron show={showNavigationChevron} />
    </>
  )
}

function DestinationRowRichInterior({
  startSlot,
  content,
  trailingInfo,
  showNavigationChevron,
}: DestinationRowRichProps & { showNavigationChevron: boolean }) {
  return (
    <>
      <div className={UI_DESTINATION_ROW_IDENTITY_CLUSTER_CLASS}>
        {startSlot ? <div className="shrink-0">{startSlot}</div> : null}
        <div className="min-w-0 flex-1">{content}</div>
      </div>
      {trailingInfo ? (
        <div className={UI_DESTINATION_ROW_TRAILING_INFO_CLASS}>{trailingInfo}</div>
      ) : null}
      <DestinationRowChevron show={showNavigationChevron} />
    </>
  )
}

export function DestinationRow(props: DestinationRowProps) {
  const { link, showNavigationChevron = true } = props
  warnInvalidLink(link)

  const interior = isDestinationRowRich(props) ? (
    <DestinationRowRichInterior {...props} showNavigationChevron={showNavigationChevron} />
  ) : (
    <DestinationRowSimpleInterior {...props} showNavigationChevron={showNavigationChevron} />
  )

  const navigableLink = renderNavigableLinkRoot(
    link,
    destinationRowLinkVariants(),
    interior,
    {},
    null,
  )

  return <li className={UI_DESTINATION_ITEM_CLASS}>{navigableLink}</li>
}
