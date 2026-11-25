import { describe, expect, it } from 'vitest'

import type { FormIssue } from '../errors/form-issue.types'
import {
  collectFormValidationSessionIssues,
  createEmptyFormValidationProducerSession,
  dedupeFormIssues,
  replaceFormValidationProducerSlot,
} from './form-validation-producer-session.lib'

function issue(path: string, message: string, extra?: Partial<FormIssue>): FormIssue {
  return {
    path,
    message,
    severity: 'field',
    ...extra,
  }
}

describe('form-validation-producer-session', () => {
  it('replaces a slot and leaves other slots unchanged', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 1, [
      issue('name', 'Required'),
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      issue('level', 'Too low'),
    ])

    expect(readiness(session)).toHaveLength(1)
    expect(collectFormValidationSessionIssues(session)).toHaveLength(2)

    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 2, [])
    expect(readiness(session)).toEqual([])
    expect(collectFormValidationSessionIssues(session)).toHaveLength(1)
  })

  it('deduplicates when messageId, params, owner, and rule match', () => {
    const issues = dedupeFormIssues([
      issue('name', 'Required', {
        messageId: 'required',
        claim: { kind: 'field', target: 'name' },
      }),
      issue('name', 'Required', {
        messageId: 'required',
        claim: { kind: 'field', target: 'name' },
      }),
      issue('name', 'Name is required', {
        messageId: 'required',
        claim: { kind: 'field', target: 'name' },
      }),
    ])
    expect(issues).toHaveLength(2)
  })
})

function readiness(session: ReturnType<typeof createEmptyFormValidationProducerSession>) {
  return session.slots['publish-readiness']?.issues ?? []
}
