import { describe, expect, it } from 'vitest'

import {
  formatMessageBubbleAriaLabel,
  formatMessagesOutOfScopeSupporting,
  formatMessagesScopeChipLabel,
  formatMessagesScopeSummary,
  formatMessagesSharedCampaignCount,
  formatMessagesUnreadBadge,
} from './messages-copy'

describe('messages-copy', () => {
  it('formats scope chip labels', () => {
    expect(formatMessagesScopeChipLabel('Ashes of Winter')).toBe('Campaign: Ashes of Winter')
  })

  it('formats scope summaries with pluralization', () => {
    expect(formatMessagesScopeSummary(1, 1)).toBe(
      '1 conversation shown · 1 conversation outside this campaign hidden',
    )
    expect(formatMessagesScopeSummary(10, 2)).toBe(
      '10 conversations shown · 2 conversations outside this campaign hidden',
    )
  })

  it('formats out-of-scope supporting copy', () => {
    expect(formatMessagesOutOfScopeSupporting('Stormwatch')).toBe(
      'Not included in the Stormwatch filter.',
    )
  })

  it('formats shared campaign counts', () => {
    expect(formatMessagesSharedCampaignCount(1)).toBe('1 shared campaign')
    expect(formatMessagesSharedCampaignCount(3)).toBe('3 shared campaigns')
  })

  it('formats unread badges', () => {
    expect(formatMessagesUnreadBadge(3)).toBe('3')
    expect(formatMessagesUnreadBadge(100)).toBe('99+')
  })

  it('formats message bubble aria labels', () => {
    expect(formatMessageBubbleAriaLabel(true, 'Alice')).toBe('Your message')
    expect(formatMessageBubbleAriaLabel(false, 'Alice')).toBe('Message from Alice')
    expect(formatMessageBubbleAriaLabel(false, undefined)).toBe('Message from peer')
  })
})
