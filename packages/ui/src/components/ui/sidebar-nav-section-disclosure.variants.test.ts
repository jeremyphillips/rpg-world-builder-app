import { describe, expect, it } from 'vitest'

import {
  sidebarNavSectionDisclosureCaretVariants,
  sidebarNavSectionDisclosureTriggerClasses,
} from './sidebar-nav-section-disclosure.variants'

describe('sidebarNavSectionDisclosure variants', () => {
  it('uses foreground opacity hover without a background wash', () => {
    expect(sidebarNavSectionDisclosureTriggerClasses).toContain('hover:text-foreground/80')
    expect(sidebarNavSectionDisclosureTriggerClasses).not.toContain('hover:bg-accent')
  })

  it('rotates the lucide caret when expanded', () => {
    expect(sidebarNavSectionDisclosureCaretVariants({ expanded: true })).toContain('rotate-180')
    expect(sidebarNavSectionDisclosureCaretVariants({ expanded: false })).toContain('rotate-0')
  })
})
