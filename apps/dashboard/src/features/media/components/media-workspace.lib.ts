import { mediaRoleSurfaceCopy, type ContentMediaDomain, type MediaRole } from '@rpg/contracts'

export function resolveMediaWorkspaceCopy(input: {
  presentation: MediaRole
  assignedRoles: readonly MediaRole[]
  hasSelection: boolean
  label: string
}): {
  heading: string
  description: string
  interaction?: string
} {
  if (!input.hasSelection) {
    return {
      heading: 'Image preview',
      description: 'Add artwork, then assign how it should be used on this record.',
    }
  }

  if (input.assignedRoles.length === 0) {
    return {
      heading: 'Image preview',
      description: `Assign a role to control how this image is used on this ${input.label}.`,
    }
  }

  const copy = mediaRoleSurfaceCopy[input.presentation]
  return {
    heading: copy.workspaceHeading,
    description: copy.workspaceDescription,
    interaction: copy.instructions,
  }
}

export function resolveMediaWorkspaceOnboarding(domain: ContentMediaDomain): string {
  switch (domain) {
    case 'character':
      return 'You can assign roles after adding an image, such as a portrait for character cards or a primary image for detail views.'
    case 'campaign':
      return 'You can assign a banner, a primary image, or an emblem after adding an image.'
    case 'organization':
      return 'You can assign a primary image or an emblem after adding an image.'
    default:
      return 'You can assign a primary image after adding an image.'
  }
}
