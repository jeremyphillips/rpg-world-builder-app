import type {
  AvailableContentImage,
  ContentMedia,
  ContainPresentation,
  MediaAsset,
  MediaRole,
  NormalizedCrop,
  NormalizedFocalPoint,
  SourceDimensions,
} from '@rpg/contracts'
import {
  buildSystemContentImageVirtualId,
  canonicalizeEmblemPresentation,
  createDefaultRolePresentation,
  createSystemRoleAssignment,
  createUploadRoleAssignment,
  defaultEmblemPresentation,
  isSystemRoleAssignment,
  normalizeFocalPointForCrop,
  parseSystemContentImageVirtualId,
  resolveEffectiveImageRoles,
  roleAssignmentMatchesImageId,
  roleAssignmentMatchesSelection,
  roleAssignmentUploadImageId,
  asCropPresentation,
} from '@rpg/contracts'

export type MediaSession = {
  initial: ContentMedia
  media: ContentMedia
  selectedId?: string
  presentation: MediaRole
}

export type MediaAction =
  | { type: 'select'; id: string; allowedRoles: readonly MediaRole[] }
  | { type: 'presentation'; role: MediaRole }
  | { type: 'add'; id: string; asset: MediaAsset }
  | { type: 'remove'; id: string; allowedRoles: readonly MediaRole[] }
  | {
      type: 'restoreRemoved'
      image: ContentMedia['images'][number]
      index: number
      roles: Partial<Record<MediaRole, NonNullable<ContentMedia['roles'][MediaRole]>>>
      restoreSelection: boolean
      allowedRoles: readonly MediaRole[]
    }
  | { type: 'alt'; id: string; alt: string }
  | {
      type: 'role'
      id: string
      role: MediaRole
      assigned: boolean
      allowedRoles: readonly MediaRole[]
      source?: SourceDimensions
    }
  | { type: 'crop'; crop: NormalizedCrop; focalPoint?: NormalizedFocalPoint }
  | { type: 'contain'; layout: ContainPresentation; source: SourceDimensions }

export type DeriveAvailableImages = (media: ContentMedia) => AvailableContentImage[]

function isVirtualSystemId(id: string): boolean {
  return parseSystemContentImageVirtualId(id) !== undefined
}

function resolvePresentationForImage(
  media: ContentMedia,
  imageId: string | undefined,
  allowedRoles: readonly MediaRole[],
  availableImages: AvailableContentImage[],
): MediaRole {
  if (!imageId) return allowedRoles[0] ?? 'primary'
  const { roles } = resolveEffectiveImageRoles(media, imageId, allowedRoles, availableImages)
  return roles[0] ?? allowedRoles[0] ?? 'primary'
}

function resolveInitialSelectedId(
  media: ContentMedia,
  initialSelectedImageId: string | undefined,
  allowedRoles: readonly MediaRole[],
  availableImages: AvailableContentImage[],
): string | undefined {
  const selectableIds = new Set([
    ...media.images.map((image) => image.id),
    ...availableImages.filter((image) => image.kind === 'system').map((image) => image.id),
  ])
  const requested =
    initialSelectedImageId && selectableIds.has(initialSelectedImageId)
      ? initialSelectedImageId
      : undefined
  if (requested) return requested

  for (const role of allowedRoles) {
    const assignment = media.roles[role]
    if (!assignment) continue
    if (isSystemRoleAssignment(assignment)) {
      return buildSystemContentImageVirtualId(assignment.source)
    }
    const imageId = roleAssignmentUploadImageId(assignment)
    if (imageId) return imageId
  }

  return availableImages.find((image) => image.kind === 'system')?.id ?? media.images[0]?.id
}

export function createMediaSession(
  media: ContentMedia,
  initialSelectedImageId: string | undefined,
  allowedRoles: readonly MediaRole[],
  availableImages: AvailableContentImage[] = [],
): MediaSession {
  const selectedId = resolveInitialSelectedId(
    media,
    initialSelectedImageId,
    allowedRoles,
    availableImages,
  )

  return {
    initial: structuredClone(media),
    media: structuredClone(media),
    selectedId,
    presentation: resolvePresentationForImage(media, selectedId, allowedRoles, availableImages),
  }
}

