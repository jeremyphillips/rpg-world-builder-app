import {
  isRolePresentationCustomized,
  MEDIA_ROLE_ENTRIES,
  resolveMediaRolePresentationNoun,
  roleAssignmentMatchesImageId,
  roleAssignmentUploadImageId,
  SYSTEM_CLASS_PRIMARY_SOURCE_DIMENSIONS,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'

export function resolveMediaRoleConfirmCopy(role: MediaRole, mode: 'remove' | 'move') {
  const roleLabel = MEDIA_ROLE_ENTRIES[role].label
  const noun = resolveMediaRolePresentationNoun(role)
  if (mode === 'remove') {
    return {
      title: `Remove ${roleLabel} role?`,
      description: `You customized this image's ${roleLabel.toLowerCase()} ${noun}. Removing the role will discard that ${noun}.`,
      confirmLabel: 'Remove role',
    }
  }
  return {
    title: `Move ${roleLabel} role?`,
    description: `The current ${roleLabel.toLowerCase()} ${noun} is customized. Moving the role to this image will discard that ${noun} and create a new default ${noun}.`,
    confirmLabel: 'Move role',
  }
}

// fallow-ignore-next-line complexity
export function shouldConfirmMediaRoleChange(input: {
  role: MediaRole
  assigned: boolean
  selectedId: string
  media: ContentMedia
  assets: Record<string, MediaAsset>
  source?: { width: number; height: number }
}): { required: true; mode: 'remove' | 'move' } | { required: false } {
  const previous = input.media.roles[input.role]
  if (!previous) return { required: false }

  const previousImageId = roleAssignmentUploadImageId(previous)
  const previousImage = previousImageId
    ? input.media.images.find((image) => image.id === previousImageId)
    : undefined
  const previousAsset = previousImage ? input.assets[previousImage.assetId] : undefined
  const previousSource = previousAsset
    ? { width: previousAsset.orientedWidth, height: previousAsset.orientedHeight }
    : previous.source.kind === 'system'
      ? SYSTEM_CLASS_PRIMARY_SOURCE_DIMENSIONS
      : input.source

  if (
    !previousSource ||
    !isRolePresentationCustomized({
      role: input.role,
      presentation: previous.presentation,
      source: previousSource,
    }) ||
    (input.assigned &&
      (roleAssignmentMatchesImageId(previous, input.selectedId) ||
        previousImageId === input.selectedId))
  ) {
    return { required: false }
  }

  return {
    required: true,
    mode:
      input.assigned && previousImageId && previousImageId !== input.selectedId ? 'move' : 'remove',
  }
}
