import { asCropPresentation, type ContentMedia } from '@rpg/contracts'

import { mediaImageUrl } from '@/features/media/lib/media-display'

/** Banner rendition URL for the overview hero. Crop comes from the saved role; emblem scale/offset is not applied by the rendition API yet. */
export function resolveCampaignBannerImageUrl(media: ContentMedia | undefined): string | undefined {
  const assignment = media?.roles.banner
  if (!assignment || assignment.source.kind !== 'upload') return undefined
  const source = assignment.source

  const attachment = media.images.find((image) => image.id === source.imageId)
  if (!attachment) return undefined

  const crop = asCropPresentation(assignment.presentation)?.crop
  return mediaImageUrl(attachment.assetId, 'banner', crop)
}

export function resolveCampaignEmblemImageUrl(media: ContentMedia | undefined): string | undefined {
  const assignment = media?.roles.emblem
  if (!assignment || assignment.source.kind !== 'upload') return undefined
  const source = assignment.source

  const attachment = media.images.find((image) => image.id === source.imageId)
  if (!attachment) return undefined

  return mediaImageUrl(attachment.assetId, 'emblem')
}
