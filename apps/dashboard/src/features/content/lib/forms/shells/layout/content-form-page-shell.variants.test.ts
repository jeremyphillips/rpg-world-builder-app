import { describe, expect, it } from 'vitest'

import { contentSchemaFormFillClasses } from './content-form-page-shell.variants'

describe('contentSchemaFormFillClasses', () => {
  it('is a flex fill participant that clips content min-size for docked footer', () => {
    expect(contentSchemaFormFillClasses).toContain('overflow-hidden')
    expect(contentSchemaFormFillClasses).toContain('flex-1')
    expect(contentSchemaFormFillClasses).toContain('min-h-0')
    expect(contentSchemaFormFillClasses).toContain('flex-col')
  })
})
