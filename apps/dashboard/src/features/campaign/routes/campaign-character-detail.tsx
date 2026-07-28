import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'
import { Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { CharacterDetailContent } from '@/features/character/components/detail/character-detail-content.client'
import { CharacterVitalSummary } from '@/features/character/components/detail/character-vital-summary.client'
import { useBuildContext } from '@/features/character/hooks/use-build-context'
import { useCharacter } from '@/features/character/hooks/use-character'
import { buildCharacterDetailViewModel } from '@/features/character/lib/display/character-display'
import { useCampaigns } from '../hooks/use-campaigns'

export function CampaignCharacterDetail() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)

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
      <div className="mb-6 flex flex-col gap-2">
        <Link
          to={campaignId ? ROUTES.campaign.detail(campaignId) : ROUTES.home}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {campaign?.identity.name ?? 'Campaign'}
        </Link>
        <Heading variant="page" as="h1">
          Campaign character
        </Heading>
      </div>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel="Could not load character."
      >
        {viewModel ? (
          <CharacterDetailContent
            viewModel={viewModel}
            statusSummary={<CharacterVitalSummary vital={viewModel.identity.vital} />}
          />
        ) : null}
      </PageLoadState>
    </WidePage>
  )
}
