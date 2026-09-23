import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

import type { MediaRenditionPreset, NormalizedCrop } from '@rpg/contracts'
import {
  buildMediaRenditionCacheKey,
  getMediaRenditionPresetConfig,
  resolveEffectiveCrop,
} from '@rpg/contracts'

import type { MediaAssetDoc } from '../media-asset.model'
import { readMediaOriginal, resolveMediaAssetDir } from './storage.lib'

const OUTPUT_FORMAT = 'webp' as const
const OUTPUT_MIME = 'image/webp'

function cropExtract(crop: NormalizedCrop, width: number, height: number) {
  return {
    left: Math.max(0, Math.round(crop.x * width)),
    top: Math.max(0, Math.round(crop.y * height)),
    width: Math.max(1, Math.round(crop.width * width)),
    height: Math.max(1, Math.round(crop.height * height)),
  }
}

function resolveRenditionPath(assetId: string, cacheKey: string): string {
  return path.join(resolveMediaAssetDir(assetId), 'renditions', `${cacheKey}.${OUTPUT_FORMAT}`)
}

export type GeneratedMediaRendition = {
  buffer: Buffer
  mimeType: string
  cachePath: string
}

/** Generate or read a cached authorized derivative for an asset. */
export async function generateMediaRendition(input: {
  asset: MediaAssetDoc
  preset: MediaRenditionPreset
  crop?: NormalizedCrop
}): Promise<GeneratedMediaRendition> {
  const source = { width: input.asset.orientedWidth, height: input.asset.orientedHeight }
  const effectiveCrop = input.crop ?? resolveEffectiveCrop(undefined, source)
  const presetConfig = getMediaRenditionPresetConfig(input.preset)
  const cacheKey = buildMediaRenditionCacheKey({
    assetId: input.asset._id,
    preset: input.preset,
    crop: effectiveCrop,
    outputFormat: OUTPUT_FORMAT,
  })
  const cachePath = resolveRenditionPath(input.asset._id, cacheKey)

  if (fs.existsSync(cachePath)) {
    return {
      buffer: fs.readFileSync(cachePath),
      mimeType: OUTPUT_MIME,
      cachePath,
    }
  }

  const original = readMediaOriginal(input.asset.storageKey)
  const extract = cropExtract(effectiveCrop, input.asset.orientedWidth, input.asset.orientedHeight)

  const buffer = await sharp(original, { animated: false, failOn: 'error' })
    .rotate()
    .extract(extract)
    .resize(presetConfig.width, presetConfig.height, { fit: 'cover' })
    .webp()
    .toBuffer()

  fs.mkdirSync(path.dirname(cachePath), { recursive: true })
  fs.writeFileSync(cachePath, buffer)

  return { buffer, mimeType: OUTPUT_MIME, cachePath }
}

/** Pixel dimensions of the extracted crop region for parity tests. */
export function cropPixelDimensions(
  crop: NormalizedCrop,
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const extract = cropExtract(crop, sourceWidth, sourceHeight)
  return { width: extract.width, height: extract.height }
}
