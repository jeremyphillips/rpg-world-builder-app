import type { ReactNode } from 'react'

import type { TableBuilderHostConfig } from './table-builder-host-config'
import { TableBuilderHostConfigContext } from './use-table-builder-host-config'

export function TableBuilderHostConfigProvider({
  config,
  children,
}: {
  config: TableBuilderHostConfig
  children: ReactNode
}) {
  return (
    <TableBuilderHostConfigContext.Provider value={config}>
      {children}
    </TableBuilderHostConfigContext.Provider>
  )
}
