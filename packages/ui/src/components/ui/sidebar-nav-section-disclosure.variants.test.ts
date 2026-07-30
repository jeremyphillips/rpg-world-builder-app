import { describe, expect, it } from 'vitest'

import {
  sidebarNavSectionDisclosureCaretClasses,
  sidebarNavSectionDisclosureTriggerClasses,
} from './sidebar-nav-section-disclosure.variants'

describe('sidebarNavSectionDisclosure variants', () => {
  it('uses foreground opacity hover without a background wash', () => {
    expect(sidebarNavSectionDisclosureTriggerClasses).toContain('hover:text-foreground/80')
    expect(sidebarNavSectionDisclosureTriggerClasses).not.toContain('hover:bg-accent')
  })

  it('uses a thicker caret border', () => {
    expect(sidebarNavSectionDisclosureCaretClasses).toContain('border-r-[1.5px]')
    expect(sidebarNavSectionDisclosureCaretClasses).toContain('border-b-[1.5px]')
  })
})