export function isMediaSessionDirty(state: MediaSession): boolean {
  return JSON.stringify(state.initial) !== JSON.stringify(state.media)
}

export function hasNewMediaUploads(state: MediaSession): boolean {
  const initialIds = new Set(state.initial.images.map((image) => image.id))
  return state.media.images.some((image) => !initialIds.has(image.id))
}

export function mediaSessionReducer(
  state: MediaSession,
  action: MediaAction,
  deriveAvailableImages: DeriveAvailableImages,
): MediaSession {
  if (action.type === 'select') {
    return selectImage(state, action.id, action.allowedRoles, deriveAvailableImages)
  }
  if (action.type === 'presentation') return { ...state, presentation: action.role }

  const next = structuredClone(state)
  const { media } = next

  switch (action.type) {
    case 'add':
      addImage(next, action)
      break
    case 'remove':
      removeImage(next, action.id, action.allowedRoles, deriveAvailableImages)
      break
    case 'restoreRemoved':
      restoreRemovedImage(next, action, deriveAvailableImages)
      break
    case 'alt': {
      const image = media.images.find((image) => image.id === action.id)
      if (image) image.alt = action.alt
      break
    }
    case 'role':
      assignRole(next, action, deriveAvailableImages)
      break
    case 'crop':
      updateCrop(next, action.crop, action.focalPoint)
      break
    case 'contain':
      updateContain(next, action.layout, action.source)
      break
  }

  return next
}

function removeImage(
  next: MediaSession,
  id: string,
  allowedRoles: readonly MediaRole[],
  deriveAvailableImages: DeriveAvailableImages,
) {
  if (isVirtualSystemId(id)) return

  const { media } = next
  const index = media.images.findIndex((image) => image.id === id)
  media.images = media.images.filter((image) => image.id !== id)
  const availableImages = deriveAvailableImages(media)
  for (const role of allowedRoles) {
    const assignment = media.roles[role]
    if (assignment && roleAssignmentMatchesImageId(assignment, id)) {
      delete media.roles[role]
    }
  }
  if (next.selectedId === id) {
    next.selectedId =
      availableImages.find((image) => image.kind === 'system')?.id ??
      media.images[Math.min(index, media.images.length - 1)]?.id
  }
  next.presentation = resolvePresentationForImage(
    media,
    next.selectedId,
    allowedRoles,
    availableImages,
  )
}

function restoreRemovedImage(
  next: MediaSession,
  action: Extract<MediaAction, { type: 'restoreRemoved' }>,
  deriveAvailableImages: DeriveAvailableImages,
) {
  const { media } = next
  const clampedIndex = Math.max(0, Math.min(action.index, media.images.length))
  media.images.splice(clampedIndex, 0, structuredClone(action.image))
  for (const [role, assignment] of Object.entries(action.roles) as Array<
    [MediaRole, NonNullable<ContentMedia['roles'][MediaRole]>]
  >) {
    media.roles[role] = structuredClone(assignment)
  }
  const availableImages = deriveAvailableImages(media)
  if (action.restoreSelection) {
    next.selectedId = action.image.id
    next.presentation = resolvePresentationForImage(
      media,
      action.image.id,
      action.allowedRoles,
      availableImages,
    )
  }
}

