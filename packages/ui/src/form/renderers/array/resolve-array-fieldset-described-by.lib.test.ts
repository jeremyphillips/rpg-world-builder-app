import { describe, expect, it } from 'vitest'

import { resolveArrayFieldsetDescribedBy } from './resolve-array-fieldset-described-by.lib'

describe('resolveArrayFieldsetDescribedBy', () => {
  it('points at the hint when the section has no container error', () => {
    expect(
      resolveArrayFieldsetDescribedBy({
        hasContainerIssue: false,
        hint: 'Add entries.',
        errorId: 'traits-error',
        hintId: 'traits-hint',
      }),
    ).toBe('traits-hint')
  })

  it('keeps a below-label hint beside the container error', () => {
    expect(
      resolveArrayFieldsetDescribedBy({
        hasContainerIssue: true,
        hint: { text: 'Add entries.', position: 'below-label' },
        errorId: 'traits-error',
        hintId: 'traits-hint',
      }),
    ).toBe('traits-hint traits-error')
  })

  it('drops a below-control hint from the description when a container error is present', () => {
    expect(
      resolveArrayFieldsetDescribedBy({
        hasContainerIssue: true,
        hint: { text: 'Add entries.', position: 'below-control' },
        errorId: 'traits-error',
        hintId: 'traits-hint',
      }),
    ).toBe('traits-error')
  })

  it('returns undefined when there is no hint and no container error', () => {
    expect(
      resolveArrayFieldsetDescribedBy({
        hasContainerIssue: false,
        errorId: 'traits-error',
        hintId: 'traits-hint',
      }),
    ).toBeUndefined()
  })
})
