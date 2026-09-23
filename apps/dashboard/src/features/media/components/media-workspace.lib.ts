import type { ContentMediaDomain } from '@rpg/contracts'

export function resolveMediaWorkspaceCopy(input: {
  portrait: boolean
  primary: boolean
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

  if (input.portrait) {
    return {
      heading: 'Portrait crop',
      description:
        'Crop and position how this image appears in character cards, lists, and tokens.',
    }
  }

  if (input.primary) {
    return {
      heading: 'Primary image preview',
      description: 'Preview the original artwork. Assign a role to control where it appears.',
    }
  }

  return {
    heading: 'Image preview',
    description: 'Preview the original artwork. Assign a role to control where it appears.',
  }
}

export function resolveMediaWorkspaceOnboarding(domain: ContentMediaDomain): string {
  if (domain === 'character') {
    return 'You can assign roles after adding an image, such as a portrait for character cards or a primary image for detail views.'
  }

  return 'You can assign roles after adding an image, such as a primary image for detail views.'
}
