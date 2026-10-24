import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

export type DetailCollectionFlushItemStackProps = {
  children: ReactNode
  className?: string
}

/** Full-bleed stack container — pair with `ContentDetailSection` `bodyLayout="flush"`. */
export function DetailCollectionFlushItemStack({
  children,
  className,
}: DetailCollectionFlushItemStackProps) {
  return <div className={cn('pt-4', className)}>{children}</div>
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
    <div
      className={cn(
        'border-b border-border-subtle px-4 pb-4 mb-4 last:mb-0 last:border-b-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
