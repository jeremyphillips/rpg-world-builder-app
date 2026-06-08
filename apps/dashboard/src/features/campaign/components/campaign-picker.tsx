import type { Campaign } from '@rpg/contracts'

import { Button } from '@rpg/ui'

interface CampaignPickerProps {
  campaigns: Campaign[]
  onSelect: (campaignId: string) => void
}

/** List of the user's campaigns shown on the home page when none is active. */
export function CampaignPicker({ campaigns, onSelect }: CampaignPickerProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Your campaigns</h3>
      <ul className="flex flex-col gap-2">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelect(campaign.id)}
            >
              {campaign.identity.name}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
