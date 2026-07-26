import type { Metadata } from 'next'
import { APP_NAME } from '@rpg/contracts'

import { SiteHeader } from '@/components/site-header'
import { CampaignInvitePage } from '@/features/campaign-invite'

export const metadata: Metadata = {
  title: `Campaign invitation - ${APP_NAME}`,
}

type CampaignInviteRouteProps = {
  params: Promise<{ token: string }>
}

export default async function CampaignInviteRoute({ params }: CampaignInviteRouteProps) {
  const { token } = await params

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <CampaignInvitePage token={token} />
      </main>
    </div>
  )
}
