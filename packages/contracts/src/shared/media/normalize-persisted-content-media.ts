import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentMedia } from './content-media'
import { systemImageSourcesEqual } from './content-media-source'
import { isRolePresentationCustomized } from './is-role-presentation-customized'
import type { MediaRole } from './roles'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImageSourceDimensions,
} from './system-content-image-registry'
import type { SystemImageSubject } from './system-image-subject'

/** Strip derived-default role assignments before persisting media from the manager. */
// fallow-ignore-next-line complexity
export function normalizePersistedContentMedia(input: {
  media: ContentMedia
  subject: SystemImageSubject
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
  const roles = { ...input.media.roles }

  for (const role of input.allowedRoles) {
    const assignment = roles[role]
    if (!assignment) continue

    const derived = deriveSystemContentImage({
      imageSetId,
      subject: input.subject,
      assetRole: role,
      slug: input.slug,
    })

    if (assignment.source.kind === 'system') {
      const matchesDerived =
        derived !== undefined && systemImageSourcesEqual(assignment.source, derived)

      const sourceDimensions = resolveSystemContentImageSourceDimensions({
        imageSetId: assignment.source.imageSetId,
        subject: assignment.source.subject,
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
