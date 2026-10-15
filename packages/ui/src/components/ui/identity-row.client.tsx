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
  type IdentityRowSize,
} from './identity-row.variants'
import { InlineMetadata } from './inline-metadata'

export type { IdentityRowSize } from './identity-row.variants'

/** Compact entity cards: 14px title, 12px classification, dot, and title-line end text. */
export type IdentityRowHeadingRecipe = 'entity-compact'

function resolveIdentityRowHeadingScale(
  size: IdentityRowSize,
  recipe?: IdentityRowHeadingRecipe,
): { title: IdentityRowSize; classification: IdentityRowSize } {
  if (recipe === 'entity-compact') {
    return { title: 'md', classification: 'sm' }
  }
  return { title: size, classification: size }
}

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
  size?: IdentityRowSize
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
  size,
  recipe,
}: {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  size: IdentityRowSize
  recipe?: IdentityRowHeadingRecipe
}) {
  const showHeading = isPresent(heading)
  const parts = classificationParts(classification)
  const scale = resolveIdentityRowHeadingScale(size, recipe)

  if (!showHeading && parts.length === 0) {
    return null
  }

  if (!showHeading && parts.length === 1) {
    return (
      <span className={identityRowClassificationVariants({ size: scale.classification })}>
        {parts[0]}
      </span>
    )
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
        <InlineMetadata.Item truncate className={identityRowHeadingVariants({ size: scale.title })}>
          {heading}
        </InlineMetadata.Item>
      ) : null}
      {parts.map((part, index) => (
        <InlineMetadata.Item
          key={index}
          className={identityRowClassificationVariants({ size: scale.classification })}
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
  /**
   * Closed compact-card scale. Title stays 14px; classification, its dot, and
   * `headingEnd` stay 12px. List rows omit this and keep one shared `size`.
   */
  recipe?: IdentityRowHeadingRecipe
}

/** Heading + classification line — row-track hosts place it in their band cell. */
export function IdentityRowHeadingLine({
  heading,
  classification,
  headingEnd,
  size = 'md',
  recipe,
}: IdentityRowHeadingLineProps) {
  const content = (
    <IdentityRowHeadingContent
      heading={heading}
      classification={classification}
      size={size}
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
  size?: IdentityRowSize
  wrap?: boolean
}

/** Supporting copy line — row-track hosts place it in their meta cell. */
export function IdentityRowSupporting({
  children,
  size = 'md',
  wrap = false,
}: IdentityRowSupportingProps) {
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
  statusSpacing = 'offset',
  size = 'md',
  className,
}: IdentityRowProps) {
  const showHeadingLine = isPresent(heading) || classificationParts(classification).length > 0
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
        {showStatus ? (
          <div className={identityRowStatusVariants({ spacing: statusSpacing })}>{status}</div>
        ) : null}
      </div>
    </div>
  )
}
