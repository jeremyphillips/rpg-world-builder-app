import type { ContentMedia } from './content-media'
import { roleAssignmentMatchesSelection } from './content-media-source'
import type { AvailableContentImage } from './get-available-content-images'
import type { MediaRole } from './roles'

export type EffectiveImageRoles = {
  roles: MediaRole[]
  derivedRoles: MediaRole[]
}

function derivedSystemImage(
  availableImages: AvailableContentImage[],
): AvailableContentImage | undefined {
  return availableImages.find((image) => image.kind === 'system')
}

/** Resolve role ownership for one gallery image, including derived system primary. */
export function resolveEffectiveImageRoles(
  media: ContentMedia,
  imageId: string,
  allowedRoles: readonly MediaRole[],
  availableImages: AvailableContentImage[],
): EffectiveImageRoles {
  const roles = allowedRoles.filter((role) => {
    const assignment = media.roles[role]
    return assignment ? roleAssignmentMatchesSelection(assignment, imageId) : false
  })

  if (roles.length > 0) {
    return { roles, derivedRoles: [] }
  }

  const systemImage = derivedSystemImage(availableImages)
  if (systemImage?.id === imageId && allowedRoles.includes('primary') && !media.roles.primary) {
    return { roles: ['primary'], derivedRoles: ['primary'] }
  }

  return { roles: [], derivedRoles: [] }
}

/** Walk representative roles and return the gallery image that effectively owns the first match. */
export function resolveEffectiveRepresentativeImageId(
  media: ContentMedia,
  representativeRoles: readonly MediaRole[],
  availableImages: AvailableContentImage[],
): string | undefined {
  for (const role of representativeRoles) {
    for (const image of availableImages) {
      const { roles } = resolveEffectiveImageRoles(media, image.id, [role], availableImages)
      if (roles.includes(role)) return image.id
    }
  }

  return availableImages[0]?.id ?? media.images[0]?.id
}
