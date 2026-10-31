import { describe, expect, it } from 'vitest'

import { fieldAnatomyStackVariants } from '../../../components/ui/field.variants'
import { resolveArrayFieldsetHeaderBodyStackClassName } from './resolve-array-fieldset-header-body-stack.lib'

describe('resolveArrayFieldsetHeaderBodyStackClassName', () => {
  it('returns anatomy stack when a visible header cluster renders', () => {
    expect(resolveArrayFieldsetHeaderBodyStackClassName(true, 'md')).toBe(
      fieldAnatomyStackVariants({ size: 'md' }),
    )
  })

  it('returns undefined when only sr-only legend chrome renders', () => {
    expect(resolveArrayFieldsetHeaderBodyStackClassName(false, 'md')).toBeUndefined()
  })
})
