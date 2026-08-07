'use client'

import type { ReactNode } from 'react'

import { cn, Eyebrow } from '@rpg/ui'

import { relationshipFieldGroupRowVariants } from './relationship-field-group-row.variants'

export type RelationshipFieldGroupRowProps = {
  eyebrow: string
  children: ReactNode
  className?: string
}

export function RelationshipFieldGroupRow({
  eyebrow,
  children,
  className,
}: RelationshipFieldGroupRowProps) {
  return (
    <div className={cn(relationshipFieldGroupRowVariants(), className)}>
      <Eyebrow size="sm" className="mb-0">
        {eyebrow}
      </Eyebrow>
      {children}
    </div>
  )
}
