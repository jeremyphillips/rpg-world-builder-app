import { describe, expect, it } from 'vitest'

import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'

describe('resolveFieldGroupChromeClassNames', () => {
  it('returns empty classes for plain chrome', () => {
    expect(resolveFieldGroupChromeClassNames({ variant: 'plain' })).toMatchObject({
      fieldset: '',
      body: '',
      legend: '',
    })
  })

  it('applies semantic rail and rhythm-scoped content inset on the body', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'rail' })
    expect(classes.body).toContain('ui-field-rail')
    expect(classes.body).toContain('ui-field-group-chrome--rail-comfortable')
    expect(classes.body).toContain('ui-border--default')
    expect(classes.body).toContain('ui-field-rail--tone-neutral')
    expect(classes.body).not.toContain('border-l-2')
  })

  it('applies compact content inset when rhythm is compact', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'rail' }, { rhythm: 'compact' })
    expect(classes.body).toContain('ui-field-group-chrome--rail-compact')
    expect(classes.body).not.toContain('ui-field-group-chrome--rail-comfortable')
  })

  it('applies inset body classes as a deprecated alias for rail', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'inset' })
    expect(classes.body).toContain('ui-field-rail')
    expect(classes.body).toContain('ui-field-group-chrome--rail-comfortable')
  })

  it('applies compact inset padding when rhythm is compact', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'inset' }, { rhythm: 'compact' })
    expect(classes.body).toContain('ui-field-group-chrome--rail-compact')
    expect(classes.body).not.toContain('ui-field-group-chrome--rail-comfortable')
  })

  it('applies primary rail tone', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'inset', tone: 'primary' })
    expect(classes.body).toContain('ui-field-rail--tone-primary')
    expect(classes.body).not.toContain('ui-border--default')
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
    const classes = resolveFieldGroupChromeClassNames({ variant: 'panel', emphasis: 'default' })
    expect(classes.body).toContain('bg-surface-muted')
  })

  it('applies elevated panel tone', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'panel', elevation: 'raised' })
    expect(classes.body).toContain('bg-card')
    expect(classes.body).toContain('shadow-surface-raised')
  })

  it('applies outline body classes with border default', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'outline' })
    expect(classes.fieldset).toBe('')
    expect(classes.body).toContain('rounded-md')
    expect(classes.body).toContain('ui-border--subtle')
    expect(classes.body).toContain('bg-transparent')
  })

  it('applies destructive outline tone', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'outline',
      tone: 'destructive',
    })
    expect(classes.body).toContain('border-destructive')
  })

  it('applies divider top chrome on the fieldset', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'divider', edge: 'top' })
    expect(classes.fieldset).toContain('ui-field-group-chrome--divider-top')
    expect(classes.fieldset).toContain('ui-border--default')
    expect(classes.fieldset).not.toContain('ui-field-group-chrome--divider-bottom')
  })

  it('applies divider bottom chrome on the fieldset', () => {
    const classes = resolveFieldGroupChromeClassNames({ variant: 'divider', edge: 'bottom' })
    expect(classes.fieldset).toContain('ui-field-group-chrome--divider-bottom')
    expect(classes.fieldset).toContain('ui-border--default')
    expect(classes.fieldset).not.toContain('ui-field-group-chrome--divider-top')
  })

  it('applies subtle divider strength', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'divider',
      edge: 'top',
      strength: 'subtle',
    })
    expect(classes.fieldset).toContain('ui-border--subtle')
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
    expect(classes.fieldset).toContain('ui-field-group-chrome--accent-top')
    expect(classes.fieldset).toContain('ui-field-group-chrome--accent-top-tone-primary')
  })

  it('applies neutral accent top via border strength', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'top',
      tone: 'neutral',
    })
    expect(classes.fieldset).toContain('ui-field-group-chrome--accent-top')
    expect(classes.fieldset).toContain('ui-border--default')
    expect(classes.fieldset).not.toContain('ui-field-group-chrome--accent-top-tone-primary')
  })

  it('applies accent legend rail classes', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'legendRail',
      tone: 'primary',
    })
    expect(classes.legend).toContain('ui-field-group-chrome__legend-rail')
    expect(classes.legend).toContain('ui-field-group-chrome__legend-rail--tone-primary')
  })

  it('applies neutral legend rail with border strength on host', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'legendRail',
      tone: 'neutral',
    })
    expect(classes.legend).toContain('ui-border--default')
    expect(classes.legend).toContain('ui-field-group-chrome__legend-rail--tone-neutral')
  })

  it('applies status accent on legend rail', () => {
    const classes = resolveFieldGroupChromeClassNames({
      variant: 'accent',
      edge: 'legendRail',
      tone: 'warning',
    })
    expect(classes.legend).toContain('ui-field-group-chrome__legend-rail--tone-warning')
  })
})
