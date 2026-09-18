import { createContext, useContext, type ReactNode } from 'react'

import type { TableBuilderHostConfig } from './table-builder-host-config'

const DEFAULT_TABLE_BUILDER_HOST_CONFIG = {
  allowedKinds: ['levelProgression'],
} as const satisfies TableBuilderHostConfig

const TableBuilderHostConfigContext = createContext<TableBuilderHostConfig>(
  DEFAULT_TABLE_BUILDER_HOST_CONFIG,
)

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

export function useTableBuilderHostConfig(): TableBuilderHostConfig {
  return useContext(TableBuilderHostConfigContext)
}
