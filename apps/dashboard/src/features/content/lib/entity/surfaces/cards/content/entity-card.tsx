import type { ReactNode } from 'react'
import type { CollapsibleListItemDragHandleConfig, ContentCardDensity } from '@rpg/ui'

import type { EntityAnatomyLeading } from '../../../anatomy/entity-anatomy-leading.types'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { ContentEntityCard } from './content-entity-card'
import { DisclosureEntityCard } from '../disclosure/disclosure-entity-card'

export type EntityCardStaticProps = {
  variant?: 'static'
  entity: EntitySummaryModel
  leading?: EntityAnatomyLeading
  trailing?: EntityAnatomyTrailing
  density?: ContentCardDensity
  disabled?: boolean
  headingEndValue?: number
  headingInline?: ReactNode
}

export type EntityCardDisclosureProps = {
  variant: 'disclosure'
  entity: EntitySummaryModel
  itemId: string
  toolbarAriaLabel: string
  children: ReactNode
  trailing?: EntityAnatomyTrailing
  headingHref?: string
  density?: ContentCardDensity
  collapsed?: boolean
  onToggleCollapse?: () => void
  defaultCollapsed?: boolean
  disabled?: boolean
  dragHandleProps?: CollapsibleListItemDragHandleConfig
}

export type EntityCardProps = EntityCardStaticProps | EntityCardDisclosureProps

/** Structured entity card — static by default; set `variant="disclosure"` for expandable body. */
export function EntityCard(props: EntityCardProps) {
  if (props.variant === 'disclosure') {
    const { variant: _variant, ...disclosureProps } = props
    return <DisclosureEntityCard {...disclosureProps} />
  }
  const { variant: _variant, ...staticProps } = props
  return <ContentEntityCard {...staticProps} />
}
