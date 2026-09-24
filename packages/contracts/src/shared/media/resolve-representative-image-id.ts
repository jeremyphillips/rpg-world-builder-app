import type { ContentMedia } from './content-media'
import type { ContentMediaPolicy } from './media-policy'

/** Walk representativeRoles, then the first gallery image. */
export function resolveRepresentativeImageId(
  media: ContentMedia,
  policy: ContentMediaPolicy,
): string | undefined {
  for (const role of policy.representativeRoles) {
    const imageId = media.roles[role]?.imageId
    if (imageId) return imageId
  }

  return media.images[0]?.id
}
