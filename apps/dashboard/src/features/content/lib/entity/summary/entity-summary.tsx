import type { ReactNode } from 'react'
import {
  ContentCardHeading,
  IdentityRowHeadingLine,
  IdentityRowSupporting,
  type ContentCardDensity,
  type IdentityRowSize,
} from '@rpg/ui'

import type { EntitySummaryModel } from './entity-summary.types'
import type { EntitySummaryStatusItem } from './entity-summary-status.types'
import { EntitySummaryStatusItemView } from './entity-summary-status'
import {
  entitySummaryHeadingEndValueVariants,
  entitySummaryHeadingRowVariants,
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
    <IdentityRowSupporting size={ENTITY_SUMMARY_SUPPORTING_SIZE[density]}>{children}</IdentityRowSupporting>
  )
}

/** Status lane — placed in the host status cell; the cell owns the top offset. */
export function EntitySummaryStatus({
  items,
  density,
}: {
  items: readonly EntitySummaryStatusItem[]
  density: ContentCardDensity
}) {
  return (
    <div className={entitySummaryStatusRowVariants()} data-entity-summary-status-row>
      {items.map((status, index) => (
        <EntitySummaryStatusItemView key={index} item={status} density={density} />
      ))}
    </div>
  )
}
