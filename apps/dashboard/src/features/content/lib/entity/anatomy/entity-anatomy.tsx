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
import { entitySummaryStatusLaneVariants } from '../summary/entity-summary.variants'
import { PickerSelectionStateLine } from '../summary/picker-selection-state-line'
import {
  resolveEntityAnatomyBand,
  type EntityAnatomyMediaPlacement,
} from './entity-anatomy-band.lib'
import {
  entityAnatomyHostRootVariants,
  entityAnatomyMediaContentSpanClasses,
  entityAnatomyVariants,
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
  /**
   * `band` — media shares the heading band row (catalog rows).
   * `content` — media spans the content stack beside heading + metadata (drawer subject band).
   */
  mediaPlacement?: EntityAnatomyMediaPlacement
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
// fallow-ignore-next-line complexity
export function EntityAnatomy({
  entity,
  headingHref,
  leadingUtilities,
  trailing,
  density = 'comfortable',
  mediaPlacement = 'band',
  headingEndValue,
}: EntityAnatomyProps) {
  const resolvedLeadingUtilities = leadingUtilities?.filter((utility) => utility != null) ?? []
  const hasStatusItems = (entity.status?.length ?? 0) > 0
  const hasProvenance = (entity.provenance?.length ?? 0) > 0
  const hasSelectionState = entity.selectionState != null
  const hasStatusCell = hasStatusItems || hasProvenance || hasSelectionState
  const band = resolveEntityAnatomyBand(entity.media, mediaPlacement)
  const mediaSpansContent = entity.media != null && mediaPlacement === 'content'

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
          cell={
            mediaSpansContent
              ? { slot: 'stretch', column: 'media' }
              : { slot: 'band', column: 'media' }
          }
          data-entity-item-slot="media"
        >
          {mediaSpansContent ? (
            <div className={entityAnatomyMediaContentSpanClasses}>{entity.media}</div>
          ) : (
            entity.media
          )}
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
      {hasStatusCell ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'status', column: 'content' }}
          data-entity-item-slot="status"
        >
          <div className={entitySummaryStatusLaneVariants()}>
            {entity.selectionState ? (
              <PickerSelectionStateLine model={entity.selectionState} density={density} />
            ) : null}
            {hasStatusItems || hasProvenance ? (
              <EntitySummaryStatus
                items={entity.status ?? []}
                provenance={entity.provenance}
                density={density}
                composition={entity.statusComposition}
              />
            ) : null}
          </div>
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
