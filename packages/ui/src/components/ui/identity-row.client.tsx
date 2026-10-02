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
  identityRowSeparatorVariants,
  identityRowStackVariants,
  identityRowStatusVariants,
  identityRowSupportingVariants,
  type IdentityRowSize,
} from './identity-row.variants'

export type { IdentityRowSize } from './identity-row.variants'

export type IdentityRowProps = {
  heading?: ReactNode
  classification?: ReactNode
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

function hasHeadingLine(heading: ReactNode | undefined, classification: ReactNode | undefined) {
  return isPresent(classification) || isPresent(heading)
}

function IdentityRowHeadingContent({
  heading,
  classification,
  size,
}: {
  heading?: ReactNode
  classification?: ReactNode
  size: IdentityRowSize
}) {
  const showHeading = isPresent(heading)
  const showClassification = isPresent(classification)

  return (
    <>
      {showHeading ? <span className={identityRowHeadingVariants({ size })}>{heading}</span> : null}
      {showClassification ? (
        <>
          {showHeading ? (
            <span className={identityRowSeparatorVariants({ size })} aria-hidden>
              {' · '}
            </span>
          ) : null}
          <span className={identityRowClassificationVariants({ size })}>{classification}</span>
        </>
      ) : null}
    </>
  )
}

function IdentityRowHeadingLine({
  heading,
  classification,
  headingEnd,
  size,
}: {
  heading?: ReactNode
  classification?: ReactNode
  headingEnd?: ReactNode
  size: IdentityRowSize
}) {
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
  const showHeadingLine = hasHeadingLine(heading, classification)
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
          <div className={identityRowSupportingVariants({ size, wrap: supportingWrap })}>
            {supporting}
          </div>
        ) : null}
        {showStatus ? <div className={identityRowStatusVariants()}>{status}</div> : null}
      </div>
    </div>
  )
}
