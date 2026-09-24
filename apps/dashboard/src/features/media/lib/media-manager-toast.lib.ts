import { TOAST_DURATION } from '@rpg/ui'

export const MEDIA_MANAGER_TOAST_IDS = {
  imageRemoved: 'media-image-removed',
  duplicate: 'media-duplicate',
  uploadLimit: 'media-upload-limit',
  dropRejected: 'media-drop-rejected',
  saveError: 'media-save-error',
} as const

export function resolveMediaUploadLimitToastMessage(remaining: number): string {
  return `Only ${remaining} more ${remaining === 1 ? 'image' : 'images'} can be added.`
}

export function resolveMediaRemovedToastDuration(): number {
  return TOAST_DURATION.undo
}
