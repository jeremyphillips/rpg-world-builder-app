import { describe, expect, it } from 'vitest'

import { z } from 'zod'

import { ApiError } from './errors'
import {
  addApiValidationIssueToRefinement,
  getApiValidationIssues,
  INVALID_CURSOR_ISSUE_CODE,
  isApiValidationDetails,
  toApiValidationIssues,
} from './api-validation'

describe('isApiValidationDetails', () => {
  it('accepts a well-formed issues payload', () => {
    expect(
      isApiValidationDetails({
        issues: [{ path: 'name', message: 'Required', code: 'invalid_type' }],
      }),
    ).toBe(true)
  })

  it('rejects malformed payloads', () => {
    expect(isApiValidationDetails(null)).toBe(false)
    expect(isApiValidationDetails({ issues: [{ path: 1, message: 'x', code: 'custom' }] })).toBe(
      false,
    )
    expect(isApiValidationDetails({ issues: [{ path: 'name', message: 'Required' }] })).toBe(false)
  })
})

describe('addApiValidationIssueToRefinement', () => {
  it('maps structured issues onto Zod paths with stable params.code', () => {
    const issues: { path: PropertyKey[]; message: string; params?: { code?: string } }[] = []
    addApiValidationIssueToRefinement(
      {
        addIssue: (issue) => {
          issues.push(issue)
        },
      },
      { path: 'equipment.0.equipmentId', message: 'Unknown equipment.', code: 'unknown_equipment' },
    )
    expect(issues[0]).toMatchObject({
      message: 'Unknown equipment.',
      path: ['equipment', 0, 'equipmentId'],
      params: { code: 'unknown_equipment' },
    })
  })
})

describe('toApiValidationIssues', () => {
  it('keeps Zod issue codes so promotion payloads pass isApiValidationDetails', () => {
    const parsed = z.object({ name: z.string().min(1) }).safeParse({ name: '' })
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    const issues = toApiValidationIssues(parsed.error.issues)
    expect(isApiValidationDetails({ issues })).toBe(true)
    expect(issues[0]?.code).toBeTruthy()
  })
})

describe('getApiValidationIssues', () => {
  it('returns issues for validation_error ApiError payloads', () => {
    const err = new ApiError(400, 'validation_error', 'Incomplete', {
      issues: [{ path: 'ability', message: 'Ability is required.', code: 'invalid_type' }],
    })

    expect(getApiValidationIssues(err)).toEqual([
      { path: 'ability', message: 'Ability is required.', code: 'invalid_type' },
    ])
  })

  it('returns issues for bad_request ApiError payloads', () => {
    const err = new ApiError(400, 'bad_request', 'Validation failed', {
      issues: [{ path: 'spells.0.access', message: 'Required', code: 'invalid_type' }],
    })

    expect(getApiValidationIssues(err)).toEqual([
      { path: 'spells.0.access', message: 'Required', code: 'invalid_type' },
    ])
  })

  it('returns cursor issues when code is present', () => {
    const err = new ApiError(400, 'bad_request', 'Validation failed', {
      issues: [{ path: 'cursor', message: 'Invalid cursor.', code: INVALID_CURSOR_ISSUE_CODE }],
    })

    expect(getApiValidationIssues(err)).toEqual([
      { path: 'cursor', message: 'Invalid cursor.', code: INVALID_CURSOR_ISSUE_CODE },
    ])
  })

  it('returns undefined for other errors', () => {
    expect(getApiValidationIssues(new ApiError(403, 'forbidden', 'Nope'))).toBeUndefined()
    expect(getApiValidationIssues(new Error('boom'))).toBeUndefined()
  })
})
