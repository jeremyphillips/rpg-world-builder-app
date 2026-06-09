import type { Request, Response } from 'express'

import { storeUpload, resolveUploadPath, ALLOWED_MIME_TYPES } from './upload.service'
import { HttpError } from '../../lib/http-error'

/** POST /api/uploads — accept a single file, validate, persist, return the key. */
export async function upload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw HttpError.badRequest('No file provided.')
  }

  const key = await storeUpload(req.file.buffer)
  res.status(201).json({ key })
}

/** GET /api/uploads/:key — serve a stored file with safe response headers. */
export async function serve(req: Request, res: Response): Promise<void> {
  const { key } = req.params as { key: string }
  const filePath = resolveUploadPath(key)

  // Derive MIME type from the extension (already validated by resolveUploadPath).
  const ext = key.split('.').at(-1)!.toLowerCase()
  const MIME: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  const mime = MIME[ext] ?? 'application/octet-stream'

  // Prevent browsers from MIME-sniffing away from the declared type.
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Disposition', 'inline')
  // Keys are UUIDs — content-addressable; safe to cache indefinitely.
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

  res.sendFile(filePath)
}

/** Exposed for documentation / discovery purposes. */
export { ALLOWED_MIME_TYPES }
