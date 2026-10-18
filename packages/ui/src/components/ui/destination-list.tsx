import * as React from 'react'

import { cn } from '../../lib/utils'
import { NavigationChevron, renderNavigableCardLink } from './card.lib'
import {
  destinationListVariants,
  destinationRowLinkVariants,
  UI_DESTINATION_ITEM_CLASS,
  UI_DESTINATION_ROW_CHEVRON_CLASS,
  UI_DESTINATION_ROW_DESCRIPTION_CLASS,
  UI_DESTINATION_ROW_MAIN_CLASS,
  UI_DESTINATION_ROW_METADATA_CLASS,
  UI_DESTINATION_ROW_TITLE_CLASS,
  type DestinationListDensity,
} from './destination-list.variants'

export type { DestinationListDensity } from './destination-list.variants'

export type DestinationListProps = Omit<React.ComponentPropsWithoutRef<'ul'>, 'children'> & {
  density?: DestinationListDensity
  children?: React.ReactNode
}

export function DestinationList({
  density = 'comfortable',
  className,
  children,
  ...props
}: DestinationListProps) {
  return (
    <ul className={cn(destinationListVariants({ density }), className)} {...props}>
      {children}
    </ul>
  )
}

export type DestinationRowProps = {
  link: React.ReactElement
  title: string
  description?: string
  metadata?: React.ReactNode
  showNavigationChevron?: boolean
}

export function DestinationRow({
  link,
  title,
  description,
  metadata,
  showNavigationChevron = true,
}: DestinationRowProps) {
  if (process.env.NODE_ENV === 'development' && !React.isValidElement(link)) {
    console.warn('DestinationRow: `link` must be a single React element.')
  }

  const interior = (
    <>
      <span className={UI_DESTINATION_ROW_MAIN_CLASS}>
        <span className={UI_DESTINATION_ROW_TITLE_CLASS}>{title}</span>
        {description ? (
          <span className={UI_DESTINATION_ROW_DESCRIPTION_CLASS}>{description}</span>
        ) : null}
        {metadata ? <span className={UI_DESTINATION_ROW_METADATA_CLASS}>{metadata}</span> : null}
      </span>
      {showNavigationChevron ? (
        <NavigationChevron className={UI_DESTINATION_ROW_CHEVRON_CLASS} />
      ) : null}
    </>
  )

  const navigableLink = renderNavigableCardLink(
    link,
    destinationRowLinkVariants(),
    interior,
    {},
    null,
  )

  return <li className={UI_DESTINATION_ITEM_CLASS}>{navigableLink}</li>
}
