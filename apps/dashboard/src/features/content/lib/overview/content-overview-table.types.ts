import type { ReactNode } from 'react'

import type {
  ActionApplyOutcome,
  ActionTargetFailure,
  ContentTypeKey,
  WithCampaignAccess,
} from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'
import type { FilterSchema } from '@rpg/ui/filters'

import type { OverviewBulkAction } from '@/lib/overview/overview-bulk-actions-menu'

import type { ContentBase } from './content-table-config'
import type { ContentOverviewBaseFilterState } from './content-overview-filter-schema'

export type ContentOverviewBulkExtensionRenderContext<
  T extends WithCampaignAccess<ContentBase> & { id: string },
> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  selectedRows: T[]
  campaignRows: T[]
  onApplyComplete: (outcomes: ActionApplyOutcome<unknown, ActionTargetFailure>[]) => void
}

export type ContentOverviewBulkExtension<
  T extends WithCampaignAccess<ContentBase> & { id: string },
> = {
  menuAction: OverviewBulkAction
  renderDialog: (context: ContentOverviewBulkExtensionRenderContext<T>) => ReactNode
}

export type ContentOverviewTableProps<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
> = {
  contentTypeKey: ContentTypeKey
  campaignId: string
  columns: ColumnDef<T, unknown>[]
  filterSchema: FilterSchema<T, TFilters>
  data: T[]
  caption?: string
  getEditHref: (row: T) => string
  bulkExtensions?: ContentOverviewBulkExtension<T>[]
}
