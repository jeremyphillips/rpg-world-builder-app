'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { contentCardHeadingLinkVariants, type ContentCardDensity } from '@rpg/ui'

import { EntitySummary } from './entity-summary.client'
import type { EntitySummaryModel } from './entity-summary.types'
import {
  entityItemActionVariants,
  entityItemAnatomyVariants,
  entityItemLeadingVariants,
  entityItemRootVariants,
} from './entity-item.variants'

export type EntityItemProps = {
  entity: EntitySummaryModel
  href?: string
  leading?: ReactNode
  action?: ReactNode
  density?: ContentCardDensity
}

type EntityItemAnatomyProps = EntityItemProps & {
  /** When false, skip entity-owned inset — used inside EntityCardFrame. */
  applyInset?: boolean
}

function resolveLinkedHeading(
  entity: EntitySummaryModel,
  href: string | undefined,
): EntitySummaryModel {
  if (!href) {
    return entity
  }

  return {
    ...entity,
    heading: (
      <Link to={href} className={contentCardHeadingLinkVariants()}>
        {entity.heading}
      </Link>
    ),
  }
}

export function EntityItemAnatomy({
  entity,
  href,
  leading,
  action,
  density = 'comfortable',
}: Omit<EntityItemAnatomyProps, 'applyInset'>) {
  const resolvedEntity = resolveLinkedHeading(entity, href)
  const hasSecondaryText = Boolean(
    resolvedEntity.description || (resolvedEntity.status && resolvedEntity.status.length > 0),
  )
  const rowAlign = hasSecondaryText ? 'start' : 'center'

  return (
    <div className={entityItemAnatomyVariants({ density, rowAlign })}>
      {leading ? <div className={entityItemLeadingVariants()}>{leading}</div> : null}
      {resolvedEntity.media ? <div className="shrink-0">{resolvedEntity.media}</div> : null}
      <EntitySummary entity={resolvedEntity} density={density} />
      {action ? <div className={entityItemActionVariants()}>{action}</div> : null}
    </div>
  )
}

export function EntityItem({
  entity,
  href,
  leading,
  action,
  density = 'comfortable',
}: EntityItemProps) {
  return (
    <div className={entityItemRootVariants({ density })}>
      <EntityItemAnatomy
        entity={entity}
        href={href}
        leading={leading}
        action={action}
        density={density}
      />
    </div>
  )
}
