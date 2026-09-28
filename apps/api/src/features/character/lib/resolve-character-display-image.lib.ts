import {
  resolveCharacterDisplayImagesByRole,
  type Character,
  type ContentDisplayImagesByRole,
} from '@rpg/contracts'

import { resolveMediaArtworkUrl } from '../../media/lib/media-artwork-url.lib'

export function resolveCharacterDisplayImagesByRoleForRecord(
  character: Pick<Character, 'media'>,
): ContentDisplayImagesByRole {
  return resolveCharacterDisplayImagesByRole({
    media: character.media,
    resolveUploadSrc: resolveMediaArtworkUrl,
  })
}
