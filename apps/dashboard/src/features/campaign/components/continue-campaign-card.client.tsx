'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

interface ContinueCampaignCardProps {
  campaign: CampaignListItem
  onContinue: (campaignId: string) => void
}

/** Promotes the user's remembered campaign from the global Dashboard. */
export function ContinueCampaignCard({ campaign, onContinue }: ContinueCampaignCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Text variant="small" as="h2">
            Continue campaign
          </Text>
          <Text className="font-medium">{campaign.identity.name}</Text>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={() => onContinue(campaign.id)}
        >
          Continue
        </Button>
      </div>
    </section>
  )
}
