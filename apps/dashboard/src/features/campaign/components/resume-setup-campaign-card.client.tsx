import { Link } from 'react-router-dom'
import type { CampaignListItem } from '@rpg/contracts'
import { Text, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { CampaignDisplayName } from './campaign-display-name'
import { buildCampaignDisplay } from '../lib/campaign-display'

interface ResumeSetupCampaignCardProps {
  campaign: CampaignListItem
}

/** Prompts the user to finish onboarding for a remembered incomplete campaign. */
export function ResumeSetupCampaignCard({ campaign }: ResumeSetupCampaignCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Text variant="small" as="h2">
            Resume setup
          </Text>
          <CampaignDisplayName display={buildCampaignDisplay(campaign)} surface="card" />
        </div>
        <Link
          to={ROUTES.campaign.onboarding(campaign.id)}
          className={buttonVariants({ size: 'sm', className: 'shrink-0' })}
        >
          Resume setup
        </Link>
      </div>
    </section>
  )
}
