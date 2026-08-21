import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { CharacterDetailContent } from '../components/detail/character-detail-content'
import { CharacterSheetDetailShell } from '../components/detail/character-sheet-detail-shell'
import { CharacterVitalSummary } from '../components/detail/status/character-vital-summary'
import { StandaloneCharacterRedirectGuard } from '../components/standalone-character-redirect-guard'
import { useBuildContext } from '../hooks/use-build-context'
import { useCharacter } from '../hooks/use-character'
import { buildCharacterDetailViewModel } from '../lib/display/character-display'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'

function CharacterDetailBody() {
  const { characterId } = useParams<{ characterId: string }>()
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
      xpProgression: getStandardXpProgression(character.rulesetId as SystemRulesetId),
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
      {viewModel ? (
        <CharacterDetailContent
          viewModel={viewModel}
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
