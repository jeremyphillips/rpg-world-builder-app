import { describe, expect, it } from 'vitest'

import {
  ACTION_RESOLUTION_ISSUE_ROW_STATES,
  actionResolutionIssueRowClasses,
} from './action-resolution-row.lib'
import {
  actionResolutionListVariants,
  actionResolutionRowVariants,
} from './action-resolution-list.variants'

describe('actionResolutionListVariants', () => {
  it('uses a subtle panel frame without a second inset', () => {
    const classes = actionResolutionListVariants()
    expect(classes).toContain('ui-panel--subtle')
    expect(classes).toContain('ui-panel--bleed')
    expect(classes).not.toContain('bg-sunken')
  })

  it('applies shared issue row chrome for every issue row state', () => {
    for (const state of ACTION_RESOLUTION_ISSUE_ROW_STATES) {
      const classes = actionResolutionRowVariants({ state })
      expect(classes).toContain(actionResolutionIssueRowClasses)
      expect(classes).not.toContain('text-destructive')
    }
  })
})
