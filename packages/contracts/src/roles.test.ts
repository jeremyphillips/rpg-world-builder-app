import { describe, expect, it } from 'vitest'
import { ROLES, roleSchema } from './roles'

describe('roleSchema', () => {
  it('accepts every known role', () => {
    for (const role of ROLES) {
      expect(roleSchema.parse(role)).toBe(role)
    }
  })

  it('rejects unknown roles', () => {
    expect(roleSchema.safeParse('wizard').success).toBe(false)
  })
})
