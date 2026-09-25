import { describe, expect, it } from 'vitest'

import {
  resolveCompactAttachmentCountLabel,
  resolveCompactDisplayCount,
  resolveCompactSummaryCopy,
} from './media-field-summary.lib'

describe('resolveCompactDisplayCount', () => {
  it('counts a derived preview as one visible image', () => {
    expect(resolveCompactDisplayCount(0, true)).toBe(1)
    expect(resolveCompactDisplayCount(0, false)).toBe(0)
    expect(resolveCompactDisplayCount(3, true)).toBe(3)
  })
})

describe('resolveCompactAttachmentCountLabel', () => {
  it('uses singular and plural labels without capacity until the limit', () => {
    expect(resolveCompactAttachmentCountLabel(0, 0, 20)).toBe('No images')
    expect(resolveCompactAttachmentCountLabel(1, 0, 20)).toBe('1 image')
    expect(resolveCompactAttachmentCountLabel(2, 2, 20)).toBe('2 images')
    expect(resolveCompactAttachmentCountLabel(7, 7, 20)).toBe('7 images')
    expect(resolveCompactAttachmentCountLabel(19, 19, 20)).toBe('19 images')
  })

  it('appends limit reached copy at upload capacity only', () => {
    expect(resolveCompactAttachmentCountLabel(20, 20, 20)).toBe('20 images · Limit reached')
    expect(resolveCompactAttachmentCountLabel(3, 3, 3)).toBe('3 images · Limit reached')
    expect(resolveCompactAttachmentCountLabel(1, 0, 1)).toBe('1 image')
  })

  it('uses singular slot copy at capacity one', () => {
    expect(resolveCompactAttachmentCountLabel(0, 0, 1)).toBe('No image')
    expect(resolveCompactAttachmentCountLabel(1, 1, 1)).toBe('1 image · Limit reached')
  })
})

describe('resolveCompactSummaryCopy', () => {
  it('uses empty add copy without a preview', () => {
    expect(resolveCompactSummaryCopy(0, 20, false)).toEqual({
      countLabel: 'No images',
      showManageGear: false,
      previewAriaLabel: 'No images. Add',
    })
  })

  it('shows one image when a preview exists without uploads', () => {
    expect(resolveCompactSummaryCopy(0, 20, true)).toEqual({
      countLabel: '1 image',
      showManageGear: true,
      previewAriaLabel: '1 image',
    })
  })

  it('shows manage gear for populated galleries', () => {
    expect(resolveCompactSummaryCopy(7, 20, true)).toEqual({
      countLabel: '7 images',
      showManageGear: true,
      previewAriaLabel: '7 images',
    })
  })
})
