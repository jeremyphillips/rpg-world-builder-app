import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  detailCollectionFlushItemStackItemVariants,
  detailCollectionFlushItemStackVariants,
} from './detail-collection-flush-item-stack.variants'

export type DetailCollectionFlushItemStackProps = {
  children: ReactNode
  className?: string
}

/** Full-bleed stack container — pair with `ContentDetailSection` `bodyLayout="flush"`. */
export function DetailCollectionFlushItemStack({
  children,
  className,
}: DetailCollectionFlushItemStackProps) {
  return <div className={cn(detailCollectionFlushItemStackVariants(), className)}>{children}</div>
}

export type DetailCollectionFlushItemStackItemProps = {
  children: ReactNode
  className?: string
}

/** Single item in a flush stack — per-item horizontal padding and dividers. */
export function DetailCollectionFlushItemStackItem({
  children,
  className,
}: DetailCollectionFlushItemStackItemProps) {
  return (
    <div className={cn(detailCollectionFlushItemStackItemVariants(), className)}>{children}</div>
  )
}
