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
  it('uses the lighter-than-modal surface token', () => {
    expect(actionResolutionListVariants()).toContain('bg-surface-subtle')
    expect(actionResolutionListVariants()).not.toContain('bg-sunken')
  })

  it('applies shared issue row chrome for every issue row state', () => {
    for (const state of ACTION_RESOLUTION_ISSUE_ROW_STATES) {
      const classes = actionResolutionRowVariants({ state })
      expect(classes).toContain(actionResolutionIssueRowClasses)
      expect(classes).not.toContain('text-destructive')
    }
  })
})
