import { describe, expect, it } from 'vitest'

import { tabsListVariants, tabsTriggerVariants } from './tabs.variants'

describe('tabs.variants', () => {
  it('maps line and pill to semantic list and trigger modifiers', () => {
    expect(tabsListVariants({ variant: 'line' })).toContain('ui-tabs__list--line')
    expect(tabsListVariants({ variant: 'line' })).toContain('ui-border--default')
    expect(tabsListVariants({ variant: 'pill' })).toContain('ui-tabs__list--pill')
    expect(tabsTriggerVariants({ variant: 'line' })).toContain('ui-tabs__trigger--line')
    expect(tabsTriggerVariants({ variant: 'pill' })).toContain('ui-tabs__trigger--pill')
  })

  it('leaves none without appearance modifiers', () => {
    expect(tabsListVariants({ variant: 'none' })).toBe('ui-tabs__list')
    expect(tabsTriggerVariants({ variant: 'none' })).toBe('ui-tabs__trigger ui-focus-ring')
  })
})
