import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { addCustomRefinementIssue, customZodIssue } from './add-custom-refinement-issue'

describe('customZodIssue', () => {
  it('builds a custom issue with path', () => {
    expect(customZodIssue('bad field', ['name'])).toEqual({
      code: 'custom',
      message: 'bad field',
      path: ['name'],
    })
  })
})

describe('addCustomRefinementIssue', () => {
  it('adds a custom issue to the refinement context', () => {
    const issues: z.ZodIssue[] = []
    const ctx = {
      addIssue: (issue: z.ZodIssue) => {
        issues.push(issue)
      },
    } as unknown as z.RefinementCtx

    addCustomRefinementIssue(ctx, 'required', ['level'])

    expect(issues).toEqual([{ code: 'custom', message: 'required', path: ['level'] }])
  })

  it('adds a pathless custom issue to the refinement context', () => {
    const issues: z.ZodIssue[] = []
    const ctx = {
      addIssue: (issue: z.ZodIssue) => {
        issues.push(issue)
      },
    } as unknown as z.RefinementCtx

    addCustomRefinementIssue(ctx, 'invalid combination')

    expect(issues).toEqual([{ code: 'custom', message: 'invalid combination' }])
  })
})
