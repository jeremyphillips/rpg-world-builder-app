import { describe, expect, it } from 'vitest'

import {
  fieldRowDividerVariants,
  interleaveFieldRowDividerTracks,
} from './field-row-divider.variants'

describe('fieldRowDividerVariants', () => {
  it('maps comfortable rhythm to mx-8 gutter flanking the pipe', () => {
    expect(fieldRowDividerVariants({ rhythm: 'comfortable' })).toContain('mx-8')
    expect(fieldRowDividerVariants({ rhythm: 'comfortable' })).toContain('border-l')
    expect(fieldRowDividerVariants({ rhythm: 'comfortable' })).toContain('border-border-subtle')
  })

  it('maps compact rhythm to mx-6 gutter flanking the pipe', () => {
    expect(fieldRowDividerVariants({ rhythm: 'compact' })).toContain('mx-6')
  })
})

describe('interleaveFieldRowDividerTracks', () => {
  it('inserts auto divider tracks between field tracks', () => {
    expect(interleaveFieldRowDividerTracks(['minmax(0, 6fr)', 'minmax(0, 6fr)'])).toEqual([
      'minmax(0, 6fr)',
      'auto',
      'minmax(0, 6fr)',
    ])
  })

  it('returns a single field track unchanged', () => {
    expect(interleaveFieldRowDividerTracks(['minmax(0, 1fr)'])).toEqual(['minmax(0, 1fr)'])
  })
})
