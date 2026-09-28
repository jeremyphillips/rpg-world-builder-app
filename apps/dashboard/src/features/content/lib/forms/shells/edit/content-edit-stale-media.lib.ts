import { contentMediaSchema, isApiError, type ContentMedia } from '@rpg/contracts'

export const CONTENT_MEDIA_STALE_FORM_MESSAGE =
  'Images changed on the server. They were reloaded; review them and save again.'

export function extractStaleMediaFromError(error: unknown): ContentMedia | undefined {
  if (!isApiError(error) || error.status !== 409 || error.code !== 'stale_revision') {
    return undefined
  }

  if (typeof error.details !== 'object' || error.details === null) return undefined

  const parsed = contentMediaSchema.safeParse((error.details as Record<string, unknown>).media)
  return parsed.success ? parsed.data : undefined
}
