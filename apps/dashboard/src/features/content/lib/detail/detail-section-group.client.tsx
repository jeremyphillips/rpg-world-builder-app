'use client'

import type { ReactNode } from 'react'

import { cn, Eyebrow } from '@rpg/ui'

import { detailSectionGroupVariants } from './detail-section-group.variants'

export type DetailSectionGroupProps = {
  label?: string
  children: ReactNode
  className?: string
}

/**
 * Detail-page subgroup shell: optional muted eyebrow label + bordered/padded body.
 * Owns inter-group `border-b` rhythm. Intra-group row dividers stay on `DetailSectionRowList`.
 */
export function DetailSectionGroup({ label, children, className }: DetailSectionGroupProps) {
  return (
    <div className={cn(detailSectionGroupVariants(), className)}>
      {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
      {children}
    </div>
  )
}
