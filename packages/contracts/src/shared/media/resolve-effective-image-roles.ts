import type { ContentMedia } from './content-media'
import type { AvailableContentMediaSource } from './resolve-available-content-media-sources'
import { selectDisplaySourceForRole } from './select-display-source-for-role'
import type { MediaRole } from './roles'

export type EffectiveImageRoles = {
  roles: MediaRole[]
  derivedRoles: MediaRole[]
}

/** Resolve role ownership for one gallery image from canonical sources. */
export function resolveEffectiveImageRoles(
  _media: ContentMedia,
  imageId: string,
  allowedRoles: readonly MediaRole[],
  sources: readonly AvailableContentMediaSource[],
): EffectiveImageRoles {
  const source = sources.find((entry) => entry.id === imageId)
  if (!source) {
    return { roles: [], derivedRoles: [] }
  }

  const persisted = allowedRoles.filter((role) =>
    source.assignments.some((entry) => entry.role === role && entry.state === 'persisted'),
  )
  if (persisted.length > 0) {
    return { roles: persisted, derivedRoles: [] }
  }

  const derived = allowedRoles.filter((role) =>
    source.assignments.some((entry) => entry.role === role && entry.state === 'derived'),
  )
  return { roles: derived, derivedRoles: derived }
}

/** Representative field preview id from the same role selection as display resolution. */
export function resolveEffectiveRepresentativeImageId(
  media: ContentMedia,
  representativeRoles: readonly MediaRole[],
  sources: readonly AvailableContentMediaSource[],
): string | undefined {
  for (const role of representativeRoles) {
    const { source } = selectDisplaySourceForRole({ sources, media, role })
    if (source) {
      return source.id
    }
  }
  return undefined
}
