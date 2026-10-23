import { useId, useState, type ReactNode } from 'react'

import { cn, Icon } from '@rpg/ui'

import { EntityAnatomy } from '../../../entity/anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../../entity/anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../../entity/anatomy/entity-surface-edges.lib'
import { projectEntitySummaryModel } from '../../../entity/summary/entity-summary-projection.lib'
import type { EntitySummaryStatusItem } from '../../../entity/summary/entity-summary-status.types'
import { entitySurfaceVariants } from '../../../entity/surfaces/dash-entity-surface.variants'
import {
  detailEntityRowDisclosureButtonVariants,
  detailEntityRowDisclosureContentVariants,
  detailEntityRowDisclosureItemVariants,
  detailEntityRowDisclosurePreviewGroupVariants,
  detailEntityRowDisclosureRowVariants,
  detailEntityRowVariants,
} from './detail-entity-row.variants'

export type DetailEntityRowDisclosure =
  | { mode: 'expandable'; label: string; content: ReactNode }
  | { mode: 'reserved' }

export type DetailEntityRowProps = {
  heading: ReactNode
  headingHref?: string
  /** Muted classification segments; separators are composed by entity identity chrome. */
  classification?: ReactNode
  subheading?: ReactNode
  metadata?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  /** Leading entity media lane — domain types project to a node upstream. */
  leadingMedia?: ReactNode
  trailing?: EntityAnatomyTrailing
  inset?: 'self' | 'parent'
  disclosure?: DetailEntityRowDisclosure
  className?: string
}

const DETAIL_ENTITY_ROW_DENSITY = 'compact' as const

function DetailEntityRowDisclosureUtility({
  disclosure,
  collapsed,
  contentId,
  onToggle,
}: {
  disclosure: DetailEntityRowDisclosure
  collapsed: boolean
  contentId: string
  onToggle: () => void
}) {
  if (disclosure.mode === 'expandable') {
    const toggleLabel = collapsed ? `Show ${disclosure.label}` : `Hide ${disclosure.label}`

    return (
      <button
        type="button"
        className={detailEntityRowDisclosureButtonVariants()}
        aria-expanded={!collapsed}
        aria-controls={contentId}
        aria-label={toggleLabel}
        onClick={onToggle}
      >
        <Icon
          name="chevron-down"
          size="owner"
          className={cn('transition-transform', collapsed && '-rotate-90')}
        />
      </button>
    )
  }

  return <span className="block size-control-action-compact" aria-hidden />
}

function DetailEntityRowIdentity(
  props: Pick<
    DetailEntityRowProps,
    | 'heading'
    | 'headingHref'
    | 'classification'
    | 'subheading'
    | 'metadata'
    | 'trailing'
    | 'leadingMedia'
  > & {
    leadingUtilities?: readonly ReactNode[]
  },
) {
  const {
    heading,
    headingHref,
    classification,
    subheading,
    metadata,
    leadingMedia,
    trailing,
    leadingUtilities,
  } = props

  const summaryModel = projectEntitySummaryModel({
    heading,
    classification: classification,
    description: subheading,
    status: metadata,
  })

  return (
    <EntityAnatomy
      entity={{
        ...summaryModel,
        ...(leadingMedia != null ? { media: leadingMedia } : {}),
      }}
      headingHref={headingHref}
      leadingUtilities={leadingUtilities}
      trailing={trailing}
      density={DETAIL_ENTITY_ROW_DENSITY}
    />
  )
}

export function DetailEntityRow({
  heading,
  headingHref,
  classification,
  subheading,
  metadata,
  leadingMedia,
  trailing,
  inset = 'self',
  disclosure,
  className,
}: DetailEntityRowProps) {
  const contentId = useId()
  const [collapsed, setCollapsed] = useState(true)

  const flatEdges =
    inset === 'self' ? resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing }) : undefined

  if (!disclosure) {
    return (
      <div
        className={cn(
          detailEntityRowVariants({ inset }),
          flatEdges &&
            entitySurfaceVariants({
              density: DETAIL_ENTITY_ROW_DENSITY,
              edges: flatEdges,
              leadingUtilityCount: 0,
            }),
          className,
        )}
        data-entity-surface-start={flatEdges?.start}
        data-entity-surface-end={flatEdges?.end}
      >
        <DetailEntityRowIdentity
          heading={heading}
          headingHref={headingHref}
          classification={classification}
          subheading={subheading}
          metadata={metadata}
          leadingMedia={leadingMedia}
          trailing={trailing}
        />
      </div>
    )
  }

  const disclosureEdges = resolveEntitySurfaceEdges({ leadingUtilityCount: 1, trailing })

  return (
    <div
      className={cn(
        detailEntityRowDisclosureItemVariants(),
        inset === 'self' &&
          entitySurfaceVariants({
            density: DETAIL_ENTITY_ROW_DENSITY,
            edges: disclosureEdges,
            leadingUtilityCount: 1,
          }),
        className,
      )}
    >
      <div className={detailEntityRowDisclosureRowVariants({ inset })}>
        <DetailEntityRowIdentity
          heading={heading}
          headingHref={headingHref}
          classification={classification}
          subheading={subheading}
          metadata={metadata}
          leadingMedia={leadingMedia}
          trailing={trailing}
          leadingUtilities={[
            <DetailEntityRowDisclosureUtility
              key="disclosure-utility"
              disclosure={disclosure}
              collapsed={collapsed}
              contentId={contentId}
              onToggle={() => setCollapsed((current) => !current)}
            />,
          ]}
        />
      </div>
      {disclosure.mode === 'expandable' && !collapsed ? (
        <div id={contentId} className={detailEntityRowDisclosureContentVariants({ inset })}>
          <div className="dash-entity-surface__disclosure-preview-offset">
            <div className={detailEntityRowDisclosurePreviewGroupVariants()}>
              {disclosure.content}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
