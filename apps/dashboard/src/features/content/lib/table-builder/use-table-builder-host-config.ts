import { createContext, useContext } from 'react'

import type { TableBuilderHostConfig } from './table-builder-host-config'

const DEFAULT_TABLE_BUILDER_HOST_CONFIG = {
  allowedKinds: ['levelProgression'],
} as const satisfies TableBuilderHostConfig

export const TableBuilderHostConfigContext = createContext<TableBuilderHostConfig>(
  DEFAULT_TABLE_BUILDER_HOST_CONFIG,
)

export function useTableBuilderHostConfig(): TableBuilderHostConfig {
  return useContext(TableBuilderHostConfigContext)
}
