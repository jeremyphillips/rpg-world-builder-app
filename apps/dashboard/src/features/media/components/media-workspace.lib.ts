import type { ContentMediaDomain, MediaRole } from '@rpg/contracts'

export function resolveMediaWorkspaceCopy(input: {
  presentation: MediaRole
  assignedRoles: readonly MediaRole[]
  hasSelection: boolean
}): {
  heading: string
  description: string
} {
  if (!input.hasSelection) {
    return {
      heading: 'Image preview',
      description: 'Add artwork, then assign how it should be used on this record.',
    }
  }

  if (input.presentation === 'portrait') {
    return {
      heading: 'Portrait crop',
      description:
        'Crop and position how this image appears in character cards, lists, and tokens.',
    }
  }

  if (input.presentation === 'banner') {
    return {
      heading: 'Banner crop',
      description: 'Crop a 3:1 banner and place the focal point inside that crop.',
    }
  }

  if (input.presentation === 'primary') {
    return {
      heading: 'Primary crop',
      description:
        'Crop the detail image and place the focal point inside that crop. The original file is kept.',
    }
  }

  if (input.presentation === 'emblem') {
    return {
      heading: 'Edit emblem',
      description:
        'Scale and pad the image inside the frame. It stays fully visible and is not cropped.',
    }
  }

  return {
    heading: 'Image preview',
    description: 'Preview the original artwork. Assign a role to control where it appears.',
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
