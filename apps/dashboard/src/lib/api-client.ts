import {
  fetchCsrfToken,
  UPLOAD_FORM_FIELD,
  UPLOADS_API_PATH,
  type UploadResponse,
} from '@rpg/contracts'
import { CSRF_HEADER, request } from '@rpg/api-client'

export { CSRF_HEADER, deleteJson, patchJson, postJson, putJson, request } from '@rpg/api-client'

/**
 * Upload a single file to `POST /api/uploads` and return the storage key.
 * Uses multipart form data — do not set `Content-Type`; the browser adds the
 * boundary. Requires an authenticated session and CSRF token.
 */
export async function uploadFile(
  file: File,
  fallbackMessage: string = 'Could not upload file.',
): Promise<string> {
  const csrfToken = await fetchCsrfToken()
  const body = new FormData()
  body.append(UPLOAD_FORM_FIELD, file)
  const { key } = await request<UploadResponse>(
    UPLOADS_API_PATH,
    {
      method: 'POST',
      headers: { [CSRF_HEADER]: csrfToken },
      body,
    },
    fallbackMessage,
  )
  return key
}
