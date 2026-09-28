import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { PageShell } from '@/components/layout/page/page-shell'

import { CampaignBannerUploadAlert } from '../components/campaign-banner-upload-alert'
import { CampaignOverviewHero } from '../components/overview/campaign-overview-hero'
import { InviteMemberDialog } from '../components/overview/invite-member-dialog'
import { useCampaignOverviewData } from '../hooks/use-campaign-overview-data'
import { useCampaigns } from '../hooks/use-campaigns'
import { useCanManageCampaign } from '../hooks/use-can-manage-campaign'
import { CampaignOverviewPageBody } from './campaign-overview-page-body'

/** Campaign overview — party, members, and invitations. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const canManage = useCanManageCampaign(campaignId)
  const overview = useCampaignOverviewData(campaignId, canManage)
  const [inviteOpen, setInviteOpen] = useState(false)

  const campaign = campaigns?.find((item) => item.id === campaignId)
  const onInviteMember = canManage ? () => setInviteOpen(true) : undefined
  const showHero = Boolean(campaign && campaignId)
  const showInviteDialog = canManage && Boolean(campaignId)

  return (
    <PageShell width="wide" rhythm="list">
      <CampaignBannerUploadAlert />
      {showHero ? (
        <CampaignOverviewHero
          campaign={campaign!}
          campaignId={campaignId!}
          canManage={canManage}
          onInviteMember={onInviteMember}
        />
      ) : null}

      {showInviteDialog ? (
        <InviteMemberDialog
          campaignId={campaignId!}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          showTrigger={false}
        />
      ) : null}

      <CampaignOverviewPageBody
        campaignId={campaignId}
        campaign={campaign}
        overview={overview}
        canManage={canManage}
        onInviteMember={onInviteMember}
      />
    </PageShell>
  )
}
