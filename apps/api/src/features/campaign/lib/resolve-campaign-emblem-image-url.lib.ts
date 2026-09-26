import type { ContentMedia } from '@rpg/contracts'

import { resolveMediaAssetUrl } from '../../media/lib/resolve-media-asset-url.lib'

export function resolveCampaignEmblemImageUrl(media: ContentMedia | undefined): string | undefined {
  const assignment = media?.roles.emblem
  if (!assignment || assignment.source.kind !== 'upload') return undefined
  const source = assignment.source

  const attachment = media.images.find((image) => image.id === source.imageId)
  if (!attachment) return undefined

  return resolveMediaAssetUrl(attachment.assetId, 'emblem')
}
