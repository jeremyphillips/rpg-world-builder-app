'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
import {
  DataTable,
  DataTableUtilityBar,
  type ColumnDef,
  type DataTableEmptyStateContext,
  type DataTableProps,
  type DataTableUtilityControls,
} from '@rpg/ui'

import { OVERVIEW_SELECTION_COLUMN_INSET } from './overview-selection-cluster.client'

type OverviewTableFrameSelectionProps<TData> = Pick<
  DataTableProps<TData>,
  | 'enableRowSelection'
  | 'rowSelection'
  | 'onRowSelectionChange'
  | 'onRowSelectionStateChange'
  | 'selectionLabels'
  | 'getRowCanSelect'
  | 'rowSelectionDescribedBy'
>

export type OverviewTableFrameProps<TData extends { id: string }> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  caption?: string
  emptyState?: ReactNode | ((context: DataTableEmptyStateContext<TData>) => ReactNode)
  rowActions?: (row: TData) => ReactNode
  getRowClassName?: DataTableProps<TData>['getRowClassName']
  getCellClassName?: DataTableProps<TData>['getCellClassName']
  defaultPageSize?: number
  initialColumnVisibility?: DataTableProps<TData>['initialColumnVisibility']
  initialColumnOrder?: DataTableProps<TData>['initialColumnOrder']
  onColumnChange?: DataTableProps<TData>['onColumnChange']
  filterRegion?: ReactNode
  resultSummary?: ReactNode
  leadingActions?: ReactNode | ((controls: DataTableUtilityControls<TData>) => ReactNode)
  trailingActions?: (controls: DataTableUtilityControls<TData>) => ReactNode
  /** When true, inset leading actions to align with the selection checkbox column. */
  selectionModeActive?: boolean
  /** Replaces slot-based utility chrome when policy shells need a custom strip layout. */
  utilityStrip?: (controls: DataTableUtilityControls<TData>) => ReactNode
} & OverviewTableFrameSelectionProps<TData>

/** Neutral overview table chrome — filter region above the table, utility bar inside the card. */
export function OverviewTableFrame<TData extends { id: string }>({
  columns,
  data,
  caption,
  emptyState,
  rowActions,
  getRowClassName,
  getCellClassName,
  defaultPageSize,
  initialColumnVisibility,
  initialColumnOrder,
  onColumnChange,
  filterRegion,
  resultSummary,
  leadingActions,
  trailingActions,
  selectionModeActive = false,
  utilityStrip: utilityStripOverride,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  onRowSelectionStateChange,
  selectionLabels,
  getRowCanSelect,
  rowSelectionDescribedBy,
}: OverviewTableFrameProps<TData>) {
  const resolvedEmptyState = useMemo(
    () =>
      typeof emptyState === 'function'
        ? (context: DataTableEmptyStateContext<TData>) => emptyState(context)
        : emptyState
          ? () => emptyState
          : undefined,
    [emptyState],
  )

  const renderSlotUtilityStrip = useCallback(
    (controls: DataTableUtilityControls<TData>) => {
      const resolvedLeadingActions =
        typeof leadingActions === 'function' ? leadingActions(controls) : leadingActions

      return (
        <DataTableUtilityBar
          summary={resultSummary}
          leadingActions={resolvedLeadingActions}
          trailingActions={trailingActions?.(controls)}
          leadingInset={selectionModeActive ? OVERVIEW_SELECTION_COLUMN_INSET : undefined}
        />
      )
    },
    [leadingActions, resultSummary, selectionModeActive, trailingActions],
  )

  const renderUtilityStrip = utilityStripOverride ?? renderSlotUtilityStrip

  const hasUtilityStrip = Boolean(
    utilityStripOverride || resultSummary || leadingActions || trailingActions,
  )

  return (
    <div className="flex flex-col gap-3">
      {filterRegion}
      <DataTable
        columns={columns}
        data={data}
        defaultPageSize={defaultPageSize}
        initialColumnVisibility={initialColumnVisibility}
        initialColumnOrder={initialColumnOrder}
        onColumnChange={onColumnChange}
        rowActions={rowActions}
        caption={caption}
        emptyState={resolvedEmptyState}
        getRowClassName={getRowClassName}
        getCellClassName={getCellClassName}
        utilityStrip={hasUtilityStrip ? renderUtilityStrip : undefined}
        enableRowSelection={enableRowSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        onRowSelectionStateChange={onRowSelectionStateChange}
        selectionLabels={selectionLabels}
        getRowCanSelect={getRowCanSelect}
        rowSelectionDescribedBy={rowSelectionDescribedBy}
        getRowId={(row) => row.id}
      />
    </div>
  )
}
