import { describe, expect, it } from 'vitest'

import { resolveTextActionTone, textActionVariants } from './text-action.variants'

describe('textActionVariants', () => {
  it('defaults to inline accent', () => {
    const classes = textActionVariants()

    expect(classes).toContain('text-action-inline')
    expect(classes).toContain('text-primary')
    expect(classes).not.toContain('text-action-standalone')
  })

  it('maps standalone neutral with stable ink', () => {
    const classes = textActionVariants({ context: 'standalone', tone: 'neutral' })

    expect(classes).toContain('text-action-standalone')
    expect(classes).toContain('text-foreground')
    expect(classes).not.toContain('text-primary')
    expect(classes).not.toMatch(/hover:text-primary/)
  })

  it('maps standalone accent and danger tones', () => {
    expect(textActionVariants({ context: 'standalone', tone: 'accent' })).toContain('text-primary')
    expect(textActionVariants({ context: 'standalone', tone: 'danger' })).toContain(
      'text-destructive',
    )
  })

  it('resolves omitted tone from context', () => {
    expect(resolveTextActionTone('inline')).toBe('accent')
    expect(resolveTextActionTone('standalone')).toBe('neutral')
    expect(resolveTextActionTone('standalone', 'accent')).toBe('accent')
  })
})
