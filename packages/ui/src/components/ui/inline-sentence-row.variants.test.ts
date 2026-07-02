import { describe, expect, it } from 'vitest'

import {
  diceFormulaSeparatorVariants,
  inlineSentenceConnectorVariants,
} from './inline-sentence-row.variants'

describe('inlineSentenceConnectorVariants', () => {
  it('applies field size typography for prose tone', () => {
    expect(inlineSentenceConnectorVariants({ size: 'sm', tone: 'prose' })).toContain('text-xs')
    expect(inlineSentenceConnectorVariants({ size: 'md', tone: 'prose' })).toContain('text-md')
  })

  it('applies field-label weight for label tone', () => {
    expect(inlineSentenceConnectorVariants({ size: 'md', tone: 'label' })).toContain(
      'font-field-label',
    )
    expect(inlineSentenceConnectorVariants({ size: 'md', tone: 'label' })).toContain('leading-none')
  })

  it('applies mono tone chrome for dice separators', () => {
    expect(diceFormulaSeparatorVariants({ size: 'sm' })).toContain('text-xs')
    expect(diceFormulaSeparatorVariants({ size: 'sm' })).toContain('font-mono')
    expect(diceFormulaSeparatorVariants({ size: 'sm' })).toContain('px-2')
  })
})
