import { describe, expect, it } from 'vitest'

import { buildMessagePreview } from './build-message-preview.lib'

describe('buildMessagePreview', () => {
  it('normalizes whitespace and trims text', () => {
    expect(buildMessagePreview('  hello   world  ')).toBe('hello world')
  })

  it('truncates long previews with an ellipsis', () => {
    const preview = buildMessagePreview('a'.repeat(200))
    expect(preview.endsWith('…')).toBe(true)
    expect(preview.length).toBeLessThanOrEqual(120)
  })
})
