import type { Request, Response } from 'express'

import { MEDIA_UPLOAD_FORM_FIELD, MEDIA_UPLOAD_IDEMPOTENCY_HEADER } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { createMediaUploadSession, getMediaAssetMetadata, uploadMediaAsset } from './media.service'

/** POST /api/media/sessions */
export async function createSession(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw HttpError.unauthorized()
  }

  const session = await createMediaUploadSession(req.body, req.user.id)
  res.status(201).json(session)
}

/** POST /api/media/sessions/:sessionId/assets */
export async function uploadAsset(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw HttpError.unauthorized()
  }

  if (!req.file) {
    throw HttpError.badRequest('No file provided.')
  }

  const { sessionId } = req.params as { sessionId: string }
  const idempotencyKey = req.header(MEDIA_UPLOAD_IDEMPOTENCY_HEADER) ?? undefined

  const result = await uploadMediaAsset({
    sessionId,
    userId: req.user.id,
    buffer: req.file.buffer,
    originalFilename: req.file.originalname,
    idempotencyKey,
  })

  res.status(201).json(result)
}

/** GET /api/media/assets/:assetId */
export async function getAsset(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw HttpError.unauthorized()
  }

  const { assetId } = req.params as { assetId: string }
  const asset = await getMediaAssetMetadata(assetId, req.user.id)

  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).json(asset)
}

export { MEDIA_UPLOAD_FORM_FIELD }
