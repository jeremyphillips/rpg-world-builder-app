'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
import {
  DataTable,
  type ColumnDef,
  type DataTableEmptyStateContext,
  type DataTableProps,
  type DataTableUtilityControls,
} from '@rpg/ui'

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
  toolbar?: ReactNode
  summary?: ReactNode
  utilityActions?: (controls: DataTableUtilityControls<TData>) => ReactNode
  selectionControls?: ReactNode
}

function OverviewTableUtilityStrip<TData>({
  summary,
  utilityActions,
  selectionControls,
  controls,
}: {
  summary?: ReactNode
  utilityActions?: (controls: DataTableUtilityControls<TData>) => ReactNode
  selectionControls?: ReactNode
  controls: DataTableUtilityControls<TData>
}) {
  if (!summary && !utilityActions && !selectionControls) return null

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {summary}
        {selectionControls}
      </div>
      {utilityActions ? utilityActions(controls) : null}
    </div>
  )
}

/** Neutral overview table chrome — slots for toolbar, summary, utility actions, and selection. */
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
  toolbar,
  summary,
  utilityActions,
  selectionControls,
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

  const renderUtilityStrip = useCallback(
    (controls: DataTableUtilityControls<TData>) => (
      <OverviewTableUtilityStrip
        summary={summary}
        utilityActions={utilityActions}
        selectionControls={selectionControls}
        controls={controls}
      />
    ),
    [selectionControls, summary, utilityActions],
  )

  const hasUtilityStrip = Boolean(summary || utilityActions || selectionControls)

  return (
    <div className="flex flex-col gap-3">
      {toolbar}
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
        getRowId={(row) => row.id}
      />
    </div>
  )
}
