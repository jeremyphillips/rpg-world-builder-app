import type { ContentMedia } from '../../../primitives/media/content-media'
import { contentTypeSubject } from '../../../primitives/media/system-image-subject'
import type { ContentDisplaySurface } from '../../../primitives/media/content-display-surface'
import {
  resolveContentDisplayImage,
  resolveContentDisplayImageAsOptional,
  resolveContentDisplayImagesByRole,
  type ContentDisplayImage,
  type ContentDisplayImagesByRole,
  type ResolveContentDisplayImageInput,
  type ResolveContentDisplayImageResult,
} from './resolve-content-display-image'

export type ResolveCharacterDisplayImageInput = {
  media?: ContentMedia | null
  surface: ContentDisplaySurface
  resolveUploadSrc?: ResolveContentDisplayImageInput['resolveUploadSrc']
}

const CHARACTER_REGISTRY_LOOKUP_STUB = {
  subject: contentTypeSubject('classes'),
  slug: '',
  contentSource: 'homebrew',
} as const satisfies Pick<ResolveContentDisplayImageInput, 'subject' | 'slug' | 'contentSource'>

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

/** Portrait and primary images for multi-frame character surfaces (list card + row thumb). */
export function resolveCharacterDisplayImagesByRole(
  input: Omit<ResolveCharacterDisplayImageInput, 'surface'>,
): ContentDisplayImagesByRole {
  return resolveContentDisplayImagesByRole({
    ...input,
    ...CHARACTER_REGISTRY_LOOKUP_STUB,
    domain: 'character',
    roles: ['portrait', 'primary'],
  })
}
