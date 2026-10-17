import type { ReactNode } from 'react'
import { RowAnatomyCell, rowAnatomyRootProps, type ContentCardDensity } from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail'
import { EntityAnatomyTrailingCells } from './entity-anatomy-trailing'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'
import type { EntityAnatomyColumn } from './entity-anatomy.types'
import {
  EntitySummaryDescription,
  EntitySummaryHeading,
  EntitySummaryStatus,
  EntitySummarySupportingMetadata,
} from '../summary/entity-summary'
import type { EntitySummaryModel } from '../summary/entity-summary.types'
import { entitySummaryStatusLaneVariants } from '../summary/entity-summary.variants'
import { PickerSelectionStateLine } from '../summary/picker-selection-state-line'
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
  /** Passive numeric scalar aligned with the heading row (private transport from ContentEntityCard). */
  headingEndValue?: number
  /** Intrinsic-width slot immediately after the title (private transport from ContentEntityCard). */
  headingInline?: ReactNode
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

/** Row-track entity anatomy — every part is a RowAnatomy cell; trailing kind selects its cell. */
// fallow-ignore-next-line complexity
export function EntityAnatomy({
  entity,
  headingHref,
  leadingUtilities,
  trailing,
  density = 'comfortable',
  headingEndValue,
  headingInline,
}: EntityAnatomyProps) {
  const resolvedLeadingUtilities = leadingUtilities?.filter((utility) => utility != null) ?? []
  const hasStatusItems = (entity.status?.length ?? 0) > 0
  const hasProvenance = (entity.provenance?.length ?? 0) > 0
  const hasSelectionState = entity.selectionState != null
  const hasStatusCell = hasStatusItems || hasProvenance || hasSelectionState
  const hasSupportingMetadata = (entity.supportingMetadata?.length ?? 0) > 0
  const hasMetaCell = entity.description != null || hasSupportingMetadata

  return (
    <div className={entityAnatomyVariants({ density })} {...rowAnatomyRootProps}>
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
          cell={{ slot: 'stretch', column: 'media' }}
          data-entity-item-slot="media"
        >
          <div className={entityAnatomyMediaContentSpanClasses}>{entity.media}</div>
        </RowAnatomyCell>
      ) : null}
      <RowAnatomyCell<EntityAnatomyColumn>
        cell={{ slot: 'band', column: 'content' }}
        data-entity-item-slot="content"
      >
        <EntitySummaryHeading
          heading={entity.heading}
          classification={entity.classification}
          density={density}
          headingEndValue={headingEndValue}
          headingInline={headingInline}
          headingHref={headingHref}
        />
      </RowAnatomyCell>
      {hasMetaCell ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={{ slot: 'meta', column: 'content' }}
          data-entity-item-slot="description"
        >
          {entity.description != null ? (
            <EntitySummaryDescription density={density}>
              {entity.description}
            </EntitySummaryDescription>
          ) : (
            <EntitySummarySupportingMetadata
              segments={entity.supportingMetadata ?? []}
              density={density}
            />
          )}
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
