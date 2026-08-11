import { describe, expect, it } from 'vitest'

import { fieldGroupedControlHeightClasses } from './field-sizing.variants'
import { inputActionGroupActionSegmentVariants } from './input-action-group.variants'

const TYPOGRAPHY_PATTERN = /\b(text-|font-)/
const PADDING_PATTERN = /\b(p|px|py|pl|pr|pt|pb)-/

describe('inputActionGroupActionSegmentVariants', () => {
  it('owns segment height and clip only — no typography or padding', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const classes = inputActionGroupActionSegmentVariants({ size })
      expect(classes).not.toMatch(TYPOGRAPHY_PATTERN)
      expect(classes).not.toMatch(PADDING_PATTERN)
      expect(classes).toContain(fieldGroupedControlHeightClasses[size])
      expect(classes).toContain('shrink-0')
      expect(classes).toContain('overflow-hidden')
    }
  })
})
