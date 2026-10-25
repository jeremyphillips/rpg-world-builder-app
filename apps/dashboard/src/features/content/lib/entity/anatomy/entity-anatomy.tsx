import type { ReactNode } from 'react'
import { RowAnatomyCell, rowAnatomyRootProps, type ContentCardDensity } from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail'
import type { EntityAnatomyLeading } from './entity-anatomy-leading.types'
import { resolveEntityLeadingCell } from './entity-leading-cell.lib'
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
import { wrapEntityAnatomyLeadingMedia } from './entity-leading-media-shell.lib'
import {
  entityAnatomyHostRootVariants,
  entityAnatomyMediaCellInnerVariants,
  entityAnatomyVariants,
} from './entity-anatomy.variants'

export type { EntityAnatomyLeading } from './entity-anatomy-leading.types'
export type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

export type EntityAnatomyProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Single leading control — kind selects the row track (see {@link resolveEntityLeadingCell}). */
  leading?: EntityAnatomyLeading
  /** Ordered disclosure utilities (grip, caret) — always title-band cells. */
  leadingUtilities?: readonly ReactNode[]
  trailing?: EntityAnatomyTrailing
  density?: ContentCardDensity
  /** Passive numeric scalar aligned with the heading row (private transport from EntityCardStaticRenderer). */
  headingEndValue?: number
  /** Intrinsic-width slot immediately after the title (private transport from EntityCardStaticRenderer). */
  headingInline?: ReactNode
  /** When true, description supporting copy wraps instead of truncating. */
  descriptionWrap?: boolean
}

export type EntityAnatomyHostProps = {
  entity: EntitySummaryModel
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  leading?: EntityAnatomyLeading
  trailing?: EntityAnatomyTrailing
  density?: ContentCardDensity
  /** When true, description supporting copy wraps instead of truncating. */
  descriptionWrap?: boolean
}

/** Row-track entity anatomy — every part is a RowAnatomy cell; trailing kind selects its cell. */
// fallow-ignore-next-line complexity
export function EntityAnatomy({
  entity,
  headingHref,
  leading,
  leadingUtilities,
  trailing,
  density,
  headingEndValue,
  headingInline,
  descriptionWrap = false,
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
      {leading ? (
        <RowAnatomyCell<EntityAnatomyColumn>
          cell={resolveEntityLeadingCell(leading)}
          data-entity-item-slot="leading"
        >
          <EntityLeadingRail density={density}>{leading.content}</EntityLeadingRail>
        </RowAnatomyCell>
      ) : null}
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
          <div className={entityAnatomyMediaCellInnerVariants}>
            {wrapEntityAnatomyLeadingMedia(entity.media)}
          </div>
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
            <EntitySummaryDescription density={density} wrap={descriptionWrap}>
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
          <div className={entitySummaryStatusLaneVariants}>
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
  density,
  descriptionWrap,
}: EntityAnatomyHostProps) {
  return (
    <div className={entityAnatomyHostRootVariants}>
      <EntityAnatomy
        entity={entity}
        headingHref={headingHref}
        leading={leading}
        trailing={trailing}
        density={density}
        descriptionWrap={descriptionWrap}
      />
    </div>
  )
}
