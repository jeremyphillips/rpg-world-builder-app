import type { CampaignPartyPcListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { CharacterListRow } from '@/features/character'
import { normalizePartyController, resolveCharacterControllerDisplay } from '@/features/character'
import { DetailCollectionPanel, RelationshipList } from '@/features/content'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
} from '../../lib/overview/campaign-overview-labels'

export type CampaignOverviewPartySectionProps = {
  campaignId: string
  party: CampaignPartyPcListItem[]
  openControlledCharacterIds: readonly string[]
}

/** Campaign party PCs in a DetailCollectionPanel with compact character list rows. */
export function CampaignOverviewPartySection({
  campaignId,
  party,
  openControlledCharacterIds,
}: CampaignOverviewPartySectionProps) {
  return (
    <DetailCollectionPanel
      heading={CAMPAIGN_OVERVIEW_SECTION_LABELS.party}
      headingId="campaign-overview-party-heading"
      headerAlign="center"
      bodySurface="transparent"
    >
      <RelationshipList.Root
        itemCount={party.length}
        emptyLabel={CAMPAIGN_OVERVIEW_EMPTY_TEXT.party}
      >
        {party.length > 0 ? (
          <RelationshipList.Group itemCount={party.length}>
            {party.map((entry) => (
              <CharacterListRow
                key={entry.character.id}
                card={entry.character}
                detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
                controllerLine={resolveCharacterControllerDisplay({
                  controller: normalizePartyController(entry.member),
                  viewerControlsCharacter: openControlledCharacterIds.includes(entry.character.id),
                })}
                rosterStatus={entry.roster.status}
              />
            ))}
          </RelationshipList.Group>
        ) : null}
      </RelationshipList.Root>
    </DetailCollectionPanel>
  )
}
