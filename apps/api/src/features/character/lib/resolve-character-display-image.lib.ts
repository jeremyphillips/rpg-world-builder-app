import {
  resolveCharacterDisplayImageAsOptional,
  type Character,
  type ContentDisplayImage,
  type ContentDisplaySurface,
} from '@rpg/contracts'

import { resolveMediaArtworkUrl } from '../../media/lib/media-artwork-url.lib'

export function resolveCharacterDisplayImageForSurface(
  character: Pick<Character, 'media'>,
  surface: ContentDisplaySurface = 'compact',
): ContentDisplayImage | undefined {
  return resolveCharacterDisplayImageAsOptional({
    media: character.media,
    surface,
    resolveUploadSrc: resolveMediaArtworkUrl,
  })
}
