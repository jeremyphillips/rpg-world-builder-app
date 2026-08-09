'use client'

import type { ReactNode } from 'react'

import { DetailSectionGroup } from '../detail/detail-section-group.client'

export type RelationshipFieldGroupRowProps = {
  eyebrow?: string
  endSlot?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Typed-edge alias for {@link DetailSectionGroup}.
 * Keeps the `eyebrow` prop name for relationship call sites; layout/typography live on the detail primitive.
 */
export function RelationshipFieldGroupRow({
  eyebrow,
  endSlot,
  children,
  className,
}: RelationshipFieldGroupRowProps) {
  return (
    <DetailSectionGroup label={eyebrow} endSlot={endSlot} className={className}>
      {children}
    </DetailSectionGroup>
  )
}
