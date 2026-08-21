import { useParams } from 'react-router-dom'
import type { CampaignCharacterListItem } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { OverviewPageShell } from '@/components/layout/page/overview-page-shell'
import { CharacterListCard } from '@/features/character'
import { normalizeListController, resolveCharacterControllerDisplay } from '@/features/character'

import { useCampaignBuildContext } from '@/features/character'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'
import { useCampaignCharacterNavigationContext } from '../hooks/use-campaign-character-navigation-context'
import { useCampaignCharacters } from '../hooks/use-campaign-characters'
import { useCampaigns } from '../hooks/use-campaigns'
import type { CampaignCharactersListContextModel } from '../lib/characters/build-campaign-character-navigation-context'

const CAMPAIGN_CHARACTERS_LIST_EMPTY_MESSAGES = {
  no_controlled_character: 'No character is currently assigned to you.',
  no_participating_characters: 'No characters to show yet.',
} as const satisfies Record<NonNullable<CampaignCharactersListContextModel['emptyState']>, string>

function resolveCampaignCharactersEmptyMessage(
  emptyState: CampaignCharactersListContextModel['emptyState'],
): string {
  if (!emptyState) {
    return CAMPAIGN_CHARACTERS_LIST_EMPTY_MESSAGES.no_participating_characters
  }
  return CAMPAIGN_CHARACTERS_LIST_EMPTY_MESSAGES[emptyState]
}

function CampaignCharacterListRow({
  campaignId,
  entry,
  openControlledCharacterIds,
}: {
  campaignId: string
  entry: CampaignCharacterListItem
  openControlledCharacterIds: readonly string[]
}) {
  return (
    <li>
      <CharacterListCard
        card={entry.character}
        detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
        showCampaign={false}
        controllerLine={resolveCharacterControllerDisplay({
          controller: normalizeListController(entry.controller),
          viewerControlsCharacter: openControlledCharacterIds.includes(entry.character.id),
        })}
        rosterStatus={entry.roster.status}
      />
    </li>
  )
}

export function CampaignCharactersOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { list: listContext } = useCampaignCharacterNavigationContext(campaignId)
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((item) => item.id === campaignId)
  const openControlledCharacterIds = campaign?.openControlledCharacterIds ?? []
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
      heading={listContext.pageTitle}
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      defaultErrorLabel="Could not load characters."
    >
      {catalogIndex ? (
        characters.length === 0 ? (
          <Text variant="muted">
            {resolveCampaignCharactersEmptyMessage(listContext.emptyState)}
          </Text>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {characters.map((entry) => (
              <CampaignCharacterListRow
                key={entry.character.id}
                campaignId={campaignId}
                entry={entry}
                openControlledCharacterIds={openControlledCharacterIds}
              />
            ))}
          </ul>
        )
      ) : null}
    </OverviewPageShell>
  )
}
