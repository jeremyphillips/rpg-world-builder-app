import { describe, expect, it } from 'vitest'

import { interactiveListVariants } from './interactive-list.variants'

describe('interactiveListVariants row separators', () => {
  it('uses the list block, whose CSS draws adjacent-sibling borders', () => {
    expect(interactiveListVariants()).toContain('ui-interactive-list')
  })

  it('does not use divide utilities on the list shell', () => {
    const classes = interactiveListVariants()
    expect(classes).not.toContain('divide-y')
    expect(classes).not.toContain('divide-border-faint')
  })
})
