import {
  fixedLevelsTableBuilderFormSchema,
  tableBuilderFormSchema,
} from './table-builder-form-schema'
import type { TableBuilderHostConfig } from './table-builder-host-config'

export function resolveTableBuilderFormSchema(config: TableBuilderHostConfig) {
  if (config.rows === 'fixedLevels') {
    return fixedLevelsTableBuilderFormSchema
  }
  return tableBuilderFormSchema
}
