'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

import {
  identityRowClassificationVariants,
  identityRowHeadingClusterVariants,
  identityRowHeadingEndVariants,
  identityRowHeadingLineVariants,
  identityRowHeadingVariants,
  identityRowRootVariants,
  identityRowStackVariants,
  identityRowStatusVariants,
  identityRowSupportingVariants,
  type IdentityRowSize,
} from './identity-row.variants'
import { InlineMetadata } from './inline-metadata'

export type { IdentityRowSize } from './identity-row.variants'

export type IdentityRowProps = {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  supporting?: ReactNode
  supportingWrap?: boolean
  /** End of the heading line. Not status copy, which stays under supporting text. */
  headingEnd?: ReactNode
  status?: ReactNode
  size?: IdentityRowSize
  className?: string
}

function isPresent(value: ReactNode | undefined): value is ReactNode {
  return value != null && value !== '' && value !== false
}

function classificationParts(
  classification?: ReactNode | readonly ReactNode[],
): ReactNode[] {
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
  size,
}: {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  size: IdentityRowSize
}) {
  const showHeading = isPresent(heading)
  const parts = classificationParts(classification)

  if (!showHeading && parts.length === 0) {
    return null
  }

  if (!showHeading && parts.length === 1) {
    return (
      <span className={identityRowClassificationVariants({ size })}>{parts[0]}</span>
    )
  }

  return (
    <InlineMetadata role="heading" density="compact" wrap={false} className="min-w-0">
      {showHeading ? (
        <InlineMetadata.Item truncate className={identityRowHeadingVariants({ size })}>
          {heading}
        </InlineMetadata.Item>
      ) : null}
      {parts.map((part, index) => (
        <InlineMetadata.Item
          key={index}
          className={identityRowClassificationVariants({ size })}
        >
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
  size?: IdentityRowSize
}

/** Heading + classification line — row-track hosts place it in their band cell. */
export function IdentityRowHeadingLine({
  heading,
  classification,
  headingEnd,
  size = 'md',
}: IdentityRowHeadingLineProps) {
  const content = (
    <IdentityRowHeadingContent heading={heading} classification={classification} size={size} />
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
  size?: IdentityRowSize
  wrap?: boolean
}

/** Supporting copy line — row-track hosts place it in their meta cell. */
export function IdentityRowSupporting({ children, size = 'md', wrap = false }: IdentityRowSupportingProps) {
  return <div className={identityRowSupportingVariants({ size, wrap })}>{children}</div>
}

/** Shared compact entity identity — heading truncates; classification stays shrink-0 on the first line. */
export function IdentityRow({
  heading,
  classification,
  supporting,
  supportingWrap = false,
  headingEnd,
  status,
  size = 'md',
  className,
}: IdentityRowProps) {
  const showHeadingLine =
    isPresent(heading) || classificationParts(classification).length > 0
  const showSupporting = isPresent(supporting)
  const showStatus = isPresent(status)

  if (!showHeadingLine && !showSupporting && !showStatus) {
    return null
  }

  return (
    <div className={cn(identityRowRootVariants(), className)}>
      <div className={identityRowStackVariants({ size })}>
        {showHeadingLine ? (
          <IdentityRowHeadingLine
            heading={heading}
            classification={classification}
            headingEnd={headingEnd}
            size={size}
          />
        ) : null}
        {showSupporting ? (
          <IdentityRowSupporting size={size} wrap={supportingWrap}>
            {supporting}
          </IdentityRowSupporting>
        ) : null}
        {showStatus ? <div className={identityRowStatusVariants()}>{status}</div> : null}
      </div>
    </div>
  )
}
