import { describe, expect, it } from 'vitest'

import {
  resolveFieldControlSurfaceClasses,
  resolveFieldControlSurfacePassthroughClasses,
} from './field-control-surface.variants'

describe('resolveFieldControlSurfaceClasses', () => {
  it('maps default surface to the default field fill token', () => {
    expect(resolveFieldControlSurfaceClasses('default')).toContain('--field-control-bg-default')
  })

  it('uses palette-field-bg for default so panel overrides do not circularly alias --field-control-bg', () => {
    expect(resolveFieldControlSurfaceClasses('default')).not.toContain('--field-control-bg)')
  })

  it('maps onMuted surface to the muted-panel field fill token', () => {
    expect(resolveFieldControlSurfaceClasses('onMuted')).toContain('--field-control-bg-on-muted')
  })
})

describe('resolveFieldControlSurfacePassthroughClasses', () => {
  it('includes contents so flex siblings stay inline', () => {
    expect(resolveFieldControlSurfacePassthroughClasses('onMuted')).toContain('contents')
    expect(resolveFieldControlSurfacePassthroughClasses('onMuted')).toContain(
      '--field-control-bg-on-muted',
    )
  })
})
