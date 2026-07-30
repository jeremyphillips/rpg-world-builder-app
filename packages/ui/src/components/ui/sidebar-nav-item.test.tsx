import { describe, expect, it } from 'vitest'

import { sidebarNavItemVariants } from './sidebar-nav-item.variants'

describe('sidebarNavItemVariants', () => {
  it('applies active styles when active', () => {
    expect(sidebarNavItemVariants({ active: true })).toContain('bg-accent')
    expect(sidebarNavItemVariants({ active: true })).toContain('text-accent-foreground')
  })

  it('applies inactive styles when not active', () => {
    expect(sidebarNavItemVariants({ active: false })).toContain('text-sidebar-nav-item-fg')
    expect(sidebarNavItemVariants({ active: false })).toContain('hover:bg-accent')
  })

  it('includes icon row layout classes', () => {
    expect(sidebarNavItemVariants({ active: false })).toContain('inline-flex')
    expect(sidebarNavItemVariants({ active: false })).toContain('items-center')
    expect(sidebarNavItemVariants({ active: false })).toContain('gap-2')
  })

  it('applies workspace exit tone for muted exit links', () => {
    expect(sidebarNavItemVariants({ active: false, tone: 'workspaceExit' })).toContain(
      'text-muted-foreground',
    )
  })
})
