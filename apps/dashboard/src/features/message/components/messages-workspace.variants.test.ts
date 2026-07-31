import { describe, expect, it } from 'vitest'

import { messageBubbleVariants } from './messages-workspace.variants'

describe('messageBubbleVariants', () => {
  it('uses info tokens for self bubbles', () => {
    expect(messageBubbleVariants({ sender: 'self' })).toContain('bg-message-bubble-self')
    expect(messageBubbleVariants({ sender: 'self' })).toContain(
      'text-message-bubble-self-foreground',
    )
  })

  it('uses peer bubble tokens for peer messages', () => {
    expect(messageBubbleVariants({ sender: 'peer' })).toContain('bg-message-bubble-peer')
    expect(messageBubbleVariants({ sender: 'peer' })).toContain(
      'text-message-bubble-peer-foreground',
    )
  })
})
