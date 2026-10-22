'use client'

import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'

import {
  IDENTITY_ROW_STACK_CLASS,
  identityRowClassificationVariants,
  identityRowHeadingVariants,
  identityRowRootVariants,
  identityRowSupportingVariants,
  type IdentityRowDensity,
} from './identity-row.variants'
import { InlineMetadata } from './inline-metadata'

export type { IdentityRowDensity } from './identity-row.variants'
export { IDENTITY_ROW_STACK_CLASS } from './identity-row.variants'

export type IdentityRowProps = {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  supporting?: ReactNode
  supportingWrap?: boolean
  /** End of the heading line. Not status copy, which stays under supporting text. */
  headingEnd?: ReactNode
  status?: ReactNode
  /** Sets the canonical copy pair on this row. Omit to inherit from the surface. */
  density?: IdentityRowDensity
  className?: string
}

function isPresent(value: ReactNode | undefined): value is ReactNode {
  return value != null && value !== '' && value !== false
}

function isComposableHeading(heading: ReactNode): heading is ReactElement {
  return isValidElement(heading) && heading.type !== Fragment
}

function IdentityRowTitle({ heading, className }: { heading: ReactNode; className: string }) {
  if (isComposableHeading(heading)) {
    return <Slot className={className}>{heading}</Slot>
  }
  return <span className={className}>{heading}</span>
}

const identityRowTitleClassName = cn(identityRowHeadingVariants(), 'min-w-0 truncate')

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
}: {
  heading?: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  headingInline?: ReactNode
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
    <InlineMetadata role="heading" density="compact" wrap={false} className="min-w-0">
      {showHeading ? (
        showHeadingInline ? (
          <InlineMetadata.Item className="flex min-w-0 items-center gap-1">
            <IdentityRowTitle heading={heading} className={identityRowTitleClassName} />
            <span className="shrink-0 self-center" data-heading-inline="">
              {headingInline}
            </span>
          </InlineMetadata.Item>
        ) : (
          <InlineMetadata.Item truncate className={identityRowHeadingVariants()}>
            <IdentityRowTitle heading={heading} className={identityRowTitleClassName} />
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
}

/** Heading + classification line — row-track hosts place it in their band cell. */
export function IdentityRowHeadingLine({
  heading,
  classification,
  headingEnd,
  headingInline,
}: IdentityRowHeadingLineProps) {
  const content = (
    <IdentityRowHeadingContent
      heading={heading}
      classification={classification}
      headingInline={headingInline}
    />
  )
  const showHeadingEnd = isPresent(headingEnd)

  return (
    <div className="flex w-full min-w-0 items-center">
      {showHeadingEnd ? (
        <div className="flex min-w-0 flex-1 items-baseline">{content}</div>
      ) : (
        content
      )}
      {showHeadingEnd ? <span className="shrink-0 text-style-caption">{headingEnd}</span> : null}
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
      <div className={IDENTITY_ROW_STACK_CLASS}>
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
        {showStatus ? <div>{status}</div> : null}
      </div>
    </div>
  )
}
