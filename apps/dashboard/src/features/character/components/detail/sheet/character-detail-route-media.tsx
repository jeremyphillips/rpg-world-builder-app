import type { ContentMedia } from '@rpg/contracts'

import { useUpdateCampaignCharacterMedia } from '@/features/campaign/hooks/use-update-campaign-character-media'

import {
  resolveCharacterMediaScope,
  type PcMediaScopeKind,
} from '../../../lib/display/resolve-character-media-scope.lib'
import { useUpdateCharacterMedia } from '../../../hooks/use-update-character-media'
import { useUpdateNpcMedia } from '../../../npc/hooks/use-update-npc-media'
import { CharacterDetailMediaSlot } from './character-detail-media-slot'

export type CharacterDetailRouteMediaProps = {
  characterType: 'pc' | 'npc'
  characterId: string
  userId?: string
  campaignId?: string
  media?: ContentMedia
  canEditMedia: boolean
  /** When set, campaign PC media writes use the campaign route and scope. */
  pcMediaScopeKind?: PcMediaScopeKind
  writeCampaignCharacterMedia?: boolean
}

export function CharacterDetailRouteMedia({
  characterType,
  characterId,
  userId,
  campaignId,
  media,
  canEditMedia,
  pcMediaScopeKind = 'user-pc',
  writeCampaignCharacterMedia = false,
}: CharacterDetailRouteMediaProps) {
  const updatePcMedia = useUpdateCharacterMedia(
    characterType === 'pc' && !writeCampaignCharacterMedia ? characterId : undefined,
    campaignId,
  )
  const updateCampaignPcMedia = useUpdateCampaignCharacterMedia(
    writeCampaignCharacterMedia ? campaignId : undefined,
    writeCampaignCharacterMedia ? characterId : undefined,
  )
  const updateNpcMedia = useUpdateNpcMedia(
    characterType === 'npc' ? campaignId : undefined,
    characterType === 'npc' ? characterId : undefined,
  )

  const scope = resolveCharacterMediaScope({
    characterType,
    userId: characterType === 'pc' ? userId : undefined,
    campaignId,
    pcScopeKind: characterType === 'pc' ? pcMediaScopeKind : undefined,
  })

  if (!scope) {
    return null
  }

  return (
    <CharacterDetailMediaSlot
      media={media}
      scope={scope}
      readOnly={!canEditMedia}
      onSave={async (change) => {
        const patch = {
          media: change.media,
          expectedMediaRevision: change.expectedMediaRevision,
        }
        if (characterType === 'npc') {
          await updateNpcMedia.mutateAsync(patch)
          return
        }
        if (writeCampaignCharacterMedia) {
          await updateCampaignPcMedia.mutateAsync(patch)
          return
        }
        await updatePcMedia.mutateAsync(patch)
      }}
    />
  )
}
