import type { ContentMedia } from './content-media'
import { createUploadRoleAssignment } from './content-media-source'
import { MEDIA_ROLES } from './roles'

export type RemapContentMediaForDuplicateInput = {
  media: ContentMedia
  sourceScopeKey: string
  targetScopeKey: string
  createAttachmentId: () => string
}

export type RemapContentMediaForDuplicateResult =
  | {
      ok: true
      media: ContentMedia
      assetReuse: 'same-scope'
    }
  | {
      ok: false
      reason: 'cross_scope_copy_required'
      copyPlan: { assetIds: readonly string[] }
    }

/** Mint new attachment ids and rewrite role imageIds for duplicated records. */
export function remapContentMediaForDuplicate(
  input: RemapContentMediaForDuplicateInput,
): RemapContentMediaForDuplicateResult {
  if (input.sourceScopeKey !== input.targetScopeKey) {
    const assetIds = [...new Set(input.media.images.map((image) => image.assetId))]
    return {
      ok: false,
      reason: 'cross_scope_copy_required',
      copyPlan: { assetIds },
    }
  }

  const attachmentIdMap = new Map<string, string>()
  for (const image of input.media.images) {
    attachmentIdMap.set(image.id, input.createAttachmentId())
  }

  const images = input.media.images.map((image) => ({
    ...image,
    id: attachmentIdMap.get(image.id) ?? input.createAttachmentId(),
  }))

  const roles: ContentMedia['roles'] = {}
  for (const role of MEDIA_ROLES) {
    const assignment = input.media.roles[role]
    if (!assignment) continue
    if (assignment.source.kind === 'system') {
      roles[role] = structuredClone(assignment)
      continue
    }
    const remappedImageId =
      attachmentIdMap.get(assignment.source.imageId) ?? images[0]?.id ?? assignment.source.imageId
    roles[role] = {
      ...assignment,
      source: createUploadRoleAssignment(remappedImageId).source,
    }
  }

  return {
    ok: true,
    media: {
      revision: 0,
      images,
      roles,
    },
    assetReuse: 'same-scope',
  }
}
