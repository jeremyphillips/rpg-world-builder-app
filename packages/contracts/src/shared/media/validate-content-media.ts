import type { ZodIssue } from 'zod'

import { contentMediaValidationMessages } from './content-media-validation-messages'
import type { ContentMedia } from './content-media'
import { CONTENT_MEDIA_MAX_ATTACHMENTS } from './limits'
import { formatAspectRatioLabel, getFixedAspectCropSpec } from './role-crop-spec'
import {
  isFocalPointInCrop,
  isFixedAspectCrop,
  meetsFixedAspectMinimum,
  normalizedCropSchema,
  resolveDefaultCropForRole,
  resolveEffectiveCrop,
  resolveMediaRoleEligibility,
  type NormalizedCrop,
  type SourceDimensions,
} from './geometry'
import { isCropPresentation, type CropPresentation } from './image-presentation'
import type { ContentMediaPolicy } from './media-policy'
import type { MediaAssetDimensions } from './asset'
import { MEDIA_ROLE_ENTRIES, type MediaRole } from './roles'

export type ContentMediaValidationContext = {
  policy: ContentMediaPolicy
  assetDimensionsById: Readonly<Record<string, MediaAssetDimensions | undefined>>
  maxItems?: number
}

export type ContentMediaValidationResult =
  | { ok: true; media: ContentMedia }
  | { ok: false; issues: ZodIssue[] }

function customIssue(message: string, path: Array<string | number>): ZodIssue {
  return { code: 'custom', message, path }
}

function collectAttachmentIssues(images: ContentMedia['images'], maxItems: number): ZodIssue[] {
  const issues: ZodIssue[] = []
  const imageIds = new Set<string>()
  const assetIds = new Set<string>()

  if (images.length > maxItems) {
    issues.push(customIssue(`A record may have at most ${maxItems} attachments.`, ['images']))
  }

  for (const [index, image] of images.entries()) {
    if (imageIds.has(image.id)) {
      issues.push(
        customIssue('Attachment ids must be unique within a record.', ['images', index, 'id']),
      )
    }
    imageIds.add(image.id)

    if (assetIds.has(image.assetId)) {
      issues.push(
        customIssue('Asset ids must be unique within a record gallery.', [
          'images',
          index,
          'assetId',
        ]),
      )
    }
    assetIds.add(image.assetId)
  }

  return issues
}

function collectRoleCropSchemaIssues(role: MediaRole, crop: CropPresentation['crop']): ZodIssue[] {
  if (!crop) return []

  const cropResult = normalizedCropSchema.safeParse(crop)
  if (cropResult.success) return []

  return cropResult.error.issues.map((issue) => ({
    ...issue,
    path: ['roles', role, 'presentation', 'crop', ...issue.path],
  }))
}

function collectEmblemPresentationIssues(
  role: MediaRole,
  assignment: NonNullable<ContentMedia['roles'][MediaRole]>,
  source: SourceDimensions,
): ZodIssue[] {
  const issues: ZodIssue[] = []
  if (assignment.presentation && assignment.presentation.mode !== 'contain') {
    issues.push(
      customIssue('Emblem presentation must use contain mode.', ['roles', role, 'presentation']),
    )
  }
  const eligibility = resolveMediaRoleEligibility(role, source)
  if (!eligibility.eligible) {
    issues.push(customIssue(eligibility.message, ['roles', role]))
  }
  return issues
}

function collectCropShapeIssues(
  role: MediaRole,
  crop: NormalizedCrop,
  source: SourceDimensions,
): ZodIssue[] {
  const spec = getFixedAspectCropSpec(role)
  if (!spec) return []

  if (!isFixedAspectCrop(crop, source, spec) || !meetsFixedAspectMinimum(crop, source, spec)) {
    const aspectLabel = formatAspectRatioLabel(spec)
    return [
      customIssue(
        contentMediaValidationMessages.fixedAspectCropInvalid({
          roleLabel: MEDIA_ROLE_ENTRIES[role].label,
          aspectLabel,
          minWidthPx: spec.minWidthPx,
          minHeightPx: spec.minHeightPx,
        }),
        ['roles', role, 'presentation', 'crop'],
      ),
    ]
  }

  return []
}

