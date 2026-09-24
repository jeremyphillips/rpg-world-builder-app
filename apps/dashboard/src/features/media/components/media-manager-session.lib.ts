import type { UseMediaManagerBodyDropResult } from '../hooks/use-media-manager-body-drop'
import type { MediaManagerProps } from '../lib/media-manager.types'
import { hasMediaStatusNotice, type MediaStatusNotice } from '../lib/media-notice.lib'

export type MediaManagerBodyDropOverlayState = 'active' | 'invalid'

export function resolveMediaManagerBodyDropOverlay(
  preview: MediaManagerProps['previewBodyDrop'],
  bodyDrop: Pick<UseMediaManagerBodyDropResult, 'active' | 'invalid'>,
): MediaManagerBodyDropOverlayState | undefined {
  if (preview) return preview
  if (!bodyDrop.active) return undefined
  return bodyDrop.invalid ? 'invalid' : 'active'
}

export function shouldShowMediaManagerStatus(input: {
  statusNotice?: MediaStatusNotice | null
  hasActiveUploads: boolean
  hasFailedUploads: boolean
  validationOk: boolean
  error?: string
}): boolean {
  return (
    hasMediaStatusNotice(input.statusNotice) ||
    input.hasActiveUploads ||
    input.hasFailedUploads ||
    !input.validationOk ||
    Boolean(input.error)
  )
}

export function resolveMediaManagerFooterHint(
  mode: MediaManagerProps['mode'],
  label: string,
): string {
  return mode === 'form' ? `Changes are saved with this ${label}.` : 'Save changes to this record.'
}
