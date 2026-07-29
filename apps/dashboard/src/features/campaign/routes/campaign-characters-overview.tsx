import { useParams } from 'react-router-dom'
import type { CampaignCharacterListItem } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { OverviewPageShell } from '@/components/layout/overview-page-shell'
import { CharacterListCard } from '@/features/character'
import {
  normalizeListController,
  resolveCharacterControllerDisplay,
} from '@/features/character/lib/display/character-display'

import { useCampaignBuildContext } from '../../character/hooks/use-campaign-build-context'
import { resolveQueryErrorLabel } from '../../character/lib/resolve-query-error-label.lib'
import { useCampaignCharacters } from '../hooks/use-campaign-characters'
import { useCampaignCharactersNav } from '../hooks/use-campaign-characters-nav'
import { useCampaigns } from '../hooks/use-campaigns'

const CAMPAIGN_CHARACTERS_EMPTY_MESSAGE = 'No characters to show yet.'

function CampaignCharacterListRow({
  campaignId,
  entry,
  viewerControlledCharacterIds,
}: {
  campaignId: string
  entry: CampaignCharacterListItem
  viewerControlledCharacterIds: readonly string[]
}) {
  return (
    <li>
      <CharacterListCard
        card={entry.character}
        detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
        showCampaign={false}
        controllerLine={resolveCharacterControllerDisplay({
          controller: normalizeListController(entry.controller),
          viewerControlsCharacter: viewerControlledCharacterIds.includes(entry.character.id),
        })}
        rosterStatus={entry.roster.status}
      />
    </li>
  )
}

export function CampaignCharactersOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const navModel = useCampaignCharactersNav(campaignId)
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((item) => item.id === campaignId)
  const viewerControlledCharacterIds = campaign?.controlledCharacterIds ?? []
  const {
    data: characters = [],
    isPending: isCharactersPending,
    isError: isCharactersError,
    error: charactersError,
  } = useCampaignCharacters(campaignId)
  const {
    catalogIndex,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
  } = useCampaignBuildContext(campaignId)

  const isPending = isCharactersPending || isContextPending
  const isError = isCharactersError || isContextError
  const errorLabel = resolveQueryErrorLabel([
    { isPending: isCharactersPending, isError: isCharactersError, error: charactersError },
    { isPending: isContextPending, isError: isContextError, error: contextError },
  ])

  return (
    <OverviewPageShell
      heading={navModel.pageTitle}
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      defaultErrorLabel="Could not load characters."
    >
      {catalogIndex ? (
        characters.length === 0 ? (
          <Text variant="muted">{CAMPAIGN_CHARACTERS_EMPTY_MESSAGE}</Text>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {characters.map((entry) => (
              <CampaignCharacterListRow
                key={entry.character.id}
                campaignId={campaignId}
                entry={entry}
                viewerControlledCharacterIds={viewerControlledCharacterIds}
              />
            ))}
          </ul>
        )
      ) : null}
    </OverviewPageShell>
  )
}
