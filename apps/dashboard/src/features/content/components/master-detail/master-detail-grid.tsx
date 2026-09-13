import type { ReactNode } from 'react'

import { masterDetailGridClasses } from './master-detail-grid.variants'

export interface MasterDetailGridProps {
  children: ReactNode
}

/** Standard two-column master-detail layout: 1/3 list rail + 2/3 detail at md+. */
export function MasterDetailGrid({ children }: MasterDetailGridProps) {
  return <div className={masterDetailGridClasses}>{children}</div>
}
