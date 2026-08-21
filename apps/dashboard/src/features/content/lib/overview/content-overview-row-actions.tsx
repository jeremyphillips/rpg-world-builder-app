import type {
  CampaignAvailabilityFilter,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { RowActionsMenu } from '@rpg/ui'

import { CampaignAccessBlockedDialog } from '../campaign-access/campaign-access-blocked-dialog'
import { ContentCampaignAvailabilityAction } from '../campaign-access/overview/content-campaign-availability-action'
import { useContentCampaignAvailabilityToggle } from './hooks/use-content-campaign-availability-toggle'

export interface ContentOverviewRowActionsProps {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  entityName: string
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
  entityName,
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
      entityName,
      campaignAccess,
      campaignAvailabilityFilter,
      onRowRemoved,
    })

  if (!canManage) return null

  return (
    <>
      <RowActionsMenu
        triggerLabel={`Open actions for this ${itemLabel}`}
        triggerRef={triggerRef}
        contentClassName="w-72"
        items={[]}
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
        campaignId={campaignId}
        targetName={entityName}
        blockers={blockers}
      />
    </>
  )
}
