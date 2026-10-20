import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.variants'
import { resolveButtonAppearance } from './resolve-button-appearance'

describe('resolveButtonAppearance', () => {
  it('matches buttonVariants for non-text variants', () => {
    expect(resolveButtonAppearance({ variant: 'outline', size: 'sm' })).toBe(
      buttonVariants({ variant: 'outline', size: 'sm' }),
    )
  })

  it('adds standalone text-action classes for variant text beyond buttonVariants', () => {
    const textOnly = buttonVariants({ variant: 'text', size: 'sm' })
    const full = resolveButtonAppearance({ variant: 'text', size: 'sm', tone: 'danger' })
    expect(full).toContain('text-destructive')
    expect(full).toContain('text-action-standalone')
    expect(full).not.toBe(textOnly)
  })

  it('merges optional className', () => {
    expect(resolveButtonAppearance({ className: 'extra' })).toContain('extra')
    expect(resolveButtonAppearance({ className: 'extra' })).toContain('ui-button')
  })
})
