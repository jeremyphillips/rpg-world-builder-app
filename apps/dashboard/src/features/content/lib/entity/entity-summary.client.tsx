'use client'

import type { ReactNode } from 'react'
import { ContentCardHeading, type ContentCardDensity } from '@rpg/ui'

import type { EntitySummaryModel } from './entity-summary.types'
import {
  entityItemStatusRowVariants,
  entitySummaryDescriptionVariants,
  entitySummaryHeadingBandVariants,
  entitySummaryStatusVariants,
} from './entity-item.variants'

const CLASSIFICATION_SEPARATOR = ' · ' as const

function resolveClassificationSuffix(classification: ReactNode): ReactNode | undefined {
  if (classification == null || classification === '') {
    return undefined
  }

  if (typeof classification === 'string' && classification.startsWith(CLASSIFICATION_SEPARATOR)) {
    return classification
  }

  if (typeof classification === 'string') {
    return `${CLASSIFICATION_SEPARATOR}${classification}`
  }

  return (
    <>
      {CLASSIFICATION_SEPARATOR}
      {classification}
    </>
  )
}

export type EntitySummaryHeadingBand = 'control' | 'natural'

export type EntitySummaryProps = {
  entity: EntitySummaryModel
  density?: ContentCardDensity
  /** When `control`, wraps the heading in a compact-control-height band for rail alignment. */
  headingBand?: EntitySummaryHeadingBand
}

export function EntitySummary({
  entity,
  density = 'comfortable',
  headingBand = 'natural',
}: EntitySummaryProps) {
  const headingSuffix = resolveClassificationSuffix(entity.classification)
  const heading = (
    <ContentCardHeading heading={entity.heading} headingSuffix={headingSuffix} density={density} />
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
      {entity.status && entity.status.length > 0 ? (
        <div className={entityItemStatusRowVariants()}>
          {entity.status.map((status, index) => (
            <div key={index} className={entitySummaryStatusVariants({ density })}>
              {status}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
