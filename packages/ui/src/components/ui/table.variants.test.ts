import { describe, expect, it } from 'vitest'

import { tableHeaderRowClasses, tableHeaderRowVariants } from './table.variants'

describe('tableHeaderRowVariants', () => {
  it('uses the shared recessed header band token', () => {
    expect(tableHeaderRowVariants()).toContain('bg-surface-strong')
    expect(tableHeaderRowVariants()).toContain('border-b')
    expect(tableHeaderRowClasses).toContain('bg-surface-strong')
  })
})
