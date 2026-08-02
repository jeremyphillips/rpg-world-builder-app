import { describe, expect, it } from 'vitest'

import { stripHtmlTags } from './strip-html-tags'

describe('stripHtmlTags', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtmlTags('<p>Fire <strong>Bolt</strong></p>')).toBe('Fire Bolt')
    expect(stripHtmlTags('  plain  text  ')).toBe('plain text')
  })
})
