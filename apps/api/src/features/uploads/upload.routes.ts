import { Router } from 'express'
import multer from 'multer'

import { loadEnv } from '../../env'
import { requireAuth } from '../../middleware/require-auth'
import * as controller from './upload.controller'

/**
 * Multer is configured with `memoryStorage` so the buffer is available for
 * magic-byte MIME validation before anything touches disk. Files that fail
 * validation are discarded without ever being written.
 *
 * Size limit is read from env at router construction time (once at startup).
 */
function buildMulter() {
  const { MAX_UPLOAD_BYTES } = loadEnv()
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
      files: 1,
    },
  })
}

export const uploadsRouter: Router = Router()

const upload = buildMulter()

// POST /api/uploads — authenticated; single file field named "file"
uploadsRouter.post('/', requireAuth, upload.single('file'), controller.upload)

// GET /api/uploads/:key — public read; no auth required
uploadsRouter.get('/:key', controller.serve)
