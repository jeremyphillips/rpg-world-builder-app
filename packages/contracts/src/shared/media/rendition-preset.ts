import { z } from 'zod'

import type { NormalizedCrop } from './geometry'
import type { ContainPresentation } from './image-presentation'

export const MEDIA_RENDITION_PRESET_TERM = {
  label: 'Media rendition preset',
  description: 'Authorized derivative output sizes for content media delivery.',
} as const

export const MEDIA_RENDITION_PRESET_ENTRIES = {
  'gallery-thumbnail': {
    label: 'Gallery thumbnail',
    width: 96,
    height: 96,
    fit: 'cover' as const,
    outputFormat: 'webp' as const,
  },
  'compact-identity': {
    label: 'Compact identity',
    width: 48,
    height: 48,
    fit: 'cover' as const,
    outputFormat: 'webp' as const,
  },
  portrait: {
    label: 'Portrait',
    width: 256,
    height: 256,
    fit: 'cover' as const,
    outputFormat: 'webp' as const,
  },
  banner: {
    label: 'Banner',
    width: 1200,
    height: 400,
    fit: 'cover' as const,
    outputFormat: 'webp' as const,
  },
  emblem: {
    label: 'Emblem',
    width: 256,
    height: 256,
    fit: 'contain' as const,
    outputFormat: 'png' as const,
  },
  artwork: {
    label: 'Artwork',
    maxWidth: 1200,
    maxHeight: 1200,
    fit: 'inside' as const,
    outputFormat: 'webp' as const,
  },
} as const satisfies Record<
  string,
  {
    label: string
    fit: 'cover' | 'contain' | 'inside'
    outputFormat: 'webp' | 'png'
  } & ({ width: number; height: number } | { maxWidth: number; maxHeight: number })
>

export type MediaRenditionPreset = keyof typeof MEDIA_RENDITION_PRESET_ENTRIES

export const MEDIA_RENDITION_PRESETS = Object.keys(MEDIA_RENDITION_PRESET_ENTRIES) as [
  MediaRenditionPreset,
  ...MediaRenditionPreset[],
]

export const mediaRenditionPresetSchema = z.enum(MEDIA_RENDITION_PRESETS)

/** Bump when derivative generation logic changes to invalidate on-disk caches. */
export const MEDIA_RENDITION_RENDERER_VERSION = 3

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
  emblemLayout?: Pick<ContainPresentation, 'scale' | 'padding' | 'offset'>
}): string {
  const cropKey = [
    input.crop.x.toFixed(6),
    input.crop.y.toFixed(6),
    input.crop.width.toFixed(6),
    input.crop.height.toFixed(6),
  ].join('_')

  const emblemKey = input.emblemLayout
    ? [
        input.emblemLayout.scale.toFixed(4),
        input.emblemLayout.padding.toFixed(4),
        input.emblemLayout.offset?.x.toFixed(4) ?? '0',
        input.emblemLayout.offset?.y.toFixed(4) ?? '0',
      ].join('_')
    : ''

  return [
    input.assetId,
    input.preset,
    cropKey,
    emblemKey,
    input.outputFormat,
    `v${MEDIA_RENDITION_RENDERER_VERSION}`,
  ].join(':')
}
