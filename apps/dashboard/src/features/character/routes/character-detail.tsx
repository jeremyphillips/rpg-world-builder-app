import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

import { CharacterDetailContent } from '../components/detail/character-detail-content.client'
import { useBuildContext } from '../hooks/use-build-context'
import { useCharacter } from '../hooks/use-character'
import { buildCharacterDetailViewModel } from '../lib/character-display'

export function CharacterDetail() {
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
  const errorLabel = characterError?.message ?? catalogError?.message

  return (
    <WidePage spacing="relaxed">
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel="Could not load character."
      >
        {viewModel ? <CharacterDetailContent viewModel={viewModel} /> : null}
      </PageLoadState>
    </WidePage>
  )
}
