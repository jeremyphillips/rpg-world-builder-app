import {
  resolveCharacterDisplayImagesByRole,
  type Character,
  type ContentDisplayImagesByRole,
} from '@rpg/contracts'

import { resolveMediaArtworkUrl } from '../../media'

export function resolveCharacterDisplayImagesByRoleForRecord(
  character: Pick<Character, 'media'>,
): ContentDisplayImagesByRole {
  return resolveCharacterDisplayImagesByRole({
    media: character.media,
    resolveUploadSrc: resolveMediaArtworkUrl,
  })
}
