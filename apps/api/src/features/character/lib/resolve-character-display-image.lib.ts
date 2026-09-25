import { asCropPresentation, type Character, type ContentDisplayImage } from '@rpg/contracts'

import { resolveMediaAssetUrl } from '../../media/lib/resolve-media-asset-url.lib'

const MEDIA_SOURCE_CROP = { x: 0, y: 0, width: 1, height: 1 } as const

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
    src: resolveMediaAssetUrl(attachment.assetId, 'artwork', MEDIA_SOURCE_CROP),
    crop,
    sourceKind: 'upload',
  }
}
