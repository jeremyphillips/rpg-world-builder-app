import type { StatBlockLeadTreatment } from '@rpg/contracts'
import { statBlockLeadSeparator } from '@rpg/contracts'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type StatBlockLeadProps = {
  treatment: StatBlockLeadTreatment
  className?: string
  children: ReactNode
}

/** Presentation for SRD-style stat-block colon lead-ins — styling lives in `stat-block-lead.css`. */
export function StatBlockLead({ treatment, className, children }: StatBlockLeadProps) {
  return (
    <span
      className={cn(
        'stat-block-lead',
        treatment === 'inline' ? 'stat-block-lead--inline' : 'stat-block-lead--paragraph',
        className,
      )}
    >
      {children}
      {statBlockLeadSeparator(treatment)}
    </span>
  )
}
