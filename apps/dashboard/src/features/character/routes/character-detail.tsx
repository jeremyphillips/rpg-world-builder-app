import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { resolveCampaignXpProgressionForRules } from '@/lib/campaign-xp-progression.lib'

import { useSession } from '@/features/auth'

import { CharacterDetailContent } from '../components/detail/character-detail-content'
import { CharacterDetailRouteMedia } from '../components/detail/sheet/character-detail-route-media'
import { CharacterSheetDetailShell } from '../components/detail/character-sheet-detail-shell'
import { CharacterVitalSummary } from '../components/detail/status/character-vital-summary'
import { StandaloneCharacterRedirectGuard } from '../components/standalone-character-redirect-guard'
import { useBuildContext } from '../hooks/use-build-context'
import { useCharacter } from '../hooks/use-character'
import { buildCharacterDetailViewModel } from '../lib/display/character-display'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'

function CharacterDetailBody() {
  const { characterId } = useParams<{ characterId: string }>()
  const { data: session } = useSession()
  const {
    data: character,
    isPending: isCharacterPending,
    isError: isCharacterError,
    error: characterError,
  } = useCharacter(characterId)
  const {
    catalogIndex,
    context,
    isPending: isCatalogPending,
    isError: isCatalogError,
    error: catalogError,
  } = useBuildContext(character?.rulesetId as SystemRulesetId | undefined)

  const viewModel = useMemo(() => {
    if (!character || !catalogIndex || !context) return null

    return buildCharacterDetailViewModel({
      character,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: resolveCampaignXpProgressionForRules(
        character.rulesetId as SystemRulesetId,
        context.characterCreationRules.progression,
      ),
    })
  }, [catalogIndex, character, context])

  const isPending = isCharacterPending || Boolean(character && isCatalogPending)
  const isError = isCharacterError || isCatalogError
  const errorLabel = resolveQueryErrorLabel([
    { isPending: isCharacterPending, isError: isCharacterError, error: characterError },
    { isPending: isCatalogPending, isError: isCatalogError, error: catalogError },
  ])

  return (
    <CharacterSheetDetailShell
      scope="standalone"
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
    >
      {viewModel && character ? (
        <CharacterDetailContent
          viewModel={viewModel}
          identityMedia={
            <CharacterDetailRouteMedia
              characterType="pc"
              characterId={character.id}
              userId={session?.user.id ?? character.userId}
              media={character.media}
              canEditMedia={Boolean(session?.user.id)}
            />
          }
          statusSummary={<CharacterVitalSummary vital={viewModel.identity.vital} />}
          showDelete
        />
      ) : null}
    </CharacterSheetDetailShell>
  )
}

export function CharacterDetail() {
  return (
    <StandaloneCharacterRedirectGuard>
      <CharacterDetailBody />
    </StandaloneCharacterRedirectGuard>
  )
}
