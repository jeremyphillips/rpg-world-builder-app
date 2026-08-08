'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

export type DetailSectionRowListProps = {
  children: ReactNode
  className?: string
}

export function DetailSectionRowList({ children, className }: DetailSectionRowListProps) {
  return (
    <div className={cn('[&>*+*]:border-t [&>*+*]:border-border-subtle', className)}>{children}</div>
  )
}
