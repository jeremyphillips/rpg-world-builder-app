import { describe, expect, it } from 'vitest'

import { extractRichTextPlainText, normalizeRichTextPlainText } from './rich-text-plain'

describe('extractRichTextPlainText', () => {
  it('strips tags and preserves paragraph breaks', () => {
    expect(extractRichTextPlainText('<p>First</p><p>Second</p>')).toBe('First\n\nSecond')
  })

  it('returns plain text unchanged', () => {
    expect(extractRichTextPlainText('Legacy plain description')).toBe('Legacy plain description')
  })
})

describe('normalizeRichTextPlainText', () => {
  it('treats empty editor HTML as empty', () => {
    expect(normalizeRichTextPlainText('<p></p>')).toBe('')
    expect(normalizeRichTextPlainText('<p><br></p>')).toBe('')
  })
})
