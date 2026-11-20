import { describe, expect, it } from 'vitest'

import {
  choiceOptionLabelClassName,
  choiceOptionTypographySizeModifier,
} from './choice-option-typography.lib'

describe('choiceOptionTypography.lib', () => {
  it('maps option typography scale to BEM size modifiers', () => {
    expect(choiceOptionTypographySizeModifier('sm')).toBe('text-style-option--sm')
    expect(choiceOptionTypographySizeModifier('md')).toBe('text-style-option--md')
  })

  it('composes base with a size modifier', () => {
    expect(choiceOptionLabelClassName('md')).toBe('text-style-option text-style-option--md')
    expect(choiceOptionLabelClassName('sm', 'ui-checkbox-option__label')).toBe(
      'text-style-option text-style-option--sm ui-checkbox-option__label',
    )
  })
})
