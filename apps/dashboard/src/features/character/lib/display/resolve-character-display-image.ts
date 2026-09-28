import {
  resolveCharacterDisplayImageAsOptional,
  resolveCharacterDisplayImagesByRole,
  type Character,
  type ContentDisplayImage,
  type ContentDisplayImagesByRole,
  type ContentDisplaySurface,
} from '@rpg/contracts'

import { mediaImageUrl, MEDIA_SOURCE_CROP } from '@/features/media'

const resolveUploadSrc = (assetId: string) => mediaImageUrl(assetId, 'artwork', MEDIA_SOURCE_CROP)

export function resolveCharacterDisplayImageForSurface(
  character: Pick<Character, 'media'>,
  surface: ContentDisplaySurface = 'compact',
): ContentDisplayImage | undefined {
  return resolveCharacterDisplayImageAsOptional({
    media: character.media,
    surface,
    resolveUploadSrc,
  })
}

export function resolveCharacterDisplayImagesByRoleForRecord(
  character: Pick<Character, 'media'>,
): ContentDisplayImagesByRole {
  return resolveCharacterDisplayImagesByRole({
    media: character.media,
    resolveUploadSrc,
  })
}

/** @deprecated Use {@link resolveCharacterDisplayImageForSurface} or {@link resolveCharacterDisplayImagesByRoleForRecord}. */
export const resolveCharacterPrimaryDisplayImage = resolveCharacterDisplayImageForSurface
