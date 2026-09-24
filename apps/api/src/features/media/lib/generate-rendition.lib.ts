import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

import type { ContainPresentation, MediaRenditionPreset, NormalizedCrop } from '@rpg/contracts'
import {
  buildMediaRenditionCacheKey,
  getMediaRenditionPresetConfig,
  resetPrimaryCrop,
  resolveEffectiveCrop,
} from '@rpg/contracts'

import type { MediaAssetDoc } from '../media-asset.model'
import { readMediaOriginal, resolveMediaAssetDir } from './storage.lib'

function cropExtract(crop: NormalizedCrop, width: number, height: number) {
  return {
    left: Math.max(0, Math.round(crop.x * width)),
    top: Math.max(0, Math.round(crop.y * height)),
    width: Math.max(1, Math.round(crop.width * width)),
    height: Math.max(1, Math.round(crop.height * height)),
  }
}

function resolvePresetOutputFormat(preset: MediaRenditionPreset): 'webp' | 'png' {
  return getMediaRenditionPresetConfig(preset).outputFormat
}

export type GeneratedMediaRendition = {
  buffer: Buffer
  mimeType: string
  cachePath: string
  width: number
  height: number
}

async function renderEmblem(input: {
  original: Buffer
  asset: MediaAssetDoc
  layout: ContainPresentation
  cachePath: string
}): Promise<GeneratedMediaRendition> {
  const presetConfig = getMediaRenditionPresetConfig('emblem')
  const canvasSize = 'width' in presetConfig ? presetConfig.width : presetConfig.maxWidth
  const innerSize = canvasSize * (1 - 2 * input.layout.padding)
  const sourceMeta = await sharp(input.original, { animated: false, failOn: 'error' })
    .rotate()
    .metadata()
  const sourceWidth = sourceMeta.width ?? input.asset.orientedWidth
  const sourceHeight = sourceMeta.height ?? input.asset.orientedHeight
  const containScale = Math.min(innerSize / sourceWidth, innerSize / sourceHeight)
  const scaledWidth = Math.max(1, Math.round(sourceWidth * containScale * input.layout.scale))
  const scaledHeight = Math.max(1, Math.round(sourceHeight * containScale * input.layout.scale))
  const maxOffsetX = Math.max(0, (innerSize - scaledWidth) / 2)
  const maxOffsetY = Math.max(0, (innerSize - scaledHeight) / 2)
  const offsetX = Math.round(
    maxOffsetX + clamp(input.layout.offset?.x ?? 0, -maxOffsetX, maxOffsetX),
  )
  const offsetY = Math.round(
    maxOffsetY + clamp(input.layout.offset?.y ?? 0, -maxOffsetY, maxOffsetY),
  )
  const inset = Math.round(canvasSize * input.layout.padding)

  const fitted = await sharp(input.original, { animated: false, failOn: 'error' })
    .rotate()
    .resize(scaledWidth, scaledHeight, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer()

  const buffer = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fitted, left: inset + offsetX, top: inset + offsetY }])
    .png()
    .toBuffer()

  fs.mkdirSync(path.dirname(input.cachePath), { recursive: true })
  fs.writeFileSync(input.cachePath, buffer)

  return {
    buffer,
    mimeType: 'image/png',
    cachePath: input.cachePath,
    width: canvasSize,
    height: canvasSize,
  }
}

function resolveEffectiveCropForPreset(input: {
  preset: MediaRenditionPreset
  crop?: NormalizedCrop
  source: { width: number; height: number }
}): NormalizedCrop {
  if (input.crop) return input.crop
  if (input.preset === 'artwork' || input.preset === 'emblem') return resetPrimaryCrop()
  return resolveEffectiveCrop(undefined, input.source)
}

async function readCachedRendition(
  cachePath: string,
  outputFormat: 'webp' | 'png',
  presetConfig: ReturnType<typeof getMediaRenditionPresetConfig>,
): Promise<GeneratedMediaRendition | null> {
  if (!fs.existsSync(cachePath)) return null
  const metadata = await sharp(cachePath).metadata()
  return {
    buffer: fs.readFileSync(cachePath),
    mimeType: outputFormat === 'png' ? 'image/png' : 'image/webp',
    cachePath,
    width: metadata.width ?? ('width' in presetConfig ? presetConfig.width : presetConfig.maxWidth),
    height:
      metadata.height ?? ('height' in presetConfig ? presetConfig.height : presetConfig.maxHeight),
  }
}

async function renderCroppedRendition(input: {
  asset: MediaAssetDoc
  preset: MediaRenditionPreset
  effectiveCrop: NormalizedCrop
  cachePath: string
  outputFormat: 'webp' | 'png'
}): Promise<GeneratedMediaRendition> {
  const presetConfig = getMediaRenditionPresetConfig(input.preset)
  const original = readMediaOriginal(input.asset.storageKey)
  const extract = cropExtract(
    input.effectiveCrop,
    input.asset.orientedWidth,
    input.asset.orientedHeight,
  )

  let pipeline = sharp(original, { animated: false, failOn: 'error' }).rotate().extract(extract)
  if ('maxWidth' in presetConfig) {
    pipeline = pipeline.resize(presetConfig.maxWidth, presetConfig.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  } else {
    pipeline = pipeline.resize(presetConfig.width, presetConfig.height, {
      fit: presetConfig.fit,
      withoutEnlargement: false,
    })
  }

  const buffer =
    input.outputFormat === 'png'
      ? await pipeline.png().toBuffer()
      : await pipeline.webp().toBuffer()
  const metadata = await sharp(buffer).metadata()
  fs.mkdirSync(path.dirname(input.cachePath), { recursive: true })
  fs.writeFileSync(input.cachePath, buffer)

  return {
    buffer,
    mimeType: input.outputFormat === 'png' ? 'image/png' : 'image/webp',
    cachePath: input.cachePath,
    width: metadata.width ?? extract.width,
    height: metadata.height ?? extract.height,
  }
}

/** Generate or read a cached authorized derivative for an asset. */
export async function generateMediaRendition(input: {
  asset: MediaAssetDoc
  preset: MediaRenditionPreset
  crop?: NormalizedCrop
  emblemLayout?: ContainPresentation
}): Promise<GeneratedMediaRendition> {
  const source = { width: input.asset.orientedWidth, height: input.asset.orientedHeight }
  const presetConfig = getMediaRenditionPresetConfig(input.preset)
  const outputFormat = resolvePresetOutputFormat(input.preset)
  const effectiveCrop = resolveEffectiveCropForPreset({
    preset: input.preset,
    crop: input.crop,
    source,
  })
  const cachePath = path.join(
    resolveMediaAssetDir(input.asset._id),
    'renditions',
    `${buildMediaRenditionCacheKey({
      assetId: input.asset._id,
      preset: input.preset,
      crop: effectiveCrop,
      outputFormat,
      emblemLayout: input.preset === 'emblem' ? input.emblemLayout : undefined,
    })}.${outputFormat}`,
  )

  const cached = await readCachedRendition(cachePath, outputFormat, presetConfig)
  if (cached) return cached

  if (input.preset === 'emblem') {
    return renderEmblem({
      original: readMediaOriginal(input.asset.storageKey),
      asset: input.asset,
      layout: input.emblemLayout ?? { mode: 'contain', scale: 1, padding: 0 },
      cachePath,
    })
  }

  return renderCroppedRendition({
    asset: input.asset,
    preset: input.preset,
    effectiveCrop,
    cachePath,
    outputFormat,
  })
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
