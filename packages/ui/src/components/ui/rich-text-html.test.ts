import { describe, expect, it } from 'vitest'

import { extractRichTextContent, normalizeRichTextHtml, richTextHtmlEquals } from './rich-text-html'

describe('normalizeRichTextHtml', () => {
  it('treats empty paragraph markup as empty', () => {
    expect(normalizeRichTextHtml('<p></p>')).toBe('')
    expect(normalizeRichTextHtml('<p><br></p>')).toBe('')
  })

  it('preserves non-empty content', () => {
    expect(normalizeRichTextHtml('<p>Hello</p>')).toBe('<p>Hello</p>')
  })
})

describe('extractRichTextContent', () => {
  it('strips paragraph markup from catalog plain-text seeds', () => {
    expect(extractRichTextContent('<p>Jump farther than normal.</p>')).toBe(
      'Jump farther than normal.',
    )
    expect(extractRichTextContent('Jump farther than normal.')).toBe('Jump farther than normal.')
  })
})

describe('richTextHtmlEquals', () => {
  it('considers blank values equivalent', () => {
    expect(richTextHtmlEquals(undefined, '')).toBe(true)
    expect(richTextHtmlEquals('', '<p></p>')).toBe(true)
  })

  it('considers plain text equivalent to single-paragraph HTML', () => {
    expect(
      richTextHtmlEquals('Jump farther than normal.', '<p>Jump farther than normal.</p>'),
    ).toBe(true)
  })
})
