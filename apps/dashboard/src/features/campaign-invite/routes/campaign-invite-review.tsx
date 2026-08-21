import { isCampaignInviteId } from '@rpg/contracts'
import { InviteInvalidSegmentState } from '@rpg/campaign-invite'
import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/page/narrow-page'

import { CampaignInviteReviewPage } from '../components/campaign-invite-review-page'

export function CampaignInviteReviewRoute() {
  const { inviteId } = useParams<{ inviteId: string }>()
  const parsedInviteId = inviteId && isCampaignInviteId(inviteId) ? inviteId : null

  return (
    <NarrowPage spacing="compact">
      {parsedInviteId ? (
        <CampaignInviteReviewPage inviteId={parsedInviteId} />
      ) : (
        <InviteInvalidSegmentState navigation={{ homeHref: ROUTES.home }} />
      )}
    </NarrowPage>
  )
}
