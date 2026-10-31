import { useMemo, useState } from 'react'

import type {
  ContentTypeKey,
  ResolvedContentCampaignAccess,
  ViewerCharacterRelationships,
  WithCampaignAccess,
} from '@rpg/contracts'
import { toPlayerContentVisibility, type ContentViewer } from '@rpg/contracts'
import { SortableHeader, type ColumnDef } from '@rpg/ui'

import {
  CONTENT_OVERVIEW_USED_BY_ALL_CHARACTERS_LABEL,
  CONTENT_OVERVIEW_USED_BY_ALL_CHARACTERS_TOOLTIP,
} from '../labels'
import { ContentOverviewNameCell } from './content-overview-name-cell'
import { contentOverviewListQueryKey } from './content-overview-query-keys'
import { createOverviewColumnDefsSignature } from './content-overview-columns.lib'
import { type ContentBase, type ContentOverviewNameColumnMeta } from './content-table-config'
import { resolveReadSurfaceCampaignAccess } from '../campaign-access/resolve-read-surface-campaign-access'
import type { UsedByOverviewColumnMeta } from '@/lib/usage-references/build-used-by-overview-column'

/**
 * Keeps a stable column-def reference when overview routes pass a freshly allocated
 * array each render (e.g. `classColumns(campaignId)` inline in JSX).
 */
export function useStableOverviewColumns<T>(
  columns: ColumnDef<T, unknown>[],
): ColumnDef<T, unknown>[] {
  const signature = createOverviewColumnDefsSignature(columns as ColumnDef<unknown>[])
  const [cached, setCached] = useState({ signature, columns })

  if (cached.signature !== signature) {
    setCached({ signature, columns })
  }

  return cached.columns
}

type OverviewNameRow = ContentBase & {
  id: string
  kind?: unknown
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

/** Injects manager utility-row context into the shared overview name column. */
export function patchOverviewColumns<T extends OverviewNameRow>(
  columns: ColumnDef<T, unknown>[],
  context: {
    canManage: boolean
    campaignId: string
    contentTypeKey: ContentTypeKey
    viewer: ContentViewer
    getEditHref?: (row: T) => string
    readOnly?: boolean
  },
): ColumnDef<T, unknown>[] {
  const queryKeyFn = (campaignId: string) =>
    contentOverviewListQueryKey(campaignId, context.contentTypeKey)
  const campaignAccessForRow = (row: T): ResolvedContentCampaignAccess =>
    resolveReadSurfaceCampaignAccess(
      context.contentTypeKey,
      (row as unknown as WithCampaignAccess<ContentBase>).campaignAccess,
    )

  return columns.map((column) => {
    const columnId = column.id ?? (column as { accessorKey?: string }).accessorKey
    const usedByMeta = column.meta as UsedByOverviewColumnMeta | undefined

    if (columnId === 'usedBy' && context.canManage && usedByMeta?.overviewCharactersUsageScope) {
      const columnLabel = CONTENT_OVERVIEW_USED_BY_ALL_CHARACTERS_LABEL
      const scopeTooltip = CONTENT_OVERVIEW_USED_BY_ALL_CHARACTERS_TOOLTIP

      return {
        ...column,
        header: ({ column: tableColumn }) => (
          <SortableHeader column={tableColumn} label={columnLabel} info={scopeTooltip}>
            {columnLabel}
          </SortableHeader>
        ),
        meta: {
          ...column.meta,
          label: columnLabel,
        },
      } as ColumnDef<T, unknown>
    }

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
          campaignAccess={campaignAccessForRow(row.original)}
          playerVisibility={toPlayerContentVisibility(
            campaignAccessForRow(row.original),
            context.viewer,
          )}
          nameHref={overviewNameHref?.(row.original)}
          editHref={
            !context.readOnly && context.canManage && context.getEditHref
              ? context.getEditHref(row.original)
              : undefined
          }
          canManage={context.canManage}
          campaignId={context.campaignId}
          contentTypeKey={context.contentTypeKey}
          queryKeyFn={queryKeyFn}
          duplicateSource={
            context.readOnly
              ? undefined
              : {
                  id: row.original.id,
                  name: row.original.name,
                  catalogLayer: row.original.catalogLayer,
                  kind: row.original.kind,
                }
          }
          viewerCharacterRelationships={row.original.viewerCharacterRelationships}
        />
      ),
    }
  })
}

export function useOverviewColumnsWithNameContext<T extends OverviewNameRow>(
  columns: ColumnDef<T, unknown>[],
  context: {
    canManage: boolean
    campaignId: string
    contentTypeKey: ContentTypeKey
    viewer: ContentViewer
    getEditHref?: (row: T) => string
    readOnly?: boolean
  },
): ColumnDef<T, unknown>[] {
  const stableColumns = useStableOverviewColumns(columns)

  return useMemo(
    () =>
      patchOverviewColumns(stableColumns, {
        canManage: context.canManage,
        campaignId: context.campaignId,
        contentTypeKey: context.contentTypeKey,
        viewer: context.viewer,
        getEditHref: context.getEditHref,
        readOnly: context.readOnly,
      }),
    [
      stableColumns,
      context.canManage,
      context.campaignId,
      context.contentTypeKey,
      context.viewer,
      context.getEditHref,
      context.readOnly,
    ],
  )
}
