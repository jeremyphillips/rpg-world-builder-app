import { Link, useParams } from 'react-router-dom'
import { Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { CampaignCharacterStatusSummary } from '@/features/character/components/detail/campaign-character-status-summary.client'
import { CharacterDetailContent } from '@/features/character/components/detail/character-detail-content.client'
import { CharacterOrganizationsSummary } from '@/features/character/components/detail/character-organizations-summary.client'

import { useCampaignCharacterDetail } from '../hooks/use-campaign-character-detail'
import { useCampaigns } from '../hooks/use-campaigns'

export function CampaignCharacterDetail() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const detail = useCampaignCharacterDetail(campaignId, characterId)

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
        isPending={detail.isPending}
        isError={detail.isError}
        errorLabel={detail.errorLabel}
        defaultErrorLabel="Could not load character."
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
      </PageLoadState>
    </WidePage>
  )
}
