'use client'

import { useMemo, useRef } from 'react'

import type { ColumnDef } from '@rpg/ui'

import { ContentOverviewNameCell } from './content-overview-name-cell.client'
import { createOverviewColumnDefsSignature } from './content-overview-columns.lib'
import {
  readContentRowCampaignAccess,
  type ContentBase,
  type ContentOverviewNameColumnMeta,
} from './content-table-config'

/**
 * Keeps a stable column-def reference when overview routes pass a freshly allocated
 * array each render (e.g. `classColumns(campaignId)` inline in JSX).
 */
export function useStableOverviewColumns<T>(
  columns: ColumnDef<T, unknown>[],
): ColumnDef<T, unknown>[] {
  const signature = createOverviewColumnDefsSignature(columns as ColumnDef<unknown>[])
  const stableColumnsRef = useRef(columns)
  const signatureRef = useRef(signature)

  if (signatureRef.current !== signature) {
    signatureRef.current = signature
    stableColumnsRef.current = columns
  }

  return stableColumnsRef.current
}

/** Injects manager utility-row context into the shared overview name column. */
export function patchOverviewNameColumn<T extends ContentBase>(
  columns: ColumnDef<T, unknown>[],
  context: {
    canManage: boolean
    getEditHref: (row: T) => string
  },
): ColumnDef<T, unknown>[] {
  return columns.map((column) => {
    const accessorKey = (column as { accessorKey?: string }).accessorKey
    if (accessorKey !== 'name') {
      return column
    }

    const meta = column.meta as ContentOverviewNameColumnMeta<T> | undefined
    const overviewNameHref = meta?.overviewNameHref

    return {
      ...column,
      cell: ({ row }) => (
        <ContentOverviewNameCell
          name={row.getValue<string>('name')}
          status={row.original.status}
          campaignAccess={readContentRowCampaignAccess(row.original)}
          nameHref={overviewNameHref?.(row.original)}
          editHref={context.canManage ? context.getEditHref(row.original) : undefined}
          canManage={context.canManage}
        />
      ),
    }
  })
}

export function useOverviewColumnsWithNameContext<T extends ContentBase>(
  columns: ColumnDef<T, unknown>[],
  context: {
    canManage: boolean
    getEditHref: (row: T) => string
  },
): ColumnDef<T, unknown>[] {
  const stableColumns = useStableOverviewColumns(columns)
  const getEditHrefRef = useRef(context.getEditHref)
  getEditHrefRef.current = context.getEditHref

  return useMemo(
    () =>
      patchOverviewNameColumn(stableColumns, {
        canManage: context.canManage,
        getEditHref: (row) => getEditHrefRef.current(row),
      }),
    [stableColumns, context.canManage],
  )
}
