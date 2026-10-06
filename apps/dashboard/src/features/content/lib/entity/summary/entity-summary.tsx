import type { ReactNode } from 'react'
import {
  ContentCardHeading,
  IdentityRowHeadingLine,
  IdentityRowSupporting,
  InlineMetadata,
  type ContentCardDensity,
  type IdentityRowSize,
} from '@rpg/ui'

import type { EntitySummaryModel } from './entity-summary.types'
import type {
  EntitySummaryStatusComposition,
  EntitySummaryStatusItem,
} from './entity-summary-status.types'
import { EntitySummaryStatusItemView } from './entity-summary-status'
import { EntitySummaryProvenanceItemView } from './entity-summary-provenance'
import type { EntitySummaryProvenanceItem } from './entity-summary-provenance.types'
import {
  entitySummaryHeadingEndValueVariants,
  entitySummaryHeadingRowVariants,
  entitySummaryStatusMetadataVariants,
  entitySummaryStatusRowVariants,
} from './entity-summary.variants'

/** Supporting copy scale per density — compact `text-xs`, comfortable `text-sm`. */
const ENTITY_SUMMARY_SUPPORTING_SIZE: Record<ContentCardDensity, IdentityRowSize> = {
  compact: 'md',
  comfortable: 'lg',
}

export type EntitySummaryHeadingProps = Pick<EntitySummaryModel, 'heading' | 'classification'> & {
  density: ContentCardDensity
  /** Passive numeric scalar aligned with the heading row (private transport from ContentEntityCard). */
  headingEndValue?: number
}

/** Heading line — placed in the host band cell. Density selects typography only. */
export function EntitySummaryHeading({
  heading,
  classification,
  density,
  headingEndValue,
}: EntitySummaryHeadingProps) {
  return (
    <div className={entitySummaryHeadingRowVariants()}>
      {density === 'compact' ? (
        <IdentityRowHeadingLine heading={heading} classification={classification} size="md" />
      ) : (
        <ContentCardHeading heading={heading} classification={classification} density={density} />
      )}
      {headingEndValue != null ? (
        <span className={entitySummaryHeadingEndValueVariants({ density })}>{headingEndValue}</span>
      ) : null}
    </div>
  )
}

/** Description line — placed in the host meta cell. */
export function EntitySummaryDescription({
  children,
  density,
}: {
  children: ReactNode
  density: ContentCardDensity
}) {
  return (
    <IdentityRowSupporting size={ENTITY_SUMMARY_SUPPORTING_SIZE[density]}>
      {children}
    </IdentityRowSupporting>
  )
}

/**
 * Status lane — placed in the host status cell; the cell owns the top offset.
 * `provenance` is a separate group rendered ahead of status on the same line.
 */
export function EntitySummaryStatus({
  items,
  provenance,
  density,
  composition = 'cluster',
}: {
  items: readonly EntitySummaryStatusItem[]
  provenance?: readonly EntitySummaryProvenanceItem[]
  density: ContentCardDensity
  composition?: EntitySummaryStatusComposition
}) {
  const provenanceItems = provenance ?? []

  if (composition === 'metadata' || provenanceItems.length > 0) {
    return (
      <InlineMetadata
        role="supporting"
        density={density}
        wrap
        className={entitySummaryStatusMetadataVariants({ density })}
      >
        {provenanceItems.map((item, index) => (
          <InlineMetadata.Item key={`provenance-${index}`}>
            <span data-entity-summary-provenance>
              <EntitySummaryProvenanceItemView item={item} density={density} />
            </span>
          </InlineMetadata.Item>
        ))}
        {items.map((status, index) => (
          <InlineMetadata.Item key={`status-${index}`}>
            <span data-entity-summary-status>
              <EntitySummaryStatusItemView item={status} density={density} layout="inline" />
            </span>
          </InlineMetadata.Item>
        ))}
      </InlineMetadata>
    )
  }

  return (
    <div className={entitySummaryStatusRowVariants()} data-entity-summary-status-row>
      {items.map((status, index) => (
        <EntitySummaryStatusItemView key={index} item={status} density={density} />
      ))}
    </div>
  )
}
