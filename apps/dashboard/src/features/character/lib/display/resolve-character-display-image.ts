import { asCropPresentation, type Character, type ContentDisplayImage } from '@rpg/contracts'

import { mediaImageUrl, MEDIA_SOURCE_CROP } from '@/features/media/lib/media-display'

export function resolveCharacterPrimaryDisplayImage(
  character: Pick<Character, 'media'>,
): ContentDisplayImage | undefined {
  const assignment = character.media?.roles.primary
  const source = assignment?.source
  if (!assignment || !source || source.kind !== 'upload') return undefined

  const attachment = character.media?.images.find((image) => image.id === source.imageId)
  if (!attachment) return undefined

  const crop = asCropPresentation(assignment.presentation)?.crop

  return {
    src: mediaImageUrl(attachment.assetId, 'artwork', MEDIA_SOURCE_CROP),
    crop,
    sourceKind: 'upload',
  }
}