// fallow-ignore-next-line complexity
function assignRole(
  next: MediaSession,
  action: Extract<MediaAction, { type: 'role' }>,
  deriveAvailableImages: DeriveAvailableImages,
) {
  const { media } = next

  if (!action.assigned) {
    const assignment = media.roles[action.role]
    if (assignment && roleAssignmentMatchesSelection(assignment, action.id)) {
      delete media.roles[action.role]
    }
    next.presentation = resolvePresentationForImage(
      media,
      next.selectedId,
      action.allowedRoles,
      deriveAvailableImages(media),
    )
    return
  }

  const systemSource = parseSystemContentImageVirtualId(action.id)
  if (systemSource) {
    if (
      media.roles[action.role] &&
      roleAssignmentMatchesSelection(media.roles[action.role], action.id)
    ) {
      return
    }
    media.roles[action.role] = {
      ...createSystemRoleAssignment({
        imageSetId: systemSource.imageSetId,
        contentType: systemSource.contentType as 'classes',
        assetRole: systemSource.assetRole,
        slug: systemSource.slug,
      }),
      presentation: action.source
        ? createDefaultRolePresentation(action.role, action.source)
        : { mode: 'crop' },
    }
    next.presentation = action.role
    return
  }

  if (
    media.roles[action.role] &&
    roleAssignmentMatchesImageId(media.roles[action.role], action.id)
  ) {
    return
  }

  media.roles[action.role] = {
    ...createUploadRoleAssignment(action.id),
    presentation: action.source
      ? createDefaultRolePresentation(action.role, action.source)
      : action.role === 'emblem'
        ? defaultEmblemPresentation()
        : { mode: 'crop' },
  }
  next.presentation = action.role
}

function selectImage(
  state: MediaSession,
  id: string,
  allowedRoles: readonly MediaRole[],
  deriveAvailableImages: DeriveAvailableImages,
): MediaSession {
  const availableImages = deriveAvailableImages(state.media)
  return {
    ...state,
    selectedId: id,
    presentation: resolvePresentationForImage(state.media, id, allowedRoles, availableImages),
  }
}

function addImage(next: MediaSession, action: Extract<MediaAction, { type: 'add' }>) {
  if (next.media.images.some((image) => image.assetId === action.asset.id)) {
    return
  }
  const attachment = { id: action.id, assetId: action.asset.id }
  next.media.images.push(attachment)
  next.selectedId ??= action.id
}

function ensureAssignmentForSelection(
  next: MediaSession,
): NonNullable<ContentMedia['roles'][MediaRole]> | null {
  if (!next.selectedId) return null

  const existing = next.media.roles[next.presentation]
  if (existing && roleAssignmentMatchesSelection(existing, next.selectedId)) {
    return existing
  }

  const systemSource = parseSystemContentImageVirtualId(next.selectedId)
  if (systemSource) {
    next.media.roles[next.presentation] = createSystemRoleAssignment({
      imageSetId: systemSource.imageSetId,
      contentType: systemSource.contentType,
      assetRole: systemSource.assetRole,
      slug: systemSource.slug,
    })
    return next.media.roles[next.presentation]!
  }

  if (next.media.images.some((image) => image.id === next.selectedId)) {
    next.media.roles[next.presentation] = createUploadRoleAssignment(next.selectedId)
    return next.media.roles[next.presentation]!
  }

  return null
}

function updateCrop(next: MediaSession, crop: NormalizedCrop, focalPoint?: NormalizedFocalPoint) {
  const assignment = ensureAssignmentForSelection(next)
  if (!assignment) {
    return
  }
  const previousCrop = asCropPresentation(assignment.presentation)?.crop
  const previousFocal = focalPoint ?? asCropPresentation(assignment.presentation)?.focalPoint
  assignment.presentation = {
    mode: 'crop',
    crop,
    focalPoint: normalizeFocalPointForCrop(previousCrop, crop, previousFocal),
  }
}

function updateContain(next: MediaSession, layout: ContainPresentation, source: SourceDimensions) {
  const assignment = next.media.roles[next.presentation]
  if (
    !assignment ||
    !next.selectedId ||
    !roleAssignmentMatchesSelection(assignment, next.selectedId)
  ) {
    return
  }
  assignment.presentation = canonicalizeEmblemPresentation(source, layout)
}

export function resolvePostRemovalSelection(
  images: ContentMedia['images'],
  removedIndex: number,
): string | undefined {
  return images[Math.min(removedIndex, images.length - 1)]?.id
}

export function isRemovableMediaSelection(
  selectedId: string | undefined,
  availableImages: AvailableContentImage[],
): boolean {
  if (!selectedId || isVirtualSystemId(selectedId)) return false
  return availableImages.some((image) => image.kind === 'upload' && image.id === selectedId)
}
