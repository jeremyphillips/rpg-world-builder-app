import type {
  ContentMedia,
  ContainPresentation,
  MediaAsset,
  MediaRole,
  NormalizedCrop,
  NormalizedFocalPoint,
  SourceDimensions,
} from '@rpg/contracts'
import {
  canonicalizeEmblemPresentation,
  createDefaultRolePresentation,
  defaultEmblemPresentation,
  asCropPresentation,
} from '@rpg/contracts'

import {
  imageAddedMediaStatusNotice,
  textMediaStatusNotice,
  type MediaStatusNotice,
} from './media-notice.lib'

export type MediaSession = {
  initial: ContentMedia
  media: ContentMedia
  selectedId?: string
  presentation: MediaRole
  notice: MediaStatusNotice | null
}

export type MediaAction =
  | { type: 'select'; id: string; allowedRoles: readonly MediaRole[] }
  | { type: 'presentation'; role: MediaRole }
  | { type: 'add'; id: string; asset: MediaAsset }
  | { type: 'remove'; id: string; allowedRoles: readonly MediaRole[] }
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

function rolesForImage(
  media: ContentMedia,
  imageId: string,
  allowedRoles: readonly MediaRole[],
): MediaRole[] {
  return allowedRoles.filter((role) => media.roles[role]?.imageId === imageId)
}

function resolvePresentationForImage(
  media: ContentMedia,
  imageId: string | undefined,
  allowedRoles: readonly MediaRole[],
): MediaRole {
  if (!imageId) return allowedRoles[0] ?? 'primary'
  const assigned = rolesForImage(media, imageId, allowedRoles)
  return assigned[0] ?? allowedRoles[0] ?? 'primary'
}

export function createMediaSession(
  media: ContentMedia,
  initialSelectedImageId: string | undefined,
  allowedRoles: readonly MediaRole[],
): MediaSession {
  const requested = media.images.some((image) => image.id === initialSelectedImageId)
    ? initialSelectedImageId
    : undefined
  const selectedId =
    requested ??
    allowedRoles.map((role) => media.roles[role]?.imageId).find(Boolean) ??
    media.images[0]?.id

  return {
    initial: structuredClone(media),
    media: structuredClone(media),
    selectedId,
    presentation: resolvePresentationForImage(media, selectedId, allowedRoles),
    notice: null,
  }
}

export function isMediaSessionDirty(state: MediaSession): boolean {
  return JSON.stringify(state.initial) !== JSON.stringify(state.media)
}

export function mediaSessionReducer(state: MediaSession, action: MediaAction): MediaSession {
  if (action.type === 'select') return selectImage(state, action.id, action.allowedRoles)
  if (action.type === 'presentation') return { ...state, presentation: action.role }

  const next = structuredClone(state)
  const { media } = next

  switch (action.type) {
    case 'add':
      addImage(next, action)
      break
    case 'remove':
      removeImage(next, action.id, action.allowedRoles)
      break
    case 'alt': {
      const image = media.images.find((image) => image.id === action.id)
      if (image) image.alt = action.alt
      break
    }
    case 'role':
      assignRole(next, action)
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

function removeImage(next: MediaSession, id: string, allowedRoles: readonly MediaRole[]) {
  const { media } = next
  const index = media.images.findIndex((image) => image.id === id)
  media.images = media.images.filter((image) => image.id !== id)
  for (const role of allowedRoles) {
    if (media.roles[role]?.imageId === id) delete media.roles[role]
  }
  if (next.selectedId === id) {
    next.selectedId = media.images[Math.min(index, media.images.length - 1)]?.id
  }
  next.presentation = resolvePresentationForImage(media, next.selectedId, allowedRoles)
  next.notice = textMediaStatusNotice(
    'Image removed from the draft. No other image was assigned automatically.',
  )
}

function assignRole(next: MediaSession, action: Extract<MediaAction, { type: 'role' }>) {
  const { media } = next
  if (action.assigned) {
    if (media.roles[action.role]?.imageId === action.id) return
    media.roles[action.role] = {
      imageId: action.id,
      presentation: action.source
        ? createDefaultRolePresentation(action.role, action.source)
        : action.role === 'emblem'
          ? defaultEmblemPresentation()
          : { mode: 'crop' },
    }
    next.presentation = action.role
  } else {
    delete media.roles[action.role]
    next.presentation = resolvePresentationForImage(media, next.selectedId, action.allowedRoles)
  }
  next.notice = textMediaStatusNotice(
    `${action.role} ${action.assigned ? 'assigned to selected image' : 'unassigned'}.`,
  )
}

function selectImage(
  state: MediaSession,
  id: string,
  allowedRoles: readonly MediaRole[],
): MediaSession {
  return {
    ...state,
    selectedId: id,
    presentation: resolvePresentationForImage(state.media, id, allowedRoles),
  }
}

function addImage(next: MediaSession, action: Extract<MediaAction, { type: 'add' }>) {
  if (next.media.images.some((image) => image.assetId === action.asset.id)) {
    next.notice = textMediaStatusNotice('This image is already in the collection.')
    return
  }
  next.media.images.push({ id: action.id, assetId: action.asset.id })
  next.selectedId ??= action.id
  next.notice = imageAddedMediaStatusNotice(action.asset.filename)
}

function updateCrop(next: MediaSession, crop: NormalizedCrop, focalPoint?: NormalizedFocalPoint) {
  const assignment = next.media.roles[next.presentation]
  if (!assignment || assignment.imageId !== next.selectedId) return
  assignment.presentation = {
    mode: 'crop',
    crop,
    ...(focalPoint
      ? { focalPoint }
      : asCropPresentation(assignment.presentation)?.focalPoint
        ? { focalPoint: asCropPresentation(assignment.presentation)!.focalPoint }
        : {}),
  }
}

function updateContain(next: MediaSession, layout: ContainPresentation, source: SourceDimensions) {
  const assignment = next.media.roles[next.presentation]
  if (!assignment || assignment.imageId !== next.selectedId) return
  assignment.presentation = canonicalizeEmblemPresentation(source, layout)
}

export function assignedRolesForImage(
  media: ContentMedia,
  imageId: string,
  allowedRoles: readonly MediaRole[],
): MediaRole[] {
  return rolesForImage(media, imageId, allowedRoles)
}
