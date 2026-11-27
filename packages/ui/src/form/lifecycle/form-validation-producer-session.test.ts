import { describe, expect, it } from 'vitest'

import type { FormIssue } from '../errors/form-issue.types'
import type { FormItem } from '../field-config'
import {
  collectCurrentFormValidationProducerIssues,
  collectFormValidationSessionIssues,
  createEmptyFormValidationProducerSession,
  dedupeFormIssues,
  projectFormValidationProducerIssues,
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

  it('omits stale producer slots when collecting for the current stamp', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'api', 1, [issue('traits.0', 'Bad')])
    session = replaceFormValidationProducerSlot(session, 'draft-action', 2, [
      issue('name', 'Required'),
    ])

    expect(collectCurrentFormValidationProducerIssues(session, 2)).toEqual([
      expect.objectContaining({ path: 'name' }),
    ])
    expect(collectCurrentFormValidationProducerIssues(session, 1)).toEqual([
      expect.objectContaining({ path: 'traits.0' }),
    ])
  })

  it('routes producer session issues through compiled ownership', () => {
    const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'serialization', 3, [
      issue('name', 'Name is required'),
    ])
    const projected = projectFormValidationProducerIssues(session, 3, fields, { name: '' })
    expect(projected[0]).toMatchObject({
      path: 'name',
      claim: { kind: 'field', target: 'name' },
    })
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
