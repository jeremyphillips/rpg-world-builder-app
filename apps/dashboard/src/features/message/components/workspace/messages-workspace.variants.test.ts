import { describe, expect, it } from 'vitest'

import { messagesWorkspaceRootClasses } from './messages-workspace.variants'

describe('messagesWorkspaceRootClasses', () => {
  it('fills the app-shell main column', () => {
    expect(messagesWorkspaceRootClasses).toContain('flex-1')
  })
})
