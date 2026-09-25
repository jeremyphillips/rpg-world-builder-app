import { z } from 'zod'

import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'

export const CONTENT_MEDIA_UPLOAD_SOURCE_KIND = 'upload' as const
export const CONTENT_MEDIA_SYSTEM_SOURCE_KIND = 'system' as const

export const contentMediaUploadSourceSchema = z
  .object({
    kind: z.literal(CONTENT_MEDIA_UPLOAD_SOURCE_KIND),
    imageId: z.string().min(1),
  })
  .strict()

export type ContentMediaUploadSource = z.infer<typeof contentMediaUploadSourceSchema>

export const contentMediaSystemSourceSchema = z
  .object({
    kind: z.literal(CONTENT_MEDIA_SYSTEM_SOURCE_KIND),
    imageSetId: z.string().min(1),
    contentType: z.string().min(1),
    assetRole: z.string().min(1),
    slug: z.string().min(1),
  })
  .strict()

export type ContentMediaSystemSource = z.infer<typeof contentMediaSystemSourceSchema>

export const contentMediaRoleSourceSchema = z.discriminatedUnion('kind', [
  contentMediaUploadSourceSchema,
  contentMediaSystemSourceSchema,
])

export type ContentMediaRoleSource = z.infer<typeof contentMediaRoleSourceSchema>

export const SYSTEM_CONTENT_IMAGE_VIRTUAL_ID_PREFIX = 'system' as const

export function buildSystemContentImageVirtualId(source: ContentMediaSystemSource): string {
  return [
    SYSTEM_CONTENT_IMAGE_VIRTUAL_ID_PREFIX,
    source.imageSetId,
    source.contentType,
    source.assetRole,
    source.slug,
  ].join(':')
}

export function parseSystemContentImageVirtualId(id: string): ContentMediaSystemSource | undefined {
  const parts = id.split(':')
  if (parts.length !== 5 || parts[0] !== SYSTEM_CONTENT_IMAGE_VIRTUAL_ID_PREFIX) return undefined
  const [, imageSetId, contentType, assetRole, slug] = parts
  if (!imageSetId || !contentType || !assetRole || !slug) return undefined
  return {
    kind: CONTENT_MEDIA_SYSTEM_SOURCE_KIND,
    imageSetId,
    contentType,
    assetRole,
    slug,
  }
}

export function roleAssignmentUploadImageId(
  assignment: { source: ContentMediaRoleSource } | undefined,
): string | undefined {
  if (!assignment || assignment.source.kind !== CONTENT_MEDIA_UPLOAD_SOURCE_KIND) return undefined
  return assignment.source.imageId
}

export function isSystemRoleAssignment(
  assignment: { source: ContentMediaRoleSource } | undefined,
): assignment is { source: ContentMediaSystemSource } {
  return assignment?.source.kind === CONTENT_MEDIA_SYSTEM_SOURCE_KIND
}

export function roleAssignmentMatchesImageId(
  assignment: { source: ContentMediaRoleSource } | undefined,
  imageId: string,
): boolean {
  return (
    assignment?.source.kind === CONTENT_MEDIA_UPLOAD_SOURCE_KIND &&
    assignment.source.imageId === imageId
  )
}

export function roleAssignmentMatchesVirtualId(
  assignment: { source: ContentMediaRoleSource } | undefined,
  virtualId: string,
): boolean {
  if (!isSystemRoleAssignment(assignment)) return false
  return buildSystemContentImageVirtualId(assignment.source) === virtualId
}

export function createUploadRoleAssignment(imageId: string): {
  source: ContentMediaUploadSource
} {
  return { source: { kind: CONTENT_MEDIA_UPLOAD_SOURCE_KIND, imageId } }
}

export function createSystemRoleAssignment(input: {
  imageSetId: string
  contentType: ContentTypeKey | string
  assetRole: string
  slug: string
}): { source: ContentMediaSystemSource } {
  return {
    source: {
      kind: CONTENT_MEDIA_SYSTEM_SOURCE_KIND,
      imageSetId: input.imageSetId,
      contentType: input.contentType,
      assetRole: input.assetRole,
      slug: input.slug,
    },
  }
}

export function isUploadContentSource(contentSource: ContentSource): boolean {
  return contentSource !== 'system'
}
