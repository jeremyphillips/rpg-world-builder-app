import type { CampaignPartyPcListItem } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CharacterListCard } from '@/features/character'
import { normalizePartyController, resolveCharacterControllerDisplay } from '@/features/character'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
} from '../../lib/overview/campaign-overview-labels'

export type CampaignOverviewPartySectionProps = {
  campaignId: string
  party: CampaignPartyPcListItem[]
  openControlledCharacterIds: readonly string[]
}

/** Campaign party PCs composed server-side with controlling member metadata. */
export function CampaignOverviewPartySection({
  campaignId,
  party,
  openControlledCharacterIds,
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
            <li key={entry.character.id}>
              <CharacterListCard
                card={entry.character}
                detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
                showCampaign={false}
                controllerLine={resolveCharacterControllerDisplay({
                  controller: normalizePartyController(entry.member),
                  viewerControlsCharacter: openControlledCharacterIds.includes(entry.character.id),
                })}
                rosterStatus={entry.roster.status}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
