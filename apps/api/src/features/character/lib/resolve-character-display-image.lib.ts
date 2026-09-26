import {
  resolveCharacterDisplayImageAsOptional,
  type Character,
  type ContentDisplayImage,
  type ContentDisplaySurface,
} from '@rpg/contracts'

import { resolveMediaAssetUrl } from '../../media/lib/resolve-media-asset-url.lib'

const MEDIA_SOURCE_CROP = { x: 0, y: 0, width: 1, height: 1 } as const

export function resolveCharacterDisplayImageForSurface(
  character: Pick<Character, 'media'>,
  surface: ContentDisplaySurface = 'compact',
): ContentDisplayImage | undefined {
  return resolveCharacterDisplayImageAsOptional({
    media: character.media,
    surface,
    resolveUploadSrc: (assetId) => resolveMediaAssetUrl(assetId, 'artwork', MEDIA_SOURCE_CROP),
  })
}
