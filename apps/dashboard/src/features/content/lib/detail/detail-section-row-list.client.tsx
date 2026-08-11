'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  detailRowListSeparatorVariants,
  type DetailRowListSeparatorKind,
} from './detail-row-list.variants'

export type DetailSectionRowListProps = {
  separator: DetailRowListSeparatorKind
  children: ReactNode
  className?: string
}

export function DetailSectionRowList({
  separator,
  children,
  className,
}: DetailSectionRowListProps) {
  return (
    <div className={cn(detailRowListSeparatorVariants({ kind: separator }), className)}>
      {children}
    </div>
  )
}
