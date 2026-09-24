import type { ContentMedia } from './content-media'
import { roleAssignmentUploadImageId } from './content-media-source'
import {
  resetPortraitCrop,
  resolveDefaultCropForRole,
  resolveEffectiveCrop,
  type NormalizedCrop,
} from './geometry'
import { asCropPresentation } from './role-presentation'
import type { ContentMediaPolicy } from './media-policy'
import type { MediaRenditionPreset } from './rendition-preset'
import type { MediaRole } from './roles'
import type { SystemAssetManifestEntry } from './system-asset-manifest'

export const CONTENT_MEDIA_PRESENTATION_CONTEXTS = ['compact-identity', 'full-artwork'] as const

export type ContentMediaPresentationContext = (typeof CONTENT_MEDIA_PRESENTATION_CONTEXTS)[number]

export type ContentMediaAssetSummary = {
  id: string
  orientedWidth: number
  orientedHeight: number
  filename?: string
}

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

export type ResolveContentMediaPresentationInput = {
  media: ContentMedia | null | undefined
  policy: ContentMediaPolicy
  context: ContentMediaPresentationContext
  assetSummariesById: Readonly<Record<string, ContentMediaAssetSummary | undefined>>
  systemAssetsByPath?: Readonly<Record<string, SystemAssetManifestEntry | undefined>>
}

function findImage(media: ContentMedia, imageId: string) {
  return media.images.find((image) => image.id === imageId)
}

function resolveRolePresentation(input: {
  media: ContentMedia
  role: MediaRole
  imageId: string
  presentation: ContentMedia['roles'][MediaRole]
  preset: MediaRenditionPreset
  assetSummariesById: ResolveContentMediaPresentationInput['assetSummariesById']
}): ResolvedContentMediaPresentation | null {
  const image = findImage(input.media, input.imageId)
  if (!image) return null

  const asset = input.assetSummariesById[image.assetId]
  if (!asset) return null

  const source = { width: asset.orientedWidth, height: asset.orientedHeight }
  const cropPresentation = asCropPresentation(input.presentation?.presentation)
  const defaultCrop = () => resolveDefaultCropForRole(input.role, source)
  const crop = resolveEffectiveCrop(cropPresentation, source, defaultCrop)

  return {
    kind: 'rendition',
    preset: input.preset,
    crop,
    role: input.role,
    alt: image.alt ?? '',
    attachmentId: image.id,
    assetId: asset.id,
    sourceWidth: asset.orientedWidth,
    sourceHeight: asset.orientedHeight,
  }
}

function placeholderPresentation(
  preset: MediaRenditionPreset,
  fallbackReason: ContentMediaFallbackReason,
): ResolvedContentMediaPresentation {
  return {
    kind: 'placeholder',
    preset,
    fallbackReason,
    alt: '',
  }
}

function presetForContext(context: ContentMediaPresentationContext): MediaRenditionPreset {
  return context === 'compact-identity' ? 'compact-identity' : 'artwork'
}

function resolveFullArtworkPresentation(
  media: ContentMedia,
  assetSummariesById: ResolveContentMediaPresentationInput['assetSummariesById'],
): ResolvedContentMediaPresentation {
  const preset = presetForContext('full-artwork')
  const primary = media.roles.primary
  if (!primary) {
    return placeholderPresentation(preset, 'missing-role')
  }

  const imageId = roleAssignmentUploadImageId(primary)
  if (!imageId) {
    return placeholderPresentation(preset, 'missing-role')
  }

  const resolved = resolveRolePresentation({
    media,
    role: 'primary',
    imageId,
    presentation: primary,
    preset: 'artwork',
    assetSummariesById,
  })
  return resolved ?? placeholderPresentation(preset, 'missing-asset')
}

function resolvePrimarySquareFallback(
  media: ContentMedia,
  primary: NonNullable<ContentMedia['roles']['primary']>,
  assetSummariesById: ResolveContentMediaPresentationInput['assetSummariesById'],
): ResolvedContentMediaPresentation | null {
  const imageId = roleAssignmentUploadImageId(primary)
  if (!imageId) return null

  const image = findImage(media, imageId)
  const asset = image ? assetSummariesById[image.assetId] : undefined
  if (!image || !asset) return null

  const source = { width: asset.orientedWidth, height: asset.orientedHeight }
  const squareCrop = resetPortraitCrop(source)

  return {
    kind: 'rendition',
    preset: 'compact-identity',
    crop: squareCrop,
    fallbackReason: 'primary-square-fallback',
    alt: image.alt ?? '',
    attachmentId: image.id,
    assetId: asset.id,
    sourceWidth: asset.orientedWidth,
    sourceHeight: asset.orientedHeight,
  }
}

function resolveCompactIdentityPresentation(
  media: ContentMedia,
  assetSummariesById: ResolveContentMediaPresentationInput['assetSummariesById'],
): ResolvedContentMediaPresentation {
  const preset = presetForContext('compact-identity')
  const portrait = media.roles.portrait

  if (portrait) {
    const portraitImageId = roleAssignmentUploadImageId(portrait)
    if (!portraitImageId) {
      return placeholderPresentation(preset, portrait ? 'missing-asset' : 'missing-role')
    }

    const resolved = resolveRolePresentation({
      media,
      role: 'portrait',
      imageId: portraitImageId,
      presentation: portrait,
      preset: 'compact-identity',
      assetSummariesById,
    })
    if (resolved) return resolved
  }

  const primary = media.roles.primary
  if (primary) {
    const fallback = resolvePrimarySquareFallback(media, primary, assetSummariesById)
    if (fallback) return fallback
  }

  return placeholderPresentation(preset, portrait ? 'missing-asset' : 'missing-role')
}

/** Resolve effective presentation for compact identity or full artwork contexts. */
export function resolveContentMediaPresentation(
  input: ResolveContentMediaPresentationInput,
): ResolvedContentMediaPresentation {
  const preset = presetForContext(input.context)

  if (!input.media || input.media.images.length === 0) {
    return placeholderPresentation(preset, 'empty-gallery')
  }

  if (input.context === 'full-artwork') {
    return resolveFullArtworkPresentation(input.media, input.assetSummariesById)
  }

  return resolveCompactIdentityPresentation(input.media, input.assetSummariesById)
}

/** Resolve presentation for a specific role without fallback chaining. */
export function resolveContentMediaRolePresentation(input: {
  media: ContentMedia
  role: MediaRole
  preset: MediaRenditionPreset
  assetSummariesById: Readonly<Record<string, ContentMediaAssetSummary | undefined>>
}): ResolvedContentMediaPresentation | null {
  const assignment = input.media.roles[input.role]
  if (!assignment) return null

  const imageId = roleAssignmentUploadImageId(assignment)
  if (!imageId) return null

  return resolveRolePresentation({
    media: input.media,
    role: input.role,
    imageId,
    presentation: assignment,
    preset: input.preset,
    assetSummariesById: input.assetSummariesById,
  })
}
