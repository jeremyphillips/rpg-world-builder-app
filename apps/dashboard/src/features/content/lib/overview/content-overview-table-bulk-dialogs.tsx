import type { ReactNode } from 'react'

import {
  supportsContentBulkCampaignAccess,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ContentTypeKey,
  type WithCampaignAccess,
} from '@rpg/contracts'

import { BulkCampaignAccessDialog } from '../campaign-access/bulk/bulk-campaign-access-dialog'
import type { ContentBase } from './content-table-config'
import type { ContentOverviewBulkExtension } from './content-overview-table.types'

type ContentOverviewTableBulkDialogsProps<
  T extends WithCampaignAccess<ContentBase> & { id: string },
> = {
  bulkAccessOpen: boolean
  bulkExtensions: ContentOverviewBulkExtension<T>[]
  campaignId: string
  canManage: boolean
  contentTypeKey: ContentTypeKey
  data: T[]
  itemLabelPlural: string
  onBulkAccessApplyComplete: (result: { updatedIds: string[]; fullSuccess: boolean }) => void
  onExtensionApplyComplete: (outcomes: ActionApplyOutcome<unknown, ActionTargetFailure>[]) => void
  openExtensionId: string | null
  selectedRows: T[]
  setBulkAccessOpen: (open: boolean) => void
  setOpenExtensionId: (id: string | null) => void
}

export function ContentOverviewTableBulkDialogs<
  T extends WithCampaignAccess<ContentBase> & { id: string },
>({
  bulkAccessOpen,
  bulkExtensions,
  campaignId,
  canManage,
  contentTypeKey,
  data,
  itemLabelPlural,
  onBulkAccessApplyComplete,
  onExtensionApplyComplete,
  openExtensionId,
  selectedRows,
  setBulkAccessOpen,
  setOpenExtensionId,
}: ContentOverviewTableBulkDialogsProps<T>): ReactNode {
  const supportsBulkCampaignAccess = supportsContentBulkCampaignAccess(contentTypeKey)

  return (
    <>
      {canManage && supportsBulkCampaignAccess ? (
        <BulkCampaignAccessDialog
          open={bulkAccessOpen}
          onOpenChange={setBulkAccessOpen}
          campaignId={campaignId}
          targetType={contentTypeKey}
          contentTypeKey={contentTypeKey}
          itemLabelPlural={itemLabelPlural}
          selectedRows={selectedRows}
          onApplyComplete={onBulkAccessApplyComplete}
        />
      ) : null}

      {canManage
        ? bulkExtensions.map((extension) => (
            <div key={extension.menuAction.id}>
              {extension.renderDialog({
                open: openExtensionId === extension.menuAction.id,
                onOpenChange: (open) => setOpenExtensionId(open ? extension.menuAction.id : null),
                campaignId,
                selectedRows,
                campaignRows: data,
                onApplyComplete: onExtensionApplyComplete,
              })}
            </div>
          ))
        : null}
    </>
  )
}
