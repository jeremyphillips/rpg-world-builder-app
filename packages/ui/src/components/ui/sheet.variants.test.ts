import { describe, expect, it } from 'vitest'

import { sheetContentVariants } from './sheet.variants'

describe('sheetContentVariants', () => {
  it('uses raised card-border stroke on edge-anchored sides', () => {
    expect(sheetContentVariants({ side: 'right' })).toContain('border-l')
    expect(sheetContentVariants({ side: 'right' })).toContain('border-card-border')
    expect(sheetContentVariants({ side: 'left' })).toContain('border-r')
    expect(sheetContentVariants({ side: 'left' })).toContain('border-card-border')
  })

  it('establishes the card plane for surface-relative chrome', () => {
    expect(sheetContentVariants()).toContain('[--surface-current:var(--card)]')
  })
})
