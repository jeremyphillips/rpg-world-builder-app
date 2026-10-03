import { describe, expect, it } from 'vitest'

import {
  formatInlineMetadataTail,
  INLINE_METADATA_SEPARATOR,
  joinInlineMetadata,
} from './inline-metadata'

describe('joinInlineMetadata', () => {
  it('joins two and many items with canonical spacing', () => {
    expect(joinInlineMetadata(['A', 'B'])).toBe('A · B')
    expect(joinInlineMetadata(['A', 'B', 'C'])).toBe('A · B · C')
    expect(INLINE_METADATA_SEPARATOR).toBe('·')
  })

  it('omits null, undefined, false, and blank strings', () => {
    expect(joinInlineMetadata(['A', null, undefined, false, '', '  ', 'B'])).toBe('A · B')
  })

  it('keeps numbers including zero and drops NaN', () => {
    expect(joinInlineMetadata(['Label', 0])).toBe('Label · 0')
    expect(joinInlineMetadata(['Label', -3])).toBe('Label · -3')
    expect(joinInlineMetadata(['Label', Number.NaN, 'tail'])).toBe('Label · tail')
  })

  it('trims string parts and avoids leading, trailing, or double separators', () => {
    expect(joinInlineMetadata(['  A  ', 'B'])).toBe('A · B')
    expect(joinInlineMetadata(['only'])).toBe('only')
    expect(joinInlineMetadata([])).toBe('')
    expect(joinInlineMetadata([null])).toBe('')
  })
})

describe('formatInlineMetadataTail', () => {
  it('prefixes joined tail with canonical leading separator spacing', () => {
    expect(formatInlineMetadataTail(['Unsaved'])).toBe(' · Unsaved')
    expect(formatInlineMetadataTail(['A', 'B'])).toBe(' · A · B')
  })

  it('returns empty string when tail is empty', () => {
    expect(formatInlineMetadataTail([])).toBe('')
    expect(formatInlineMetadataTail(['', null])).toBe('')
  })
})
