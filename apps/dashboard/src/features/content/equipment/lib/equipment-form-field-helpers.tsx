import { formatSpeedRate, type SpeedRate } from '@rpg/contracts'
import { SortableHeader, type ColumnDef } from '@rpg/ui'

/** Maps vocabulary entry records (`{ label }`) to option label maps for `toOptions`. */
export function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

/** Shared speed column for mount and vehicle equipment tables. */
export function equipmentSpeedColumn<T extends { speed: SpeedRate }>(): ColumnDef<T> {
  return {
    id: 'speed',
    accessorFn: (row) => row.speed.value,
    header: ({ column }) => <SortableHeader column={column}>Speed</SortableHeader>,
    cell: ({ row }) => formatSpeedRate(row.original.speed),
    meta: { label: 'Speed' },
  }
}
