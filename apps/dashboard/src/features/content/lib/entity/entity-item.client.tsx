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
  entityItemLeadingSlotVariants,
  entityItemRootVariants,
  entityItemTrailingSlotVariants,
} from './entity-item.variants'

export type { EntityItemTrailing } from './entity-item-trailing.types'

export type EntityItemAnatomyProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Ordered leading utilities; Anatomy is the sole EntityLeadingRail wrapper. */
  leadingUtilities?: readonly ReactNode[]
  trailing?: EntityItemTrailing
  density?: ContentCardDensity
}

export type EntityItemProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Exactly one leading utility when set — never a multi-control group or fragment. */
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
  leadingUtilities,
  trailing,
  density = 'comfortable',
}: EntityItemAnatomyProps) {
  const resolvedEntity = resolveLinkedHeading(entity, headingHref)
  const hasSecondaryText = Boolean(
    resolvedEntity.description || (resolvedEntity.status && resolvedEntity.status.length > 0),
  )
  const rowAlign = hasSecondaryText ? 'start' : 'center'
  const resolvedLeadingUtilities = leadingUtilities?.filter((utility) => utility != null) ?? []

  return (
    <div className={entityItemAnatomyVariants({ density, rowAlign })}>
      {resolvedLeadingUtilities.length > 0 ? (
        <div className={entityItemLeadingSlotVariants({ density })} data-entity-item-slot="leading">
          <EntityLeadingRail>{resolvedLeadingUtilities}</EntityLeadingRail>
        </div>
      ) : null}
      <div
        className={entityItemContentVariants({ density, rowAlign })}
        data-entity-item-slot="content"
      >
        {resolvedEntity.media ? <div className="shrink-0">{resolvedEntity.media}</div> : null}
        <EntitySummary entity={resolvedEntity} density={density} />
      </div>
      {trailing ? (
        <div
          className={entityItemTrailingSlotVariants({ density })}
          data-entity-item-slot="trailing"
        >
          <EntityItemTrailingSlot trailing={trailing} />
        </div>
      ) : null}
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
        leadingUtilities={leading != null ? [leading] : undefined}
        trailing={trailing}
        density={density}
      />
    </div>
  )
}
