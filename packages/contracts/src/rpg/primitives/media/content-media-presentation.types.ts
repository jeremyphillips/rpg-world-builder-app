import type { NormalizedCrop } from './geometry'
import type { MediaRenditionPreset } from './rendition-preset'
import type { MediaRole } from './roles'

export type ContentMediaFallbackReason =
  | 'empty-gallery'
  | 'missing-role'
  | 'missing-asset'
  | 'primary-square-fallback'

export type ResolvedContentMediaPresentation = {
  kind: 'rendition' | 'placeholder'
  preset: MediaRenditionPreset
  crop?: NormalizedCrop
  role?: MediaRole
  fallbackReason?: ContentMediaFallbackReason
  alt: string
  attachmentId?: string
  assetId?: string
  systemAssetPath?: string
  sourceWidth?: number
  sourceHeight?: number
}
