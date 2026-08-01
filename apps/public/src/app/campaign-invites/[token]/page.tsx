import type { Metadata } from 'next'
import { APP_NAME, parseCampaignInviteTokenSegment } from '@rpg/contracts'
import { InviteInvalidSegmentState } from '@rpg/campaign-invite'

import { SiteHeader } from '@/components/site-header'
import { CampaignInvitePage } from '@/features/campaign-invite'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = {
  title: `Campaign invitation - ${APP_NAME}`,
}

type CampaignInviteRouteProps = {
  params: Promise<{ token: string }>
}

export default async function CampaignInviteRoute({ params }: CampaignInviteRouteProps) {
  const { token } = await params
  const parsedToken = parseCampaignInviteTokenSegment(token)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {parsedToken ? (
          <CampaignInvitePage token={parsedToken} />
        ) : (
          <InviteInvalidSegmentState navigation={{ homeHref: ROUTES.home }} />
        )}
      </main>
    </div>
  )
}
