import type { ZodIssue } from 'zod'
import { customZodIssue } from '../../../../lib/add-custom-refinement-issue'

import { contentMediaValidationMessages } from '../../../primitives/media/content-media-validation-messages'
import type { ContentMedia } from '../../../primitives/media/content-media'
import {
  isSystemRoleAssignment,
  roleAssignmentUploadImageId,
} from '../../../primitives/media/content-media-source'
import { CONTENT_MEDIA_MAX_ATTACHMENTS } from '../../../primitives/media/limits'
import { systemImageSourcesEqual } from '../../../primitives/media/content-media-source'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImageSourceDimensions,
} from './system-content-image-registry'
import { resolveContentMediaMaxItems } from '../../../primitives/media/media-policy'
import {
  formatAspectRatioLabel,
  getFixedAspectCropSpec,
} from '../../../primitives/media/role-crop-spec'
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
} from '../../../primitives/media/geometry'
import {
  isCropPresentation,
  type CropPresentation,
} from '../../../primitives/media/image-presentation'
import type { ContentMediaPolicy } from '../../../primitives/media/media-policy'
import type { MediaAssetDimensions } from '../../../primitives/media/asset'
import { MEDIA_ROLE_ENTRIES, type MediaRole } from '../../../primitives/media/roles'

export type ContentMediaValidationContext = {
  policy: ContentMediaPolicy
  assetDimensionsById: Readonly<Record<string, MediaAssetDimensions | undefined>>
  maxItems?: number
}

export type ContentMediaValidationResult =
  | { ok: true; media: ContentMedia }
  | { ok: false; issues: ZodIssue[] }

function collectAttachmentIssues(images: ContentMedia['images'], maxItems: number): ZodIssue[] {
  const issues: ZodIssue[] = []
  const imageIds = new Set<string>()
  const assetIds = new Set<string>()

  if (images.length > maxItems) {
    issues.push(customZodIssue(`A record may have at most ${maxItems} attachments.`, ['images']))
  }

  for (const [index, image] of images.entries()) {
    if (imageIds.has(image.id)) {
      issues.push(
        customZodIssue('Attachment ids must be unique within a record.', ['images', index, 'id']),
      )
    }
    imageIds.add(image.id)

    if (assetIds.has(image.assetId)) {
      issues.push(
        customZodIssue('Asset ids must be unique within a record gallery.', [
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
      customZodIssue('Emblem presentation must use contain mode.', ['roles', role, 'presentation']),
    )
  }
  const eligibility = resolveMediaRoleEligibility(role, source)
  if (!eligibility.eligible) {
    issues.push(customZodIssue(eligibility.message, ['roles', role]))
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
      customZodIssue(
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
      customZodIssue(`${MEDIA_ROLE_ENTRIES[role].label} presentation must use crop mode.`, [
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
      customZodIssue('Focal point must sit inside the crop.', [
        'roles',
        role,
        'presentation',
        'focalPoint',
      ]),
    )
  }

  const eligibility = resolveMediaRoleEligibility(role, source, cropPresentation)
  if (!eligibility.eligible) {
    issues.push(customZodIssue(eligibility.message, ['roles', role, 'presentation']))
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
      customZodIssue(
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

function collectSystemRoleIssues(
  role: MediaRole,
  assignment: NonNullable<ContentMedia['roles'][MediaRole]>,
): ZodIssue[] {
  if (!isSystemRoleAssignment(assignment)) return []

  const imageSetId = resolveContentImageSet({})
  const derived = deriveSystemContentImage({
    imageSetId,
    subject: assignment.source.subject,
    assetRole: assignment.source.assetRole,
    slug: assignment.source.slug,
  })
  if (!derived || !systemImageSourcesEqual(assignment.source, derived)) {
    return [
      customZodIssue(`Role ${role} references an unknown system image source.`, [
        'roles',
        role,
        'source',
      ]),
    ]
  }

  const sourceDimensions = resolveSystemContentImageSourceDimensions({
    imageSetId: assignment.source.imageSetId,
    subject: assignment.source.subject,
    assetRole: assignment.source.assetRole,
    slug: assignment.source.slug,
  }) ?? { width: 0, height: 0 }

  return collectRolePresentationIssues(role, assignment, {
    orientedWidth: sourceDimensions.width,
    orientedHeight: sourceDimensions.height,
  })
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
      issues.push(customZodIssue(`${role} is not allowed for ${policy.domain}.`, ['roles', role]))
      continue
    }

    if (isSystemRoleAssignment(assignment)) {
      issues.push(...collectSystemRoleIssues(role, assignment))
      continue
    }

    const imageId = roleAssignmentUploadImageId(assignment)
    if (!imageId || !imageIds.has(imageId)) {
      issues.push(
        customZodIssue(`Role ${role} references a missing attachment.`, ['roles', role, 'source']),
      )
      continue
    }

    const image = media.images.find((entry) => entry.id === imageId)
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
    ...collectAttachmentIssues(
      media.images,
      context.maxItems ??
        resolveContentMediaMaxItems(context.policy) ??
        CONTENT_MEDIA_MAX_ATTACHMENTS,
    ),
    ...collectRoleIssues(media, context.policy, context.assetDimensionsById),
  ]

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  return { ok: true, media }
}
