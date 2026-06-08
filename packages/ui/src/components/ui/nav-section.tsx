import * as React from 'react'

import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'

export interface NavSectionProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function NavSection({ label, children, className }: NavSectionProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Eyebrow className="px-3 pb-1 pt-3">{label}</Eyebrow>
      {children}
    </div>
  )
}
