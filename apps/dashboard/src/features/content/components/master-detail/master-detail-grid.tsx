import type { ReactNode } from 'react'

export interface MasterDetailGridProps {
  children: ReactNode
}

/** Standard two-column master-detail layout: 1/3 list rail + 2/3 detail at md+. */
export function MasterDetailGrid({ children }: MasterDetailGridProps) {
  return (
    <div className="master-detail-grid grid grid-cols-1 items-start gap-6 md:grid-cols-3">
      {children}
    </div>
  )
}
