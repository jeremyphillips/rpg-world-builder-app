import { describe, expect, it } from 'vitest'

import { ApiError } from './errors'
import { getApiValidationIssues, isApiValidationDetails } from './api-validation'

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

  it('returns undefined for other errors', () => {
    expect(getApiValidationIssues(new ApiError(403, 'forbidden', 'Nope'))).toBeUndefined()
    expect(getApiValidationIssues(new Error('boom'))).toBeUndefined()
  })
})
