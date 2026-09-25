import { useParams } from 'react-router-dom'

import { useSession } from '@/features/auth'
import { CharacterSheetDetailShell } from '@/features/character'

import { useCampaignCharacterDetail } from '../hooks/use-campaign-character-detail'
import { useCampaignCharacterNavigationContext } from '../hooks/use-campaign-character-navigation-context'
import { CampaignCharacterDetailBody } from './campaign-character-detail-body'

export function CampaignCharacterDetail() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const { data: session } = useSession()
  const { nav } = useCampaignCharacterNavigationContext(campaignId)
  const detail = useCampaignCharacterDetail(campaignId, characterId)

  const errorBackLink =
    detail.isError && nav.showCharactersNav ? { href: nav.href, label: nav.label } : undefined

  const ready =
    detail.viewModel && detail.campaignCharacter && campaignId && characterId
      ? {
          campaignId,
          characterId,
          viewModel: detail.viewModel,
          campaignCharacter: detail.campaignCharacter,
        }
      : null

  return (
    <CharacterSheetDetailShell
      scope="campaign"
      errorBackLink={errorBackLink}
      isPending={detail.isPending}
      isError={detail.isError}
      errorLabel={detail.errorLabel}
    >
      {ready ? (
        <CampaignCharacterDetailBody
          campaignId={ready.campaignId}
          characterId={ready.characterId}
          viewerId={session?.user.id}
          detail={{
            ...detail,
            viewModel: ready.viewModel,
            campaignCharacter: ready.campaignCharacter,
          }}
        />
      ) : null}
    </CharacterSheetDetailShell>
  )
}
