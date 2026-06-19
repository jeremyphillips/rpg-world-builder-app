import type { Campaign } from '@rpg/contracts'

import { Button, Text } from '@rpg/ui'

interface CampaignPickerProps {
  campaigns: Campaign[]
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
