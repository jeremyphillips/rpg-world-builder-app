import { describe, expect, it } from 'vitest'

import { resolveMediaWorkspaceCopy, resolveMediaWorkspaceOnboarding } from './media-workspace.lib'

describe('resolveMediaWorkspaceCopy', () => {
  it('describes the empty workspace', () => {
    expect(
      resolveMediaWorkspaceCopy({ portrait: false, primary: false, hasSelection: false }),
    ).toEqual({
      heading: 'Image preview',
      description: 'Add artwork, then assign how it should be used on this record.',
    })
  })

  it('describes uploaded artwork without an assigned role', () => {
    expect(
      resolveMediaWorkspaceCopy({ portrait: false, primary: false, hasSelection: true }),
    ).toEqual({
      heading: 'Image preview',
      description: 'Preview the original artwork. Assign a role to control where it appears.',
    })
  })
})

describe('resolveMediaWorkspaceOnboarding', () => {
  it('mentions portrait guidance for characters only', () => {
    expect(resolveMediaWorkspaceOnboarding('character')).toMatch(/portrait/)
    expect(resolveMediaWorkspaceOnboarding('class')).not.toMatch(/portrait/)
  })
})
