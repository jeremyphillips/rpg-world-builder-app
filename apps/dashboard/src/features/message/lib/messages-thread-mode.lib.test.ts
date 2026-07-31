import { describe, expect, it } from 'vitest'

import { resolveMessagesThreadModeBehavior } from './messages-thread-mode.lib'

describe('resolveMessagesThreadModeBehavior', () => {
  it('enables composer and mark-read for active threads', () => {
    expect(resolveMessagesThreadModeBehavior('active')).toEqual({
      showComposer: true,
      isAttentionEligible: true,
      showPreviewChrome: false,
    })
  })

  it('disables composer and mark-read for preview threads', () => {
    expect(resolveMessagesThreadModeBehavior('preview')).toEqual({
      showComposer: false,
      isAttentionEligible: false,
      showPreviewChrome: true,
    })
  })
})
