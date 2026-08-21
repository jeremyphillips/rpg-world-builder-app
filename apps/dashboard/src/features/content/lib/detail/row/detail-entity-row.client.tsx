'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { EntityItemAnatomy } from '../../entity/item/entity-item.client'
import type { EntityItemTrailing } from '../../entity/item/entity-item-trailing.types'
import { buildEntityContentOffsetStyle } from '../../entity/item/entity-leading-rail.lib'
import { projectEntitySummaryModel } from '../../entity/summary/entity-summary-projection.lib'
import type { EntitySummaryStatusItem } from '../../entity/summary/entity-summary-status.types'
import { entitySurfaceInsetVariants } from '../../entity/surfaces/entity-surface-inset.variants'
import {
  detailEntityRowDisclosureButtonVariants,
  detailEntityRowDisclosureContentVariants,
  detailEntityRowDisclosureItemVariants,
  detailEntityRowDisclosurePreviewOffsetVariants,
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
  /** Muted classification text rendered inline after the heading (includes leading separator). */
  headingSuffix?: ReactNode
  subheading?: ReactNode
  metadata?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  trailing?: EntityItemTrailing
  inset?: 'self' | 'parent'
  disclosure?: DetailEntityRowDisclosure
  className?: string
}

const DETAIL_ENTITY_ROW_DENSITY = 'compact' as const

const DETAIL_ENTITY_ROW_DISCLOSURE_OFFSET_STYLE = buildEntityContentOffsetStyle({
  count: 1,
  density: DETAIL_ENTITY_ROW_DENSITY,
})

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
        <ChevronDown
          className={cn('transition-transform', collapsed && '-rotate-90')}
          aria-hidden
        />
      </button>
    )
  }

  return <span className="block size-control-action-compact" aria-hidden />
}

function DetailEntityRowIdentity(
  props: Pick<
    DetailEntityRowProps,
    'heading' | 'headingHref' | 'headingSuffix' | 'subheading' | 'metadata' | 'trailing'
  > & {
    leadingUtilities?: readonly ReactNode[]
  },
) {
  const { heading, headingHref, headingSuffix, subheading, metadata, trailing, leadingUtilities } =
    props

  return (
    <EntityItemAnatomy
      entity={projectEntitySummaryModel({
        heading,
        classification: headingSuffix,
        description: subheading,
        status: metadata,
      })}
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
  headingSuffix,
  subheading,
  metadata,
  trailing,
  inset = 'self',
  disclosure,
  className,
}: DetailEntityRowProps) {
  const contentId = useId()
  const [collapsed, setCollapsed] = useState(true)

  if (!disclosure) {
    return (
      <div className={cn(detailEntityRowVariants({ inset }), className)}>
        <DetailEntityRowIdentity
          heading={heading}
          headingHref={headingHref}
          headingSuffix={headingSuffix}
          subheading={subheading}
          metadata={metadata}
          trailing={trailing}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        detailEntityRowDisclosureItemVariants(),
        inset === 'self' &&
          entitySurfaceInsetVariants({ density: DETAIL_ENTITY_ROW_DENSITY, leading: true }),
        className,
      )}
      style={DETAIL_ENTITY_ROW_DISCLOSURE_OFFSET_STYLE}
    >
      <div className={detailEntityRowDisclosureRowVariants({ inset })}>
        <DetailEntityRowIdentity
          heading={heading}
          headingHref={headingHref}
          headingSuffix={headingSuffix}
          subheading={subheading}
          metadata={metadata}
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
          <div className={detailEntityRowDisclosurePreviewOffsetVariants()}>
            <div className={detailEntityRowDisclosurePreviewGroupVariants()}>
              {disclosure.content}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
