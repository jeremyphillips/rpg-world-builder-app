import { describe, expect, it } from 'vitest'

import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'

describe('resolveFieldGroupChromeClassNames', () => {
  it('returns empty classes for plain chrome', () => {
    expect(resolveFieldGroupChromeClassNames({ variant: 'plain' })).toMatchObject({
      fieldset: '',
      body: '',
      legend: '',
      isCollapsible: false,
    })
  })

  it('applies inset body classes', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'inset' })
    expect(classes.body).toContain('border-l-2')
    expect(classes.body).toContain('pl-6')
    expect(classes.body).toContain('sm:pl-8')
    expect(classes.body).toContain('border-border')
  })

  it('applies primary inset tone', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'inset', tone: 'primary' })
    expect(classes.body).toContain('border-primary')
    expect(classes.body).not.toContain('bg-surface-strong')
  })

  it('applies panel body classes with subtle default', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'panel' })
    expect(classes.fieldset).toBe('')
    expect(classes.body).toContain('rounded-md')
    expect(classes.body).toContain('border')
    expect(classes.body).toContain('p-4')
    expect(classes.body).toContain('bg-surface-subtle')
  })

  it('applies muted panel tone', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'panel', tone: 'muted' })
    expect(classes.body).toContain('bg-surface-muted')
  })

  it('applies elevated panel tone', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'panel', tone: 'raised' })
    expect(classes.body).toContain('bg-card')
    expect(classes.body).toContain('shadow-surface-raised')
  })

  it('applies outline body classes with border default', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'outline' })
    expect(classes.fieldset).toBe('')
    expect(classes.body).toContain('rounded-md')
    expect(classes.body).toContain('border-border-subtle')
    expect(classes.body).toContain('bg-transparent')
  })

  it('applies destructive outline tone', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'outline',
      tone: 'destructive',
    })
    expect(classes.body).toContain('border-destructive')
  })

  it('applies divider top padding and border', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'divider', edge: 'top' })
    expect(classes.fieldset).toContain('border-t')
    expect(classes.fieldset).toContain('pt-7')
  })

  it('applies divider bottom padding and border', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'divider', edge: 'bottom' })
    expect(classes.fieldset).toContain('border-b')
    expect(classes.fieldset).toContain('pb-7')
  })

  it('applies callout info classes on the body', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'callout', tone: 'info' })
    expect(classes.fieldset).toBe('')
    expect(classes.body).toContain('rounded-lg')
    expect(classes.body).toContain('bg-info-subtle')
  })

  it('applies accent top border', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'top',
      tone: 'primary',
    })
    expect(classes.fieldset).toContain('border-t-2')
    expect(classes.fieldset).toContain('border-primary')
    expect(classes.fieldset).toContain('pt-4')
  })

  it('applies accent legend rail classes', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'legendRail',
      tone: 'primary',
    })
    expect(classes.legend).toContain('before:bg-primary')
    expect(classes.legend).toContain('w-full')
  })

  it('marks collapsible chrome', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'collapsible',
      defaultOpen: false,
      collapseKey: 'advanced',
    })
    expect(classes.isCollapsible).toBe(true)
    expect(classes.defaultOpen).toBe(false)
    expect(classes.collapseKey).toBe('advanced')
  })

  it('marks summary disclosure chrome', () => {
    const chrome = {
      variant: 'summaryDisclosure' as const,
      resolveSummary: () => ({ primary: 'Available' }),
    }
    const classes = resolveFieldGroupChromeClassNames(chrome)
    expect(classes.isSummaryDisclosure).toBe(true)
    expect(classes.summaryDisclosure).toBe(chrome)
    expect(classes.defaultOpen).toBe(false)
  })
})
