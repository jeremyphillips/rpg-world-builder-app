import { Router } from 'express'
import multer from 'multer'

import { createMediaUploadSessionInputSchema } from '@rpg/contracts'

import { loadEnv } from '../../env'
import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './media.controller'

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

export const mediaRouter: Router = Router()

const upload = buildMulter()

mediaRouter.post(
  '/sessions',
  requireAuth,
  validate(createMediaUploadSessionInputSchema),
  controller.createSession,
)

mediaRouter.post(
  '/sessions/:sessionId/assets',
  requireAuth,
  upload.single(controller.MEDIA_UPLOAD_FORM_FIELD),
  controller.uploadAsset,
)

mediaRouter.get('/assets/:assetId', requireAuth, controller.getAsset)

mediaRouter.get('/assets/:assetId/renditions/:preset', requireAuth, controller.getAssetRendition)
