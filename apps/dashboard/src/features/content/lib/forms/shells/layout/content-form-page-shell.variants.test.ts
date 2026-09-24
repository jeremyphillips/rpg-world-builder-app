import { describe, expect, it } from 'vitest'

import { contentViewportFormFillClasses } from './content-form-page-shell.variants'

describe('contentViewportFormFillClasses', () => {
  it('is a flex fill participant that clips content min-size for docked footer', () => {
    expect(contentViewportFormFillClasses).toContain('overflow-hidden')
    expect(contentViewportFormFillClasses).toContain('flex-1')
    expect(contentViewportFormFillClasses).toContain('min-h-0')
    expect(contentViewportFormFillClasses).toContain('flex-col')
  })
})
