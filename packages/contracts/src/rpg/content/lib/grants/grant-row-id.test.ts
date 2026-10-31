import { describe, expect, it } from 'vitest'

import {
  GRANT_ROW_OPAQUE_ID_PATTERN,
  createGrantRowId,
  grantRowIdSchema,
  isOpaqueGrantRowId,
  isSeedGrantRowId,
} from './grant-row-id'

describe('createGrantRowId', () => {
  it('allocates an opaque grant row id', () => {
    const id = createGrantRowId()
    expect(isOpaqueGrantRowId(id)).toBe(true)
    expect(isSeedGrantRowId(id)).toBe(false)
    expect(grantRowIdSchema.parse(id)).toBe(id)
  })

  it('uses the injected id factory', () => {
    expect(createGrantRowId(() => '11111111-1111-1111-1111-111111111111')).toBe(
      'grt_11111111-1111-1111-1111-111111111111',
    )
  })

  it('accepts explicit seed ids and rejects reused shapes that are neither', () => {
    expect(grantRowIdSchema.safeParse('darkvision').success).toBe(true)
    expect(grantRowIdSchema.safeParse('fighting-style-feat').success).toBe(true)
    expect(GRANT_ROW_OPAQUE_ID_PATTERN.test('grt_not-a-uuid')).toBe(false)
    expect(grantRowIdSchema.safeParse('grt_not-a-uuid').success).toBe(false)
    expect(grantRowIdSchema.safeParse('Darkvision').success).toBe(false)
  })
})
