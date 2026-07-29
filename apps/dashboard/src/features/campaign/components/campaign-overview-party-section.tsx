import type { CampaignPartyPcListItem } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CharacterListCard } from '@/features/character'

import { CAMPAIGN_CHARACTER_UNASSIGNED_LABEL } from '@/features/character/lib/character-list-routing'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
} from '../lib/campaign-overview-labels'

export type CampaignOverviewPartySectionProps = {
  campaignId: string
  party: CampaignPartyPcListItem[]
}

/** Campaign party PCs composed server-side with controlling member metadata. */
export function CampaignOverviewPartySection({
  campaignId,
  party,
}: CampaignOverviewPartySectionProps) {
  return (
    <section aria-labelledby="campaign-overview-party-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="campaign-overview-party-heading">
        {CAMPAIGN_OVERVIEW_SECTION_LABELS.party}
      </Heading>

      {party.length === 0 ? (
        <Text variant="muted">{CAMPAIGN_OVERVIEW_EMPTY_TEXT.party}</Text>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {party.map((entry) => (
            <li key={entry.character.id} className="space-y-2">
              <CharacterListCard
                card={entry.character}
                detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
              />
              <Text variant="small" className="text-muted-foreground">
                {entry.member
                  ? `Played by ${entry.member.displayName}`
                  : CAMPAIGN_CHARACTER_UNASSIGNED_LABEL}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
