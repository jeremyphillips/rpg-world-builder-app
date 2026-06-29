import { describe, expect, it } from 'vitest'

import {
  descriptionForMarkdownForm,
  looksLikeRichTextHtml,
  normalizeMarkdownField,
} from './markdown-field'

describe('looksLikeRichTextHtml', () => {
  it('detects HTML that starts with a tag', () => {
    expect(looksLikeRichTextHtml('<p>Hello</p>')).toBe(true)
  })

  it('detects block tags anywhere in the string', () => {
    expect(looksLikeRichTextHtml('prefix <p>Hello</p>')).toBe(true)
  })

  it('returns false for markdown and plain text', () => {
    expect(looksLikeRichTextHtml('## Heading')).toBe(false)
    expect(looksLikeRichTextHtml('Plain description')).toBe(false)
  })

  it('returns false for empty strings', () => {
    expect(looksLikeRichTextHtml('')).toBe(false)
    expect(looksLikeRichTextHtml('   ')).toBe(false)
  })
})

describe('normalizeMarkdownField', () => {
  it('trims and preserves non-empty markdown', () => {
    expect(normalizeMarkdownField('  ## Notes  ')).toBe('## Notes')
  })

  it('returns undefined for empty input', () => {
    expect(normalizeMarkdownField('')).toBeUndefined()
    expect(normalizeMarkdownField('   ')).toBeUndefined()
    expect(normalizeMarkdownField(undefined)).toBeUndefined()
  })
})

describe('descriptionForMarkdownForm', () => {
  it('extracts plain text from legacy HTML', () => {
    expect(descriptionForMarkdownForm('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('passes markdown through unchanged', () => {
    expect(descriptionForMarkdownForm('## Context\n\nUse `pnpm bench`.')).toBe(
      '## Context\n\nUse `pnpm bench`.',
    )
  })

  it('passes plain text through unchanged', () => {
    expect(descriptionForMarkdownForm('Legacy plain description')).toBe('Legacy plain description')
  })
})
