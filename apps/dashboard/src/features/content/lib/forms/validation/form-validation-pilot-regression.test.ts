/**
 * Phase 4 pilot regression — desired behavior for cutover surfaces.
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { FormItem } from '@rpg/ui/form'
import {
  collectCurrentFormValidationProducerIssues,
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'
import { apiValidationIssuesToFormIssues } from './normalize-content-form-issues.lib'

import {
  ContentFormValidationOperationFailure,
  normalizeContentFormIssues,
} from './normalize-content-form-issues.lib'
import { evaluateContentPublishFormIssues } from './content-publish-validation.lib'
import { projectCompactedArrayProvenance } from '../submit/project-compacted-array-provenance.lib'

const fields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text' }]

describe('form validation pilot regression', () => {
  it('keeps operation failures as bounded safe copy, not transport payloads', () => {
    const brokenSchema = z.object({
      name: z.string().superRefine(() => {
        throw new Error('{"issues":[{"message":"not for ui"}]}')
      }),
    })

    expect(() => normalizeContentFormIssues(brokenSchema, { name: 'x' }, fields)).toThrow(
      ContentFormValidationOperationFailure,
    )

    try {
      normalizeContentFormIssues(brokenSchema, { name: 'x' }, fields)
    } catch (error) {
      const message = (error as Error).message
      expect(message).not.toContain('not for ui')
      expect(message).not.toMatch(/\{"issues"/)
    }
  })

  it('replaces publish-readiness slot with empty success without clearing publish-action', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      { path: 'level', message: 'Too low', severity: 'field' },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 2, [
      { path: 'name', message: 'Required', severity: 'field' },
    ])
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 3, [])

    expect(session.slots['publish-readiness']?.issues).toEqual([])
    expect(session.slots['publish-action']?.issues).toHaveLength(1)
  })

  it('preserves authored schema messages versus generic Zod labels at the evaluation boundary', () => {
    const authoredSchema = z.object({
      name: z.string().min(1, 'Use a display name for this entry.'),
    })
    const genericSchema = z.object({ name: z.number() })

    const authored = normalizeContentFormIssues(authoredSchema, { name: '' }, fields)
    const generic = normalizeContentFormIssues(genericSchema, { name: 'oops' }, fields)

    expect(authored?.[0]?.message).toBe('Use a display name for this entry.')
    expect(generic?.[0]?.message).not.toBe('Use a display name for this entry.')
    expect(generic?.[0]?.message).toMatch(/name/i)
    expect(generic?.[0]?.message).not.toMatch(/invalid_type/i)
  })

  it('routes publish validation once at the boundary for tabbed preview consumers', () => {
    const schema = z.object({ name: z.string().min(1, 'Name is required.') })
    expect(evaluateContentPublishFormIssues(schema, { name: '' }, fields)?.[0]?.path).toBe('name')
    expect(evaluateContentPublishFormIssues(schema, { name: 'Dragon' }, fields)).toBeNull()
  })

  it('records serializer row provenance after compaction', () => {
    const provenance = projectCompactedArrayProvenance('actions', 4, (index) => index !== 1)
    expect(provenance.filteredRowIndexBySourceIndex).toEqual({
      actions: { 0: 0, 2: 1, 3: 2 },
    })
  })

  it('omits api slot issues from stamp N when the session advances to N+1', () => {
    let session = createEmptyFormValidationProducerSession()
    const wireIssues = apiValidationIssuesToFormIssues([{ path: 'name', message: 'Slug taken' }])
    session = replaceFormValidationProducerSlot(session, 'api', 1, wireIssues)

    expect(
      collectCurrentFormValidationProducerIssues(session, 2).some((issue) => issue.path === 'name'),
    ).toBe(false)
    expect(collectCurrentFormValidationProducerIssues(session, 1)).toHaveLength(1)
  })
})
