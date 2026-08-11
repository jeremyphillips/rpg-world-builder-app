'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
  buildCollapsibleListItemLeadingChromeStyle,
  cn,
  ContentCardHeading,
  contentCardHeadingLinkVariants,
} from '@rpg/ui'

import {
  detailEntityRowContentVariants,
  detailEntityRowDisclosureButtonColumnClasses,
  detailEntityRowDisclosureButtonVariants,
  detailEntityRowDisclosureContentVariants,
  detailEntityRowDisclosureIdentityVariants,
  detailEntityRowDisclosureItemVariants,
  detailEntityRowDisclosurePreviewGroupVariants,
  detailEntityRowDisclosureRowVariants,
  detailEntityRowSubheadingVariants,
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

const DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE = buildCollapsibleListItemLeadingChromeStyle({
  showDragHandle: false,
  collapsible: true,
})

function DetailEntityRowIdentity({
  heading,
  href,
  headingSuffix,
  subheading,
  metadata,
}: Pick<DetailEntityRowProps, 'heading' | 'href' | 'headingSuffix' | 'subheading' | 'metadata'>) {
  const resolvedHeading = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  return (
    <div className={detailEntityRowContentVariants()}>
      <ContentCardHeading
        heading={resolvedHeading}
        headingSuffix={headingSuffix}
        density="compact"
      />
      {subheading ? <p className={detailEntityRowSubheadingVariants()}>{subheading}</p> : null}
      {metadata ? <div className={detailEntityRowSubheadingVariants()}>{metadata}</div> : null}
    </div>
  )
}

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
        />
        {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
      </div>
    )
  }

  return (
    <div
      className={cn(detailEntityRowDisclosureItemVariants(), className)}
      style={DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE}
    >
      <div className={detailEntityRowDisclosureRowVariants({ inset })}>
        <div className={detailEntityRowDisclosureIdentityVariants()}>
          <DetailEntityRowDisclosureColumn
            disclosure={disclosure}
            collapsed={collapsed}
            contentId={contentId}
            onToggle={() => setCollapsed((current) => !current)}
          />
          <DetailEntityRowIdentity
            heading={heading}
            href={href}
            headingSuffix={headingSuffix}
            subheading={subheading}
            metadata={metadata}
          />
        </div>
        {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
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
