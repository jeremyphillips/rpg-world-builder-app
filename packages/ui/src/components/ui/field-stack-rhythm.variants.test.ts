import { describe, expect, it } from 'vitest'

import { fieldStackRhythmVariants } from './field.variants'

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
