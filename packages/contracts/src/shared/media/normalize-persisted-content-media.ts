import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'
import type { ContentMedia } from './content-media'
import { isRolePresentationCustomized } from './is-role-presentation-customized'
import type { MediaRole } from './roles'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImageSourceDimensions,
} from './system-content-image-registry'

/** Strip derived-default role assignments before persisting media from the manager. */
// fallow-ignore-next-line complexity
export function normalizePersistedContentMedia(input: {
  media: ContentMedia
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
  allowedRoles: readonly MediaRole[]
}): ContentMedia {
  const imageSetId = resolveContentImageSet({
    campaignImageSetId: input.campaignImageSetId,
    rulesetId: input.rulesetId,
  })
  const derived = deriveSystemContentImage({
    imageSetId,
    contentType: input.contentType,
    assetRole: 'primary',
    slug: input.slug,
  })
  const roles = { ...input.media.roles }

  for (const role of input.allowedRoles) {
    const assignment = roles[role]
    if (!assignment) continue

    if (assignment.source.kind === 'system') {
      const matchesDerived =
        derived !== undefined &&
        assignment.source.imageSetId === derived.imageSetId &&
        assignment.source.contentType === derived.contentType &&
        assignment.source.assetRole === derived.assetRole &&
        assignment.source.slug === derived.slug

      const sourceDimensions = resolveSystemContentImageSourceDimensions({
        imageSetId: assignment.source.imageSetId,
        contentType: assignment.source.contentType,
        assetRole: assignment.source.assetRole,
        slug: assignment.source.slug,
      }) ?? { width: 0, height: 0 }

      const customized = isRolePresentationCustomized({
        role,
        presentation: assignment.presentation,
        source: sourceDimensions,
      })

      if (matchesDerived && !customized) {
        delete roles[role]
      }
      continue
    }

    if (assignment.source.kind === 'upload') {
      const uploadImageId = assignment.source.imageId
      const imageExists = input.media.images.some((image) => image.id === uploadImageId)
      if (!imageExists) {
        delete roles[role]
      }
    }
  }

  return {
    ...input.media,
    roles,
  }
}
