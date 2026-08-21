import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { contentCardHeadingLinkVariants, type ContentCardDensity } from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail'
import { EntityAnatomyTrailingSlot } from './entity-anatomy-trailing'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'
import { EntitySummary } from '../summary/entity-summary'
import type { EntitySummaryModel } from '../summary/entity-summary.types'
import {
  entityAnatomyVariants,
  entityAnatomyContentVariants,
  entityAnatomyLeadingSlotVariants,
  entityAnatomyHostRootVariants,
  entityAnatomyTrailingSlotVariants,
} from './entity-anatomy.variants'

export type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

export type EntityAnatomyProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Ordered leading utilities; Anatomy is the sole EntityLeadingRail wrapper. */
  leadingUtilities?: readonly ReactNode[]
  trailing?: EntityAnatomyTrailing
  density?: ContentCardDensity
  /** Passive numeric scalar aligned with the heading row (private transport from ContentEntityCard). */
  headingEndValue?: number
}

export type EntityAnatomyHostProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Exactly one leading utility when set — never a multi-control group or fragment. */
  leading?: ReactNode
  trailing?: EntityAnatomyTrailing
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

export function EntityAnatomy({
  entity,
  headingHref,
  leadingUtilities,
  trailing,
  density = 'comfortable',
  headingEndValue,
}: EntityAnatomyProps) {
  const resolvedEntity = resolveLinkedHeading(entity, headingHref)
  const resolvedLeadingUtilities = leadingUtilities?.filter((utility) => utility != null) ?? []
  const hasControlChrome = resolvedLeadingUtilities.length > 0 || trailing != null

  return (
    <div className={entityAnatomyVariants({ density })}>
      {resolvedLeadingUtilities.length > 0 ? (
        <div className={entityAnatomyLeadingSlotVariants()} data-entity-item-slot="leading">
          <EntityLeadingRail density={density}>{resolvedLeadingUtilities}</EntityLeadingRail>
        </div>
      ) : null}
      <div className={entityAnatomyContentVariants({ density })} data-entity-item-slot="content">
        {resolvedEntity.media ? <div className="shrink-0">{resolvedEntity.media}</div> : null}
        <EntitySummary
          entity={resolvedEntity}
          density={density}
          headingBand={hasControlChrome ? 'control' : 'natural'}
          headingEndValue={headingEndValue}
        />
      </div>
      {trailing ? (
        <div
          className={entityAnatomyTrailingSlotVariants({ density })}
          data-entity-item-slot="trailing"
        >
          <EntityAnatomyTrailingSlot trailing={trailing} />
        </div>
      ) : null}
    </div>
  )
}

export function EntityAnatomyHost({
  entity,
  headingHref,
  leading,
  trailing,
  density = 'comfortable',
}: EntityAnatomyHostProps) {
  return (
    <div className={entityAnatomyHostRootVariants()}>
      <EntityAnatomy
        entity={entity}
        headingHref={headingHref}
        leadingUtilities={leading != null ? [leading] : undefined}
        trailing={trailing}
        density={density}
      />
    </div>
  )
}
