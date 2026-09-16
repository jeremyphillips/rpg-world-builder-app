import { describe, expect, it } from 'vitest'

import { fieldValidationMessages, formatFieldMessage } from '@rpg/contracts'

import { formIssuesFromZodIssues } from './flatten-form-issues'

describe('formIssuesFromZodIssues', () => {
  it('decodes structured catalog payloads into field copy', () => {
    const encoded = fieldValidationMessages.requiredSelect({ label: 'Progression' })
    const [issue] = formIssuesFromZodIssues([
      { path: ['spellcasting', 'progression'], message: encoded },
    ])

    expect(issue?.path).toBe('spellcasting.progression')
    expect(issue?.message).toBe('Choose a progression.')
    expect(issue?.message).not.toContain('"f":')
    expect(issue?.summaryMessage).toBe('Missing Progression')
    expect(formatFieldMessage(encoded)).toBe('Choose a progression.')
  })
})
