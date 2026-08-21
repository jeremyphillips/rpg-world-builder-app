import { describe, expect, it } from 'vitest'

import { messageBubbleVariants } from '../message-thread.variants'

describe('messageBubbleVariants', () => {
  it('maps self sender to info bubble tokens', () => {
    expect(messageBubbleVariants({ sender: 'self' })).toContain('bg-message-bubble-self')
  })

  it('maps peer sender to muted bubble tokens', () => {
    expect(messageBubbleVariants({ sender: 'peer' })).toContain('bg-message-bubble-peer')
  })
})
