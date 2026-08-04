import { describe, expect, it } from 'vitest'

import {
  isActionConfigurePhase,
  isActionResolvePhase,
  isActionResultPhase,
  resolveActionCancelLabel,
  resolveActionDialogHeadline,
  shouldRenderActionResolutionList,
} from './action-dialog-shell.lib'

describe('action dialog shell helpers', () => {
  it('resolves headlines by phase', () => {
    expect(
      resolveActionDialogHeadline({
        phase: 'configure',
        headline: 'Edit availability',
        confirmedCount: 2,
        resolveNoun: 'items',
      }),
    ).toBe('Edit availability')

    expect(
      resolveActionDialogHeadline({
        phase: 'resolve',
        headline: 'Edit availability',
        confirmedCount: 2,
        resolveNoun: 'items',
      }),
    ).toBe('Apply to 2 items')
  })

  it('identifies phase-specific rendering', () => {
    expect(shouldRenderActionResolutionList('resolve')).toBe(true)
    expect(shouldRenderActionResolutionList('configure')).toBe(false)
    expect(isActionConfigurePhase('configure')).toBe(true)
    expect(isActionResolvePhase('resolve')).toBe(true)
    expect(isActionResultPhase('result')).toBe(true)
    expect(resolveActionCancelLabel('result')).toBe('Close')
  })
})
