import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  RowAnatomyCell,
  contentCardHeadingLinkVariants,
  rowAnatomyRootProps,
  type ContentCardDensity,
} from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail'
import { EntityAnatomyTrailingCells } from './entity-anatomy-trailing'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'
import type { EntityAnatomyColumn } from './entity-anatomy.types'
import {
  EntitySummaryDescription,
  EntitySummaryHeading,
  EntitySummaryStatus,
} from '../summary/entity-summary'
import type { EntitySummaryModel } from '../summary/entity-summary.types'
import { resolveEntityAnatomyBand } from './entity-anatomy-band.lib'
import { entityAnatomyHostRootVariants, entityAnatomyVariants } from './entity-anatomy.variants'

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

function resolveLinkedHeading(heading: ReactNode, headingHref: string | undefined): ReactNode {
  if (!headingHref) {
    return heading
  }

  return (
    <Link to={headingHref} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  )
}

/** Row-track entity anatomy — every part is a RowAnatomy cell; trailing kind selects its cell. */
export function EntityAnatomy({
  entity,
  headingHref,
  leadingUtilities,
  trailing,
  density = 'comfortable',
  headingEndValue,
}: EntityAnatomyProps) {
  const resolvedLeadingUtilities = leadingUtilities?.filter((utility) => utility != null) ?? []
  const hasStatus = entity.status != null && entity.status.length > 0
  const band = resolveEntityAnatomyBand(entity.media)

  return (
    <div className={entityAnatomyVariants({ density, band })} {...rowAnatomyRootProps}>
      {resolvedLeadingUtilities.length > 0 ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'band', column: 'leading' }}
          data-entity-item-slot="leading"
        >
          <EntityLeadingRail density={density}>{resolvedLeadingUtilities}</EntityLeadingRail>
        </RowAnatomyCell>
      ) : null}
      {entity.media ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'band', column: 'media' }}
          data-entity-item-slot="media"
        >
          {entity.media}
        </RowAnatomyCell>
      ) : null}
      <RowAnatomyCell<EntityAnatomyColumn>
        cell={{ slot: 'band', column: 'content' }}
        data-entity-item-slot="content"
      >
        <EntitySummaryHeading
          heading={resolveLinkedHeading(entity.heading, headingHref)}
          classification={entity.classification}
          density={density}
          headingEndValue={headingEndValue}
        />
      </RowAnatomyCell>
      {entity.description ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'meta', column: 'content' }}
          data-entity-item-slot="description"
        >
          <EntitySummaryDescription density={density}>
            {entity.description}
          </EntitySummaryDescription>
        </RowAnatomyCell>
      ) : null}
      {hasStatus ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'status', column: 'content' }}
          data-entity-item-slot="status"
        >
          <EntitySummaryStatus items={entity.status!} density={density} />
        </RowAnatomyCell>
      ) : null}
      <EntityAnatomyTrailingCells trailing={trailing} />
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
