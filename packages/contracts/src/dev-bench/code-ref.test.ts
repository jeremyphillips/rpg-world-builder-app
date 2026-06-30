import { describe, expect, it } from 'vitest'

import { codeRefSchema } from './code-ref'

describe('codeRefSchema', () => {
  it('accepts a path-only ref', () => {
    expect(codeRefSchema.safeParse({ path: 'packages/contracts/src/shared' }).success).toBe(true)
  })

  it('accepts a full ref', () => {
    expect(
      codeRefSchema.safeParse({
        packageName: '@rpg/contracts',
        path: 'packages/contracts/src/shared/auth.ts',
        symbol: 'loginInputSchema',
        lineStart: 10,
        lineEnd: 20,
        note: 'Auth entry point',
      }).success,
    ).toBe(true)
  })

  it('requires path', () => {
    expect(codeRefSchema.safeParse({ symbol: 'foo' }).success).toBe(false)
  })

  it('rejects lineEnd before lineStart', () => {
    expect(
      codeRefSchema.safeParse({
        path: 'src/index.ts',
        lineStart: 20,
        lineEnd: 10,
      }).success,
    ).toBe(false)
  })

  it('accepts equal lineStart and lineEnd', () => {
    expect(
      codeRefSchema.safeParse({
        path: 'src/index.ts',
        lineStart: 10,
        lineEnd: 10,
      }).success,
    ).toBe(true)
  })
})
