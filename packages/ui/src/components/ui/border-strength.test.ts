import { describe, expect, it } from 'vitest'

import { cn } from '../../lib/utils'
import {
  BORDER_STRENGTHS,
  borderStrength,
  DEFAULT_BORDER_STRENGTH,
  UI_BORDER_STRENGTH_CLASSES,
} from './border-strength'

describe('borderStrength', () => {
  it('resolves the three neutral strengths', () => {
    expect(BORDER_STRENGTHS.map(borderStrength)).toEqual(UI_BORDER_STRENGTH_CLASSES)
  })

  it('defaults to default while allowing field owners to default separately', () => {
    expect(DEFAULT_BORDER_STRENGTH).toBe('default')
    expect(borderStrength()).toBe('ui-border--default')
  })

  it('participates in the semantic twMerge group', () => {
    expect(cn(borderStrength('subtle'), borderStrength('strong'))).toBe('ui-border--strong')
  })
})
