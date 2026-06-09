import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { fileTypeFromBuffer } from 'file-type'

import { loadEnv } from '../../env'
import { HttpError } from '../../lib/http-error'

/** MIME types accepted for upload. Validated by magic bytes, not extension. */
export const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Resolved absolute path to the upload storage directory. */
export function resolveUploadDir(): string {
  const { UPLOAD_DIR } = loadEnv()
  return path.resolve(process.cwd(), UPLOAD_DIR)
}

/**
 * Ensures the upload directory exists on disk (creates it if absent).
 * Safe to call multiple times — uses `recursive: true`.
 */
export function ensureUploadDir(): void {
  fs.mkdirSync(resolveUploadDir(), { recursive: true })
}

/**
 * Validates a multer-parsed file buffer against the allowed MIME type list
 * using magic bytes (not the Content-Type header or file extension). Throws a
 * 400 HttpError if the type is unsupported.
 */
export async function validateFileType(buffer: Buffer): Promise<{ mime: string; ext: string }> {
  const detected = await fileTypeFromBuffer(buffer)

  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw HttpError.badRequest('Unsupported file type. Accepted types: JPEG, PNG, WebP, GIF.')
  }

  return { mime: detected.mime, ext: EXTENSION_MAP[detected.mime] ?? detected.ext }
}

/**
 * Writes the validated buffer to the upload directory under a UUID-based key.
 * Returns the storage key (e.g. `a1b2c3d4-…-e5f6.jpg`) — never the full path.
 */
export async function storeUpload(buffer: Buffer): Promise<string> {
  const { mime, ext } = await validateFileType(buffer)
  void mime // validated above; ext is what we use
  const key = `${randomUUID()}.${ext}`
  const uploadDir = resolveUploadDir()
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, key), buffer)
  return key
}

/** Regex that a valid upload key must match — prevents path traversal. */
const KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i

/**
 * Returns the absolute path to a stored file after validating the key format
 * and that the resolved path stays within the upload directory. Throws 400/404
 * on invalid key or missing file.
 */
export function resolveUploadPath(key: string): string {
  if (!KEY_RE.test(key)) {
    throw HttpError.badRequest('Invalid upload key.')
  }

  const uploadDir = resolveUploadDir()
  const filePath = path.join(uploadDir, key)

  // Guard against path traversal even if the regex above is ever relaxed.
  if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
    throw HttpError.badRequest('Invalid upload key.')
  }

  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, 'not_found', 'File not found.')
  }

  return filePath
}
