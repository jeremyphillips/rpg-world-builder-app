import { describe, expect, it } from 'vitest'

import { fieldStackRhythmVariants, resolveFieldStackRhythm } from './field.variants'

describe('fieldStackRhythmVariants', () => {
  it('applies compact gap by default', () => {
    expect(fieldStackRhythmVariants()).toContain('gap-2')
    expect(fieldStackRhythmVariants()).toContain('flex')
    expect(fieldStackRhythmVariants()).toContain('flex-col')
  })

  it('applies comfortable gap when requested', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'comfortable' })).toContain('gap-6')
  })
})

describe('resolveFieldStackRhythm', () => {
  it('prefers explicit config rhythm', () => {
    expect(
      resolveFieldStackRhythm({
        explicit: 'comfortable',
        inherited: 'compact',
        sectionDefault: 'compact',
      }),
    ).toBe('comfortable')
  })

  it('falls back to section default before inherited rhythm', () => {
    expect(
      resolveFieldStackRhythm({
        inherited: 'comfortable',
        sectionDefault: 'compact',
      }),
    ).toBe('compact')
  })

  it('inherits form rhythm when no override or section default', () => {
    expect(resolveFieldStackRhythm({ inherited: 'comfortable' })).toBe('comfortable')
  })
})
