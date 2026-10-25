import { describe, expect, it } from 'vitest'

import { tableHeaderRowVariants } from './table.variants'

describe('tableHeaderRowVariants', () => {
  it('uses the shared recessed header band token', () => {
    expect(tableHeaderRowVariants).toContain('bg-surface-strong')
    expect(tableHeaderRowVariants).toContain('border-b')
    expect(tableHeaderRowVariants).toContain('bg-surface-strong')
  })
})
