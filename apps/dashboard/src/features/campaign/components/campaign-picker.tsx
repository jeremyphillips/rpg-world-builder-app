import type { CampaignListItem } from '@rpg/contracts'
import { Badge, Button, Text } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CampaignDisplayName } from './campaign-display-name'
import { CAMPAIGN_ONBOARDING_INCOMPLETE_COPY } from '../lib/campaign-onboarding-copy'
import { buildCampaignDisplay } from '../lib/campaign-display'
import { isCampaignMembershipOnboardingIncomplete } from '../lib/campaign-membership-onboarding'

interface CampaignPickerProps {
  campaigns: CampaignListItem[]
  onSelect: (campaignId: string) => void
}

/** List of the user's campaigns shown on the home page when none is active. */
export function CampaignPicker({ campaigns, onSelect }: CampaignPickerProps) {
  return (
    <section className="space-y-2">
      <Text variant="small" as="h3">
        Your campaigns
      </Text>
      <ul className="flex flex-col gap-2">
        {campaigns.map((campaign) => {
          const incomplete = isCampaignMembershipOnboardingIncomplete(campaign)

          return (
            <li key={campaign.id} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CampaignDisplayName display={buildCampaignDisplay(campaign)} surface="card" />
                    {incomplete ? (
                      <Badge appearance="outline" tone="warning" size="sm">
                        {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.label}
                      </Badge>
                    ) : null}
                  </div>
                  {incomplete ? (
                    <Text variant="small" className="text-muted-foreground">
                      {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message}
                    </Text>
                  ) : null}
                </div>

                {incomplete ? (
                  <Link to={ROUTES.campaign.onboarding(campaign.id)} className="shrink-0">
                    <Button type="button" size="sm">
                      {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.action}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onSelect(campaign.id)}
                  >
                    Open campaign
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
