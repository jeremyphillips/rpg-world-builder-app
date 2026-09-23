import { z } from 'zod'

import type { NormalizedCrop } from './geometry'

export const MEDIA_RENDITION_PRESET_TERM = {
  label: 'Media rendition preset',
  description: 'Authorized derivative output sizes for content media delivery.',
} as const

export const MEDIA_RENDITION_PRESET_ENTRIES = {
  'gallery-thumbnail': {
    label: 'Gallery thumbnail',
    width: 96,
    height: 96,
  },
  'compact-identity': {
    label: 'Compact identity',
    width: 48,
    height: 48,
  },
  portrait: {
    label: 'Portrait',
    width: 256,
    height: 256,
  },
  artwork: {
    label: 'Artwork',
    width: 800,
    height: 600,
  },
} as const satisfies Record<string, { label: string; width: number; height: number }>

export type MediaRenditionPreset = keyof typeof MEDIA_RENDITION_PRESET_ENTRIES

export const MEDIA_RENDITION_PRESETS = Object.keys(MEDIA_RENDITION_PRESET_ENTRIES) as [
  MediaRenditionPreset,
  ...MediaRenditionPreset[],
]

export const mediaRenditionPresetSchema = z.enum(MEDIA_RENDITION_PRESETS)

/** Bump when derivative generation logic changes to invalidate on-disk caches. */
export const MEDIA_RENDITION_RENDERER_VERSION = 1

export type MediaRenditionPresetConfig =
  (typeof MEDIA_RENDITION_PRESET_ENTRIES)[MediaRenditionPreset]

export function getMediaRenditionPresetConfig(
  preset: MediaRenditionPreset,
): MediaRenditionPresetConfig {
  return MEDIA_RENDITION_PRESET_ENTRIES[preset]
}

export function buildMediaRenditionCacheKey(input: {
  assetId: string
  preset: MediaRenditionPreset
  crop: NormalizedCrop
  outputFormat: 'webp' | 'jpeg' | 'png'
}): string {
  const cropKey = [
    input.crop.x.toFixed(6),
    input.crop.y.toFixed(6),
    input.crop.width.toFixed(6),
    input.crop.height.toFixed(6),
  ].join('_')

  return [
    input.assetId,
    input.preset,
    cropKey,
    input.outputFormat,
    `v${MEDIA_RENDITION_RENDERER_VERSION}`,
  ].join(':')
}
