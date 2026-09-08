import { describe, expect, it } from 'vitest'

import {
  DEFAULT_FIELD_CHROME,
  fieldChromePaddingContainerClasses,
  fieldChromePaddingMdClasses,
  fieldChromePaddingSmClasses,
  pickFieldChromeProps,
  resolveEffectiveFieldChrome,
  resolveFieldAnatomyWidth,
  resolveFieldChromeClassNames,
  resolveFieldChromeProps,
} from './field-chrome.variants'
import { fieldShellLayoutClasses } from './field-surface.variants'

describe('resolveFieldChromeClassNames', () => {
  it('returns empty classes for none, plain, or omitted chrome', () => {
    expect(resolveFieldChromeClassNames(undefined)).toBe('')
    expect(resolveFieldChromeClassNames({ variant: 'plain' })).toBe('')
    expect(resolveFieldChromeClassNames({ variant: 'none' })).toBe('')
  })

  it('applies default container chrome with 16px padding, field-container bg, and full width', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'container' }, 'md')
    expect(classes).toContain(fieldShellLayoutClasses)
    expect(classes).toContain(fieldChromePaddingContainerClasses)
    expect(classes).toContain('bg-field-container')
    expect(classes).toContain('border-border-subtle')
    expect(classes).toContain('w-full')
  })

  it('applies panel chrome with field padding tokens', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'panel' }, 'md')
    expect(classes).toContain(fieldShellLayoutClasses)
    expect(classes).toContain(fieldChromePaddingMdClasses)
    expect(classes).toContain('bg-surface-subtle')
  })

  it('uses separate sm padding token for panel chrome', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'panel' }, 'sm')
    expect(classes).toContain(fieldChromePaddingSmClasses)
  })

  it('applies outline chrome without background wash', () => {
    const classes = resolveFieldChromeClassNames(
      { variant: 'outline', borderAccent: 'primary' },
      'md',
    )
    expect(classes).toContain('bg-transparent')
    expect(classes).toContain('border-primary')
  })

  it('uses the subtle border ladder for the default outline tone', () => {
    const classes = resolveFieldChromeClassNames({ variant: 'outline' }, 'md')
    const tokens = classes.split(/\s+/).filter(Boolean)
    expect(tokens).toContain('border-border-subtle')
    expect(tokens).not.toContain('border-border-faint')
    expect(tokens).not.toContain('border-border')
  })

  it('maps outline emphasis to separator border utilities', () => {
    const faint = resolveFieldChromeClassNames({ variant: 'outline', emphasis: 'faint' }, 'md')
    expect(faint).toContain('border-border-faint')
  })
})

describe('resolveEffectiveFieldChrome', () => {
  it('defaults to container when no explicit chrome or suppression', () => {
    expect(resolveEffectiveFieldChrome({}, {})).toEqual(DEFAULT_FIELD_CHROME)
  })

  it('honors explicit none opt-out', () => {
    expect(resolveEffectiveFieldChrome({ chrome: { variant: 'none' } }, {})).toBeUndefined()
  })

  it('honors ancestor fieldChrome cascade', () => {
    expect(
      resolveEffectiveFieldChrome({}, { fieldChromeCascade: { variant: 'none' } }),
    ).toBeUndefined()
  })

  it('suppresses default container when fieldChromeSuppressed is true', () => {
    expect(resolveEffectiveFieldChrome({}, { fieldChromeSuppressed: true })).toBeUndefined()
  })

  it('prefers explicit leaf chrome over cascade', () => {
    expect(
      resolveEffectiveFieldChrome(
        { chrome: { variant: 'panel' } },
        { fieldChromeCascade: { variant: 'none' } },
      ),
    ).toEqual({ variant: 'panel' })
  })
})

describe('pickFieldChromeProps', () => {
  it('maps config chrome onto field props', () => {
    const chrome = { variant: 'panel' as const }
    expect(pickFieldChromeProps({ chrome })).toEqual({ chrome })
    expect(pickFieldChromeProps({})).toEqual({ chrome: undefined })
    expect(pickFieldChromeProps({ chrome: { variant: 'none' } })).toEqual({ chrome: undefined })
  })
})

describe('resolveFieldAnatomyWidth', () => {
  it('forces full anatomy width for container chrome', () => {
    expect(resolveFieldAnatomyWidth('auto', { variant: 'container' })).toBe('full')
  })

  it('preserves configured width for other chrome variants', () => {
    expect(resolveFieldAnatomyWidth('auto', { variant: 'panel' })).toBe('auto')
    expect(resolveFieldAnatomyWidth('auto', undefined)).toBe('auto')
  })
})

describe('resolveFieldChromeProps', () => {
  it('resolves default container from section context', () => {
    expect(resolveFieldChromeProps({}, {})).toEqual({ chrome: DEFAULT_FIELD_CHROME })
  })
})
