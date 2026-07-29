import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CampaignCharacterStatusSummary } from '@/features/character/components/detail/campaign-character-status-summary.client'
import { CharacterDetailContent } from '@/features/character/components/detail/character-detail-content.client'
import { CharacterOrganizationsSummary } from '@/features/character/components/detail/character-organizations-summary.client'
import { CharacterSheetDetailShell } from '@/features/character/components/detail/character-sheet-detail-shell'

import { useCampaignCharacterDetail } from '../hooks/use-campaign-character-detail'
import { useCampaignCharacterNavigationContext } from '../hooks/use-campaign-character-navigation-context'
import { useCampaigns } from '../hooks/use-campaigns'

export function CampaignCharacterDetail() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const { nav } = useCampaignCharacterNavigationContext(campaignId)
  const detail = useCampaignCharacterDetail(campaignId, characterId)

  const errorBackLink =
    detail.isError && nav.showCharactersNav ? { href: nav.href, label: nav.label } : undefined

  return (
    <CharacterSheetDetailShell
      scope="campaign"
      campaignBreadcrumb={{
        href: campaignId ? ROUTES.campaign.detail(campaignId) : ROUTES.home,
        label: campaign?.identity.name ?? 'Campaign',
      }}
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
