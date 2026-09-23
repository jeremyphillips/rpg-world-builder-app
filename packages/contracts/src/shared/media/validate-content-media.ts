import type { ZodIssue } from 'zod'

import type { ContentMedia } from './content-media'
import { CONTENT_MEDIA_MAX_ATTACHMENTS, CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX } from './limits'
import {
  isSquareCrop,
  meetsPortraitMinimumCrop,
  normalizedCropSchema,
  resolveEffectiveCrop,
  type SourceDimensions,
} from './geometry'
import type { ContentMediaPolicy } from './media-policy'
import type { MediaAssetDimensions } from './asset'
import type { MediaRole } from './roles'

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

function collectRoleCropIssues(
  role: MediaRole,
  crop: NonNullable<NonNullable<ContentMedia['roles'][MediaRole]>['presentation']>['crop'],
): ZodIssue[] {
  if (!crop) return []

  const cropResult = normalizedCropSchema.safeParse(crop)
  if (cropResult.success) return []

  return cropResult.error.issues.map((issue) => ({
    ...issue,
    path: ['roles', role, 'presentation', 'crop', ...issue.path],
  }))
}

function collectPortraitCropIssues(
  assignment: NonNullable<ContentMedia['roles']['portrait']>,
  dimensions: MediaAssetDimensions | undefined,
): ZodIssue[] {
  if (!dimensions) {
    return [
      customIssue('Portrait validation requires trusted asset dimensions.', ['roles', 'portrait']),
    ]
  }

  const source: SourceDimensions = {
    width: dimensions.orientedWidth,
    height: dimensions.orientedHeight,
  }
  const crop = resolveEffectiveCrop(assignment.presentation, source)
  const issues: ZodIssue[] = []

  if (!isSquareCrop(crop, source)) {
    issues.push(
      customIssue('Portrait crop must be square within the configured pixel tolerance.', [
        'roles',
        'portrait',
        'presentation',
        'crop',
      ]),
    )
  }

  if (!meetsPortraitMinimumCrop(crop, source)) {
    issues.push(
      customIssue(
        `Portrait crop must be at least ${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX}×${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX} oriented pixels.`,
        ['roles', 'portrait', 'presentation', 'crop'],
      ),
    )
  }

  return issues
}

function collectRoleIssues(
  media: ContentMedia,
  policy: ContentMediaPolicy,
  assetDimensionsById: ContentMediaValidationContext['assetDimensionsById'],
): ZodIssue[] {
  const imageIds = new Set(media.images.map((image) => image.id))
  const issues: ZodIssue[] = []
  const roleEntries: Array<[MediaRole, ContentMedia['roles'][MediaRole]]> = [
    ['primary', media.roles.primary],
    ['portrait', media.roles.portrait],
  ]

  for (const [role, assignment] of roleEntries) {
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

    issues.push(...collectRoleCropIssues(role, assignment.presentation?.crop))
    if (role !== 'portrait') continue

    const image = media.images.find((entry) => entry.id === assignment.imageId)
    const dimensions = image ? assetDimensionsById[image.assetId] : undefined
    issues.push(...collectPortraitCropIssues(assignment, dimensions))
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
