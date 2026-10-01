import { describe, expect, it } from 'vitest'

import {
  interactiveListRowSeparatorClasses,
  interactiveListVariants,
} from './interactive-list.variants'

describe('interactiveListVariants row separators', () => {
  it('uses adjacent-sibling top borders with border-border-faint', () => {
    expect(interactiveListRowSeparatorClasses).toBe('[&>*+*]:border-t [&>*+*]:border-border-faint')
    expect(interactiveListVariants()).toContain(interactiveListRowSeparatorClasses)
  })

  it('does not use divide utilities on the list shell', () => {
    const classes = interactiveListVariants()
    expect(classes).not.toContain('divide-y')
    expect(classes).not.toContain('divide-border-faint')
  })
})
