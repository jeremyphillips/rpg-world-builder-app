import { dataTableUnavailableAppearance } from '@rpg/ui'

export function overviewUnavailableRowClassName(isAvailable: boolean): string | undefined {
  return dataTableUnavailableAppearance(!isAvailable).rowClassName
}

export function overviewUnavailableNameCellClassName(
  isAvailable: boolean,
  columnId: string,
  nameColumnId = 'label',
): string | undefined {
  if (isAvailable) return undefined
  if (columnId !== nameColumnId) return undefined
  return dataTableUnavailableAppearance(true).nameCellRailClassName
}
