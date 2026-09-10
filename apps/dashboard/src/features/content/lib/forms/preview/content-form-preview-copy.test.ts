import { describe, expect, it } from 'vitest'

import { contentPreviewAttentionTitle } from './content-form-preview-copy'

describe('contentPreviewAttentionTitle', () => {
  it('uses singular section copy for one invalid section', () => {
    expect(contentPreviewAttentionTitle(1)).toBe('1 section need attention.')
  })

  it('uses plural sections copy for multiple invalid sections', () => {
    expect(contentPreviewAttentionTitle(2)).toBe('2 sections need attention.')
  })
})
