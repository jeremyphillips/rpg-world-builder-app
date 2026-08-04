import { useParams } from 'react-router-dom'

import { CampaignCharacterStatusSummary } from '@/features/character'
import { CharacterDetailContent } from '@/features/character'
import { CharacterOrganizationsSummary } from '@/features/character'
import { CharacterSheetDetailShell } from '@/features/character'

import { useCampaignCharacterDetail } from '../hooks/use-campaign-character-detail'
import { useCampaignCharacterNavigationContext } from '../hooks/use-campaign-character-navigation-context'

export function CampaignCharacterDetail() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const { nav } = useCampaignCharacterNavigationContext(campaignId)
  const detail = useCampaignCharacterDetail(campaignId, characterId)

  const errorBackLink =
    detail.isError && nav.showCharactersNav ? { href: nav.href, label: nav.label } : undefined

  return (
    <CharacterSheetDetailShell
      scope="campaign"
      errorBackLink={errorBackLink}
      isPending={detail.isPending}
      isError={detail.isError}
      errorLabel={detail.errorLabel}
    >
      {detail.viewModel && detail.campaignCharacter ? (
        <CharacterDetailContent
          viewModel={detail.viewModel}
          showDelete={detail.campaignCharacter.capabilities.canDelete}
          statusSummary={
            <CampaignCharacterStatusSummary
              vital={detail.viewModel.identity.vital}
              roster={detail.campaignCharacter.participation.roster}
            />
          }
          identitySupplement={
            detail.organizationReferences ? (
              <CharacterOrganizationsSummary
                campaignId={campaignId!}
                organizationReferences={detail.organizationReferences}
              />
            ) : null
          }
        />
      ) : null}
    </CharacterSheetDetailShell>
  )
}
