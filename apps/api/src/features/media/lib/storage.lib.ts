import fs from 'node:fs'
import path from 'node:path'

import { HttpError } from '../../../lib/http-error'
import { resolveUploadDir } from '../../uploads'

const MEDIA_SEGMENT = 'media'

export function resolveMediaAssetDir(assetId: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(assetId)) {
    throw HttpError.badRequest('Invalid media asset id.')
  }

  const mediaRoot = path.join(resolveUploadDir(), MEDIA_SEGMENT)
  const assetDir = path.join(mediaRoot, assetId)

  if (!assetDir.startsWith(mediaRoot + path.sep)) {
    throw HttpError.badRequest('Invalid media asset id.')
  }

  return assetDir
}

export function resolveMediaOriginalPath(assetId: string, ext: string): string {
  const assetDir = resolveMediaAssetDir(assetId)
  return path.join(assetDir, `original.${ext}`)
}

export function storeMediaOriginal(
  assetId: string,
  ext: string,
  buffer: Buffer,
): { storageKey: string; absolutePath: string } {
  const assetDir = resolveMediaAssetDir(assetId)
  fs.mkdirSync(assetDir, { recursive: true })
  const absolutePath = path.join(assetDir, `original.${ext}`)
  fs.writeFileSync(absolutePath, buffer)
  return {
    storageKey: `${MEDIA_SEGMENT}/${assetId}/original.${ext}`,
    absolutePath,
  }
}

export function readMediaOriginal(storageKey: string): Buffer {
  const uploadDir = resolveUploadDir()
  const absolutePath = path.join(uploadDir, storageKey)

  if (!absolutePath.startsWith(uploadDir + path.sep)) {
    throw HttpError.badRequest('Invalid media storage key.')
  }

  if (!fs.existsSync(absolutePath)) {
    throw new HttpError(404, 'not_found', 'Media asset file not found.')
  }

  return fs.readFileSync(absolutePath)
}
