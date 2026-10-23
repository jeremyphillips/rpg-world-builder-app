import { describe, expect, it } from 'vitest'

import { sidebarNavSectionDisclosureCaretVariants } from './sidebar-nav-section-disclosure.variants'

describe('sidebarNavSectionDisclosure variants', () => {
  it('rotates the lucide caret when expanded', () => {
    expect(sidebarNavSectionDisclosureCaretVariants({ expanded: true })).toContain('rotate-180')
    expect(sidebarNavSectionDisclosureCaretVariants({ expanded: false })).toContain('rotate-0')
  })
})
