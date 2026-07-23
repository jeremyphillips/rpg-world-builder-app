import { describe, expect, it } from 'vitest'

import {
  fieldChromePaddingMdClasses,
  fieldChromePaddingSmClasses,
  pickFieldChromeProps,
  resolveFieldChromeClassNames,
} from './field-chrome.variants'
import { fieldShellLayoutClasses } from './field-surface.variants'

describe('resolveFieldChromeClassNames', () => {
  it('returns empty classes for plain or omitted chrome', () => {
    expect(resolveFieldChromeClassNames(undefined)).toBe('')
    expect(resolveFieldChromeClassNames({ variant: 'plain' })).toBe('')
  })

  it('applies panel chrome with field padding tokens', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'panel' }, 'md')
    expect(classes).toContain(fieldShellLayoutClasses)
    expect(classes).toContain(fieldChromePaddingMdClasses)
    expect(classes).toContain('bg-surface-subtle')
  })

  it('uses separate sm padding token', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'panel' }, 'sm')
    expect(classes).toContain(fieldChromePaddingSmClasses)
  })

  it('applies outline chrome without background wash', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'outline', tone: 'primary' }, 'md')
    expect(classes).toContain('bg-transparent')
    expect(classes).toContain('border-primary')
  })
})

describe('pickFieldChromeProps', () => {
  it('maps config chrome onto field props', () => {
    const chrome = { variant: 'panel' as const }
    expect(pickFieldChromeProps({ chrome })).toEqual({ chrome })
    expect(pickFieldChromeProps({})).toEqual({ chrome: undefined })
  })
})
