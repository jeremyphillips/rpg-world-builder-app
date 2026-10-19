import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ContentCardHeading,
  IdentityRowHeadingLine,
  IdentityRowSupporting,
  InlineMetadata,
  contentCardHeadingLinkVariants,
  type ContentCardDensity,
  type InlineMetadataDensity,
} from '@rpg/ui'

import type { EntitySummaryModel } from './entity-summary.types'
import type {
  EntitySummaryStatusComposition,
  EntitySummaryStatusItem,
} from './entity-summary-status.types'
import { EntitySummaryStatusItemView } from './entity-summary-status'
import { EntitySummaryProvenanceItemView } from './entity-summary-provenance'
import type { EntitySummaryProvenanceItem } from './entity-summary-provenance.types'
import { groupEntitySummaryStatusForMetadata } from './entity-summary-metadata-groups.lib'
import {
  entitySummaryHeadingEndValueVariants,
  entitySummaryHeadingRowVariants,
  entitySummaryStatusBadgeGroupVariants,
  entitySummaryStatusMetadataVariants,
  entitySummaryStatusRowVariants,
} from './entity-summary.variants'

function inlineMetadataDensity(density?: ContentCardDensity): InlineMetadataDensity {
  return density === 'compact' ? 'compact' : 'comfortable'
}

export type EntitySummaryHeadingProps = Pick<EntitySummaryModel, 'heading' | 'classification'> & {
  density?: ContentCardDensity
  /** Passive numeric scalar aligned with the heading row (private transport from ContentEntityCard). */
  headingEndValue?: number
  /** Intrinsic-width slot immediately after the title (private transport from ContentEntityCard). */
  headingInline?: ReactNode
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
}

/** Heading line — placed in the host band cell. Density selects typography only. */
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

export function EntitySummaryHeading({
  heading,
  classification,
  density,
  headingEndValue,
  headingInline,
  headingHref,
}: EntitySummaryHeadingProps) {
  const headingEnd =
    headingEndValue != null ? (
      <span className={entitySummaryHeadingEndValueVariants({ density })}>{headingEndValue}</span>
    ) : undefined
  const resolvedHeading = resolveLinkedHeading(heading, headingHref)

  return (
    <div className={entitySummaryHeadingRowVariants()}>
      {density === 'compact' ? (
        <IdentityRowHeadingLine
          heading={resolvedHeading}
          classification={classification}
          headingEnd={headingEnd}
          headingInline={headingInline}
          recipe="entity-compact"
        />
      ) : (
        <>
          <ContentCardHeading
            heading={resolvedHeading}
            classification={classification}
            density={density}
            headingInline={headingInline}
          />
          {headingEnd}
        </>
      )}
    </div>
  )
}

/** Description line — placed in the host meta cell. */
export function EntitySummaryDescription({
  children,
}: {
  children: ReactNode
  density?: ContentCardDensity
}) {
  return <IdentityRowSupporting>{children}</IdentityRowSupporting>
}

/** Structured supporting segments — placed in the host meta cell. */
export function EntitySummarySupportingMetadata({
  segments,
  density,
}: {
  segments: readonly string[]
  density?: ContentCardDensity
}) {
  if (segments.length === 0) {
    return null
  }

  return (
    <IdentityRowSupporting wrap>
      <InlineMetadata role="supporting" density={inlineMetadataDensity(density)}>
        {segments.map((label) => (
          <InlineMetadata.Item key={label}>{label}</InlineMetadata.Item>
        ))}
      </InlineMetadata>
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
  density?: ContentCardDensity
  composition?: EntitySummaryStatusComposition
}) {
  const provenanceItems = provenance ?? []

  if (composition === 'metadata' || provenanceItems.length > 0) {
    return (
      <InlineMetadata
        role="supporting"
        density={inlineMetadataDensity(density)}
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
        {(composition === 'metadata'
          ? groupEntitySummaryStatusForMetadata(items)
          : items.map((item) => ({ kind: 'status' as const, item }))
        ).map((segment, index) => (
          <InlineMetadata.Item key={`status-${index}`}>
            <span data-entity-summary-status>
              {segment.kind === 'badge-group' ? (
                <span className={entitySummaryStatusBadgeGroupVariants()}>
                  {segment.badges.map((badge, badgeIndex) => (
                    <EntitySummaryStatusItemView
                      key={
                        badge.kind === 'validationError'
                          ? `validation-error-${badgeIndex}`
                          : `${badge.label}-${badgeIndex}`
                      }
                      item={badge}
                      density={density}
                      layout="inline"
                    />
                  ))}
                </span>
              ) : (
                <EntitySummaryStatusItemView
                  item={segment.item}
                  density={density}
                  layout="inline"
                />
              )}
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
