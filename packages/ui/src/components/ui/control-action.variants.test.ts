import { describe, expect, it } from 'vitest'

import { resolveControlActionGapClass } from './compact-control.styles'
import { resolveControlActionMetricsTier } from './control-action.variants'

describe('resolveControlActionMetricsTier', () => {
  it('maps xs chrome to the xs gap tier', () => {
    expect(resolveControlActionMetricsTier('xs', 'outline')).toBe('xs')
  })

  it('maps sm chrome to the sm gap tier', () => {
    expect(resolveControlActionMetricsTier('sm', 'outline')).toBe('sm')
  })

  it('maps default and lg chrome to the md gap tier', () => {
    expect(resolveControlActionMetricsTier('default', 'default')).toBe('md')
    expect(resolveControlActionMetricsTier('lg', 'outline')).toBe('md')
  })

  it('maps text xs to xs and text sm default to sm', () => {
    expect(resolveControlActionMetricsTier('xs', 'text')).toBe('xs')
    expect(resolveControlActionMetricsTier('sm', 'text')).toBe('sm')
  })

  it('exposes semantic gap modifiers per tier', () => {
    expect(resolveControlActionGapClass('xs')).toBe('ui-compact-control--gap-xs')
    expect(resolveControlActionGapClass('sm')).toBe('ui-compact-control--gap-sm')
    expect(resolveControlActionGapClass('md')).toBe('ui-compact-control--gap-md')
  })
})
