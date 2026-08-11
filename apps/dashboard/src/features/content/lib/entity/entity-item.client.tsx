'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { contentCardHeadingLinkVariants, type ContentCardDensity } from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail.client'
import { EntityItemTrailingSlot } from './entity-item-trailing.client'
import type { EntityItemTrailing } from './entity-item-trailing.types'
import { EntitySummary } from './entity-summary.client'
import type { EntitySummaryModel } from './entity-summary.types'
import {
  entityItemAnatomyVariants,
  entityItemContentVariants,
  entityItemRootVariants,
} from './entity-item.variants'

export type { EntityItemTrailing } from './entity-item-trailing.types'

export type EntityItemProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Exactly one leading utility when set — never a multi-control fragment. */
  leading?: ReactNode
  trailing?: EntityItemTrailing
  density?: ContentCardDensity
}

function resolveLinkedHeading(
  entity: EntitySummaryModel,
  headingHref: string | undefined,
): EntitySummaryModel {
  if (!headingHref) {
    return entity
  }

  return {
    ...entity,
    heading: (
      <Link to={headingHref} className={contentCardHeadingLinkVariants()}>
        {entity.heading}
      </Link>
    ),
  }
}

export function EntityItemAnatomy({
  entity,
  headingHref,
  leading,
  trailing,
  density = 'comfortable',
}: EntityItemProps) {
  const resolvedEntity = resolveLinkedHeading(entity, headingHref)
  const hasSecondaryText = Boolean(
    resolvedEntity.description || (resolvedEntity.status && resolvedEntity.status.length > 0),
  )
  const rowAlign = hasSecondaryText ? 'start' : 'center'

  return (
    <div className={entityItemAnatomyVariants({ density, rowAlign })}>
      {leading ? <EntityLeadingRail>{leading}</EntityLeadingRail> : null}
      <div className={entityItemContentVariants({ density, rowAlign })}>
        {resolvedEntity.media ? <div className="shrink-0">{resolvedEntity.media}</div> : null}
        <EntitySummary entity={resolvedEntity} density={density} />
      </div>
      <EntityItemTrailingSlot trailing={trailing} />
    </div>
  )
}

export function EntityItem({
  entity,
  headingHref,
  leading,
  trailing,
  density = 'comfortable',
}: EntityItemProps) {
  return (
    <div className={entityItemRootVariants()}>
      <EntityItemAnatomy
        entity={entity}
        headingHref={headingHref}
        leading={leading}
        trailing={trailing}
        density={density}
      />
    </div>
  )
}
