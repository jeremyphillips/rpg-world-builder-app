import { useParams } from 'react-router-dom'
import type { CampaignCharacterListItem } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { OverviewPageShell } from '@/components/layout/overview-page-shell'
import { CharacterListCard } from '@/features/character'
import { CAMPAIGN_CHARACTER_UNASSIGNED_LABEL } from '@/features/character/lib/character-list-routing'

import { useCampaignBuildContext } from '../../character/hooks/use-campaign-build-context'
import { resolveQueryErrorLabel } from '../../character/lib/resolve-query-error-label.lib'
import { useCampaignCharacters } from '../hooks/use-campaign-characters'
import { useCampaignCharactersNav } from '../hooks/use-campaign-characters-nav'

const CAMPAIGN_CHARACTERS_EMPTY_MESSAGE = 'No characters to show yet.'

function CampaignCharacterListRow({
  campaignId,
  entry,
}: {
  campaignId: string
  entry: CampaignCharacterListItem
}) {
  return (
    <li className="space-y-2">
      <CharacterListCard
        card={entry.character}
        detailHref={ROUTES.campaign.characters.detail(campaignId, entry.character.id)}
        rosterStatus={entry.roster.status}
      />
      <Text variant="small" className="text-muted-foreground">
        {entry.controller
          ? `Played by ${entry.controller.displayName}`
          : CAMPAIGN_CHARACTER_UNASSIGNED_LABEL}
      </Text>
    </li>
  )
}

export function CampaignCharactersOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const navModel = useCampaignCharactersNav(campaignId)
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
              />
            ))}
          </ul>
        )
      ) : null}
    </OverviewPageShell>
  )
}
