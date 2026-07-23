'use client'

import type {
  CampaignAvailabilityFilter,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { RowActionsMenu, type RowActionsMenuLinkProps } from '@rpg/ui'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

import { useCanManageCampaign } from '@/features/campaign'

import { CampaignAccessBlockedDialog } from '../campaign-access/campaign-access-blocked-dialog.client'
import { ContentCampaignAvailabilityAction } from './content-campaign-availability-action.client'
import { useContentCampaignAvailabilityToggle } from './use-content-campaign-availability-toggle.client'

const DashboardRowActionsEditLink = forwardRef<HTMLAnchorElement, RowActionsMenuLinkProps>(
  function DashboardRowActionsEditLink({ href, className, children }, ref) {
    return (
      <Link ref={ref} to={href} className={className}>
        {children}
      </Link>
    )
  },
)

export interface ContentOverviewRowActionsProps {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  editHref: string
  itemLabel: string
  campaignAccess: ResolvedContentCampaignAccess
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  editLabel?: string
  onRowRemoved?: () => void
  triggerRef?: React.Ref<HTMLButtonElement>
}

/** Row actions menu for content overview tables; hidden for non-managers. */
export function ContentOverviewRowActions({
  campaignId,
  contentTypeKey,
  entityId,
  editHref,
  itemLabel,
  campaignAccess,
  campaignAvailabilityFilter,
  editLabel = 'Edit details',
  onRowRemoved,
  triggerRef,
}: ContentOverviewRowActionsProps) {
  const canManage = useCanManageCampaign(campaignId)

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
        editHref={editHref}
        EditLink={DashboardRowActionsEditLink}
        editLabel={editLabel}
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
