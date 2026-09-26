import type { ContentMedia } from './content-media'
import type { ContentDisplaySurface } from './content-display-surface'
import {
  resolveContentDisplayImage,
  resolveContentDisplayImageAsOptional,
  type ContentDisplayImage,
  type ResolveContentDisplayImageInput,
  type ResolveContentDisplayImageResult,
} from './resolve-content-display-image'

export type ResolveCharacterDisplayImageInput = {
  media?: ContentMedia | null
  surface: ContentDisplaySurface
  resolveUploadSrc?: ResolveContentDisplayImageInput['resolveUploadSrc']
}

const CHARACTER_REGISTRY_LOOKUP_STUB = {
  contentType: 'classes',
  slug: '',
  contentSource: 'homebrew',
} as const satisfies Pick<ResolveContentDisplayImageInput, 'contentType' | 'slug' | 'contentSource'>

/** Character display resolution — portrait→primary on compact; no catalog system art. */
export function resolveCharacterDisplayImage(
  input: ResolveCharacterDisplayImageInput,
): ResolveContentDisplayImageResult {
  return resolveContentDisplayImage({
    ...input,
    ...CHARACTER_REGISTRY_LOOKUP_STUB,
    domain: 'character',
  })
}

export function resolveCharacterDisplayImageAsOptional(
  input: ResolveCharacterDisplayImageInput,
): ContentDisplayImage | undefined {
  return resolveContentDisplayImageAsOptional({
    ...input,
    ...CHARACTER_REGISTRY_LOOKUP_STUB,
    domain: 'character',
  })
}
