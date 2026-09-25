import { getAssetUrl } from '../assets'
import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'
import type { ContentMedia } from './content-media'
import { isSystemRoleAssignment, type ContentMediaSystemSource } from './content-media-source'
import { asCropPresentation } from './role-presentation'
import type { NormalizedCrop } from './geometry'
import type { MediaRole } from './roles'
import {
  resolveContentImageSet,
  resolveSystemContentImage,
  resolveSystemContentImageSourceDimensionsFromPath,
} from './system-content-image-registry'

export const CONTENT_DISPLAY_IMAGE_SOURCE_KINDS = ['system', 'upload', 'fallback'] as const

export type ContentDisplayImageSourceKind = (typeof CONTENT_DISPLAY_IMAGE_SOURCE_KINDS)[number]

export type ContentDisplayImagePresentationTreatment = 'white-paper-knockout'

export type ContentDisplayImage = {
  src: string
  crop?: NormalizedCrop
  sourceKind: ContentDisplayImageSourceKind
  /** Set only when resolved from a registry entry that declares a non-default treatment. */
  presentationTreatment?: ContentDisplayImagePresentationTreatment
}

export type ResolveContentDisplayImageInput = {
  media?: ContentMedia | null
  imageKey?: string
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
  role?: MediaRole
  resolveUploadSrc?: (assetId: string) => string | undefined
  fallbackSrc: string
}

function resolveUploadAssignmentSrc(
  media: ContentMedia,
  imageId: string,
  resolveUploadSrc: ResolveContentDisplayImageInput['resolveUploadSrc'],
): string | undefined {
  const attachment = media.images.find((image) => image.id === imageId)
  if (!attachment || !resolveUploadSrc) return undefined
  return resolveUploadSrc(attachment.assetId)
}

function resolveSystemAssignment(source: ContentMediaSystemSource, contentSource: ContentSource) {
  return resolveSystemContentImage({
    imageSetId: source.imageSetId,
    contentType: source.contentType,
    assetRole: source.assetRole,
    slug: source.slug,
    contentSource,
  })
}

function presentationTreatmentFromSystemImage(
  presentation: { treatment: string } | undefined,
): ContentDisplayImagePresentationTreatment | undefined {
  return presentation?.treatment === 'white-paper-knockout' ? 'white-paper-knockout' : undefined
}

/** Resolve the effective display image for a content record presentation role. */
export function resolveContentDisplayImage(
  input: ResolveContentDisplayImageInput,
): ContentDisplayImage {
  const role = input.role ?? 'primary'
  const imageSetId = resolveContentImageSet({
    campaignImageSetId: input.campaignImageSetId,
    rulesetId: input.rulesetId,
  })
  const assignment = input.media?.roles[role]

  if (assignment) {
    const crop = asCropPresentation(assignment.presentation)?.crop

    if (assignment.source.kind === 'upload') {
      const src = input.media
        ? resolveUploadAssignmentSrc(input.media, assignment.source.imageId, input.resolveUploadSrc)
        : undefined
      if (src) {
        return { src, crop, sourceKind: 'upload' }
      }
    }

    if (isSystemRoleAssignment(assignment)) {
      const resolved = resolveSystemAssignment(assignment.source, input.contentSource)
      if (resolved) {
        return {
          src: resolved.path,
          crop,
          sourceKind: 'system',
          presentationTreatment: presentationTreatmentFromSystemImage(resolved.presentation),
        }
      }
    }
  }

  const derivedResolved = resolveSystemContentImage({
    imageSetId,
    contentType: input.contentType,
    assetRole: 'primary',
    slug: input.slug,
    contentSource: input.contentSource,
  })
  if (derivedResolved) {
    return {
      src: derivedResolved.path,
      sourceKind: 'system',
      presentationTreatment: presentationTreatmentFromSystemImage(derivedResolved.presentation),
    }
  }

  if (input.imageKey) {
    return { src: getAssetUrl(input.imageKey), sourceKind: 'upload' }
  }

  return { src: input.fallbackSrc, sourceKind: 'fallback' }
}

export function resolveContentDisplayImageSourceDimensions(
  display: ContentDisplayImage,
): { width: number; height: number } | undefined {
  if (display.sourceKind === 'system') {
    return resolveSystemContentImageSourceDimensionsFromPath(display.src)
  }
  return undefined
}
