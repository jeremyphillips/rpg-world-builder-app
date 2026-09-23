import type { ContentMedia, MediaAsset, MediaRole, NormalizedCrop } from '@rpg/contracts'

export type MediaSession = {
  initial: ContentMedia
  media: ContentMedia
  selectedId?: string
  presentation: MediaRole
  notice: string
}
export type MediaAction =
  | { type: 'select'; id: string }
  | { type: 'presentation'; role: MediaRole }
  | { type: 'add'; id: string; asset: MediaAsset }
  | { type: 'remove'; id: string }
  | { type: 'alt'; id: string; alt: string }
  | { type: 'role'; id: string; role: MediaRole; assigned: boolean }
  | { type: 'crop'; crop: NormalizedCrop }

export function createMediaSession(media: ContentMedia): MediaSession {
  return {
    initial: structuredClone(media),
    media: structuredClone(media),
    selectedId:
      media.roles.portrait?.imageId ?? media.roles.primary?.imageId ?? media.images[0]?.id,
    presentation: media.roles.portrait ? 'portrait' : 'primary',
    notice: '',
  }
}
export function isMediaSessionDirty(state: MediaSession): boolean {
  return JSON.stringify(state.initial) !== JSON.stringify(state.media)
}
export function mediaSessionReducer(state: MediaSession, action: MediaAction): MediaSession {
  if (action.type === 'select') return selectImage(state, action.id)
  if (action.type === 'presentation') return { ...state, presentation: action.role }
  const next = structuredClone(state)
  const { media } = next
  switch (action.type) {
    case 'add':
      addImage(next, action)
      break
    case 'remove':
      removeImage(next, action.id)
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
      updateCrop(next, action.crop)
      break
  }
  return next
}

function removeImage(next: MediaSession, id: string) {
  const { media } = next
  const index = media.images.findIndex((image) => image.id === id)
  media.images = media.images.filter((image) => image.id !== id)
  for (const role of ['primary', 'portrait'] as const) {
    if (media.roles[role]?.imageId === id) delete media.roles[role]
  }
  if (next.selectedId === id)
    next.selectedId = media.images[Math.min(index, media.images.length - 1)]?.id
  next.presentation = media.roles.portrait?.imageId === next.selectedId ? 'portrait' : 'primary'
  next.notice = 'Image removed from the draft. No other image was assigned automatically.'
}

function assignRole(next: MediaSession, action: Extract<MediaAction, { type: 'role' }>) {
  const { media } = next
  if (action.assigned) {
    if (media.roles[action.role]?.imageId === action.id) return
    media.roles[action.role] = { imageId: action.id }
    next.presentation = action.role
  } else {
    delete media.roles[action.role]
    next.presentation = 'primary'
  }
  next.notice = `${action.role === 'portrait' ? 'Portrait' : 'Primary image'} ${action.assigned ? 'assigned to selected image' : 'unassigned'}.`
}

function selectImage(state: MediaSession, id: string): MediaSession {
  return {
    ...state,
    selectedId: id,
    presentation: state.media.roles.portrait?.imageId === id ? 'portrait' : 'primary',
  }
}
function addImage(next: MediaSession, action: Extract<MediaAction, { type: 'add' }>) {
  if (next.media.images.some((image) => image.assetId === action.asset.id)) {
    next.notice = 'This image is already in the collection.'
    return
  }
  next.media.images.push({ id: action.id, assetId: action.asset.id })
  next.selectedId ??= action.id
  next.notice = `${action.asset.filename} added. Assign a role to use it as representative artwork.`
}
function updateCrop(next: MediaSession, crop: NormalizedCrop) {
  const portrait = next.media.roles.portrait
  if (portrait && portrait.imageId === next.selectedId) portrait.presentation = { crop }
}
