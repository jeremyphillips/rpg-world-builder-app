import { dataTableRowUnavailableRailVariants, dataTableRowUnavailableVariants } from '@rpg/ui'

export { dataTableRowUnavailableVariants, dataTableRowUnavailableRailVariants }

export function overviewUnavailableRowClassName(isAvailable: boolean): string | undefined {
  return isAvailable ? undefined : dataTableRowUnavailableVariants()
}

export function overviewUnavailableNameCellClassName(
  isAvailable: boolean,
  columnId: string,
  nameColumnId = 'label',
): string | undefined {
  if (isAvailable) return undefined
  if (columnId !== nameColumnId) return undefined
  return dataTableRowUnavailableRailVariants()
}
