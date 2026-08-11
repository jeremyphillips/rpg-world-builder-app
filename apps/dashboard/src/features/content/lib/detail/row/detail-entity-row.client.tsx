'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { buildCollapsibleListItemLeadingChromeStyle, cn } from '@rpg/ui'

import { EntityItemAnatomy } from '../../entity/entity-item.client'
import { projectEntitySummaryModel } from '../../entity/entity-summary-projection.lib'
import {
  detailEntityRowDisclosureButtonColumnClasses,
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
  href?: string
  /** Muted classification text rendered inline after the heading (includes leading separator). */
  headingSuffix?: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  endSlot?: ReactNode
  inset?: 'self' | 'parent'
  disclosure?: DetailEntityRowDisclosure
  className?: string
}

const DETAIL_ENTITY_ROW_DENSITY = 'compact' as const

const DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE = buildCollapsibleListItemLeadingChromeStyle({
  showDragHandle: false,
  collapsible: true,
})

function DetailEntityRowDisclosureColumn({
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
      <div className={detailEntityRowDisclosureButtonColumnClasses}>
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
      </div>
    )
  }

  return (
    <div className={detailEntityRowDisclosureButtonColumnClasses} aria-hidden>
      <span className="block size-control-action-compact" />
    </div>
  )
}

function DetailEntityRowIdentity(
  props: Pick<
    DetailEntityRowProps,
    'heading' | 'href' | 'headingSuffix' | 'subheading' | 'metadata' | 'endSlot'
  > & {
    leading?: ReactNode
  },
) {
  const { heading, href, headingSuffix, subheading, metadata, endSlot, leading } = props

  return (
    <EntityItemAnatomy
      entity={projectEntitySummaryModel({
        heading,
        classification: headingSuffix,
        description: subheading,
        status: metadata,
      })}
      href={href}
      leading={leading}
      action={endSlot}
      density={DETAIL_ENTITY_ROW_DENSITY}
    />
  )
}

export function DetailEntityRow({
  heading,
  href,
  headingSuffix,
  subheading,
  metadata,
  endSlot,
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
          href={href}
          headingSuffix={headingSuffix}
          subheading={subheading}
          metadata={metadata}
          endSlot={endSlot}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(detailEntityRowDisclosureItemVariants(), className)}
      style={DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE}
    >
      <div className={detailEntityRowDisclosureRowVariants({ inset })}>
        <DetailEntityRowIdentity
          heading={heading}
          href={href}
          headingSuffix={headingSuffix}
          subheading={subheading}
          metadata={metadata}
          endSlot={endSlot}
          leading={
            <DetailEntityRowDisclosureColumn
              disclosure={disclosure}
              collapsed={collapsed}
              contentId={contentId}
              onToggle={() => setCollapsed((current) => !current)}
            />
          }
        />
      </div>
      {disclosure.mode === 'expandable' && !collapsed ? (
        <div id={contentId} className={detailEntityRowDisclosureContentVariants()}>
          <div className={detailEntityRowDisclosurePreviewGroupVariants()}>
            {disclosure.content}
          </div>
        </div>
      ) : null}
    </div>
  )
}
