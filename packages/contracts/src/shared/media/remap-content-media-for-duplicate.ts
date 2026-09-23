import type { ContentMedia } from './content-media'

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
  if (input.media.roles.primary) {
    roles.primary = {
      ...input.media.roles.primary,
      imageId: attachmentIdMap.get(input.media.roles.primary.imageId) ?? images[0]?.id ?? '',
    }
  }
  if (input.media.roles.portrait) {
    roles.portrait = {
      ...input.media.roles.portrait,
      imageId: attachmentIdMap.get(input.media.roles.portrait.imageId) ?? images[0]?.id ?? '',
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
