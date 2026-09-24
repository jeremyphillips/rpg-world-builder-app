import { describe, expect, it } from 'vitest'

import { resolveCompactCountCopy, resolveCompactSummaryCopy } from './media-field-summary.lib'

describe('resolveCompactSummaryCopy', () => {
  it('uses singular empty and populated copy at capacity one', () => {
    expect(resolveCompactSummaryCopy(0, 1)).toEqual({
      subject: 'No image',
      action: 'Add',
      ariaLabel: 'No image. Add',
    })
    expect(resolveCompactSummaryCopy(1, 1)).toEqual({
      subject: 'Image',
      action: 'Change',
      ariaLabel: 'Image. Change',
    })
  })

  it('uses plural empty copy and keeps populated gallery grammar', () => {
    expect(resolveCompactSummaryCopy(0, 3)).toEqual({
      subject: 'No images',
      action: 'Add',
      ariaLabel: 'No images. Add',
    })
    expect(resolveCompactSummaryCopy(2, 3)).toEqual({
      subject: '2 of 3 images',
      action: 'Manage',
      ariaLabel: '2 of 3 images · Manage',
    })
  })
})

describe('resolveCompactCountCopy', () => {
  it('supports count display mode', () => {
    expect(resolveCompactCountCopy(2, 3, 'count')).toBe('2 images · Manage')
    expect(resolveCompactCountCopy(1, 3, 'count')).toBe('1 image · Manage')
  })
})
