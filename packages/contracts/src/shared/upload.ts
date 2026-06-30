import { z } from 'zod'

/** Same-origin path for authenticated file uploads. */
export const UPLOADS_API_PATH = '/api/uploads'

/** Multer field name expected by `POST /api/uploads`. */
export const UPLOAD_FORM_FIELD = 'file'

export const uploadResponseSchema = z.object({
  key: z.string(),
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>
