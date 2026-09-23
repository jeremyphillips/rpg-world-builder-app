export function resolveMediaWorkspaceCopy(input: { portrait: boolean; primary: boolean }): {
  heading: string
  description: string
} {
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
      description: 'Preview the original artwork. Assign a role to use it on this record.',
    }
  }

  return {
    heading: 'Image preview',
    description: 'Preview the original artwork. Assign a role to use it on this record.',
  }
}
