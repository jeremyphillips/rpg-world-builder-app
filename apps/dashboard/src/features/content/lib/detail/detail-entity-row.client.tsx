'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, ContentCardHeading, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE,
  detailEntityRowContentVariants,
  detailEntityRowDisclosureButtonColumnVariants,
  detailEntityRowDisclosureButtonVariants,
  detailEntityRowDisclosureContentVariants,
  detailEntityRowDisclosureIdentityVariants,
  detailEntityRowDisclosureItemVariants,
  detailEntityRowDisclosureRowVariants,
  detailEntityRowSubheadingVariants,
  detailEntityRowVariants,
} from './detail-entity-row.variants'

export type DetailEntityRowDisclosure = {
  /** Semantic target for Show/Hide labels, e.g. "locations in Bar District". */
  label: string
  content: ReactNode
}

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

  const toggleLabel = collapsed ? `Show ${disclosure.label}` : `Hide ${disclosure.label}`

  return (
    <div
      className={cn(detailEntityRowDisclosureItemVariants(), className)}
      style={DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE}
    >
      <div className={detailEntityRowDisclosureRowVariants({ inset })}>
        <div className={detailEntityRowDisclosureIdentityVariants()}>
          <div className={detailEntityRowDisclosureButtonColumnVariants()}>
            <button
              type="button"
              className={detailEntityRowDisclosureButtonVariants()}
              aria-expanded={!collapsed}
              aria-controls={contentId}
              aria-label={toggleLabel}
              onClick={() => setCollapsed((current) => !current)}
            >
              <ChevronDown
                className={cn('size-4 transition-transform', collapsed && '-rotate-90')}
                aria-hidden
              />
            </button>
          </div>
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
      {!collapsed ? (
        <div id={contentId} className={detailEntityRowDisclosureContentVariants()}>
          {disclosure.content}
        </div>
      ) : null}
    </div>
  )
}
