import { CSRF_HEADER, postJson, request } from '@rpg/api-client'
import {
  fetchCsrfToken,
  MEDIA_API_PATH,
  MEDIA_UPLOAD_FORM_FIELD,
  MEDIA_UPLOAD_IDEMPOTENCY_HEADER,
  mediaAssetSchema,
  mediaAssetUploadResponseSchema,
  mediaUploadSessionSchema,
  type MediaScope,
} from '@rpg/contracts'

export async function createUploadSession(scope: MediaScope) {
  return mediaUploadSessionSchema.parse(await postJson(`${MEDIA_API_PATH}/sessions`, { scope }))
}
export async function uploadMediaFile(
  sessionId: string,
  file: File,
  key: string,
  signal: AbortSignal,
) {
  const body = new FormData()
  body.append(MEDIA_UPLOAD_FORM_FIELD, file)
  return mediaAssetUploadResponseSchema.parse(
    await request(`${MEDIA_API_PATH}/sessions/${encodeURIComponent(sessionId)}/assets`, {
      method: 'POST',
      body,
      signal,
      headers: { [CSRF_HEADER]: await fetchCsrfToken(), [MEDIA_UPLOAD_IDEMPOTENCY_HEADER]: key },
    }),
  )
}
export async function fetchMediaAsset(id: string) {
  return mediaAssetSchema.parse(await request(`${MEDIA_API_PATH}/assets/${encodeURIComponent(id)}`))
}
