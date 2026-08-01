import type { Metadata } from 'next'
import { APP_NAME, parseCampaignInviteRouteSegment } from '@rpg/contracts'

import { SiteHeader } from '@/components/site-header'
import { CampaignInvitePage } from '@/features/campaign-invite'
import { InviteInvalidSegmentState } from '@/features/campaign-invite/lib/campaign-invite-page-states.client'

export const metadata: Metadata = {
  title: `Campaign invitation - ${APP_NAME}`,
}

type CampaignInviteRouteProps = {
  params: Promise<{ token: string }>
}

export default async function CampaignInviteRoute({ params }: CampaignInviteRouteProps) {
  const { token } = await params
  const segment = parseCampaignInviteRouteSegment(token)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {segment ? <CampaignInvitePage segment={segment} /> : <InviteInvalidSegmentState />}
      </main>
    </div>
  )
}
