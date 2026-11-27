import { describe, expect, it } from 'vitest'

import type { FormIssue } from '../errors/form-issue.types'
import { projectIssuesToFieldErrors } from './project-issues-to-field-errors.lib'

describe('projectIssuesToFieldErrors', () => {
  it('merges two distinct reasons on one path for RHF compatibility', () => {
    const issues: FormIssue[] = [
      {
        path: 'movementAlternative.modes',
        message: 'Choose at least 2 available modes.',
        severity: 'field',
      },
      {
        path: 'movementAlternative.modes',
        message: 'Choose different movement modes.',
        severity: 'field',
      },
    ]

    const errors = projectIssuesToFieldErrors(issues)
    const modes = errors.movementAlternative as { modes?: { message?: string } }
    expect(modes.modes?.message).toContain('Choose at least 2')
    expect(modes.modes?.message).toContain('Choose different')
  })
})
