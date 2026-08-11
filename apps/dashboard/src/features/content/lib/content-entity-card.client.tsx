'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContentCardHeadingAction, type ContentCardDensity } from '@rpg/ui'

import { EntityCardFrame } from './entity/entity-card-frame.client'
import { EntityItemAnatomy } from './entity/entity-item.client'
import type { EntitySummaryModel } from './entity/entity-summary.types'

export type { EntitySummaryModel } from './entity/entity-summary.types'
export { EntitySummary } from './entity/entity-summary.client'
export { EntityItem } from './entity/entity-item.client'

export type ContentEntityCardProps = {
  entity: EntitySummaryModel
  action?: ReactNode
  href?: string
  density?: ContentCardDensity
  disabled?: boolean
}

export function ContentEntityCard({
  entity,
  action,
  href,
  density,
  disabled = false,
}: ContentEntityCardProps) {
  const resolvedDensity = density ?? 'comfortable'

  return (
    <EntityCardFrame density={resolvedDensity} disabled={disabled}>
      <EntityItemAnatomy entity={entity} href={href} action={action} density={resolvedDensity} />
    </EntityCardFrame>
  )
}

export function ContentEntityCardViewLink({ href }: { href: string }) {
  return (
    <ContentCardHeadingAction asChild>
      <Link to={href}>View</Link>
    </ContentCardHeadingAction>
  )
}
