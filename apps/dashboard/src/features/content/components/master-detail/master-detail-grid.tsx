import type { ReactNode } from 'react'

export interface MasterDetailGridProps {
  children: ReactNode
}

/** Standard two-column master-detail layout: list rail + detail column. */
export function MasterDetailGrid({ children }: MasterDetailGridProps) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{children}</div>
}