function collectCropPresentationIssues(
  role: MediaRole,
  assignment: NonNullable<ContentMedia['roles'][MediaRole]>,
  source: SourceDimensions,
): ZodIssue[] {
  if (assignment.presentation?.mode === 'contain') {
    return [
      customIssue(`${MEDIA_ROLE_ENTRIES[role].label} presentation must use crop mode.`, [
        'roles',
        role,
        'presentation',
      ]),
    ]
  }

  const cropPresentation = isCropPresentation(assignment.presentation)
    ? assignment.presentation
    : undefined
  const issues = collectRoleCropSchemaIssues(role, cropPresentation?.crop)
  const crop = resolveEffectiveCrop(cropPresentation, source, () =>
    resolveDefaultCropForRole(role, source),
  )

  if (cropPresentation?.focalPoint && !isFocalPointInCrop(cropPresentation.focalPoint, crop)) {
    issues.push(
      customIssue('Focal point must sit inside the crop.', [
        'roles',
        role,
        'presentation',
        'focalPoint',
      ]),
    )
  }

  const eligibility = resolveMediaRoleEligibility(role, source, cropPresentation)
  if (!eligibility.eligible) {
    issues.push(customIssue(eligibility.message, ['roles', role, 'presentation']))
    return issues
  }

  issues.push(...collectCropShapeIssues(role, crop, source))
  return issues
}

function collectRolePresentationIssues(
  role: MediaRole,
  assignment: NonNullable<ContentMedia['roles'][MediaRole]>,
  dimensions: MediaAssetDimensions | undefined,
): ZodIssue[] {
  if (!dimensions) {
    return [
      customIssue(
        `${MEDIA_ROLE_ENTRIES[role].label} validation requires trusted asset dimensions.`,
        ['roles', role],
      ),
    ]
  }

  const source: SourceDimensions = {
    width: dimensions.orientedWidth,
    height: dimensions.orientedHeight,
  }

  if (role === 'emblem') {
    return collectEmblemPresentationIssues(role, assignment, source)
  }

  return collectCropPresentationIssues(role, assignment, source)
}

function collectRoleIssues(
  media: ContentMedia,
  policy: ContentMediaPolicy,
  assetDimensionsById: ContentMediaValidationContext['assetDimensionsById'],
): ZodIssue[] {
  const imageIds = new Set(media.images.map((image) => image.id))
  const issues: ZodIssue[] = []

  for (const role of Object.keys(MEDIA_ROLE_ENTRIES) as MediaRole[]) {
    const assignment = media.roles[role]
    if (!assignment) continue

    if (!policy.allowedRoles.includes(role)) {
      issues.push(customIssue(`${role} is not allowed for ${policy.domain}.`, ['roles', role]))
      continue
    }

    if (!imageIds.has(assignment.imageId)) {
      issues.push(
        customIssue(`Role ${role} references a missing attachment.`, ['roles', role, 'imageId']),
      )
      continue
    }

    const image = media.images.find((entry) => entry.id === assignment.imageId)
    const dimensions = image ? assetDimensionsById[image.assetId] : undefined
    issues.push(...collectRolePresentationIssues(role, assignment, dimensions))
  }

  return issues
}

/** Validate a proposed gallery against domain policy and trusted asset metadata. */
export function validateContentMedia(
  media: ContentMedia,
  context: ContentMediaValidationContext,
): ContentMediaValidationResult {
  const issues = [
    ...collectAttachmentIssues(media.images, context.maxItems ?? CONTENT_MEDIA_MAX_ATTACHMENTS),
    ...collectRoleIssues(media, context.policy, context.assetDimensionsById),
  ]

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  return { ok: true, media }
}
