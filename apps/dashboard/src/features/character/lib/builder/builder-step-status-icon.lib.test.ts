import { describe, expect, it } from 'vitest'

import {
  resolveStepStatusIconVariant,
  STEP_STATUS_TO_ICON_VARIANT,
} from './builder-step-status-icon.lib'

describe('builder-step-status-icon.lib', () => {
  it('maps every step status to a shared StatusIcon variant', () => {
    expect(STEP_STATUS_TO_ICON_VARIANT.complete).toBe('ready')
    expect(STEP_STATUS_TO_ICON_VARIANT.error).toBe('needsAttention')
    expect(STEP_STATUS_TO_ICON_VARIANT.locked).toBe('off')
    expect(STEP_STATUS_TO_ICON_VARIANT.idle).toBe('incomplete')
    expect(STEP_STATUS_TO_ICON_VARIANT.active).toBe('incomplete')
  })

  it('resolves variants through a single helper', () => {
    expect(resolveStepStatusIconVariant('complete')).toBe('ready')
    expect(resolveStepStatusIconVariant('active')).toBe('incomplete')
  })
})
