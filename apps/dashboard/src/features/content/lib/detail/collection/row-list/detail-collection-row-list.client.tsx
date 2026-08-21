'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { detailCollectionRecordSeparatorVariants } from '../detail-collection-chrome.variants'
import {
  detailCollectionRowListStructuralSeparatorVariants,
  type DetailCollectionRowListSeparatorKind,
} from './detail-collection-row-list.variants'

export type DetailCollectionRowListProps = {
  separator: DetailCollectionRowListSeparatorKind
  children: ReactNode
  className?: string
}

function resolveSeparatorVariants(separator: DetailCollectionRowListSeparatorKind) {
  return separator === 'structural'
    ? detailCollectionRowListStructuralSeparatorVariants()
    : detailCollectionRecordSeparatorVariants()
}

export function DetailCollectionRowList({
  separator,
  children,
  className,
}: DetailCollectionRowListProps) {
  return <div className={cn(resolveSeparatorVariants(separator), className)}>{children}</div>
}
