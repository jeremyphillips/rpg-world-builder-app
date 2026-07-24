'use client'

import type {
  CampaignAvailabilityFilter,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { RowActionsMenu } from '@rpg/ui'

import { CampaignAccessBlockedDialog } from '../campaign-access/campaign-access-blocked-dialog.client'
import { ContentCampaignAvailabilityAction } from './content-campaign-availability-action.client'
import { useContentCampaignAvailabilityToggle } from './use-content-campaign-availability-toggle.client'

export interface ContentOverviewRowActionsProps {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  itemLabel: string
  campaignAccess: ResolvedContentCampaignAccess
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  canManage: boolean
  onRowRemoved?: () => void
  triggerRef?: React.Ref<HTMLButtonElement>
}

/** Row overflow actions for content overview tables; edit lives on the utility row. */
export function ContentOverviewRowActions({
  campaignId,
  contentTypeKey,
  entityId,
  itemLabel,
  campaignAccess,
  campaignAvailabilityFilter,
  canManage,
  onRowRemoved,
  triggerRef,
}: ContentOverviewRowActionsProps) {
  const { pending, blockedOpen, setBlockedOpen, blockers, handleAvailableChange } =
    useContentCampaignAvailabilityToggle({
      campaignId,
      contentTypeKey,
      entityId,
      campaignAccess,
      campaignAvailabilityFilter,
      onRowRemoved,
    })

  if (!canManage) return null

  return (
    <>
      <RowActionsMenu
        itemLabel={itemLabel}
        triggerRef={triggerRef}
        footer={
          <ContentCampaignAvailabilityAction
            available={campaignAccess.available}
            pending={pending}
            onAvailableChange={handleAvailableChange}
          />
        }
      />

      <CampaignAccessBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        blockers={blockers}
      />
    </>
  )
}
