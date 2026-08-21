import { describe, expect, it, vi } from 'vitest'

import { ACTION_VALIDATE_CONCURRENCY, fanOutValidate } from './fan-out-validate'

describe('fanOutValidate', () => {
  it('runs validate calls with bounded concurrency', async () => {
    const validateTarget = vi.fn(async (target: { id: string }) => target.id)
    const targets = Array.from({ length: 7 }, (_, index) => ({ id: `target_${index}` }))

    const results = await fanOutValidate({ targets, validateTarget })

    expect(results).toEqual(targets.map((target) => target.id))
    expect(validateTarget).toHaveBeenCalledTimes(7)
    expect(ACTION_VALIDATE_CONCURRENCY).toBe(5)
  })
})
