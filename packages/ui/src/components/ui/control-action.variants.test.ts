import { describe, expect, it } from 'vitest'

import { resolveControlActionGapClass } from './compact-control.styles'
import { resolveControlActionMetricsTier } from './control-action.variants'

describe('resolveControlActionMetricsTier', () => {
  it('maps xs chrome and sm compact chrome to the xs gap tier', () => {
    expect(resolveControlActionMetricsTier('xs', 'default', 'outline')).toBe('xs')
    expect(resolveControlActionMetricsTier('sm', 'compact', 'outline')).toBe('xs')
  })

  it('maps sm default and default compact chrome to the sm gap tier', () => {
    expect(resolveControlActionMetricsTier('sm', 'default', 'outline')).toBe('sm')
    expect(resolveControlActionMetricsTier('default', 'compact', 'outline')).toBe('sm')
  })

  it('maps default and lg chrome to the md gap tier', () => {
    expect(resolveControlActionMetricsTier('default', 'default', 'default')).toBe('md')
    expect(resolveControlActionMetricsTier('lg', 'compact', 'outline')).toBe('md')
  })

  it('maps text compact lanes to xs and text sm default to sm', () => {
    expect(resolveControlActionMetricsTier('xs', 'compact', 'text')).toBe('xs')
    expect(resolveControlActionMetricsTier('xs', 'default', 'text')).toBe('sm')
    expect(resolveControlActionMetricsTier('sm', 'compact', 'text')).toBe('xs')
    expect(resolveControlActionMetricsTier('sm', 'default', 'text')).toBe('sm')
  })

  it('exposes semantic gap modifiers per tier', () => {
    expect(resolveControlActionGapClass('xs')).toBe('ui-compact-control--gap-xs')
    expect(resolveControlActionGapClass('sm')).toBe('ui-compact-control--gap-sm')
    expect(resolveControlActionGapClass('md')).toBe('ui-compact-control--gap-md')
  })
})
