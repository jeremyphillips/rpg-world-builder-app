import { describe, expect, it } from 'vitest'

import {
  resolveCompactAttachmentCountLabel,
  resolveCompactSummaryCopy,
  resolveExpandedCapacityHint,
  resolveMediaFieldCountFigures,
} from './media-field-summary.lib'

describe('resolveMediaFieldCountFigures', () => {
  it('keeps gallery membership and upload capacity separate', () => {
    expect(resolveMediaFieldCountFigures(1, 2)).toEqual({ uploadCount: 1, galleryCount: 2 })
  })
})

describe('resolveExpandedCapacityHint', () => {
  it('describes upload capacity without system art', () => {
    expect(resolveExpandedCapacityHint(0, 20)).toBe('0 of 20 uploads')
    expect(resolveExpandedCapacityHint(1, 20)).toBe('1 of 20 uploads')
  })
})

describe('resolveCompactAttachmentCountLabel', () => {
  it('uses gallery membership for the visible count', () => {
    expect(resolveCompactAttachmentCountLabel(0, 0, 20)).toBe('No images')
    expect(resolveCompactAttachmentCountLabel(1, 0, 20)).toBe('1 image')
    expect(resolveCompactAttachmentCountLabel(2, 1, 20)).toBe('2 images')
    expect(resolveCompactAttachmentCountLabel(7, 7, 20)).toBe('7 images')
    expect(resolveCompactAttachmentCountLabel(19, 19, 20)).toBe('19 images')
  })

  it('appends limit reached copy at upload capacity only', () => {
    expect(resolveCompactAttachmentCountLabel(20, 20, 20)).toBe('20 images · Limit reached')
    expect(resolveCompactAttachmentCountLabel(3, 3, 3)).toBe('3 images · Limit reached')
    expect(resolveCompactAttachmentCountLabel(2, 1, 20)).toBe('2 images')
  })

  it('uses singular slot copy at capacity one', () => {
    expect(resolveCompactAttachmentCountLabel(0, 0, 1)).toBe('No image')
    expect(resolveCompactAttachmentCountLabel(1, 1, 1)).toBe('1 image · Limit reached')
  })
})

describe('resolveCompactSummaryCopy', () => {
  it('uses empty add copy without gallery membership', () => {
    expect(resolveCompactSummaryCopy(0, 0, 20)).toEqual({
      countLabel: 'No images',
      showManageGear: false,
      previewAriaLabel: 'No images. Add',
    })
  })

  it('shows gallery membership when a system preview exists without uploads', () => {
    expect(resolveCompactSummaryCopy(0, 1, 20)).toEqual({
      countLabel: '1 image',
      showManageGear: true,
      previewAriaLabel: '1 image',
    })
  })

  it('shows manage gear for populated galleries', () => {
    expect(resolveCompactSummaryCopy(7, 7, 20)).toEqual({
      countLabel: '7 images',
      showManageGear: true,
      previewAriaLabel: '7 images',
    })
  })
})
