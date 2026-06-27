import { Link } from 'react-router-dom'
import type { BadgeProps, ColumnDef, DataTableColumnWidth } from '@rpg/ui'
import {
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
  NameCell,
  SortableHeader,
  TableBadgeCell,
} from '@rpg/ui'

/** Domain badge map for `buildSourceColumn` — variant + label per enum value. */
export type SourceBadgeMap<T extends string> = Record<
  T,
  { variant: NonNullable<BadgeProps['variant']>; label: string }
>

/** Applies the data column tone to each column unless overridden in `meta`. */
export function stampDataColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return columns.map((col) => ({
    ...col,
    meta: { ...dataTableColumnMeta.data, ...col.meta },
  }))
}

/** Merges a fixed-width preset into a column def's meta. */
export function withColumnWidth<T>(
  column: ColumnDef<T>,
  width: DataTableColumnWidth,
): ColumnDef<T> {
  return {
    ...column,
    meta: { ...column.meta, ...dataTableWidthMeta(width) },
  }
}

export type BuildNameColumnOptions<T> = {
  accessorKey: string
  label?: string
  locked?: boolean
  nameHref?: (row: T) => string
}

/** Shared sortable identity (name/label) column for catalog tables. */
export function buildNameColumn<T>({
  accessorKey,
  label = 'Name',
  locked = false,
  nameHref,
}: BuildNameColumnOptions<T>): ColumnDef<T> {
  return {
    accessorKey,
    header: ({ column }) => <SortableHeader column={column}>{label}</SortableHeader>,
    cell: nameHref
      ? ({ row }) => (
          <Link to={nameHref(row.original)} className={dataTableNameLinkCellVariants()}>
            {row.getValue<string>(accessorKey)}
          </Link>
        )
      : ({ row }) => <NameCell>{row.getValue<string>(accessorKey)}</NameCell>,
    enableHiding: locked ? false : undefined,
    meta: {
      ...dataTableColumnMeta.identity,
      label,
      ...(locked ? { locked: true as const } : {}),
    },
  }
}

export type BuildSourceColumnOptions<S extends string> = {
  badgeMap: SourceBadgeMap<S>
  accessorKey?: string
  label?: string
  width?: DataTableColumnWidth
}

/** Shared source column with compact badge cell for catalog tables. */
export function buildSourceColumn<T, S extends string>({
  badgeMap,
  accessorKey = 'source',
  label = 'Source',
  width = 'compact',
}: BuildSourceColumnOptions<S>): ColumnDef<T> {
  return {
    accessorKey,
    header: label,
    cell: ({ row }) => {
      const source = row.getValue<S>(accessorKey)
      const { variant, label: badgeLabel } = badgeMap[source]
      return <TableBadgeCell variant={variant}>{badgeLabel}</TableBadgeCell>
    },
    enableSorting: false,
    meta: { ...dataTableColumnMeta.source, ...dataTableWidthMeta(width), label },
  }
}
