import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentMedia } from './content-media'
import {
  isSystemRoleAssignment,
  systemImageSourcesEqual,
  type ContentMediaSystemSource,
} from './content-media-source'
import type { ContentDisplaySurface } from './content-display-surface'
import {
  resolveContentDisplayFallback,
  type ContentDisplayFallback,
} from './content-display-fallback'
import { asCropPresentation } from './role-presentation'
import type { NormalizedCrop } from './geometry'
import type { MediaRole } from './roles'
import { getContentMediaPolicy, resolveDetailRoles, type ContentMediaDomain } from './media-policy'
import {
  resolveContentImageSet,
  resolveSystemContentImage,
  resolveSystemContentImageSourceDimensionsFromPath,
} from './system-content-image-registry'
import type { SystemImageSubject } from './system-image-subject'

export const CONTENT_DISPLAY_IMAGE_SOURCE_KINDS = ['system', 'upload'] as const

export type ContentDisplayImageSourceKind = (typeof CONTENT_DISPLAY_IMAGE_SOURCE_KINDS)[number]

export type ContentDisplayImagePresentationTreatment = 'white-paper-knockout' | 'mono-glyph-invert'

export type ContentDisplayImage = {
  src: string
  crop?: NormalizedCrop
  sourceKind: ContentDisplayImageSourceKind
  /** Set only when resolved from a registry entry that declares a non-default treatment. */
  presentationTreatment?: ContentDisplayImagePresentationTreatment
}

export type ResolveContentDisplayImageInput = {
  media?: ContentMedia | null
  surface: ContentDisplaySurface
  domain: ContentMediaDomain
  subject: SystemImageSubject
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
  resolveUploadSrc?: (assetId: string) => string | undefined
}

export type ResolveContentDisplayImageResult =
  | { outcome: 'image'; display: ContentDisplayImage }
  | { outcome: 'fallback'; fallback: ContentDisplayFallback }

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
    subject: source.subject,
    assetRole: source.assetRole,
    slug: source.slug,
    contentSource,
  })
}

function presentationTreatmentFromSystemImage(
  presentation: { treatment: string } | undefined,
): ContentDisplayImagePresentationTreatment | undefined {
  if (presentation?.treatment === 'white-paper-knockout') {
    return 'white-paper-knockout'
  }
  if (presentation?.treatment === 'mono-glyph-invert') {
    return 'mono-glyph-invert'
  }
  return undefined
}

function resolveRolesForSurface(
  surface: ContentDisplaySurface,
  domain: ContentMediaDomain,
): readonly MediaRole[] {
  const policy = getContentMediaPolicy(domain)
  if (surface === 'compact') {
    return policy.representativeRoles
  }
  if (surface === 'detail') {
    return resolveDetailRoles(policy)
  }
  const representative = policy.representativeRoles[0]
  return representative ? [representative] : ['primary']
}

function resolveDisplayImageForRole(
  input: ResolveContentDisplayImageInput,
  role: MediaRole,
  imageSetId: string,
): ContentDisplayImage | undefined {
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
    subject: input.subject,
    assetRole: role,
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

  return undefined
}

/** Resolve display image or semantic fallback for a content record and surface. */
export function resolveContentDisplayImage(
  input: ResolveContentDisplayImageInput,
): ResolveContentDisplayImageResult {
  const imageSetId = resolveContentImageSet({
    campaignImageSetId: input.campaignImageSetId,
    rulesetId: input.rulesetId,
  })
  const roles = resolveRolesForSurface(input.surface, input.domain)

  for (const role of roles) {
    const display = resolveDisplayImageForRole(input, role, imageSetId)
    if (display) {
      return { outcome: 'image', display }
    }
  }

  return {
    outcome: 'fallback',
    fallback: resolveContentDisplayFallback({ domain: input.domain, surface: input.surface }),
  }
}

/** Wire DTO helper — omits display image when only a semantic fallback applies. */
export function resolveContentDisplayImageAsOptional(
  input: ResolveContentDisplayImageInput,
): ContentDisplayImage | undefined {
  const result = resolveContentDisplayImage(input)
  return result.outcome === 'image' ? result.display : undefined
}

export function resolveContentDisplayImageSourceDimensions(
  display: ContentDisplayImage,
): { width: number; height: number } | undefined {
  if (display.sourceKind === 'system') {
    return resolveSystemContentImageSourceDimensionsFromPath(display.src)
  }
  return undefined
}

export function systemDerivedImageMatchesAssignment(
  derived: Pick<ContentMediaSystemSource, 'imageSetId' | 'subject' | 'assetRole' | 'slug'>,
  assignment: ContentMediaSystemSource,
): boolean {
  return systemImageSourcesEqual(assignment, derived)
}
