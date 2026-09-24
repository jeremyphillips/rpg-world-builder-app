import { describe, expect, it } from 'vitest'

import { resolveMediaWorkspaceCopy, resolveMediaWorkspaceOnboarding } from './media-workspace.lib'

describe('resolveMediaWorkspaceCopy', () => {
  it('describes the empty workspace', () => {
    expect(
      resolveMediaWorkspaceCopy({
        presentation: 'primary',
        assignedRoles: [],
        hasSelection: false,
      }),
    ).toEqual({
      heading: 'Image preview',
      description: 'Add artwork, then assign how it should be used on this record.',
    })
  })

  it('describes emblem editing without padding controls', () => {
    expect(
      resolveMediaWorkspaceCopy({
        presentation: 'emblem',
        assignedRoles: ['emblem'],
        hasSelection: true,
      }),
    ).toEqual({
      heading: 'Emblem',
      description: "Adjust how the emblem appears inside its frame. It won't be cropped.",
    })
  })

  it('describes uploaded artwork without an assigned role', () => {
    expect(
      resolveMediaWorkspaceCopy({
        presentation: 'primary',
        assignedRoles: [],
        hasSelection: true,
      }),
    ).toEqual({
      heading: 'Image preview',
      description: 'Assign a role to control how this image is used.',
    })
  })

  it('separates workspace purpose from editor instructions for primary', () => {
    expect(
      resolveMediaWorkspaceCopy({
        presentation: 'primary',
        assignedRoles: ['primary'],
        hasSelection: true,
      }),
    ).toEqual({
      heading: 'Primary crop',
      description: 'Crop a 4:3 image for representative artwork and detail views.',
    })
  })
})

describe('resolveMediaWorkspaceOnboarding', () => {
  it('mentions portrait guidance for characters only', () => {
    expect(resolveMediaWorkspaceOnboarding('character')).toMatch(/portrait/)
    expect(resolveMediaWorkspaceOnboarding('class')).not.toMatch(/portrait/)
  })

  it('mentions banner and emblem for campaign and organization domains', () => {
    expect(resolveMediaWorkspaceOnboarding('campaign')).toMatch(/banner/)
    expect(resolveMediaWorkspaceOnboarding('organization')).toMatch(/emblem/)
  })
})
