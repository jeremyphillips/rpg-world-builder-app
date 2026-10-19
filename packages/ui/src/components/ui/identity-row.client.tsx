'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

import {
  identityRowClassificationVariants,
  identityRowEntityCompactMetaVariants,
  identityRowHeadingClusterVariants,
  identityRowHeadingEndVariants,
  identityRowHeadingLineVariants,
  identityRowHeadingVariants,
  identityRowRootVariants,
  identityRowStackVariants,
  identityRowStatusVariants,
  identityRowSupportingVariants,
  type IdentityRowDensity,
} from './identity-row.variants'
import { InlineMetadata } from './inline-metadata'

export type { IdentityRowDensity } from './identity-row.variants'

/** Compact entity cards: 14px title, 12px classification, dot, and title-line end text. */
export type IdentityRowHeadingRecipe = 'entity-compact'

export type IdentityRowProps = {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  supporting?: ReactNode
  supportingWrap?: boolean
  /** End of the heading line. Not status copy, which stays under supporting text. */
  headingEnd?: ReactNode
  status?: ReactNode
  /** `flush` matches supporting-line spacing. Badges keep the default offset. */
  statusSpacing?: 'offset' | 'flush'
  /** Sets the canonical copy pair on this row. Omit to inherit from the surface. */
  density?: IdentityRowDensity
  className?: string
}

function isPresent(value: ReactNode | undefined): value is ReactNode {
  return value != null && value !== '' && value !== false
}

function classificationParts(classification?: ReactNode | readonly ReactNode[]): ReactNode[] {
  if (classification == null || classification === '' || classification === false) {
    return []
  }
  if (Array.isArray(classification)) {
    return classification.filter(isPresent)
  }
  return [classification]
}

function IdentityRowHeadingContent({
  heading,
  classification,
  headingInline,
  recipe,
}: {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  headingInline?: ReactNode
  recipe?: IdentityRowHeadingRecipe
}) {
  const showHeading = isPresent(heading)
  const showHeadingInline = isPresent(headingInline)
  const parts = classificationParts(classification)

  if (!showHeading && parts.length === 0) {
    return null
  }

  if (!showHeading && parts.length === 1) {
    return <span className={identityRowClassificationVariants()}>{parts[0]}</span>
  }

  return (
    <InlineMetadata
      role="heading"
      density="compact"
      wrap={false}
      separatorSize={recipe === 'entity-compact' ? 'xs' : undefined}
      className={recipe === 'entity-compact' ? identityRowEntityCompactMetaVariants() : 'min-w-0'}
    >
      {showHeading ? (
        showHeadingInline ? (
          <InlineMetadata.Item className="flex min-w-0 items-center gap-1">
            <span className={cn(identityRowHeadingVariants(), 'min-w-0 truncate')}>{heading}</span>
            <span className="shrink-0 self-center" data-heading-inline="">
              {headingInline}
            </span>
          </InlineMetadata.Item>
        ) : (
          <InlineMetadata.Item truncate className={identityRowHeadingVariants()}>
            {heading}
          </InlineMetadata.Item>
        )
      ) : null}
      {parts.map((part, index) => (
        <InlineMetadata.Item key={index} className={identityRowClassificationVariants()}>
          {part}
        </InlineMetadata.Item>
      ))}
    </InlineMetadata>
  )
}

export type IdentityRowHeadingLineProps = {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  headingEnd?: ReactNode
  /** Intrinsic-width slot immediately after the title (not `headingEnd`). */
  headingInline?: ReactNode
  /**
   * Compact entity title line. Classification uses the supporting size.
   * Title size still comes from the surrounding density.
   */
  recipe?: IdentityRowHeadingRecipe
}

/** Heading + classification line — row-track hosts place it in their band cell. */
export function IdentityRowHeadingLine({
  heading,
  classification,
  headingEnd,
  headingInline,
  recipe,
}: IdentityRowHeadingLineProps) {
  const content = (
    <IdentityRowHeadingContent
      heading={heading}
      classification={classification}
      headingInline={headingInline}
      recipe={recipe}
    />
  )
  const showHeadingEnd = isPresent(headingEnd)

  return (
    <div className={identityRowHeadingLineVariants()}>
      {showHeadingEnd ? (
        <div className={identityRowHeadingClusterVariants()}>{content}</div>
      ) : (
        content
      )}
      {showHeadingEnd ? (
        <span className={identityRowHeadingEndVariants()}>{headingEnd}</span>
      ) : null}
    </div>
  )
}

export type IdentityRowSupportingProps = {
  children: ReactNode
  wrap?: boolean
}

/** Supporting copy line — row-track hosts place it in their meta cell. */
export function IdentityRowSupporting({ children, wrap = false }: IdentityRowSupportingProps) {
  return <div className={identityRowSupportingVariants({ wrap })}>{children}</div>
}

/** Shared compact entity identity — heading truncates; classification stays shrink-0 on the first line. */
export function IdentityRow({
  heading,
  classification,
  supporting,
  supportingWrap = false,
  headingEnd,
  status,
  statusSpacing = 'offset',
  density,
  className,
}: IdentityRowProps) {
  const showHeadingLine = isPresent(heading) || classificationParts(classification).length > 0
  const showSupporting = isPresent(supporting)
  const showStatus = isPresent(status)

  if (!showHeadingLine && !showSupporting && !showStatus) {
    return null
  }

  return (
    <div className={cn(identityRowRootVariants({ density }), className)}>
      <div className={identityRowStackVariants()}>
        {showHeadingLine ? (
          <IdentityRowHeadingLine
            heading={heading}
            classification={classification}
            headingEnd={headingEnd}
          />
        ) : null}
        {showSupporting ? (
          <IdentityRowSupporting wrap={supportingWrap}>{supporting}</IdentityRowSupporting>
        ) : null}
        {showStatus ? (
          <div className={identityRowStatusVariants({ spacing: statusSpacing })}>{status}</div>
        ) : null}
      </div>
    </div>
  )
}
