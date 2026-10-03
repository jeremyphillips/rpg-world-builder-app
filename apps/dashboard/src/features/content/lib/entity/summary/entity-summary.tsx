import type { ReactNode } from 'react'
import { ContentCardHeading, IdentityRow, type ContentCardDensity } from '@rpg/ui'

import type { EntitySummaryModel } from './entity-summary.types'
import { EntitySummaryStatusItemView } from './entity-summary-status'
import {
  entitySummaryStatusRowVariants,
  entitySummaryDescriptionVariants,
  entitySummaryHeadingBandVariants,
  entitySummaryHeadingEndValueVariants,
  entitySummaryHeadingRowVariants,
} from './entity-summary.variants'

function renderEntitySummaryStatus(
  entity: EntitySummaryModel,
  density: ContentCardDensity,
): ReactNode | undefined {
  if (!entity.status || entity.status.length === 0) {
    return undefined
  }

  return (
    <div className={entitySummaryStatusRowVariants()} data-entity-summary-status-row>
      {entity.status.map((status, index) => (
        <EntitySummaryStatusItemView key={index} item={status} density={density} />
      ))}
    </div>
  )
}

export type EntitySummaryHeadingBand = 'control' | 'natural'

export type EntitySummaryProps = {
  entity: EntitySummaryModel
  density?: ContentCardDensity
  /** When `control`, wraps the heading in a compact-control-height band for rail alignment. */
  headingBand?: EntitySummaryHeadingBand
  /** Passive numeric scalar aligned with the heading row (private transport from ContentEntityCard). */
  headingEndValue?: number
}

function EntitySummaryCompact({
  entity,
  density,
  headingBand,
  headingEndValue,
}: EntitySummaryProps & { density: ContentCardDensity }) {
  const status = renderEntitySummaryStatus(entity, density)

  const identity =
    headingEndValue != null ? (
      <>
        <div className={entitySummaryHeadingRowVariants()}>
          <IdentityRow
            heading={entity.heading}
            classification={entity.classification}
            size="md"
            className="min-w-0 flex-1"
          />
          <span className={entitySummaryHeadingEndValueVariants({ density })}>
            {headingEndValue}
          </span>
        </div>
        <IdentityRow supporting={entity.description} status={status} size="md" />
      </>
    ) : (
      <IdentityRow
        heading={entity.heading}
        classification={entity.classification}
        supporting={entity.description}
        status={status}
        size="md"
      />
    )

  const body = (
    <div className="min-w-0 flex-1">
      {headingBand === 'control' ? (
        <div className={entitySummaryHeadingBandVariants()} data-entity-summary-band="control">
          {identity}
        </div>
      ) : (
        identity
      )}
    </div>
  )

  return body
}

export function EntitySummary({
  entity,
  density = 'comfortable',
  headingBand = 'natural',
  headingEndValue,
}: EntitySummaryProps) {
  if (density === 'compact') {
    return (
      <EntitySummaryCompact
        entity={entity}
        density={density}
        headingBand={headingBand}
        headingEndValue={headingEndValue}
      />
    )
  }

  const heading = (
    <div className={entitySummaryHeadingRowVariants()}>
      <div className="min-w-0 flex-1">
        <ContentCardHeading
          heading={entity.heading}
          classification={entity.classification}
          density={density}
        />
      </div>
      {headingEndValue != null ? (
        <span className={entitySummaryHeadingEndValueVariants({ density })}>{headingEndValue}</span>
      ) : null}
    </div>
  )

  return (
    <div className="min-w-0 flex-1">
      {headingBand === 'control' ? (
        <div className={entitySummaryHeadingBandVariants()} data-entity-summary-band="control">
          {heading}
        </div>
      ) : (
        heading
      )}
      {entity.description ? (
        <div className={entitySummaryDescriptionVariants({ density })}>{entity.description}</div>
      ) : null}
      {renderEntitySummaryStatus(entity, density)}
    </div>
  )
}
