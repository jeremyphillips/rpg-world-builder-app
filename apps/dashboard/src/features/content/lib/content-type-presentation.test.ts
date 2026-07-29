import { API_CONTENT_TYPE_KEYS, CONTENT_TYPE_KEYS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { CONTENT_TYPE_PRESENTATION, shouldPresentContentSource } from './content-type-presentation'

describe('content type presentation policy', () => {
  it('covers every registered content type exactly once', () => {
    expect(Object.keys(CONTENT_TYPE_PRESENTATION).sort()).toEqual([...CONTENT_TYPE_KEYS].sort())
  })

  it('retains source presentation for existing bundled content types', () => {
    for (const contentType of API_CONTENT_TYPE_KEYS) {
      expect(shouldPresentContentSource(contentType)).toBe(true)
    }
  })

  it('suppresses campaign-authorship chrome for organizations', () => {
    expect(shouldPresentContentSource('organizations')).toBe(false)
  })
})
