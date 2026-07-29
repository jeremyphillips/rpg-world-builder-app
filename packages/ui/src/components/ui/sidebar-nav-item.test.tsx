import { describe, expect, it } from 'vitest'

import { sidebarNavItemVariants } from './sidebar-nav-item.variants'

describe('sidebarNavItemVariants', () => {
  it('applies active styles when active', () => {
    expect(sidebarNavItemVariants({ active: true })).toContain('bg-accent')
    expect(sidebarNavItemVariants({ active: true })).toContain('text-accent-foreground')
  })

  it('applies inactive styles when not active', () => {
    expect(sidebarNavItemVariants({ active: false })).toContain('text-muted-foreground')
    expect(sidebarNavItemVariants({ active: false })).toContain('hover:bg-accent')
  })
})
