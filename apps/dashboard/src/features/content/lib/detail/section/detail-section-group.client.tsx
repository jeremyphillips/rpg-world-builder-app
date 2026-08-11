'use client'

import type { ReactNode } from 'react'

import { cn, Eyebrow } from '@rpg/ui'

import {
  detailSectionGroupHeaderVariants,
  detailSectionGroupVariants,
} from './detail-section-group.variants'

export type DetailSectionGroupProps = {
  label?: string
  endSlot?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Detail-page subgroup shell: optional muted eyebrow label + bordered/padded body.
 * Owns inter-group `border-b` rhythm. Intra-group row dividers stay on `DetailSectionRowList`.
 */
export function DetailSectionGroup({
  label,
  endSlot,
  children,
  className,
}: DetailSectionGroupProps) {
  const showHeader = Boolean(label || endSlot)

  return (
    <div className={cn(detailSectionGroupVariants(), className)}>
      {showHeader ? (
        <div className={detailSectionGroupHeaderVariants()}>
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
