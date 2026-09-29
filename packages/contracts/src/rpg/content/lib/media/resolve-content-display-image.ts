import type { ContentSource } from '../envelope'
import type { ContentMedia } from '../../../primitives/media/content-media'
import { roleAssignmentMatchesSelection } from '../../../primitives/media/content-media-source'
import type { ContentDisplaySurface } from '../../../primitives/media/content-display-surface'
import {
  resolveContentDisplayFallback,
  type ContentDisplayFallback,
} from '../../../primitives/media/content-display-fallback'
import type { ContentDisplayImageSourceKind } from '../../../primitives/media/content-display-image-dto'
import { asCropPresentation } from '../../../primitives/media/role-presentation'
import type { NormalizedCrop, NormalizedFocalPoint } from '../../../primitives/media/geometry'
import type { ContentDisplayImagesByRole } from '../../../primitives/media/content-display-image-dto'
import type { MediaRole } from '../../../primitives/media/roles'
import {
  getContentMediaPolicy,
  resolveDetailRoles,
  type ContentMediaDomain,
} from '../../../primitives/media/media-policy'
import { resolveSystemContentImageSourceDimensionsFromPath } from './system-content-image-registry'
import type { SystemImageSubject } from '../../../primitives/media/system-image-subject'
import { resolveAvailableContentMediaSources } from './resolve-available-content-media-sources'
import { selectDisplaySourceForRole } from './select-display-source-for-role'
import type { AvailableContentMediaSource } from './resolve-available-content-media-sources'

export {
  CONTENT_DISPLAY_IMAGE_SOURCE_KINDS,
  type ContentDisplayImageSourceKind,
} from '../../../primitives/media/content-display-image-dto'

export type ContentDisplayImagePresentationTreatment = 'white-paper-knockout' | 'mono-glyph-invert'

export type ContentDisplayImage = {
  src: string
  role: MediaRole
  crop?: NormalizedCrop
  focalPoint?: NormalizedFocalPoint
  sourceKind: ContentDisplayImageSourceKind
  /** Set only when resolved from a registry entry that declares a non-default treatment. */
  presentationTreatment?: ContentDisplayImagePresentationTreatment
  /** True when a persisted role assignment could not be resolved and display fell back. */
  assignedSourceMissing?: boolean
}

export type { ContentDisplayImagesByRole } from '../../../primitives/media/content-display-image-dto'

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

function presentationFromSource(
  source: AvailableContentMediaSource,
): ContentDisplayImagePresentationTreatment | undefined {
  if (source.sourceKind !== 'system') return undefined
  return source.presentationTreatment
}

function buildDisplayImageForRole(
  input: ResolveContentDisplayImageInput,
  role: MediaRole,
  source: AvailableContentMediaSource,
  assignedSourceMissing?: boolean,
): ContentDisplayImage | undefined {
  const assignment = input.media?.roles[role]
  const cropPresentation =
    assignment && roleAssignmentMatchesSelection(assignment, source.id)
      ? asCropPresentation(assignment.presentation)
      : undefined
  const crop = cropPresentation?.crop
  const focalPoint = cropPresentation?.focalPoint

  if (source.sourceKind === 'upload') {
    const src = input.media
      ? resolveUploadAssignmentSrc(input.media, source.id, input.resolveUploadSrc)
      : undefined
    if (!src) return undefined
    return {
      src,
      role,
      crop,
      focalPoint,
      sourceKind: 'upload',
      assignedSourceMissing,
    }
  }

  return {
    src: source.path,
    role,
    crop,
    focalPoint,
    sourceKind: 'system',
    presentationTreatment: presentationFromSource(source),
    assignedSourceMissing,
  }
}

function resolveDisplayImageForRole(
  input: ResolveContentDisplayImageInput,
  role: MediaRole,
  sources: readonly AvailableContentMediaSource[],
): ContentDisplayImage | undefined {
  const selection = selectDisplaySourceForRole({
    sources,
    media: input.media,
    role,
  })
  if (!selection.source) return undefined
  return buildDisplayImageForRole(input, role, selection.source, selection.assignedSourceMissing)
}

function resolveAvailabilityForDisplay(input: ResolveContentDisplayImageInput) {
  return resolveAvailableContentMediaSources({
    media: input.media ?? { revision: 0, images: [], roles: {} },
    domain: input.domain,
    contentSource: input.contentSource,
    subject: input.subject,
    slug: input.slug,
    rulesetId: input.rulesetId,
    campaignImageSetId: input.campaignImageSetId,
  })
}

/** Resolve one display image per requested role (independent crops; no compact walk). */
export function resolveContentDisplayImagesByRole(
  input: Omit<ResolveContentDisplayImageInput, 'surface'> & {
    roles?: readonly MediaRole[]
  },
): ContentDisplayImagesByRole {
  const policy = getContentMediaPolicy(input.domain)
  const roles = input.roles ?? policy.representativeRoles
  const { sources } = resolveAvailabilityForDisplay({ ...input, surface: 'compact' })
  const byRole: ContentDisplayImagesByRole = {}

  for (const role of roles) {
    const display = resolveDisplayImageForRole({ ...input, surface: 'compact' }, role, sources)
    if (display) {
      byRole[role] = display
    }
  }

  return byRole
}

/** Resolve display image or semantic fallback for a content record and surface. */
export function resolveContentDisplayImage(
  input: ResolveContentDisplayImageInput,
): ResolveContentDisplayImageResult {
  const { sources } = resolveAvailabilityForDisplay(input)
  const roles = resolveRolesForSurface(input.surface, input.domain)

  for (const role of roles) {
    const display = resolveDisplayImageForRole(input, role, sources)
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

export { systemDerivedImageMatchesAssignment } from './content-display-image-system-match'
