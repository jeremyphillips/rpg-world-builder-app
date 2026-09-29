import type { ZodIssue } from 'zod'
import { customZodIssue } from '../../../../lib/add-custom-refinement-issue'
import type { ContentSource } from '../envelope'
import type { ContentMedia } from '../../../primitives/media/content-media'
import type { ImagePresentation } from '../../../primitives/media/image-presentation'
import { contentMediaSchema } from '../../../primitives/media/content-media'
import {
  isSystemRoleAssignment,
  roleAssignmentUploadImageId,
} from '../../../primitives/media/content-media-source'
import { isRolePresentationCustomized } from '../../../primitives/media/is-role-presentation-customized'
import { normalizePersistedContentMedia } from './normalize-persisted-content-media'
import type { ContentMediaDomain } from '../../../primitives/media/media-policy'
import { getContentMediaPolicy } from '../../../primitives/media/media-policy'
import type { MediaRole } from '../../../primitives/media/roles'
import { MEDIA_ROLE_ENTRIES } from '../../../primitives/media/roles'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImageSourceDimensions,
} from './system-content-image-registry'
import { systemImageSourcesEqual } from '../../../primitives/media/content-media-source'
import type { SystemImageSubject } from '../../../primitives/media/system-image-subject'
import type { ContentMediaValidationContext } from './validate-content-media'
import { validateContentMedia } from './validate-content-media'

export type CatalogContentMediaWriteContext = {
  domain: ContentMediaDomain
  subject: SystemImageSubject
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
}

/** Canonical parse only — no pruning or repair on normal writes. */
export function prepareContentMediaForCatalogWrite(media: unknown): ContentMedia {
  return contentMediaSchema.parse(media)
}

export function collectContentMediaCoherenceIssues(media: ContentMedia): ZodIssue[] {
  const imageIds = new Set(media.images.map((image) => image.id))
  const issues: ZodIssue[] = []

  for (const role of Object.keys(MEDIA_ROLE_ENTRIES) as MediaRole[]) {
    const assignment = media.roles[role]
    if (!assignment || isSystemRoleAssignment(assignment)) continue

    const imageId = roleAssignmentUploadImageId(assignment)
    if (!imageId || !imageIds.has(imageId)) {
      issues.push(
        customZodIssue(`Role ${role} references a missing attachment.`, ['roles', role, 'source']),
      )
    }
  }

  return issues
}

/** Fail-loud validation for catalog content writes (API boundary + dashboard UX). */
export function validateContentMediaForCatalogWrite(
  media: ContentMedia,
  context: ContentMediaValidationContext,
): { ok: true; media: ContentMedia } | { ok: false; issues: ZodIssue[] } {
  const coherenceIssues = collectContentMediaCoherenceIssues(media)
  if (coherenceIssues.length > 0) {
    return { ok: false, issues: coherenceIssues }
  }

  return validateContentMedia(media, context)
}

function isAuthoredSystemRoleAssignment(
  role: MediaRole,
  assignment: NonNullable<ContentMedia['roles'][MediaRole]>,
  ctx: CatalogContentMediaWriteContext,
): boolean {
  if (!isSystemRoleAssignment(assignment)) return false

  const imageSetId = resolveContentImageSet({
    campaignImageSetId: ctx.campaignImageSetId,
    rulesetId: ctx.rulesetId,
  })
  const derived = deriveSystemContentImage({
    imageSetId,
    subject: ctx.subject,
    assetRole: role,
    slug: ctx.slug,
  })

  const matchesDerived =
    derived !== undefined && systemImageSourcesEqual(assignment.source, derived)

  const sourceDimensions = resolveSystemContentImageSourceDimensions({
    imageSetId: assignment.source.imageSetId,
    subject: assignment.source.subject,
    assetRole: assignment.source.assetRole,
    slug: assignment.source.slug,
  }) ?? { width: 0, height: 0 }

  const customized = isRolePresentationCustomized({
    role,
    presentation: ('presentation' in assignment ? assignment.presentation : undefined) as
      | ImagePresentation
      | undefined,
    source: sourceDimensions,
  })

  if (customized) return true
  return !matchesDerived
}

/** Whether form/API media should be treated as user-authored for create inclusion. */
export function hasAuthoredContentMediaForCatalogWrite(
  media: ContentMedia | undefined | null,
  ctx?: CatalogContentMediaWriteContext,
): boolean {
  if (!media) return false
  if (media.images.length > 0) return true

  for (const role of Object.keys(MEDIA_ROLE_ENTRIES) as MediaRole[]) {
    const assignment = media.roles[role]
    if (!assignment) continue

    if (isSystemRoleAssignment(assignment)) {
      if (ctx && isAuthoredSystemRoleAssignment(role, assignment, ctx)) {
        return true
      }
      continue
    }

    const imageId = roleAssignmentUploadImageId(assignment)
    if (imageId && media.images.some((image) => image.id === imageId)) {
      return true
    }
  }

  return false
}

/** Persisted override snapshot only — not merged catalog / virtual system art. */
export function resolvePersistedContentMediaOverride(input: {
  homebrewRecordMedia?: ContentMedia | null | undefined
  overlayPatchMedia?: ContentMedia | null | undefined
  source: ContentSource
}): ContentMedia | null {
  if (input.source === 'homebrew') {
    return input.homebrewRecordMedia ?? null
  }
  return input.overlayPatchMedia ?? null
}

/** Explicit repair for legacy reads — not used on normal write paths. */
export function repairContentMediaForRead(media: ContentMedia): ContentMedia {
  const imageIds = new Set(media.images.map((image) => image.id))
  const roles = { ...media.roles }

  for (const role of Object.keys(MEDIA_ROLE_ENTRIES) as MediaRole[]) {
    const assignment = roles[role]
    if (!assignment || isSystemRoleAssignment(assignment)) continue
    const imageId = roleAssignmentUploadImageId(assignment)
    if (!imageId || !imageIds.has(imageId)) {
      delete roles[role]
    }
  }

  return { ...media, roles }
}

export function normalizeContentMediaForCatalogPersist(
  media: ContentMedia,
  ctx: CatalogContentMediaWriteContext,
): ContentMedia {
  const policy = getContentMediaPolicy(ctx.domain)
  return normalizePersistedContentMedia({
    media,
    subject: ctx.subject,
    slug: ctx.slug,
    contentSource: ctx.contentSource,
    rulesetId: ctx.rulesetId,
    campaignImageSetId: ctx.campaignImageSetId,
    allowedRoles: policy.allowedRoles,
  })
}

export const catalogContentMediaExpectedRevisionField = 'expectedMediaRevision' as const
