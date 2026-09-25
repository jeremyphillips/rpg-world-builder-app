import type { Request, Response } from 'express'

import {
  MEDIA_UPLOAD_FORM_FIELD,
  MEDIA_UPLOAD_IDEMPOTENCY_HEADER,
  mediaRenditionPresetSchema,
  parseMediaRenditionCropQuery,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  createMediaUploadSession,
  getMediaAssetMetadata,
  getMediaAssetRendition,
  uploadMediaAsset,
} from './media.service'

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

/** GET /api/media/assets/:assetId/renditions/:preset */
export async function getAssetRendition(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw HttpError.unauthorized()
  }

  const { assetId, preset } = req.params as { assetId: string; preset: string }
  const presetResult = mediaRenditionPresetSchema.safeParse(preset)
  if (!presetResult.success) {
    throw HttpError.badRequest('Unsupported rendition preset.')
  }

  const crop = parseMediaRenditionCropQuery(req.query as Record<string, unknown>)
  if (Object.keys(req.query).some((key) => key.startsWith('crop')) && crop === undefined) {
    throw HttpError.badRequest('Invalid crop query parameters.')
  }

  const rendition = await getMediaAssetRendition({
    assetId,
    preset: presetResult.data,
    crop,
    userId: req.user.id,
  })

  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('Content-Type', rendition.mimeType)
  res.status(200).send(rendition.buffer)
}

export { MEDIA_UPLOAD_FORM_FIELD }
