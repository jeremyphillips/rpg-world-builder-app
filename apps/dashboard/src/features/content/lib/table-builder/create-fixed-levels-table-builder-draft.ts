import {
  createTableBuilderColumnKey,
  createTableBuilderRowKey,
  type TableBuilderColumnDraft,
  type TableBuilderFormValues,
} from './table-builder-draft'
import type { TableBuilderHostConfig } from './table-builder-host-config'
import { resolveTableBuilderRecommendedKind } from './table-builder-host-config'

export function createFixedColumnsDraft(
  fixedColumns: readonly Pick<TableBuilderColumnDraft, 'label' | 'valueType' | 'format'>[],
): TableBuilderColumnDraft[] {
  return fixedColumns.map((column) => ({
    key: createTableBuilderColumnKey(),
    label: column.label,
    valueType: column.valueType,
    format: column.format ?? 'plain',
  }))
}

export function createFixedLevelsTableBuilderDraft(
  config: TableBuilderHostConfig,
  options: {
    name: string
    seedRowCells?: (level: number, columnKey: string) => string | undefined
  },
): TableBuilderFormValues {
  const kind = resolveTableBuilderRecommendedKind(config)
  const columns = createFixedColumnsDraft(config.fixedColumns ?? [])
  const allowedLevels = config.allowedLevels ?? []

  return {
    kind,
    name: options.name,
    columns,
    rows: allowedLevels.map((level) => ({
      key: createTableBuilderRowKey(),
      level: String(level),
      cells: Object.fromEntries(
        columns.map((column) => {
          const seeded = options.seedRowCells?.(level, column.key)
          return [column.key, seeded === undefined ? undefined : seeded]
        }),
      ),
    })),
  }
}
