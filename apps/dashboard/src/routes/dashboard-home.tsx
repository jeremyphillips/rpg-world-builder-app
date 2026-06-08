import { useSession } from '@/features/auth'
import {
  CampaignPicker,
  CreateCampaignForm,
  useCampaigns,
  useSelectCampaign,
} from '@/features/campaign'

import { useLandingRedirect } from './use-landing-redirect'

export function DashboardHome() {
  const redirecting = useLandingRedirect()
  const { data: user } = useSession()
  const { data: campaigns } = useCampaigns()
  const selectCampaign = useSelectCampaign()

  // Hold the picker back while the one-shot landing redirect is being decided.
  if (redirecting) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  const hasCampaigns = campaigns !== undefined && campaigns.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome{user ? `, ${user.displayName}` : ''}
        </h2>
        <p className="text-muted-foreground">
          {hasCampaigns
            ? 'Choose a campaign to continue, or start a new one.'
            : 'Create your first campaign to get started.'}
        </p>
      </div>

      {hasCampaigns ? <CampaignPicker campaigns={campaigns} onSelect={selectCampaign} /> : null}

      <CreateCampaignForm />
    </div>
  )
}
